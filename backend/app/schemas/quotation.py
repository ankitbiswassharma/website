from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, Field

from app.schemas.common import ORMModel


class QuotationItemIn(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    description: str | None = None
    unit: str | None = Field(default="Nos", max_length=30)
    quantity: Decimal = Field(gt=0)
    unit_price: Decimal = Field(gt=0)


class QuotationSectionIn(BaseModel):
    title: str = Field(min_length=2, max_length=120)
    content: str = Field(default="", max_length=12000)


class AdminQuotationUpsertIn(BaseModel):
    title: str = Field(default="Custom SaaS Proposal", max_length=200)
    intro_message: str | None = None
    requirements_summary: str | None = None
    tax_rate: Decimal | None = None
    valid_until: date | None = None
    items: list[QuotationItemIn] = Field(min_length=1)
    sections: list[QuotationSectionIn] = Field(default_factory=list)
    send_email: bool = False
    personalized_message: str | None = None


class AdminQuotationSendIn(BaseModel):
    personalized_message: str | None = Field(default=None, max_length=4000)


class QuotationItemOut(ORMModel):
    id: int | None = None
    title: str
    description: str | None
    unit: str | None
    quantity: Decimal
    unit_price: Decimal
    line_total: Decimal


class QuotationSectionOut(ORMModel):
    title: str
    content: str


class QuotationOut(ORMModel):
    id: str
    quotation_number: str
    quote_code: str
    quotation_series: str | None = None
    revision_number: int = 0
    status: str
    title: str
    intro_message: str | None
    requirements_summary: str | None
    tax_label: str
    tax_rate: Decimal
    subtotal: Decimal
    tax_amount: Decimal
    total_amount: Decimal
    currency: str
    valid_until: date
    pdf_path: str | None
    payment_page_url: str | None
    sent_at: datetime | None
    created_at: datetime
    updated_at: datetime
    items: list[QuotationItemOut]
    sections: list[QuotationSectionOut] = []


class AdminQuotationOut(QuotationOut):
    lead_id: str
    docx_path: str | None
    personalized_message: str | None
    lead_name: str
    company: str | None
    lead_email: str


class PublicQuotationView(QuotationOut):
    lead_name: str
    company: str | None


class PublicPaymentOrderOut(BaseModel):
    success: bool = True
    mode: str
    status: str | None = None
    payment_id: str | None = None
    key_id: str | None = None
    order_id: str | None = None
    amount: int | None = None
    currency: str | None = None
    prefill: dict | None = None
    payment_page_url: str | None = None
    message: str | None = None
