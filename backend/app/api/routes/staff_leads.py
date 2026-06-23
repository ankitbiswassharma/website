from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_staff_session
from app.api.routes.admin_leads import serialize_lead_detail
from app.db.session import get_db
from app.models.enums import LeadStatus
from app.repositories.lead_repository import LeadRepository
from app.repositories.user_repository import UserRepository
from app.schemas.lead import LeadDetail, LeadListItem, LeadNotesUpdateIn, LeadUpdateIn
from app.services.lead_service import lead_service


router = APIRouter(prefix="/staff", tags=["staff-leads"])
lead_repository = LeadRepository()
user_repository = UserRepository()


def ensure_lead_assigned(db: Session, lead_id: str, staff_user_id: str) -> None:
    """Raise unless ``lead_id`` is currently assigned to this staff user."""
    assignment = lead_repository.get_assignment(db, lead_id)
    if not assignment or assignment.staff_user_id != staff_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This lead is not assigned to you.",
        )


@router.get("/leads", response_model=list[LeadListItem])
def list_leads(
    status_filter: str | None = None,
    search: str | None = None,
    staff_session=Depends(get_staff_session),
    db: Session = Depends(get_db),
):
    try:
        parsed_status = LeadStatus(status_filter) if status_filter else None
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid lead status filter") from exc
    assigned_ids = lead_repository.lead_ids_for_staff(db, staff_session.user_id)
    leads = lead_repository.list(db, status=parsed_status, search=search, ids=assigned_ids)
    return [LeadListItem.model_validate(lead) for lead in leads]


@router.get("/leads/{lead_id}", response_model=LeadDetail)
def get_lead(lead_id: str, staff_session=Depends(get_staff_session), db: Session = Depends(get_db)):
    lead = lead_repository.get(db, lead_id)
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    ensure_lead_assigned(db, lead_id, staff_session.user_id)
    return serialize_lead_detail(db, lead)


@router.patch("/leads/{lead_id}", response_model=LeadDetail)
def update_lead(
    lead_id: str,
    payload: LeadUpdateIn,
    staff_session=Depends(get_staff_session),
    db: Session = Depends(get_db),
):
    ensure_lead_assigned(db, lead_id, staff_session.user_id)
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


@router.patch("/leads/{lead_id}/notes", response_model=LeadDetail)
def update_lead_notes(
    lead_id: str,
    payload: LeadNotesUpdateIn,
    staff_session=Depends(get_staff_session),
    db: Session = Depends(get_db),
):
    ensure_lead_assigned(db, lead_id, staff_session.user_id)
    lead = lead_service.update_lead(db, lead_id, admin_notes=payload.admin_notes)
    refreshed = lead_repository.get(db, lead.id)
    return serialize_lead_detail(db, refreshed)
