from __future__ import annotations

from pathlib import Path

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import utcnow
from app.models.company import Company
from app.models.lead import Lead
from app.repositories.company_repository import CompanyRepository
from app.services.email_service import email_service
from app.utils.formatting import (
    derive_company_code,
    generate_lead_reference,
    parse_lead_reference_sequence,
    sanitize_company_code,
)


company_repository = CompanyRepository()


class CompanyService:
    def build_login_url(self, company_code: str) -> str:
        code = sanitize_company_code(company_code).lower()
        domain = settings.enterprise_base_domain.strip().lower() or "muskit.in"
        return f"https://{code}.{domain}"

    def _clean_text(self, value: str | None) -> str | None:
        cleaned = (value or "").strip()
        return cleaned or None

    def _candidate_code(self, company_name: str, preferred_code: str | None = None) -> str:
        seed = sanitize_company_code(preferred_code) if preferred_code else derive_company_code(company_name)
        return (seed or "COMP")[:12]

    def _generate_unique_code(
        self,
        db: Session,
        *,
        company_name: str,
        preferred_code: str | None = None,
        company_id: str | None = None,
    ) -> str:
        base_code = self._candidate_code(company_name, preferred_code)
        candidate = base_code
        counter = 2
        while True:
            existing = company_repository.get_by_code(db, candidate)
            if not existing or existing.id == company_id:
                return candidate
            suffix = str(counter)
            candidate = f"{base_code[: max(2, 12 - len(suffix))]}{suffix}"
            counter += 1

    def _assign_lead_reference(self, company: Company, lead: Lead) -> None:
        existing_sequence = parse_lead_reference_sequence(lead.lead_reference)
        if existing_sequence:
            company.lead_sequence = max(company.lead_sequence, existing_sequence)
            lead.lead_reference = generate_lead_reference(company.company_code, existing_sequence)
            return

        company.lead_sequence += 1
        lead.lead_reference = generate_lead_reference(company.company_code, company.lead_sequence)

    def _sync_company_to_matching_leads(
        self,
        db: Session,
        *,
        company: Company,
        previous_code: str | None = None,
    ) -> None:
        stmt = select(Lead).where(
            func.lower(func.coalesce(Lead.company, "")) == company.name.lower()
        )
        matching_leads = list(db.scalars(stmt).all())
        if previous_code and previous_code != company.company_code:
            prior_code_stmt = select(Lead).where(Lead.company_code == previous_code)
            prior_leads = list(db.scalars(prior_code_stmt).all())
            matching_ids = {lead.id for lead in matching_leads}
            matching_leads.extend([lead for lead in prior_leads if lead.id not in matching_ids])

        for lead in matching_leads:
            lead.company = company.name
            lead.company_code = company.company_code
            lead.company_login_url = company.login_url
            self._assign_lead_reference(company, lead)
            company.latest_lead_reference = lead.lead_reference
            company.latest_lead_id = lead.id
            lead.updated_at = utcnow()
            db.add(lead)

    def save_admin_company(
        self,
        db: Session,
        *,
        company_id: str | None = None,
        name: str | None,
        company_code: str | None,
        address: str | None,
        contact_person: str | None,
        contact_email: str | None = None,
        is_active: bool | None = None,
    ) -> Company:
        now = utcnow()
        company = company_repository.get(db, company_id) if company_id else None
        if company_id and not company:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")

        normalized_name = self._clean_text(name) or (company.name if company else None)
        if not normalized_name:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Company name is required")

        previous_code = company.company_code if company else None
        resolved_code = self._generate_unique_code(
            db,
            company_name=normalized_name,
            preferred_code=company_code,
            company_id=company.id if company else None,
        )

        if not company:
            existing_by_name = company_repository.get_by_name(db, normalized_name)
            if existing_by_name and existing_by_name.id != company_id:
                company = existing_by_name
                previous_code = company.company_code

        if company:
            company.name = normalized_name
            company.company_code = resolved_code
            company.address = self._clean_text(address)
            company.contact_person = self._clean_text(contact_person)
            company.contact_email = self._clean_text(contact_email)
            company.login_url = self.build_login_url(resolved_code)
            company.source = "admin"
            if is_active is not None:
                company.is_active = is_active
            company.updated_at = now
            company_repository.update(db, company)
        else:
            company = Company(
                name=normalized_name,
                company_code=resolved_code,
                address=self._clean_text(address),
                contact_person=self._clean_text(contact_person),
                contact_email=self._clean_text(contact_email),
                login_url=self.build_login_url(resolved_code),
                source="admin",
                is_active=True if is_active is None else is_active,
                lead_sequence=0,
                created_at=now,
                updated_at=now,
            )
            company_repository.create(db, company)

        self._sync_company_to_matching_leads(db, company=company, previous_code=previous_code)
        company.updated_at = now
        company_repository.update(db, company)
        return company

    def ensure_company_for_lead(self, db: Session, lead: Lead) -> Company | None:
        company_name = self._clean_text(lead.company)
        if not company_name:
            return None

        now = utcnow()
        company = company_repository.get_by_code(db, lead.company_code) if lead.company_code else None
        if not company:
            company = company_repository.get_by_name(db, company_name)

        if company:
            company.name = company_name
            company.contact_person = company.contact_person or self._clean_text(lead.full_name)
            company.contact_email = company.contact_email or self._clean_text(lead.email)
            company.updated_at = now
        else:
            code = self._generate_unique_code(db, company_name=company_name)
            company = Company(
                name=company_name,
                company_code=code,
                address=None,
                contact_person=self._clean_text(lead.full_name),
                contact_email=self._clean_text(lead.email),
                login_url=self.build_login_url(code),
                source="lead",
                is_active=True,
                lead_sequence=0,
                created_at=now,
                updated_at=now,
            )
            company_repository.create(db, company)

        lead.company = company.name
        lead.company_code = company.company_code
        lead.company_login_url = company.login_url
        self._assign_lead_reference(company, lead)
        company.latest_lead_reference = lead.lead_reference
        company.latest_lead_id = lead.id
        company.updated_at = now
        db.add(lead)
        company_repository.update(db, company)
        return company

    def backfill_existing_data(self, db: Session) -> None:
        leads = list(db.scalars(select(Lead).order_by(Lead.created_at.asc())).all())
        changed = False
        for lead in leads:
            if not lead.company:
                continue
            if lead.company_code and lead.company_login_url and lead.lead_reference:
                existing_company = company_repository.get_by_code(db, lead.company_code)
                if existing_company:
                    continue
            company = self.ensure_company_for_lead(db, lead)
            if company:
                changed = True
        if changed:
            db.commit()

    def notify_company_domain_ready(self, db: Session, *, lead, quotation, payment) -> None:
        company = company_repository.get_by_code(db, lead.company_code) if lead.company_code else None
        if not company:
            company = self.ensure_company_for_lead(db, lead)
        if not company:
            return
        if company.domain_ready_notified_at:
            return

        quotation_path = Path(quotation.pdf_path) if quotation.pdf_path else None
        attachments = [quotation_path] if quotation_path and quotation_path.exists() else None
        context = {
            "lead": lead,
            "quotation": quotation,
            "payment": payment,
            "company": company,
            "company_name": settings.company_name,
            "company_tagline": settings.company_tagline,
            "admin_name": settings.admin_name,
        }

        admin_result = email_service.send_template(
            db=db,
            template_name="company_domain_ready.html",
            context={**context, "recipient_name": settings.admin_name, "is_admin": True},
            to_email=settings.admin_email,
            subject=f"Enterprise login ready for {company.name}",
            attachments=attachments,
            lead_id=lead.id,
            quotation_id=quotation.id,
            payment_id=payment.id,
            payload={"event": "company_domain_ready_admin", "company_code": company.company_code},
        )

        client_result = email_service.send_template(
            db=db,
            template_name="company_domain_ready.html",
            context={**context, "recipient_name": company.contact_person or lead.full_name, "is_admin": False},
            to_email=company.contact_email or lead.email,
            subject=f"Your {company.name} enterprise login link is ready",
            attachments=attachments,
            lead_id=lead.id,
            quotation_id=quotation.id,
            payment_id=payment.id,
            payload={"event": "company_domain_ready_client", "company_code": company.company_code},
        )

        if admin_result.success or client_result.success:
            company.latest_quotation_id = quotation.id
            company.latest_payment_id = payment.id
            company.domain_ready_notified_at = utcnow()
            company.updated_at = utcnow()
            company_repository.update(db, company)


company_service = CompanyService()
