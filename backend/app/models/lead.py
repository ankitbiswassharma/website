import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import LeadRequestType, LeadStatus


class Lead(Base):
    __tablename__ = "leads"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    full_name: Mapped[str] = mapped_column(String(160), nullable=False)
    email: Mapped[str] = mapped_column(String(320), nullable=False, index=True)
    phone: Mapped[str | None] = mapped_column(String(40))
    company: Mapped[str | None] = mapped_column(String(160))
    company_code: Mapped[str | None] = mapped_column(String(20), index=True)
    company_login_url: Mapped[str | None] = mapped_column(String(255))
    lead_reference: Mapped[str | None] = mapped_column(String(40), index=True)
    designation: Mapped[str | None] = mapped_column(String(120))
    project_type: Mapped[str | None] = mapped_column(String(120))
    request_type: Mapped[LeadRequestType] = mapped_column(
        Enum(LeadRequestType, name="lead_request_type"),
        nullable=False,
        default=LeadRequestType.CONTACT,
    )
    source: Mapped[str | None] = mapped_column(String(80))
    status: Mapped[LeadStatus] = mapped_column(
        Enum(LeadStatus, name="lead_status"),
        nullable=False,
        default=LeadStatus.NEW,
        index=True,
    )
    client_requirements_html: Mapped[str | None] = mapped_column(Text)
    client_requirements_text: Mapped[str | None] = mapped_column(Text)
    admin_notes: Mapped[str | None] = mapped_column(Text)
    preferred_demo_date: Mapped[date | None] = mapped_column(Date)
    preferred_demo_time: Mapped[str | None] = mapped_column(String(30))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    qualified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    proposal_sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    won_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    lost_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    activities: Mapped[list["LeadActivity"]] = relationship(
        back_populates="lead",
        cascade="all, delete-orphan",
        order_by="desc(LeadActivity.created_at)",
    )
    quotations: Mapped[list["Quotation"]] = relationship(
        back_populates="lead",
        cascade="all, delete-orphan",
        order_by="desc(Quotation.created_at)",
    )
    payments: Mapped[list["Payment"]] = relationship(
        back_populates="lead",
        cascade="all, delete-orphan",
        order_by="desc(Payment.created_at)",
    )

    @property
    def name(self) -> str:
        return self.full_name

    @name.setter
    def name(self, value: str) -> None:
        self.full_name = value

    @property
    def company_name(self) -> str | None:
        return self.company

    @company_name.setter
    def company_name(self, value: str | None) -> None:
        self.company = value

    @property
    def requirements(self) -> str | None:
        return self.client_requirements_text

    @requirements.setter
    def requirements(self, value: str | None) -> None:
        self.client_requirements_text = value
