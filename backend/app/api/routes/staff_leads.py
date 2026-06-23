from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_staff_session
from app.api.routes.admin_leads import serialize_lead_detail
from app.db.session import get_db
from app.models.enums import LeadStatus
from app.repositories.lead_repository import LeadRepository
from app.repositories.user_repository import UserRepository
from app.schemas.lead import LeadDetail, LeadListItem, LeadUpdateIn
from app.services.lead_service import lead_service


router = APIRouter(prefix="/staff", tags=["staff-leads"])
lead_repository = LeadRepository()
user_repository = UserRepository()


@router.get("/leads", response_model=list[LeadListItem])
def list_leads(
    status_filter: str | None = None,
    search: str | None = None,
    _: object = Depends(get_staff_session),
    db: Session = Depends(get_db),
):
    try:
        parsed_status = LeadStatus(status_filter) if status_filter else None
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid lead status filter") from exc
    leads = lead_repository.list(db, status=parsed_status, search=search)
    return [LeadListItem.model_validate(lead) for lead in leads]


@router.get("/leads/{lead_id}", response_model=LeadDetail)
def get_lead(lead_id: str, _: object = Depends(get_staff_session), db: Session = Depends(get_db)):
    lead = lead_repository.get(db, lead_id)
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    return serialize_lead_detail(db, lead)


@router.patch("/leads/{lead_id}", response_model=LeadDetail)
def update_lead(
    lead_id: str,
    payload: LeadUpdateIn,
    staff_session=Depends(get_staff_session),
    db: Session = Depends(get_db),
):
    lead = lead_service.update_lead(
        db,
        lead_id,
        status_value=payload.status,
        admin_notes=payload.admin_notes,
    )
    if payload.status is not None:
        user = user_repository.get(db, staff_session.user_id)
        lead_service.add_activity(
            db,
            lead_id,
            f"Status updated by staff member {user.name if user else staff_session.email}",
            staff_session.email,
        )
    refreshed = lead_repository.get(db, lead.id)
    return serialize_lead_detail(db, refreshed)
