import json
import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import QuotationStatus


class Quotation(Base):
    __tablename__ = "quotations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    quotation_number: Mapped[str] = mapped_column(String(32), nullable=False, unique=True, index=True)
    quote_code: Mapped[str] = mapped_column(String(32), nullable=False, unique=True, index=True)
    quotation_series: Mapped[str | None] = mapped_column(String(32), index=True)
    revision_number: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    lead_id: Mapped[str] = mapped_column(ForeignKey("leads.id", ondelete="CASCADE"), index=True)
    status: Mapped[QuotationStatus] = mapped_column(
        Enum(QuotationStatus, name="quotation_status"),
        nullable=False,
        default=QuotationStatus.DRAFT,
        index=True,
    )
    currency: Mapped[str] = mapped_column(String(8), nullable=False, default="INR")
    title: Mapped[str] = mapped_column(String(200), nullable=False, default="Custom SaaS Proposal")
    intro_message: Mapped[str | None] = mapped_column(Text)
    requirements_summary: Mapped[str | None] = mapped_column(Text)
    tax_label: Mapped[str] = mapped_column(String(50), nullable=False, default="GST")
    tax_rate: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    tax_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    valid_until: Mapped[date] = mapped_column(Date, nullable=False)
    pdf_path: Mapped[str | None] = mapped_column(String(500))
    docx_path: Mapped[str | None] = mapped_column(String(500))
    sections_json: Mapped[str | None] = mapped_column(Text)
    payment_page_url: Mapped[str | None] = mapped_column(String(500))
    personalized_message: Mapped[str | None] = mapped_column(Text)
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    lead: Mapped["Lead"] = relationship(back_populates="quotations")
    items: Mapped[list["QuotationItem"]] = relationship(
        back_populates="quotation",
        cascade="all, delete-orphan",
        order_by="QuotationItem.sort_order",
    )
    payments: Mapped[list["Payment"]] = relationship(back_populates="quotation")

    @property
    def sections(self) -> list[dict[str, str]]:
        if not self.sections_json:
            return []
        try:
            parsed = json.loads(self.sections_json)
        except (TypeError, ValueError):
            return []
        sections: list[dict[str, str]] = []
        for item in parsed if isinstance(parsed, list) else []:
            if not isinstance(item, dict):
                continue
            title = str(item.get("title") or "").strip()
            content = str(item.get("content") or "").strip()
            if not title:
                continue
            sections.append({"title": title, "content": content})
        return sections

    @property
    def revision_label(self) -> str:
        return f"R{self.revision_number}"


class QuotationItem(Base):
    __tablename__ = "quotation_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    quotation_id: Mapped[str] = mapped_column(ForeignKey("quotations.id", ondelete="CASCADE"), index=True)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    unit: Mapped[str | None] = mapped_column(String(30))
    quantity: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    line_total: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)

    quotation: Mapped["Quotation"] = relationship(back_populates="items")
