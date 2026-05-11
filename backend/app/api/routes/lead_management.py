from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.repositories.lead_repository import LeadRepository
from app.schemas.lead import LeadCreateIn, LeadOut, LeadStatusUpdateIn
from app.services.lead_service import lead_service


router = APIRouter(tags=["leads"])
lead_repository = LeadRepository()


@router.post("/leads", response_model=LeadOut, status_code=status.HTTP_201_CREATED)
def create_lead(payload: LeadCreateIn, request: Request, db: Session = Depends(get_db)):
    lead = lead_service.create_lead(
        db,
        payload,
        request_ip=request.client.host if request.client else None,
        request_user_agent=request.headers.get("user-agent"),
    )
    return LeadOut.model_validate(lead)


@router.get("/leads", response_model=list[LeadOut])
def list_leads(db: Session = Depends(get_db)):
    leads = lead_repository.list(db)
    return [LeadOut.model_validate(lead) for lead in leads]


@router.get("/leads/{lead_id}", response_model=LeadOut)
def get_lead(lead_id: str, db: Session = Depends(get_db)):
    lead = lead_repository.get(db, lead_id)
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    return LeadOut.model_validate(lead)


@router.patch("/leads/{lead_id}", response_model=LeadOut)
def update_lead(lead_id: str, payload: LeadStatusUpdateIn, db: Session = Depends(get_db)):
    lead = lead_service.update_lead(db, lead_id, status_value=payload.status)
    refreshed = lead_repository.get(db, lead.id)
    if not refreshed:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    return LeadOut.model_validate(refreshed)
