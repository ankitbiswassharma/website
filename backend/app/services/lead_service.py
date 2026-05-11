from __future__ import annotations

import logging

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import utcnow
from app.models.enums import ActivityType, LeadRequestType
from app.models.lead import Lead
from app.repositories.lead_repository import LeadRepository
from app.services.company_service import company_service
from app.services.email_service import email_service
from app.utils.formatting import plain_text_to_html, sanitize_rich_text


lead_repository = LeadRepository()
logger = logging.getLogger(__name__)


class LeadService:
    def _notify_on_lead_creation(
        self,
        db: Session,
        lead: Lead,
        *,
        request_label: str,
        request_ip: str | None,
        request_user_agent: str | None,
    ) -> None:
        admin_result = email_service.send_template(
            db=db,
            template_name="new_lead_admin.html",
            context={
                "lead": lead,
                "request_label": request_label,
                "company_name": settings.company_name,
                "company_tagline": settings.company_tagline,
                "dashboard_url": f"{settings.frontend_url}/dashboard",
                "admin_name": settings.admin_name,
            },
            to_email=settings.admin_email,
            subject=f"New {settings.company_name} lead from {lead.full_name}",
            lead_id=lead.id,
            payload={"event": "lead_created_admin_notification", "request_label": request_label},
        )
        user_result = email_service.send_template(
            db=db,
            template_name="lead_confirmation.html",
            context={
                "lead": lead,
                "company_name": settings.company_name,
                "company_tagline": settings.company_tagline,
                "admin_name": settings.admin_name,
                "admin_phone": settings.admin_phone,
                "admin_whatsapp": settings.admin_whatsapp,
                "frontend_url": settings.frontend_url,
            },
            to_email=lead.email,
            subject=f"We received your {request_label} for {settings.company_name}",
            lead_id=lead.id,
            payload={"event": "lead_created_client_confirmation", "request_label": request_label},
        )
        notification_payload = {
            "ip": request_ip,
            "user_agent": request_user_agent,
            "admin_email_sent": admin_result.success,
            "client_email_sent": user_result.success,
            "admin_email_status": admin_result.status,
            "client_email_status": user_result.status,
        }
        if admin_result.success and user_result.success:
            description = "Lead confirmation and admin notification emails sent"
        else:
            description = "Lead created, but one or more notification emails could not be delivered"
            logger.warning(
                "Lead %s created with partial email delivery. admin_email_sent=%s client_email_sent=%s",
                lead.id,
                admin_result.success,
                user_result.success,
            )
        lead_repository.add_activity(
            db=db,
            lead_id=lead.id,
            activity_type=ActivityType.EMAIL,
            description=description,
            payload=notification_payload,
        )

    def create_lead(self, db: Session, payload, *, request_ip: str | None, request_user_agent: str | None):
        requirements_text = payload.requirements.strip()
        lead = Lead(
            full_name=payload.name.strip(),
            email=payload.email.strip().lower(),
            phone=(payload.phone or "").strip() or None,
            company=(payload.company_name or "").strip() or None,
            request_type=LeadRequestType.CONTACT,
            source="lead_form",
            client_requirements_html=plain_text_to_html(requirements_text),
            client_requirements_text=requirements_text,
            created_at=utcnow(),
            updated_at=utcnow(),
        )
        lead_repository.create(db, lead)
        company = company_service.ensure_company_for_lead(db, lead)
        lead_repository.add_activity(
            db,
            lead_id=lead.id,
            activity_type=ActivityType.SYSTEM,
            description="Lead created from lead management form",
        )
        if company:
            lead_repository.add_activity(
                db,
                lead_id=lead.id,
                activity_type=ActivityType.SYSTEM,
                description=f"Company portal prepared as {company.login_url}",
                payload={"company_code": company.company_code, "lead_reference": lead.lead_reference},
            )
        self._notify_on_lead_creation(
            db,
            lead,
            request_label="lead enquiry",
            request_ip=request_ip,
            request_user_agent=request_user_agent,
        )
        db.commit()
        db.refresh(lead)
        return lead

    def create_public_lead(self, db: Session, payload, *, request_ip: str | None, request_user_agent: str | None):
        requirements_html, requirements_text = sanitize_rich_text(payload.client_requirements_html)
        lead = Lead(
            full_name=payload.full_name.strip(),
            email=payload.email.strip().lower(),
            phone=(payload.phone or "").strip() or None,
            company=(payload.company or "").strip() or None,
            designation=(payload.designation or "").strip() or None,
            project_type=(payload.project_type or "").strip() or None,
            request_type=payload.request_type,
            source=payload.source or "website",
            client_requirements_html=requirements_html,
            client_requirements_text=requirements_text,
            preferred_demo_date=payload.preferred_demo_date,
            preferred_demo_time=(payload.preferred_demo_time or "").strip() or None,
            created_at=utcnow(),
            updated_at=utcnow(),
        )
        lead_repository.create(db, lead)
        company = company_service.ensure_company_for_lead(db, lead)
        lead_repository.add_activity(
            db,
            lead_id=lead.id,
            activity_type=ActivityType.SYSTEM,
            description=f"Lead created from {lead.request_type.value} form",
        )
        if company:
            lead_repository.add_activity(
                db,
                lead_id=lead.id,
                activity_type=ActivityType.SYSTEM,
                description=f"Company portal prepared as {company.login_url}",
                payload={"company_code": company.company_code, "lead_reference": lead.lead_reference},
            )

        request_label = "demo request" if lead.request_type == LeadRequestType.DEMO else "contact enquiry"
        self._notify_on_lead_creation(
            db,
            lead,
            request_label=request_label,
            request_ip=request_ip,
            request_user_agent=request_user_agent,
        )
        db.commit()
        return lead

    def update_lead(self, db: Session, lead_id: str, *, status_value=None, admin_notes: str | None = None):
        lead = lead_repository.get(db, lead_id)
        if not lead:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")

        if status_value and lead.status != status_value:
            lead.status = status_value
            lead.updated_at = utcnow()
            if status_value.value == "qualified":
                lead.qualified_at = utcnow()
            if status_value.value == "proposal_sent":
                lead.proposal_sent_at = utcnow()
            if status_value.value == "won":
                lead.won_at = utcnow()
            if status_value.value == "lost":
                lead.lost_at = utcnow()
            lead_repository.add_activity(
                db,
                lead_id=lead.id,
                activity_type=ActivityType.STATUS,
                description=f"Lead moved to {status_value.value}",
                created_by="admin",
            )

        if admin_notes is not None:
            lead.admin_notes = admin_notes
            lead.updated_at = utcnow()
            lead_repository.add_activity(
                db,
                lead_id=lead.id,
                activity_type=ActivityType.NOTE,
                description="Internal notes updated",
                created_by="admin",
            )

        lead_repository.update(db, lead)
        db.commit()
        db.refresh(lead)
        return lead

    def add_activity(self, db: Session, lead_id: str, description: str, created_by: str) -> None:
        lead = lead_repository.get(db, lead_id)
        if not lead:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
        lead_repository.add_activity(
            db,
            lead_id=lead_id,
            activity_type=ActivityType.NOTE,
            description=description,
            created_by=created_by,
        )
        db.commit()


lead_service = LeadService()
