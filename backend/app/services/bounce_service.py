from __future__ import annotations

import email
import imaplib
import logging
import re
from dataclasses import dataclass, field
from email.header import decode_header
from email.message import Message

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.campaign_recipient import CampaignRecipient
from app.services.campaign_service import campaign_service


logger = logging.getLogger(__name__)

EMAIL_RE = re.compile(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}")

# Senders / subject keywords that identify an automated bounce (non-delivery report).
# Bounce formats vary a lot between mail servers, so we don't rely on parsing a single
# strict format — we flag the message as a candidate bounce, then confirm it by checking
# whether any email address inside it matches one of our own recent "sent" recipients.
_BOUNCE_FROM_HINTS = ("mailer-daemon", "postmaster", "mail delivery", "mailerdaemon")
_BOUNCE_SUBJECT_HINTS = (
    "undeliver",
    "delivery status notification",
    "returned mail",
    "delivery failure",
    "failure notice",
    "delivery has failed",
    "delivery incomplete",
    "bounce",
    "could not be delivered",
    "message not delivered",
)

# RFC 3464 delivery-status field names we look for inside a DSN sub-message's headers.
_DSN_HEADER_NAMES = (
    "final-recipient",
    "original-recipient",
    "diagnostic-code",
    "status",
    "action",
    "reporting-mta",
)


@dataclass(slots=True)
class BounceCheckResult:
    scanned: int = 0
    matched: int = 0
    bounced_emails: list[str] = field(default_factory=list)
    error: str | None = None


def _decode(value: str | None) -> str:
    if not value:
        return ""
    parts = decode_header(value)
    out: list[str] = []
    for text, enc in parts:
        if isinstance(text, bytes):
            out.append(text.decode(enc or "utf-8", errors="ignore"))
        else:
            out.append(text)
    return "".join(out)


def _looks_like_bounce(msg: Message) -> bool:
    from_header = _decode(msg.get("From", "")).lower()
    subject = _decode(msg.get("Subject", "")).lower()
    if any(hint in from_header for hint in _BOUNCE_FROM_HINTS):
        return True
    if any(hint in subject for hint in _BOUNCE_SUBJECT_HINTS):
        return True
    return msg.get_content_type() == "multipart/report"


def _extract_text(msg: Message) -> str:
    """Pull every plain-text / delivery-status part out of a (possibly multipart) message."""
    chunks: list[str] = []
    for part in msg.walk():
        content_type = part.get_content_type()
        if content_type in ("text/plain", "text/html"):
            try:
                payload = part.get_payload(decode=True)
                if payload:
                    charset = part.get_content_charset() or "utf-8"
                    chunks.append(payload.decode(charset, errors="ignore"))
            except Exception:  # pragma: no cover - defensive, malformed MIME part
                pass
        # A message/delivery-status part (RFC 3464) encodes Final-Recipient,
        # Diagnostic-Code, Status, etc. as *headers* of a nested sub-message rather
        # than as body text, so pull those out directly regardless of content-type.
        for key, value in part.items():
            if key.lower() in _DSN_HEADER_NAMES:
                chunks.append(f"{key}: {value}")
    return "\n".join(chunks)


_DIAGNOSTIC_PREFIXES = ("diagnostic-code:", "status:", "action:")


def _extract_diagnostic(text: str) -> str | None:
    """Best-effort human-readable reason line from a delivery-status report.

    Checked in priority order so a specific Diagnostic-Code (e.g. "550 5.1.1 user
    unknown") wins over a generic Action/Status line when both are present.
    """
    lines = text.splitlines()
    for prefix in _DIAGNOSTIC_PREFIXES:
        for line in lines:
            stripped = line.strip()
            if stripped.lower().startswith(prefix):
                return stripped
    return None


class BounceService:
    """Polls the outbound mailbox over IMAP for non-delivery reports (bounces).

    The SMTP relay we send through doesn't offer a bounce webhook, so a wrong or
    non-existent recipient address is usually accepted at send time (status "sent")
    and only bounces back asynchronously as a regular email to the sending mailbox.
    This scans that mailbox, matches bounce messages against our own "sent" campaign
    recipients, flips them to status "bounced" with the SMTP diagnostic captured in
    error_message, and suppresses the address so it's never emailed again.
    """

    def check_bounces(self, db: Session, *, max_messages: int = 200) -> BounceCheckResult:
        result = BounceCheckResult()
        if not settings.imap_enabled:
            result.error = "IMAP is not configured (set IMAP_HOST, and IMAP_USER/IMAP_PASSWORD if different from SMTP)."
            return result

        # Recipients we've actually sent to, keyed by lowercased email — used to confirm a
        # candidate bounce message is really about one of our sends, not unrelated inbox mail.
        candidates: dict[str, CampaignRecipient] = {}
        rows = db.execute(
            select(CampaignRecipient).where(CampaignRecipient.status == "sent")
        ).scalars().all()
        for row in rows:
            candidates[row.recipient_email.lower()] = row

        if not candidates:
            return result

        try:
            imap = self._connect()
        except Exception as exc:  # pragma: no cover - network/env dependent
            logger.exception("IMAP connection failed while checking for bounces")
            result.error = f"Could not connect to IMAP: {exc}"
            return result

        try:
            imap.select(settings.imap_folder or "INBOX")
            status_code, data = imap.search(None, "UNSEEN")
            if status_code != "OK":
                result.error = "IMAP search failed."
                return result

            message_ids = (data[0].split() if data and data[0] else [])[-max_messages:]
            for msg_id in message_ids:
                result.scanned += 1
                fetch_status, msg_data = imap.fetch(msg_id, "(RFC822)")
                if fetch_status != "OK" or not msg_data or not msg_data[0]:
                    continue
                raw = msg_data[0][1]
                msg = email.message_from_bytes(raw)
                if not _looks_like_bounce(msg):
                    continue

                text = _extract_text(msg) + "\n" + _decode(msg.get("Subject", ""))
                found_addresses = {addr.lower() for addr in EMAIL_RE.findall(text)}
                matched_email = next((addr for addr in found_addresses if addr in candidates), None)
                if not matched_email:
                    continue

                recipient = candidates.pop(matched_email)
                diagnostic = _extract_diagnostic(text) or "Bounced (non-delivery report received)."
                recipient.status = "bounced"
                recipient.error_message = diagnostic[:2000]
                db.add(recipient)
                campaign_service.add_suppression(
                    db, email=matched_email, reason="bounce", source="imap_bounce_scan"
                )
                result.matched += 1
                result.bounced_emails.append(matched_email)

            db.commit()
        finally:
            try:
                imap.close()
            except Exception:
                pass
            try:
                imap.logout()
            except Exception:
                pass

        return result

    def _connect(self) -> imaplib.IMAP4:
        if settings.imap_use_ssl:
            imap = imaplib.IMAP4_SSL(settings.imap_host, settings.imap_port, timeout=settings.imap_timeout)
        else:
            imap = imaplib.IMAP4(settings.imap_host, settings.imap_port, timeout=settings.imap_timeout)
            if settings.imap_use_starttls:
                imap.starttls()
        imap.login(settings.imap_effective_user, settings.imap_effective_password)
        return imap


bounce_service = BounceService()
