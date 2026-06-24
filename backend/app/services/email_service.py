from __future__ import annotations

import base64
import logging
import mimetypes
import smtplib
import socket
import ssl
import time
from dataclasses import dataclass
from email.message import EmailMessage
from email.utils import formataddr, parseaddr
from pathlib import Path

import httpx
from jinja2 import Environment, FileSystemLoader, select_autoescape
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import utcnow
from app.models.email_log import EmailLog


logger = logging.getLogger(__name__)

template_env = Environment(
    loader=FileSystemLoader(Path(__file__).resolve().parents[1] / "templates" / "email"),
    autoescape=select_autoescape(["html", "xml"]),
)


@dataclass(slots=True)
class EmailDeliveryResult:
    success: bool
    status: str
    provider: str
    error_message: str | None = None
    provider_message_id: str | None = None


class EmailService:
    def render(self, template_name: str, context: dict) -> str:
        template = template_env.get_template(template_name)
        return template.render(**context)

    def send_template(
        self,
        *,
        db: Session | None = None,
        template_name: str,
        context: dict,
        to_email: str,
        subject: str,
        attachments: list[Path] | None = None,
        lead_id: str | None = None,
        quotation_id: str | None = None,
        payment_id: str | None = None,
        payload: dict | None = None,
    ) -> EmailDeliveryResult:
        return self.send(
            db=db,
            to_email=to_email,
            subject=subject,
            html=self.render(template_name, context),
            attachments=attachments,
            template_name=template_name,
            lead_id=lead_id,
            quotation_id=quotation_id,
            payment_id=payment_id,
            payload=payload,
        )

    def send(
        self,
        *,
        db: Session | None = None,
        to_email: str,
        subject: str,
        html: str,
        attachments: list[Path] | None = None,
        template_name: str | None = None,
        lead_id: str | None = None,
        quotation_id: str | None = None,
        payment_id: str | None = None,
        payload: dict | None = None,
    ) -> EmailDeliveryResult:
        provider = settings.active_email_provider
        attachment_paths = attachments or []
        attachment_names = [attachment_path.name for attachment_path in attachment_paths]

        if provider == "none":
            result = EmailDeliveryResult(
                success=False,
                status="skipped",
                provider="none",
                error_message="No email provider is configured.",
            )
            logger.warning("Email delivery skipped for %s because no provider is configured", to_email)
            self._log_delivery(
                db=db,
                to_email=to_email,
                subject=subject,
                template_name=template_name,
                result=result,
                lead_id=lead_id,
                quotation_id=quotation_id,
                payment_id=payment_id,
                attachments=attachment_names,
                payload=payload,
            )
            return result

        if provider == "sendgrid":
            result = self._send_via_sendgrid(
                to_email=to_email,
                subject=subject,
                html=html,
                attachments=attachment_paths,
            )
        else:
            result = self._send_via_smtp(
                to_email=to_email,
                subject=subject,
                html=html,
                attachments=attachment_paths,
            )

        self._log_delivery(
            db=db,
            to_email=to_email,
            subject=subject,
            template_name=template_name,
            result=result,
            lead_id=lead_id,
            quotation_id=quotation_id,
            payment_id=payment_id,
            attachments=attachment_names,
            payload=payload,
        )
        return result

    def _build_from_address(self) -> str:
        smtp_from_name, smtp_from_email = parseaddr(settings.smtp_from)
        smtp_from_email = smtp_from_email or settings.smtp_from_address or settings.smtp_user
        smtp_from_name = smtp_from_name or settings.smtp_from_name or settings.company_name
        if settings.active_email_provider == "sendgrid":
            from_email = settings.sendgrid_from_email or smtp_from_email
            from_name = settings.sendgrid_from_name or smtp_from_name
            return formataddr((from_name, from_email)) if from_name else from_email
        return formataddr((smtp_from_name, smtp_from_email)) if smtp_from_name else smtp_from_email

    def _reply_to_address(self) -> str | None:
        reply_to = settings.email_reply_to.strip()
        return reply_to or None

    def _send_via_smtp(
        self,
        *,
        to_email: str,
        subject: str,
        html: str,
        attachments: list[Path],
    ) -> EmailDeliveryResult:
        message = EmailMessage()
        message["Subject"] = subject
        message["From"] = self._build_from_address()
        message["To"] = to_email
        reply_to = self._reply_to_address()
        if reply_to:
            message["Reply-To"] = reply_to
        message.set_content("This email requires an HTML-capable client.")
        message.add_alternative(html, subtype="html")

        for attachment_path in attachments:
            content_type, _ = mimetypes.guess_type(attachment_path.name)
            maintype, subtype = (content_type or "application/octet-stream").split("/", 1)
            with attachment_path.open("rb") as file_handle:
                message.add_attachment(
                    file_handle.read(),
                    maintype=maintype,
                    subtype=subtype,
                    filename=attachment_path.name,
                )

        # Many SMTP relays drop or defer the very first connection (cold TLS/DNS handshake,
        # transient disconnects), which previously surfaced to the user as a hard failure that
        # "worked after a page refresh". Retry on connection-level errors with a fresh connection
        # so a transient first attempt never reaches the caller.
        attempts = max(1, settings.smtp_max_attempts)
        last_exc: Exception | None = None
        for attempt in range(1, attempts + 1):
            try:
                self._deliver_over_smtp(message)
                return EmailDeliveryResult(success=True, status="sent", provider="smtp")
            except self._RETRYABLE_SMTP_ERRORS as exc:
                last_exc = exc
                if attempt < attempts:
                    logger.warning(
                        "Transient SMTP error sending to %s (attempt %s/%s): %s — retrying",
                        to_email,
                        attempt,
                        attempts,
                        exc,
                    )
                    time.sleep(settings.smtp_retry_delay)
                    continue
                logger.exception("SMTP delivery failed for %s after %s attempts", to_email, attempts)
            except (smtplib.SMTPException, OSError) as exc:
                # Non-retryable errors (e.g. authentication, malformed recipients): fail fast.
                last_exc = exc
                logger.exception("SMTP delivery failed for %s", to_email)
                break

        return EmailDeliveryResult(
            success=False,
            status="failed",
            provider="smtp",
            error_message=f"{last_exc.__class__.__name__}: {last_exc}" if last_exc else "SMTP delivery failed.",
        )

    # Connection-level errors that are typically resolved by reconnecting and retrying.
    _RETRYABLE_SMTP_ERRORS = (
        smtplib.SMTPServerDisconnected,
        smtplib.SMTPConnectError,
        smtplib.SMTPHeloError,
        ConnectionError,
        socket.timeout,
        TimeoutError,
    )

    def _deliver_over_smtp(self, message: EmailMessage) -> None:
        if settings.smtp_use_ssl:
            server_cm = smtplib.SMTP_SSL(
                settings.smtp_host,
                settings.smtp_port,
                timeout=settings.smtp_timeout,
            )
        else:
            server_cm = smtplib.SMTP(
                settings.smtp_host,
                settings.smtp_port,
                timeout=settings.smtp_timeout,
            )
        with server_cm as server:
            server.ehlo()
            if settings.smtp_use_starttls and not settings.smtp_use_ssl:
                if not server.has_extn("starttls"):
                    raise smtplib.SMTPNotSupportedError("SMTP server does not support STARTTLS")
                server.starttls(context=ssl.create_default_context())
                server.ehlo()
            self._smtp_login(server)
            server.send_message(message)

    def _smtp_login(self, server: smtplib.SMTP) -> None:
        auth_mechanisms = {
            mechanism.strip().upper()
            for mechanism in server.esmtp_features.get("auth", "").split()
            if mechanism.strip()
        }

        # Some SMTP providers advertise AUTH PLAIN but close the connection when it is attempted
        # with an initial response. Prefer LOGIN when available, then fall back to smtplib's default.
        if "LOGIN" in auth_mechanisms:
            server.user = settings.smtp_user
            server.password = settings.smtp_password
            server.auth("LOGIN", server.auth_login, initial_response_ok=False)
            return

        server.login(settings.smtp_user, settings.smtp_password)

    def _send_via_sendgrid(
        self,
        *,
        to_email: str,
        subject: str,
        html: str,
        attachments: list[Path],
    ) -> EmailDeliveryResult:
        from_name, from_email = parseaddr(self._build_from_address())
        if not from_email:
            from_email = settings.sendgrid_from_email
        from_payload = {"email": from_email}
        if from_name:
            from_payload["name"] = from_name

        request_payload: dict = {
            "personalizations": [{"to": [{"email": to_email}], "subject": subject}],
            "from": from_payload,
            "content": [{"type": "text/html", "value": html}],
        }
        reply_to = self._reply_to_address()
        if reply_to:
            request_payload["reply_to"] = {"email": reply_to}
        if attachments:
            request_payload["attachments"] = [self._build_sendgrid_attachment(path) for path in attachments]

        try:
            response = httpx.post(
                "https://api.sendgrid.com/v3/mail/send",
                json=request_payload,
                headers={
                    "Authorization": f"Bearer {settings.sendgrid_api_key}",
                    "Content-Type": "application/json",
                },
                timeout=20,
            )
            if response.status_code >= 400:
                logger.error("SendGrid delivery failed for %s: %s", to_email, response.text)
                return EmailDeliveryResult(
                    success=False,
                    status="failed",
                    provider="sendgrid",
                    error_message=f"SendGrid delivery failed with status {response.status_code}.",
                )
            return EmailDeliveryResult(
                success=True,
                status="sent",
                provider="sendgrid",
                provider_message_id=response.headers.get("X-Message-Id") or response.headers.get("x-message-id"),
            )
        except (httpx.HTTPError, OSError):
            logger.exception("SendGrid delivery failed for %s", to_email)
            return EmailDeliveryResult(
                success=False,
                status="failed",
                provider="sendgrid",
                error_message="SendGrid delivery failed.",
            )

    def _build_sendgrid_attachment(self, attachment_path: Path) -> dict:
        content_type, _ = mimetypes.guess_type(attachment_path.name)
        encoded_content = base64.b64encode(attachment_path.read_bytes()).decode("utf-8")
        return {
            "content": encoded_content,
            "type": content_type or "application/octet-stream",
            "filename": attachment_path.name,
            "disposition": "attachment",
        }

    def _log_delivery(
        self,
        *,
        db: Session | None,
        to_email: str,
        subject: str,
        template_name: str | None,
        result: EmailDeliveryResult,
        lead_id: str | None,
        quotation_id: str | None,
        payment_id: str | None,
        attachments: list[str] | None,
        payload: dict | None,
    ) -> None:
        if db is None:
            return

        email_log = EmailLog(
            lead_id=lead_id,
            quotation_id=quotation_id,
            payment_id=payment_id,
            recipient_email=to_email,
            subject=subject,
            template_name=template_name,
            provider=result.provider,
            status=result.status,
            provider_message_id=result.provider_message_id,
            error_message=result.error_message,
            attachments=attachments or None,
            payload=payload,
            created_at=utcnow(),
            sent_at=utcnow() if result.success else None,
        )
        db.add(email_log)


email_service = EmailService()
