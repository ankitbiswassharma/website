from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.payment import Payment


class PaymentRepository:
    def create(self, db: Session, payment: Payment) -> Payment:
        db.add(payment)
        db.flush()
        return payment

    def get_by_order_id(self, db: Session, order_id: str) -> Payment | None:
        stmt = (
            select(Payment)
            .where(Payment.razorpay_order_id == order_id)
            .options(selectinload(Payment.lead), selectinload(Payment.quotation))
        )
        return db.scalar(stmt)

    def get_latest_for_quotation(self, db: Session, quotation_id: str) -> Payment | None:
        stmt = (
            select(Payment)
            .where(Payment.quotation_id == quotation_id)
            .options(selectinload(Payment.lead), selectinload(Payment.quotation))
            .order_by(Payment.created_at.desc())
            .limit(1)
        )
        return db.scalar(stmt)

    def list(self, db: Session) -> list[Payment]:
        stmt = select(Payment).options(selectinload(Payment.lead), selectinload(Payment.quotation)).order_by(
            Payment.created_at.desc()
        )
        return list(db.scalars(stmt).all())
