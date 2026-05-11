from __future__ import annotations

import logging
import secrets
import uuid
from datetime import timedelta

from fastapi import HTTPException, status
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
from app.models.auth import AdminOtpRequest, AdminSession
from app.repositories.auth_repository import AuthRepository
from app.services.email_service import email_service


auth_repository = AuthRepository()
logger = logging.getLogger(__name__)


def mask_email(email: str) -> str:
    local, _, domain = email.partition("@")
    visible = local[: min(2, len(local))]
    return f"{visible}{'*' * max(len(local) - len(visible), 1)}@{domain}"


class AuthService:
    def request_otp(self, db: Session, *, email: str, requested_ip: str | None, user_agent: str | None):
        normalized_email = email.strip().lower()
        if normalized_email != settings.admin_email.strip().lower():
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized admin email")

        recent = auth_repository.get_recent_otp_request(
            db,
            normalized_email,
            utcnow() - timedelta(seconds=settings.admin_otp_cooldown_seconds),
        )
        if recent:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Please wait {settings.admin_otp_cooldown_seconds} seconds before requesting another OTP.",
            )

        challenge_id = str(uuid.uuid4())
        otp = generate_numeric_otp(settings.admin_otp_digits)
        otp_request = AdminOtpRequest(
            id=challenge_id,
            email=normalized_email,
            otp_hash=hash_admin_otp(challenge_id, otp),
            requested_ip=requested_ip,
            user_agent=user_agent,
            attempt_count=0,
            created_at=utcnow(),
            expires_at=build_expiry(minutes=settings.admin_otp_expires_minutes),
        )
        auth_repository.create_otp_request(db, otp_request)

        email_result = email_service.send_template(
            db=db,
            template_name="admin_otp.html",
            context={
                "otp": otp,
                "admin_email": settings.admin_email,
                "expires_minutes": settings.admin_otp_expires_minutes,
                "company_name": settings.company_name,
                "company_tagline": settings.company_tagline,
                "frontend_url": settings.frontend_url,
                "requested_ip": requested_ip or "Unknown IP",
            },
            to_email=settings.admin_email,
            subject=f"{settings.company_name} admin login OTP",
            payload={"event": "admin_otp_request", "requested_ip": requested_ip},
        )
        if not email_result.success:
            logger.error(
                "SMTP delivery failed for admin OTP for %s: %s",
                normalized_email,
                email_result.error_message or email_result.status,
            )
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Could not send OTP email. Check SMTP settings and try again.",
            )

        db.commit()
        return {
            "challenge_id": challenge_id,
            "masked_email": mask_email(settings.admin_email),
            "expires_in_seconds": settings.admin_otp_expires_minutes * 60,
            "otp_digits": settings.admin_otp_digits,
            "delivery_mode": "email",
            "message": f"OTP sent to {mask_email(settings.admin_email)}.",
        }

    def verify_otp(self, db: Session, *, email: str, challenge_id: str, otp: str):
        normalized_email = email.strip().lower()
        if normalized_email != settings.admin_email.strip().lower():
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized admin email")

        otp_request = auth_repository.get_otp_request(db, challenge_id)
        if not otp_request or otp_request.email != normalized_email or otp_request.used_at:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="OTP expired or invalid")
        if otp_request.expires_at <= utcnow():
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="OTP expired or invalid")
        if otp_request.attempt_count >= settings.admin_otp_max_attempts:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many incorrect OTP attempts. Request a new code.",
            )

        provided_hash = hash_admin_otp(challenge_id, otp)
        if not verify_hash(otp_request.otp_hash, provided_hash):
            otp_request.attempt_count += 1
            db.add(otp_request)
            db.commit()
            attempts_left = max(settings.admin_otp_max_attempts - otp_request.attempt_count, 0)
            detail = (
                f"Incorrect OTP. {attempts_left} attempt{'s' if attempts_left != 1 else ''} left."
                if attempts_left
                else "Too many incorrect OTP attempts. Request a new code."
            )
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)

        otp_request.used_at = utcnow()
        token = secrets.token_hex(32)
        session = AdminSession(
            token_hash=hash_admin_session(token),
            email=normalized_email,
            created_at=utcnow(),
            last_seen_at=utcnow(),
            expires_at=build_expiry(hours=settings.admin_session_ttl_hours),
        )
        auth_repository.create_session(db, session)
        db.add(otp_request)
        db.commit()
        return {"token": token, "expires_at": session.expires_at, "admin_email": normalized_email}

    def revoke_session(self, db: Session, token_hash: str) -> None:
        session = auth_repository.get_session(db, token_hash)
        if session:
            session.revoked_at = utcnow()
            db.add(session)
            db.commit()


auth_service = AuthService()
