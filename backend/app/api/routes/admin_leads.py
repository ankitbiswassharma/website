from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.api.deps import get_admin_session
from app.db.session import get_db
from app.repositories.lead_repository import LeadRepository
from app.repositories.quotation_repository import QuotationRepository
from app.models.enums import LeadStatus
from app.schemas.lead import LeadActivityCreate, LeadDetail, LeadListItem, LeadNotesUpdateIn, LeadUpdateIn
from app.schemas.payment import AdminPaymentLinkCreateIn, AdminPaymentLinkOut
from app.schemas.quotation import AdminQuotationOut, AdminQuotationSendIn, AdminQuotationUpsertIn, QuotationOut
from app.services.lead_service import lead_service
from app.services.payment_service import payment_service
from app.services.quotation_service import quotation_service


router = APIRouter(prefix="/admin", tags=["admin-leads"])
lead_repository = LeadRepository()
quotation_repository = QuotationRepository()


def serialize_lead_detail(db: Session, lead) -> LeadDetail:
    latest_quote = lead_repository.latest_quotation(db, lead.id)
    latest_payment = lead_repository.latest_payment(db, lead.id)
    return LeadDetail(
        **LeadListItem.model_validate(lead).model_dump(),
        designation=lead.designation,
        source=lead.source,
        client_requirements_html=lead.client_requirements_html,
        client_requirements_text=lead.client_requirements_text,
        admin_notes=lead.admin_notes,
        latest_quotation_id=latest_quote.id if latest_quote else None,
        latest_quotation_number=latest_quote.quotation_number if latest_quote else None,
        latest_quote_code=latest_quote.quote_code if latest_quote else None,
        latest_payment_status=latest_payment.status.value if latest_payment else None,
        activities=lead.activities,
    )


def serialize_admin_quotation(quotation) -> AdminQuotationOut:
    return AdminQuotationOut(
        **QuotationOut.model_validate(quotation).model_dump(),
        lead_id=quotation.lead_id,
        docx_path=quotation.docx_path,
        personalized_message=quotation.personalized_message,
        lead_name=quotation.lead.full_name if quotation.lead else "",
        company=quotation.lead.company if quotation.lead else None,
        lead_email=quotation.lead.email if quotation.lead else "",
    )


@router.get("/leads", response_model=list[LeadListItem])
def list_leads(
    status_filter: str | None = None,
    search: str | None = None,
    request_type: str | None = None,
    _: object = Depends(get_admin_session),
    db: Session = Depends(get_db),
):
    try:
        parsed_status = LeadStatus(status_filter) if status_filter else None
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid lead status filter") from exc
    leads = lead_repository.list(db, status=parsed_status, search=search, request_type=request_type)
    return [LeadListItem.model_validate(lead) for lead in leads]


@router.get("/leads/{lead_id}", response_model=LeadDetail)
def get_lead(lead_id: str, _: object = Depends(get_admin_session), db: Session = Depends(get_db)):
    lead = lead_repository.get(db, lead_id)
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    return serialize_lead_detail(db, lead)


@router.patch("/leads/{lead_id}", response_model=LeadDetail)
def update_lead(
    lead_id: str,
    payload: LeadUpdateIn,
    _: object = Depends(get_admin_session),
    db: Session = Depends(get_db),
):
    lead = lead_service.update_lead(db, lead_id, status_value=payload.status, admin_notes=payload.admin_notes)
    refreshed = lead_repository.get(db, lead.id)
    return serialize_lead_detail(db, refreshed)


@router.patch("/leads/{lead_id}/notes", response_model=LeadDetail)
def update_lead_notes(
    lead_id: str,
    payload: LeadNotesUpdateIn,
    _: object = Depends(get_admin_session),
    db: Session = Depends(get_db),
):
    lead = lead_service.update_lead(db, lead_id, admin_notes=payload.admin_notes)
    refreshed = lead_repository.get(db, lead.id)
    return serialize_lead_detail(db, refreshed)


@router.post("/leads/{lead_id}/activities")
def add_activity(
    lead_id: str,
    payload: LeadActivityCreate,
    _: object = Depends(get_admin_session),
    db: Session = Depends(get_db),
):
    lead_service.add_activity(db, lead_id, payload.description, payload.created_by)
    return {"success": True}


@router.post("/leads/{lead_id}/quotation", response_model=AdminQuotationOut)
def create_quotation(
    lead_id: str,
    payload: AdminQuotationUpsertIn,
    _: object = Depends(get_admin_session),
    db: Session = Depends(get_db),
):
    quotation = quotation_service.upsert_for_lead(db, lead_id=lead_id, payload=payload)
    return serialize_admin_quotation(quotation)


@router.get("/quotations", response_model=list[AdminQuotationOut])
def list_quotations(
    lead_id: str | None = None,
    _: object = Depends(get_admin_session),
    db: Session = Depends(get_db),
):
    quotations = quotation_repository.list(db, lead_id=lead_id)
    return [serialize_admin_quotation(quotation) for quotation in quotations]


@router.get("/quotations/{quotation_id}", response_model=AdminQuotationOut)
def get_quotation(quotation_id: str, _: object = Depends(get_admin_session), db: Session = Depends(get_db)):
    quotation = quotation_repository.get(db, quotation_id)
    if not quotation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quotation not found")
    return serialize_admin_quotation(quotation)


@router.get("/quotations/{quotation_id}/pdf")
def get_quotation_pdf(quotation_id: str, _: object = Depends(get_admin_session), db: Session = Depends(get_db)):
    quotation = quotation_repository.get(db, quotation_id)
    if not quotation or not quotation.pdf_path:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quotation PDF not found")
    return FileResponse(quotation.pdf_path, media_type="application/pdf", filename=f"{quotation.quotation_number}.pdf")


@router.get("/quotations/{quotation_id}/docx")
def get_quotation_docx(quotation_id: str, _: object = Depends(get_admin_session), db: Session = Depends(get_db)):
    quotation = quotation_repository.get(db, quotation_id)
    if not quotation or not quotation.docx_path:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quotation DOCX not found")
    return FileResponse(
        quotation.docx_path,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=f"{quotation.quotation_number}.docx",
    )


@router.post("/quotations/{quotation_id}/edited-docx", response_model=AdminQuotationOut)
async def upload_edited_docx(
    quotation_id: str,
    file: UploadFile = File(...),
    _: object = Depends(get_admin_session),
    db: Session = Depends(get_db),
):
    if not file.filename.lower().endswith(".docx"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Please upload a .docx quotation file")
    file_bytes = await file.read()
    quotation = quotation_service.apply_uploaded_docx(db, quotation_id=quotation_id, file_bytes=file_bytes)
    return serialize_admin_quotation(quotation)


@router.post("/quotations/{quotation_id}/send", response_model=AdminQuotationOut)
def send_quotation(
    quotation_id: str,
    payload: AdminQuotationSendIn,
    _: object = Depends(get_admin_session),
    db: Session = Depends(get_db),
):
    quotation = quotation_service.send_to_client(
        db,
        quotation_id=quotation_id,
        personalized_message=payload.personalized_message,
    )
    return serialize_admin_quotation(quotation)


@router.post("/quotations/{quotation_id}/payment-link", response_model=AdminPaymentLinkOut)
async def create_payment_link(
    quotation_id: str,
    payload: AdminPaymentLinkCreateIn,
    _: object = Depends(get_admin_session),
    db: Session = Depends(get_db),
):
    result = await payment_service.create_admin_payment_link(
        db,
        quotation_id=quotation_id,
        message=payload.message,
        send_email=payload.send_email,
    )
    return AdminPaymentLinkOut(**result)
