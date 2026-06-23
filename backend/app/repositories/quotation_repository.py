from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.quotation import Quotation


class QuotationRepository:
    def create(self, db: Session, quotation: Quotation) -> Quotation:
        db.add(quotation)
        db.flush()
        return quotation

    def get(self, db: Session, quotation_id: str) -> Quotation | None:
        stmt = (
            select(Quotation)
            .where(Quotation.id == quotation_id)
            .options(selectinload(Quotation.items), selectinload(Quotation.lead))
        )
        return db.scalar(stmt)

    def get_by_code(self, db: Session, quote_code: str) -> Quotation | None:
        stmt = (
            select(Quotation)
            .where(Quotation.quote_code == quote_code)
            .options(selectinload(Quotation.items), selectinload(Quotation.lead))
        )
        return db.scalar(stmt)

    def list(
        self,
        db: Session,
        *,
        lead_id: str | None = None,
        created_by_staff_id: str | None = None,
    ) -> list[Quotation]:
        stmt = select(Quotation).options(selectinload(Quotation.items), selectinload(Quotation.lead))
        if lead_id:
            stmt = stmt.where(Quotation.lead_id == lead_id)
        if created_by_staff_id:
            stmt = stmt.where(Quotation.created_by_staff_id == created_by_staff_id)
        stmt = stmt.order_by(Quotation.created_at.desc(), Quotation.revision_number.desc())
        return list(db.scalars(stmt).all())
