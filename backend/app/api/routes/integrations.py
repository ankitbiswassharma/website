from __future__ import annotations

from fastapi import APIRouter, Depends, Header, Request
from sqlalchemy.orm import Session

from app.api.deps import get_admin_session
from app.db.session import get_db
from app.schemas.integration import (
    EventDispatchIn,
    EventDispatchOut,
    InboundEventOut,
    IntegrationCatalogOut,
    WebhookEndpointCreate,
    WebhookEndpointCreatedOut,
    WebhookEndpointOut,
)
from app.services.integration_service import integration_service

router = APIRouter(tags=["integrations"])


# ----- public ------------------------------------------------------------
@router.get("/integrations/catalog", response_model=IntegrationCatalogOut)
def integration_catalog():
    """Connectors and event types the platform supports (future connectivity)."""
    return integration_service.get_catalog()


@router.post("/integrations/inbound/{source}", response_model=InboundEventOut)
async def receive_inbound_webhook(
    source: str,
    request: Request,
    x_muskit_signature: str | None = Header(default=None),
    db: Session = Depends(get_db),
):
    """Accept a signed inbound webhook from an external system and log it."""
    raw_body = await request.body()
    event = integration_service.record_inbound(
        db, source=source, raw_body=raw_body, signature=x_muskit_signature
    )
    return InboundEventOut(
        source=event.source,
        event_type=event.event_type,
        signature_valid=event.signature_valid,
    )


# ----- admin -------------------------------------------------------------
@router.get("/admin/integrations/webhooks", response_model=list[WebhookEndpointOut])
def list_webhook_endpoints(
    _: object = Depends(get_admin_session),
    db: Session = Depends(get_db),
):
    return [
        WebhookEndpointOut.model_validate(endpoint)
        for endpoint in integration_service.list_endpoints(db)
    ]


@router.post("/admin/integrations/webhooks", response_model=WebhookEndpointCreatedOut)
def create_webhook_endpoint(
    payload: WebhookEndpointCreate,
    _: object = Depends(get_admin_session),
    db: Session = Depends(get_db),
):
    endpoint = integration_service.register_endpoint(
        db,
        name=payload.name,
        target_url=str(payload.target_url),
        event_types=payload.event_types,
        description=payload.description,
    )
    return WebhookEndpointCreatedOut.model_validate(endpoint)


@router.post("/admin/integrations/dispatch", response_model=EventDispatchOut)
def dispatch_event(
    payload: EventDispatchIn,
    _: object = Depends(get_admin_session),
    db: Session = Depends(get_db),
):
    """Manually emit an event to all subscribed endpoints (useful for testing)."""
    result = integration_service.dispatch_event(
        db, event_type=payload.event_type, payload=payload.payload
    )
    return EventDispatchOut(**result)
