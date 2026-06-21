from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.integration import InboundEvent, WebhookDelivery, WebhookEndpoint


class IntegrationRepository:
    def create_endpoint(self, db: Session, endpoint: WebhookEndpoint) -> WebhookEndpoint:
        db.add(endpoint)
        db.flush()
        return endpoint

    def get_endpoint(self, db: Session, endpoint_id: str) -> WebhookEndpoint | None:
        return db.get(WebhookEndpoint, endpoint_id)

    def list_endpoints(self, db: Session, *, active_only: bool = False) -> list[WebhookEndpoint]:
        stmt = select(WebhookEndpoint).order_by(WebhookEndpoint.created_at.desc())
        if active_only:
            stmt = stmt.where(WebhookEndpoint.is_active.is_(True))
        return list(db.scalars(stmt).all())

    def add_delivery(self, db: Session, delivery: WebhookDelivery) -> WebhookDelivery:
        db.add(delivery)
        db.flush()
        return delivery

    def add_inbound(self, db: Session, event: InboundEvent) -> InboundEvent:
        db.add(event)
        db.flush()
        return event
