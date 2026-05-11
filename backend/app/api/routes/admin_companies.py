from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_admin_session
from app.db.session import get_db
from app.repositories.company_repository import CompanyRepository
from app.schemas.company import CompanyCreateIn, CompanyOut, CompanyUpdateIn
from app.services.company_service import company_service


router = APIRouter(prefix="/admin", tags=["admin-companies"])
company_repository = CompanyRepository()


@router.get("/companies", response_model=list[CompanyOut])
def list_companies(_: object = Depends(get_admin_session), db: Session = Depends(get_db)):
    companies = company_repository.list(db)
    return [CompanyOut.model_validate(company) for company in companies]


@router.post("/companies", response_model=CompanyOut)
def create_company(payload: CompanyCreateIn, _: object = Depends(get_admin_session), db: Session = Depends(get_db)):
    company = company_service.save_admin_company(
        db,
        name=payload.name,
        company_code=payload.company_code,
        address=payload.address,
        contact_person=payload.contact_person,
        contact_email=payload.contact_email,
    )
    db.commit()
    db.refresh(company)
    return CompanyOut.model_validate(company)


@router.patch("/companies/{company_id}", response_model=CompanyOut)
def update_company(
    company_id: str,
    payload: CompanyUpdateIn,
    _: object = Depends(get_admin_session),
    db: Session = Depends(get_db),
):
    company = company_service.save_admin_company(
        db,
        company_id=company_id,
        name=payload.name,
        company_code=payload.company_code,
        address=payload.address,
        contact_person=payload.contact_person,
        contact_email=payload.contact_email,
        is_active=payload.is_active,
    )
    db.commit()
    db.refresh(company)
    return CompanyOut.model_validate(company)
