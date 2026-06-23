from __future__ import annotations

import re
import secrets

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import utcnow
from app.models.campaign_recipient import CampaignRecipient
from app.schemas.campaign import (
    ColdOutreachRecipientResult,
    ColdOutreachResult,
)
from app.services.email_service import email_service


# Reasonable, permissive email shape check (full RFC validation is not worth it here).
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

COLD_OUTREACH_TEMPLATE = "cold_outreach_email.html"
DEFAULT_SUBJECT = "Custom software & IT solutions, built around how your business runs — Musk-IT"

# Recipients are split on commas, semicolons, whitespace and newlines so the admin
# can paste a list in almost any shape.
_SPLIT_RE = re.compile(r"[,\n;]+")


def parse_emails(raw: str) -> tuple[list[str], list[str], list[str]]:
    """Return (valid_unique, invalid, duplicates) preserving first-seen order."""
    valid_unique: list[str] = []
    invalid: list[str] = []
    duplicates: list[str] = []
    seen: set[str] = set()

    for chunk in _SPLIT_RE.split(raw or ""):
        candidate = chunk.strip().strip("<>").strip()
        if not candidate:
            continue
        lowered = candidate.lower()
        if not EMAIL_RE.match(lowered):
            invalid.append(candidate)
            continue
        if lowered in seen:
            duplicates.append(lowered)
            continue
        seen.add(lowered)
        valid_unique.append(lowered)

    return valid_unique, invalid, duplicates


class CampaignService:
    def _contact_email(self) -> str:
        return (
            settings.email_reply_to
            or settings.smtp_from_address
            or settings.smtp_user
            or settings.admin_email
        )

    def _public_base(self) -> str:
        base = settings.public_base_url or settings.company_website
        return base.rstrip("/")

    def _consultation_target(self) -> str:
        return f"{settings.frontend_url.rstrip('/')}/consultation"

    def _tracked_url(self, token: str) -> str:
        return f"{self._public_base()}{settings.api_v1_prefix}/c/{token}"

    def build_context(self, recipient_email: str | None = None, consultation_url: str | None = None) -> dict:
        website = settings.company_website.rstrip("/")
        return {
            "company_name": settings.company_name,
            "company_tagline": settings.company_tagline,
            "accent_color": "#4f46e5",
            "website_url": website,
            "consultation_url": consultation_url or self._consultation_target(),
            "contact_email": self._contact_email(),
            "contact_phone": settings.admin_phone,
            "sender_name": f"The {settings.company_name} Team",
            "recipient_email": recipient_email or "",
        }

    def render_preview(self) -> str:
        return email_service.render(COLD_OUTREACH_TEMPLATE, self.build_context())

    def send_cold_outreach(
        self,
        db: Session,
        *,
        raw_emails: str,
        subject: str | None = None,
    ) -> ColdOutreachResult:
        valid, invalid, duplicates = parse_emails(raw_emails)
        final_subject = (subject or "").strip() or DEFAULT_SUBJECT
        target_url = self._consultation_target()

        results: list[ColdOutreachRecipientResult] = []
        sent = 0
        failed = 0

        for email in valid:
            token = secrets.token_urlsafe(24)
            tracked_url = self._tracked_url(token)
            now = utcnow()

            delivery = email_service.send_template(
                db=db,
                template_name=COLD_OUTREACH_TEMPLATE,
                context=self.build_context(recipient_email=email, consultation_url=tracked_url),
                to_email=email,
                subject=final_subject,
                payload={"event": "cold_outreach", "campaign": "capabilities", "token": token},
            )

            db.add(
                CampaignRecipient(
                    token=token,
                    campaign="capabilities",
                    recipient_email=email,
                    subject=final_subject,
                    target_url=target_url,
                    status=delivery.status,
                    error_message=delivery.error_message,
                    created_at=now,
                    sent_at=now if delivery.success else None,
                )
            )

            if delivery.success:
                sent += 1
            else:
                failed += 1
            results.append(
                ColdOutreachRecipientResult(
                    email=email,
                    status=delivery.status,
                    error_message=delivery.error_message,
                )
            )

        # email_service logs each delivery on the session; persist logs + recipients once.
        db.commit()

        return ColdOutreachResult(
            requested=len(valid) + len(invalid) + len(duplicates),
            valid=len(valid),
            sent=sent,
            failed=failed,
            skipped_invalid=invalid,
            skipped_duplicates=duplicates,
            results=results,
            subject=final_subject,
        )

    def list_recipients(self, db: Session, *, limit: int = 200) -> list[CampaignRecipient]:
        stmt = (
            select(CampaignRecipient)
            .order_by(CampaignRecipient.created_at.desc())
            .limit(limit)
        )
        return list(db.execute(stmt).scalars().all())

    def register_click(
        self,
        db: Session,
        *,
        token: str,
        user_agent: str | None = None,
    ) -> str | None:
        """Record a click for the token; return the redirect target, or None if unknown."""
        recipient = db.execute(
            select(CampaignRecipient).where(CampaignRecipient.token == token)
        ).scalar_one_or_none()
        if recipient is None:
            return None

        now = utcnow()
        recipient.click_count = (recipient.click_count or 0) + 1
        if recipient.first_clicked_at is None:
            recipient.first_clicked_at = now
        recipient.last_clicked_at = now
        if user_agent:
            recipient.last_user_agent = user_agent[:400]
        db.add(recipient)
        db.commit()
        return recipient.target_url


campaign_service = CampaignService()
