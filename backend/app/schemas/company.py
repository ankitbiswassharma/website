from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import ORMModel


class CompanyCreateIn(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    company_code: str = Field(min_length=2, max_length=20)
    address: str | None = Field(default=None, max_length=4000)
    contact_person: str | None = Field(default=None, max_length=160)
    contact_email: str | None = Field(default=None, max_length=320)


class CompanyUpdateIn(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=160)
    company_code: str | None = Field(default=None, min_length=2, max_length=20)
    address: str | None = Field(default=None, max_length=4000)
    contact_person: str | None = Field(default=None, max_length=160)
    contact_email: str | None = Field(default=None, max_length=320)
    is_active: bool | None = None


class CompanyOut(ORMModel):
    id: str
    name: str
    company_code: str
    address: str | None
    contact_person: str | None
    contact_email: str | None
    login_url: str
    source: str
    is_active: bool
    lead_sequence: int
    latest_lead_reference: str | None
    latest_lead_id: str | None
    latest_quotation_id: str | None
    latest_payment_id: str | None
    domain_ready_notified_at: datetime | None
    created_at: datetime
    updated_at: datetime


class PublicCompanyOut(ORMModel):
    id: str
    name: str
    company_code: str
    login_url: str
    contact_person: str | None
