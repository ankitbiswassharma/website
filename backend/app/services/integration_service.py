from __future__ import annotations

import hashlib
import hmac
import json
import secrets

import httpx
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import utcnow
from app.models.integration import InboundEvent, WebhookDelivery, WebhookEndpoint
from app.repositories.integration_repository import IntegrationRepository
from app.utils.net import UnsafeWebhookURL, assert_public_http_url

# Outbound event types the platform can emit to subscribed webhook endpoints.
OUTBOUND_EVENTS = [
    "lead.created",
    "consultation.requested",
    "quotation.sent",
    "payment.received",
]

# Inbound sources the platform knows how to accept signed webhooks from.
INBOUND_SOURCES = ["generic", "razorpay", "zapier", "make"]

# Static catalog surfaced to the public integrations page / API.
CATALOG = [
    {
        "key": "payments",
        "label": "Payments & Billing",
        "description": "Collect payments and reconcile invoices automatically.",
        "connectors": ["Razorpay", "Stripe", "PayPal", "UPI"],
    },
    {
        "key": "communication",
        "label": "Email & Messaging",
        "description": "Transactional email and team notifications on every event.",
        "connectors": ["SMTP", "SendGrid", "WhatsApp", "Slack", "Microsoft Teams"],
    },
    {
        "key": "crm",
        "label": "CRM & Sales",
        "description": "Sync leads and deals with the CRM your sales team lives in.",
        "connectors": ["HubSpot", "Zoho CRM", "Salesforce", "Pipedrive"],
    },
    {
        "key": "erp_accounting",
        "label": "ERP & Accounting",
        "description": "Push orders, inventory, and invoices into your books.",
        "connectors": ["Tally", "Zoho Books", "QuickBooks", "SAP"],
    },
    {
        "key": "cloud_devops",
        "label": "Cloud & DevOps",
        "description": "Deploy and run on the infrastructure you already use.",
        "connectors": ["AWS", "Google Cloud", "Azure", "Docker", "GitHub Actions"],
    },
    {
        "key": "data_apis",
        "label": "Data & APIs",
        "description": "Connect anything else over REST, GraphQL, or signed webhooks.",
        "connectors": ["REST API", "GraphQL", "Webhooks", "PostgreSQL", "Google Sheets"],
    },
]


class IntegrationService:
    def __init__(self) -> None:
        self.repository = IntegrationRepository()

    # ----- catalog ---------------------------------------------------------
    def get_catalog(self) -> dict:
        return {
            "categories": [
                {
                    "key": category["key"],
                    "label": category["label"],
                    "description": category["description"],
                    "connectors": [
                        {"name": name, "status": "available"} for name in category["connectors"]
                    ],
                }
                for category in CATALOG
            ],
            "outbound_events": OUTBOUND_EVENTS,
            "inbound_sources": INBOUND_SOURCES,
        }

    # ----- endpoint registration ------------------------------------------
    def register_endpoint(
        self,
        db: Session,
        *,
        name: str,
        target_url: str,
        event_types: list[str],
        description: str | None,
    ) -> WebhookEndpoint:
        try:
            assert_public_http_url(target_url)
        except UnsafeWebhookURL as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
        normalized = ",".join(sorted({event.strip() for event in event_types if event.strip()})) or "*"
        endpoint = WebhookEndpoint(
            name=name,
            target_url=target_url,
            secret=f"whsec_{secrets.token_hex(24)}",
            event_types=normalized,
            description=description,
            is_active=True,
            created_at=utcnow(),
        )
        self.repository.create_endpoint(db, endpoint)
        db.commit()
        db.refresh(endpoint)
        return endpoint

    def list_endpoints(self, db: Session) -> list[WebhookEndpoint]:
        return self.repository.list_endpoints(db)

    # ----- outbound dispatch ----------------------------------------------
    @staticmethod
    def _sign(secret: str, body: bytes) -> str:
        digest = hmac.new(secret.encode("utf-8"), body, hashlib.sha256).hexdigest()
        return f"sha256={digest}"

    @staticmethod
    def _is_subscribed(endpoint: WebhookEndpoint, event_type: str) -> bool:
        subscriptions = {item.strip() for item in (endpoint.event_types or "*").split(",")}
        return "*" in subscriptions or event_type in subscriptions

    def dispatch_event(self, db: Session, *, event_type: str, payload: dict) -> dict:
        """Send a signed event to every active, subscribed endpoint.

        Failures are logged per-endpoint and never raised, so emitting an
        event can never break the action that triggered it.
        """
        endpoints = [
            endpoint
            for endpoint in self.repository.list_endpoints(db, active_only=True)
            if self._is_subscribed(endpoint, event_type)
        ]
        delivered = 0
        failed = 0
        body = json.dumps(
            {"event": event_type, "data": payload, "sent_at": utcnow().isoformat()},
            default=str,
        ).encode("utf-8")

        for endpoint in endpoints:
            status_label = "delivered"
            response_code: int | None = None
            error: str | None = None
            try:
                # Re-validate at send time: guards endpoints stored before the
                # registration check existed, and narrows the DNS-rebind window.
                assert_public_http_url(endpoint.target_url)
                response = httpx.post(
                    endpoint.target_url,
                    content=body,
                    headers={
                        "Content-Type": "application/json",
                        "X-Muskit-Event": event_type,
                        "X-Muskit-Signature": self._sign(endpoint.secret, body),
                    },
                    timeout=settings.integrations_dispatch_timeout,
                )
                response_code = response.status_code
                if response.is_success:
                    delivered += 1
                else:
                    status_label = "failed"
                    failed += 1
            except Exception as exc:  # noqa: BLE001 - never let a webhook break the caller
                status_label = "failed"
                error = str(exc)[:480]
                failed += 1

            endpoint.last_triggered_at = utcnow()
            db.add(endpoint)
            self.repository.add_delivery(
                db,
                WebhookDelivery(
                    endpoint_id=endpoint.id,
                    event_type=event_type,
                    status=status_label,
                    response_code=response_code,
                    error=error,
                    created_at=utcnow(),
                ),
            )

        db.commit()
        return {
            "event_type": event_type,
            "endpoints_matched": len(endpoints),
            "delivered": delivered,
            "failed": failed,
        }

    # ----- inbound ---------------------------------------------------------
    def verify_inbound(self, raw_body: bytes, signature: str | None) -> bool:
        secret = settings.integrations_inbound_secret
        if not secret or not signature:
            return False
        expected = self._sign(secret, raw_body)
        # Accept either "sha256=<hex>" or a bare hex digest.
        candidate = signature if signature.startswith("sha256=") else f"sha256={signature}"
        return hmac.compare_digest(expected, candidate)

    def record_inbound(
        self,
        db: Session,
        *,
        source: str,
        raw_body: bytes,
        signature: str | None,
    ) -> InboundEvent:
        signature_valid = self.verify_inbound(raw_body, signature)
        try:
            parsed = json.loads(raw_body.decode("utf-8")) if raw_body else {}
        except (ValueError, UnicodeDecodeError):
            parsed = {}
        event_type = None
        if isinstance(parsed, dict):
            event_type = parsed.get("event") or parsed.get("type") or parsed.get("event_type")
        event = InboundEvent(
            source=source,
            event_type=event_type,
            signature_valid=signature_valid,
            payload_json=raw_body.decode("utf-8", errors="replace")[:8000] if raw_body else None,
            created_at=utcnow(),
        )
        self.repository.add_inbound(db, event)
        db.commit()
        db.refresh(event)
        return event


integration_service = IntegrationService()
