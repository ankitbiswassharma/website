from __future__ import annotations

from datetime import date

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.core.security import utcnow
from app.models.activity import LeadActivity
from app.models.enums import ActivityType, LeadStatus
from app.models.lead import Lead
from app.models.payment import Payment
from app.models.quotation import Quotation


class LeadRepository:
    def create(self, db: Session, lead: Lead) -> Lead:
        db.add(lead)
        db.flush()
        return lead

    def get(self, db: Session, lead_id: str) -> Lead | None:
        stmt = (
            select(Lead)
            .where(Lead.id == lead_id)
            .options(
                selectinload(Lead.activities),
                selectinload(Lead.quotations).selectinload(Quotation.items),
                selectinload(Lead.payments),
            )
        )
        return db.scalar(stmt)

    def list(
        self,
        db: Session,
        *,
        status: LeadStatus | None = None,
        search: str | None = None,
        request_type: str | None = None,
        created_from: date | None = None,
        created_to: date | None = None,
    ) -> list[Lead]:
        stmt = select(Lead).order_by(Lead.created_at.desc())
        if status:
            stmt = stmt.where(Lead.status == status)
        if search:
            pattern = f"%{search.lower()}%"
            stmt = stmt.where(
                func.lower(Lead.full_name).like(pattern)
                | func.lower(Lead.email).like(pattern)
                | func.lower(func.coalesce(Lead.company, "")).like(pattern)
            )
        if request_type:
            stmt = stmt.where(Lead.request_type == request_type)
        if created_from:
            stmt = stmt.where(func.date(Lead.created_at) >= created_from)
        if created_to:
            stmt = stmt.where(func.date(Lead.created_at) <= created_to)
        return list(db.scalars(stmt).all())

    def add_activity(
        self,
        db: Session,
        *,
        lead_id: str,
        activity_type: ActivityType,
        description: str,
        created_by: str = "system",
        payload: dict | None = None,
    ) -> LeadActivity:
        activity = LeadActivity(
            lead_id=lead_id,
            activity_type=activity_type,
            description=description,
            created_by=created_by,
            payload=payload,
            created_at=utcnow(),
        )
        db.add(activity)
        db.flush()
        return activity

    def update(self, db: Session, lead: Lead) -> Lead:
        db.add(lead)
        db.flush()
        return lead

    def latest_quotation(self, db: Session, lead_id: str) -> Quotation | None:
        stmt = (
            select(Quotation)
            .where(Quotation.lead_id == lead_id)
            .order_by(Quotation.created_at.desc(), Quotation.revision_number.desc())
            .limit(1)
        )
        return db.scalar(stmt)

    def latest_payment(self, db: Session, lead_id: str) -> Payment | None:
        stmt = (
            select(Payment)
            .where(Payment.lead_id == lead_id)
            .order_by(Payment.created_at.desc())
            .limit(1)
        )
        return db.scalar(stmt)
