from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, HttpUrl

from app.schemas.common import ORMModel


class WebhookEndpointCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=2, max_length=160)
    target_url: HttpUrl
    event_types: list[str] = Field(
        default_factory=lambda: ["*"],
        description="Event types to subscribe to, or ['*'] for all events.",
    )
    description: str | None = Field(default=None, max_length=255)


class WebhookEndpointOut(ORMModel):
    id: str
    name: str
    target_url: str
    event_types: str
    is_active: bool
    description: str | None
    created_at: datetime
    last_triggered_at: datetime | None


class WebhookEndpointCreatedOut(WebhookEndpointOut):
    # Returned only once, at creation time, so the caller can store it.
    secret: str


class WebhookDeliveryOut(ORMModel):
    id: int
    endpoint_id: str
    event_type: str
    status: str
    response_code: int | None
    error: str | None
    created_at: datetime


class EventDispatchIn(BaseModel):
    model_config = ConfigDict(extra="forbid")

    event_type: str = Field(min_length=2, max_length=120)
    payload: dict = Field(default_factory=dict)


class EventDispatchOut(BaseModel):
    event_type: str
    endpoints_matched: int
    delivered: int
    failed: int


class InboundEventOut(BaseModel):
    received: bool = True
    source: str
    event_type: str | None = None
    signature_valid: bool


class IntegrationConnector(BaseModel):
    name: str
    status: str = "available"


class IntegrationCategory(BaseModel):
    key: str
    label: str
    description: str
    connectors: list[IntegrationConnector]


class IntegrationCatalogOut(BaseModel):
    categories: list[IntegrationCategory]
    outbound_events: list[str]
    inbound_sources: list[str]
