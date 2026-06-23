from __future__ import annotations

import logging
import re
import secrets

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import utcnow
from app.db.session import SessionLocal
from app.models.campaign_recipient import CampaignRecipient
from app.models.email_suppression import EmailSuppression
from app.schemas.campaign import (
    ColdOutreachRecipientResult,
    ColdOutreachResult,
)
from app.services.email_service import email_service


logger = logging.getLogger(__name__)

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

    def _unsubscribe_url(self, token: str) -> str:
        return f"{self._public_base()}{settings.api_v1_prefix}/u/{token}"

    def _pixel_url(self, token: str) -> str:
        return f"{self._public_base()}{settings.api_v1_prefix}/o/{token}.png"

    def build_context(
        self,
        recipient_email: str | None = None,
        consultation_url: str | None = None,
        unsubscribe_url: str | None = None,
        pixel_url: str | None = None,
    ) -> dict:
        website = settings.company_website.rstrip("/")
        return {
            "company_name": settings.company_name,
            "company_tagline": settings.company_tagline,
            "accent_color": "#4f46e5",
            "website_url": website,
            "consultation_url": consultation_url or self._consultation_target(),
            "unsubscribe_url": unsubscribe_url or "#",
            "pixel_url": pixel_url or "",
            "contact_email": self._contact_email(),
            "contact_phone": settings.admin_phone,
            "sender_name": f"The {settings.company_name} Team",
            "recipient_email": recipient_email or "",
        }

    def render_preview(self) -> str:
        return email_service.render(COLD_OUTREACH_TEMPLATE, self.build_context())

    # ── Suppression list ────────────────────────────────────────────
    def suppressed_set(self, db: Session, emails: list[str]) -> set[str]:
        if not emails:
            return set()
        rows = db.execute(
            select(EmailSuppression.email).where(EmailSuppression.email.in_(emails))
        ).scalars().all()
        return {e.lower() for e in rows}

    def list_suppressions(self, db: Session, *, limit: int = 500) -> list[EmailSuppression]:
        stmt = select(EmailSuppression).order_by(EmailSuppression.created_at.desc()).limit(limit)
        return list(db.execute(stmt).scalars().all())

    def add_suppression(self, db: Session, *, email: str, reason: str = "unsubscribe", source: str | None = None) -> None:
        email = email.strip().lower()
        exists = db.execute(
            select(EmailSuppression).where(EmailSuppression.email == email)
        ).scalar_one_or_none()
        if exists:
            return
        db.add(EmailSuppression(email=email, reason=reason, source=source, created_at=utcnow()))

    # ── Enqueue + background send ───────────────────────────────────
    def enqueue_cold_outreach(
        self,
        db: Session,
        *,
        raw_emails: str,
        subject: str | None = None,
    ) -> tuple[ColdOutreachResult, list[str]]:
        """Create queued recipient rows; return (summary, recipient_ids_to_send)."""
        valid, invalid, duplicates = parse_emails(raw_emails)
        final_subject = (subject or "").strip() or DEFAULT_SUBJECT
        target_url = self._consultation_target()

        suppressed = self.suppressed_set(db, valid)
        to_send = [e for e in valid if e not in suppressed]
        skipped_suppressed = [e for e in valid if e in suppressed]

        recipient_ids: list[str] = []
        now = utcnow()
        for email in to_send:
            token = secrets.token_urlsafe(24)
            recipient = CampaignRecipient(
                token=token,
                campaign="capabilities",
                recipient_email=email,
                subject=final_subject,
                target_url=target_url,
                status="queued",
                created_at=now,
            )
            db.add(recipient)
            db.flush()  # assign id
            recipient_ids.append(recipient.id)

        db.commit()

        summary = ColdOutreachResult(
            requested=len(valid) + len(invalid) + len(duplicates),
            valid=len(valid),
            queued=len(recipient_ids),
            sent=0,
            failed=0,
            skipped_invalid=invalid,
            skipped_duplicates=duplicates,
            skipped_suppressed=skipped_suppressed,
            results=[],
            subject=final_subject,
        )
        return summary, recipient_ids

    def process_recipients(self, db: Session, recipient_ids: list[str]) -> None:
        """Send queued emails (runs in a background task with its own session)."""
        for recipient_id in recipient_ids:
            recipient = db.get(CampaignRecipient, recipient_id)
            if recipient is None or recipient.status != "queued":
                continue
            context = self.build_context(
                recipient_email=recipient.recipient_email,
                consultation_url=self._tracked_url(recipient.token),
                unsubscribe_url=self._unsubscribe_url(recipient.token),
                pixel_url=self._pixel_url(recipient.token),
            )
            delivery = email_service.send_template(
                db=db,
                template_name=COLD_OUTREACH_TEMPLATE,
                context=context,
                to_email=recipient.recipient_email,
                subject=recipient.subject,
                payload={"event": "cold_outreach", "campaign": "capabilities", "token": recipient.token},
            )
            recipient.status = delivery.status
            recipient.error_message = delivery.error_message
            if delivery.success:
                recipient.sent_at = utcnow()
            db.add(recipient)
            db.commit()

    def run_background_send(self, recipient_ids: list[str]) -> None:
        """Entry point for FastAPI BackgroundTasks — owns its own DB session."""
        db = SessionLocal()
        try:
            self.process_recipients(db, recipient_ids)
        except Exception:  # pragma: no cover - defensive
            logger.exception("Background campaign send failed")
        finally:
            db.close()

    # ── Read + tracking ─────────────────────────────────────────────
    def list_recipients(self, db: Session, *, limit: int = 200) -> list[CampaignRecipient]:
        stmt = (
            select(CampaignRecipient)
            .order_by(CampaignRecipient.created_at.desc())
            .limit(limit)
        )
        return list(db.execute(stmt).scalars().all())

    def register_click(self, db: Session, *, token: str, user_agent: str | None = None) -> str | None:
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

    def register_open(self, db: Session, *, token: str) -> None:
        recipient = db.execute(
            select(CampaignRecipient).where(CampaignRecipient.token == token)
        ).scalar_one_or_none()
        if recipient is None:
            return
        now = utcnow()
        recipient.open_count = (recipient.open_count or 0) + 1
        if recipient.first_opened_at is None:
            recipient.first_opened_at = now
        recipient.last_opened_at = now
        db.add(recipient)
        db.commit()

    def register_unsubscribe(self, db: Session, *, token: str) -> bool:
        """Suppress the email behind this token. Returns True if a recipient matched."""
        recipient = db.execute(
            select(CampaignRecipient).where(CampaignRecipient.token == token)
        ).scalar_one_or_none()
        if recipient is None:
            return False
        self.add_suppression(db, email=recipient.recipient_email, reason="unsubscribe", source="email_link")
        db.commit()
        return True


campaign_service = CampaignService()
