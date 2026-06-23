from __future__ import annotations

import logging
import secrets
import uuid
from datetime import timedelta

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    build_expiry,
    generate_numeric_otp,
    hash_admin_otp,
    hash_admin_session,
    utcnow,
    verify_hash,
)
from app.models.client_auth import ClientOtpRequest, ClientSession
from app.models.lead import Lead
from app.services.email_service import email_service


logger = logging.getLogger(__name__)

STATUS_LABELS = {
    "new": "Received",
    "contacted": "In discussion",
    "qualified": "Qualified",
    "proposal_sent": "Proposal sent",
    "won": "In delivery",
    "lost": "Closed",
}


def mask_email(email: str) -> str:
    local, _, domain = email.partition("@")
    visible = local[: min(2, len(local))]
    return f"{visible}{'*' * max(len(local) - len(visible), 1)}@{domain}"


class ClientService:
    def _leads_for_email(self, db: Session, email: str) -> list[Lead]:
        stmt = select(Lead).where(Lead.email == email).order_by(Lead.created_at.desc())
        return list(db.execute(stmt).scalars().all())

    def request_otp(self, db: Session, *, email: str, requested_ip: str | None, user_agent: str | None) -> dict:
        normalized = email.strip().lower()
        leads = self._leads_for_email(db, normalized)
        if not leads:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="We couldn't find any projects for that email. Use the email you contacted us with.",
            )

        cooldown = utcnow() - timedelta(seconds=settings.admin_otp_cooldown_seconds)
        recent = db.execute(
            select(ClientOtpRequest)
            .where(ClientOtpRequest.email == normalized, ClientOtpRequest.created_at >= cooldown)
            .limit(1)
        ).scalar_one_or_none()
        if recent:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Please wait {settings.admin_otp_cooldown_seconds} seconds before requesting another code.",
            )

        challenge_id = str(uuid.uuid4())
        otp = generate_numeric_otp(settings.admin_otp_digits)
        db.add(ClientOtpRequest(
            id=challenge_id,
            email=normalized,
            otp_hash=hash_admin_otp(challenge_id, otp),
            requested_ip=requested_ip,
            user_agent=user_agent,
            attempt_count=0,
            created_at=utcnow(),
            expires_at=build_expiry(minutes=settings.admin_otp_expires_minutes),
        ))

        result = email_service.send_template(
            db=db,
            template_name="client_login_otp.html",
            context={
                "otp": otp,
                "client_email": normalized,
                "expires_minutes": settings.admin_otp_expires_minutes,
                "company_name": settings.company_name,
                "company_tagline": settings.company_tagline,
                "accent_color": "#4f46e5",
            },
            to_email=normalized,
            subject=f"Your {settings.company_name} client portal code",
            payload={"event": "client_otp_request"},
        )
        if not result.success:
            logger.error("Client OTP email failed for %s: %s", normalized, result.error_message or result.status)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Could not send the login code. Please try again shortly.",
            )

        db.commit()
        return {
            "challenge_id": challenge_id,
            "masked_email": mask_email(normalized),
            "expires_in_seconds": settings.admin_otp_expires_minutes * 60,
            "otp_digits": settings.admin_otp_digits,
            "message": f"We sent a {settings.admin_otp_digits}-digit code to {mask_email(normalized)}.",
        }

    def verify_otp(self, db: Session, *, email: str, challenge_id: str, otp: str) -> dict:
        normalized = email.strip().lower()
        otp_request = db.get(ClientOtpRequest, challenge_id)
        if not otp_request or otp_request.email != normalized or otp_request.used_at:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Code expired or invalid")
        if otp_request.expires_at <= utcnow():
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Code expired or invalid")
        if otp_request.attempt_count >= settings.admin_otp_max_attempts:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many incorrect attempts. Request a new code.",
            )

        if not verify_hash(otp_request.otp_hash, hash_admin_otp(challenge_id, otp)):
            otp_request.attempt_count += 1
            db.add(otp_request)
            db.commit()
            left = max(settings.admin_otp_max_attempts - otp_request.attempt_count, 0)
            detail = (
                f"Incorrect code. {left} attempt{'s' if left != 1 else ''} left."
                if left else "Too many incorrect attempts. Request a new code."
            )
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)

        otp_request.used_at = utcnow()
        token = secrets.token_hex(32)
        db.add(ClientSession(
            token_hash=hash_admin_session(token),
            email=normalized,
            created_at=utcnow(),
            last_seen_at=utcnow(),
            expires_at=build_expiry(hours=settings.admin_session_ttl_hours),
        ))
        db.add(otp_request)
        db.commit()
        return {"token": token, "expires_at": build_expiry(hours=settings.admin_session_ttl_hours), "email": normalized}

    def revoke_session(self, db: Session, token_hash: str) -> None:
        session = db.get(ClientSession, token_hash)
        if session:
            session.revoked_at = utcnow()
            db.add(session)
            db.commit()

    # ── Portal data ─────────────────────────────────────────────────
    def _timeline(self, lead: Lead) -> list[dict]:
        steps = [
            ("received", "Received", lead.created_at),
            ("qualified", "Qualified", lead.qualified_at),
            ("proposal", "Proposal", lead.proposal_sent_at),
            ("delivery", "In delivery", lead.won_at),
        ]
        return [{"key": k, "label": label, "done": at is not None, "at": at} for k, label, at in steps]

    def overview(self, db: Session, *, email: str) -> dict:
        normalized = email.strip().lower()
        leads = self._leads_for_email(db, normalized)
        client_name = leads[0].full_name if leads else ""
        public_base = (settings.public_base_url or settings.company_website).rstrip("/")

        projects = []
        for lead in leads:
            quotations = []
            for q in lead.quotations:
                status_value = q.status.value if hasattr(q.status, "value") else str(q.status)
                pay_url = None
                if q.quote_code and status_value in {"sent"}:
                    pay_url = f"{settings.frontend_url.rstrip('/')}/pay/{q.quote_code}"
                quotations.append({
                    "quotation_number": q.quotation_number,
                    "quote_code": q.quote_code,
                    "status": status_value,
                    "total_amount": q.total_amount,
                    "currency": q.currency,
                    "created_at": q.created_at,
                    "pay_url": pay_url,
                })
            payments = []
            for p in lead.payments:
                pstatus = p.status.value if hasattr(p.status, "value") else str(p.status)
                payments.append({
                    "invoice_number": p.invoice_number,
                    "status": pstatus,
                    "total_amount": p.total_amount,
                    "currency": p.currency,
                    "created_at": p.created_at,
                })
            lead_status = lead.status.value if hasattr(lead.status, "value") else str(lead.status)
            projects.append({
                "reference": lead.lead_reference,
                "title": lead.project_type or "Project enquiry",
                "company": lead.company,
                "status": lead_status,
                "status_label": STATUS_LABELS.get(lead_status, lead_status.replace("_", " ").title()),
                "created_at": lead.created_at,
                "timeline": self._timeline(lead),
                "quotations": quotations,
                "payments": payments,
            })

        return {"client_name": client_name, "email": normalized, "projects": projects}


client_service = ClientService()
