from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.company import Company


class CompanyRepository:
    def create(self, db: Session, company: Company) -> Company:
        db.add(company)
        db.flush()
        return company

    def update(self, db: Session, company: Company) -> Company:
        db.add(company)
        db.flush()
        return company

    def get(self, db: Session, company_id: str) -> Company | None:
        return db.get(Company, company_id)

    def get_by_code(self, db: Session, company_code: str | None) -> Company | None:
        if not company_code:
            return None
        stmt = select(Company).where(Company.company_code == company_code.upper())
        return db.scalar(stmt)

    def get_by_name(self, db: Session, company_name: str | None) -> Company | None:
        if not company_name:
            return None
        stmt = select(Company).where(func.lower(Company.name) == company_name.strip().lower())
        return db.scalar(stmt)

    def list(self, db: Session, *, active_only: bool = False) -> list[Company]:
        stmt = select(Company).order_by(func.lower(Company.name))
        if active_only:
            stmt = stmt.where(Company.is_active.is_(True))
        return list(db.scalars(stmt).all())
