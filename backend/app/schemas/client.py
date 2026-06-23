from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, EmailStr, Field


class ClientLoginIn(BaseModel):
    email: EmailStr


class ClientOtpChallengeOut(BaseModel):
    challenge_id: str
    masked_email: str
    expires_in_seconds: int
    otp_digits: int
    message: str


class ClientOtpVerifyIn(BaseModel):
    email: EmailStr
    challenge_id: str
    otp: str


class ClientSessionOut(BaseModel):
    token: str
    expires_at: datetime
    email: str


class ClientQuotation(BaseModel):
    quotation_number: str
    quote_code: str | None = None
    status: str
    total_amount: Decimal
    currency: str
    created_at: datetime
    pay_url: str | None = None


class ClientPayment(BaseModel):
    invoice_number: str | None = None
    status: str
    total_amount: Decimal
    currency: str
    created_at: datetime


class ClientTimelineStep(BaseModel):
    key: str
    label: str
    done: bool
    at: datetime | None = None


class ClientProject(BaseModel):
    reference: str | None = None
    title: str
    company: str | None = None
    status: str
    status_label: str
    created_at: datetime
    timeline: list[ClientTimelineStep] = Field(default_factory=list)
    quotations: list[ClientQuotation] = Field(default_factory=list)
    payments: list[ClientPayment] = Field(default_factory=list)


class ClientPortalOverview(BaseModel):
    client_name: str
    email: str
    projects: list[ClientProject] = Field(default_factory=list)
