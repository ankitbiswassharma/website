from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field

from app.schemas.common import ORMModel


class PaymentVerifyIn(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class PaymentOut(ORMModel):
    id: str
    lead_id: str
    quotation_id: str
    lead_name: str | None = None
    company: str | None = None
    quotation_number: str | None = None
    status: str
    provider: str
    currency: str
    subtotal: Decimal
    tax_amount: Decimal
    total_amount: Decimal
    receipt: str
    razorpay_order_id: str | None
    razorpay_payment_id: str | None
    invoice_number: str | None
    paid_at: datetime | None
    created_at: datetime


class PaymentVerifyOut(BaseModel):
    success: bool = True
    invoice_number: str
    lead_status: str


class AdminPaymentLinkCreateIn(BaseModel):
    message: str | None = Field(default=None, max_length=4000)
    send_email: bool = True


class AdminPaymentLinkOut(BaseModel):
    success: bool = True
    quotation_id: str
    quote_code: str
    payment_id: str | None = None
    status: str
    mode: str
    order_id: str | None = None
    payment_page_url: str | None = None
    email_sent: bool = False
    message: str


class PaymentWebhookOut(BaseModel):
    success: bool = True
    event: str
    status: str
    message: str
