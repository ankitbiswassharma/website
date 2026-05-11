import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Company(Base):
    __tablename__ = "companies"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(160), nullable=False, index=True)
    company_code: Mapped[str] = mapped_column(String(20), nullable=False, unique=True, index=True)
    address: Mapped[str | None] = mapped_column(Text)
    contact_person: Mapped[str | None] = mapped_column(String(160))
    contact_email: Mapped[str | None] = mapped_column(String(320))
    login_url: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    source: Mapped[str] = mapped_column(String(40), nullable=False, default="admin")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)
    lead_sequence: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    latest_lead_reference: Mapped[str | None] = mapped_column(String(40))
    latest_lead_id: Mapped[str | None] = mapped_column(String(36))
    latest_quotation_id: Mapped[str | None] = mapped_column(String(36))
    latest_payment_id: Mapped[str | None] = mapped_column(String(36))
    domain_ready_notified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
