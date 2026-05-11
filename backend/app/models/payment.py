import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import JSON, DateTime, Enum, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import PaymentStatus


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    lead_id: Mapped[str] = mapped_column(ForeignKey("leads.id", ondelete="CASCADE"), index=True)
    quotation_id: Mapped[str] = mapped_column(ForeignKey("quotations.id", ondelete="CASCADE"), index=True)
    status: Mapped[PaymentStatus] = mapped_column(
        Enum(PaymentStatus, name="payment_status"),
        nullable=False,
        default=PaymentStatus.PENDING,
        index=True,
    )
    provider: Mapped[str] = mapped_column(String(50), nullable=False, default="razorpay")
    currency: Mapped[str] = mapped_column(String(8), nullable=False, default="INR")
    subtotal: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    tax_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    receipt: Mapped[str] = mapped_column(String(64), nullable=False, unique=True)
    razorpay_order_id: Mapped[str | None] = mapped_column(String(120), unique=True)
    razorpay_payment_id: Mapped[str | None] = mapped_column(String(120), unique=True)
    razorpay_signature: Mapped[str | None] = mapped_column(String(256))
    payment_page_url: Mapped[str | None] = mapped_column(String(500))
    invoice_number: Mapped[str | None] = mapped_column(String(50), unique=True)
    gateway_payload: Mapped[dict | None] = mapped_column(JSON)
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    lead: Mapped["Lead"] = relationship(back_populates="payments")
    quotation: Mapped["Quotation"] = relationship(back_populates="payments")
