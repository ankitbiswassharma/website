from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.api.deps import get_staff_session
from app.api.routes.admin_leads import serialize_admin_quotation
from app.api.routes.staff_leads import ensure_lead_assigned
from app.db.session import get_db
from app.repositories.payment_repository import PaymentRepository
from app.repositories.quotation_repository import QuotationRepository
from app.repositories.user_repository import UserRepository
from app.schemas.payment import AdminPaymentLinkCreateIn, AdminPaymentLinkOut, PaymentOut
from app.schemas.quotation import AdminQuotationOut, AdminQuotationSendIn, AdminQuotationUpsertIn
from app.services.payment_service import payment_service
from app.services.quotation_service import quotation_service


router = APIRouter(prefix="/staff", tags=["staff-quotations"])
quotation_repository = QuotationRepository()
payment_repository = PaymentRepository()
user_repository = UserRepository()


def _actor(db: Session, staff_session) -> tuple[str, str]:
    user = user_repository.get(db, staff_session.user_id)
    label = f"staff:{user.name}" if user else f"staff:{staff_session.email}"
    return label, staff_session.user_id


def _load_assigned_quotation(db: Session, quotation_id: str, staff_user_id: str):
    """Fetch a quotation, ensuring its lead is assigned to this staff user."""
    quotation = quotation_repository.get(db, quotation_id)
    if not quotation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quotation not found")
    ensure_lead_assigned(db, quotation.lead_id, staff_user_id)
    return quotation


@router.get("/quotations", response_model=list[AdminQuotationOut])
def list_quotations(
    lead_id: str | None = None,
    mine: bool = False,
    staff_session=Depends(get_staff_session),
    db: Session = Depends(get_db),
):
    if lead_id:
        ensure_lead_assigned(db, lead_id, staff_session.user_id)
    created_by_staff_id = staff_session.user_id if mine else None
    quotations = quotation_repository.list(db, lead_id=lead_id, created_by_staff_id=created_by_staff_id)
    return [serialize_admin_quotation(quotation) for quotation in quotations]


@router.post("/leads/{lead_id}/quotation", response_model=AdminQuotationOut)
def create_quotation(
    lead_id: str,
    payload: AdminQuotationUpsertIn,
    staff_session=Depends(get_staff_session),
    db: Session = Depends(get_db),
):
    ensure_lead_assigned(db, lead_id, staff_session.user_id)
    actor_label, actor_staff_id = _actor(db, staff_session)
    quotation = quotation_service.upsert_for_lead(
        db,
        lead_id=lead_id,
        payload=payload,
        actor_label=actor_label,
        actor_staff_id=actor_staff_id,
    )
    return serialize_admin_quotation(quotation)


@router.get("/quotations/{quotation_id}/pdf")
def get_quotation_pdf(quotation_id: str, staff_session=Depends(get_staff_session), db: Session = Depends(get_db)):
    quotation = _load_assigned_quotation(db, quotation_id, staff_session.user_id)
    if not quotation.pdf_path:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quotation PDF not found")
    return FileResponse(quotation.pdf_path, media_type="application/pdf", filename=f"{quotation.quotation_number}.pdf")


@router.get("/quotations/{quotation_id}/docx")
def get_quotation_docx(quotation_id: str, staff_session=Depends(get_staff_session), db: Session = Depends(get_db)):
    quotation = _load_assigned_quotation(db, quotation_id, staff_session.user_id)
    if not quotation.docx_path:
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
    staff_session=Depends(get_staff_session),
    db: Session = Depends(get_db),
):
    _load_assigned_quotation(db, quotation_id, staff_session.user_id)
    if not file.filename.lower().endswith(".docx"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Please upload a .docx quotation file")
    actor_label, actor_staff_id = _actor(db, staff_session)
    file_bytes = await file.read()
    quotation = quotation_service.apply_uploaded_docx(
        db,
        quotation_id=quotation_id,
        file_bytes=file_bytes,
        actor_label=actor_label,
        actor_staff_id=actor_staff_id,
    )
    return serialize_admin_quotation(quotation)


@router.post("/quotations/{quotation_id}/send", response_model=AdminQuotationOut)
def send_quotation(
    quotation_id: str,
    payload: AdminQuotationSendIn,
    staff_session=Depends(get_staff_session),
    db: Session = Depends(get_db),
):
    _load_assigned_quotation(db, quotation_id, staff_session.user_id)
    actor_label, actor_staff_id = _actor(db, staff_session)
    quotation = quotation_service.send_to_client(
        db,
        quotation_id=quotation_id,
        personalized_message=payload.personalized_message,
        actor_label=actor_label,
        actor_staff_id=actor_staff_id,
    )
    return serialize_admin_quotation(quotation)


@router.post("/quotations/{quotation_id}/payment-link", response_model=AdminPaymentLinkOut)
async def create_payment_link(
    quotation_id: str,
    payload: AdminPaymentLinkCreateIn,
    staff_session=Depends(get_staff_session),
    db: Session = Depends(get_db),
):
    _load_assigned_quotation(db, quotation_id, staff_session.user_id)
    result = await payment_service.create_admin_payment_link(
        db,
        quotation_id=quotation_id,
        message=payload.message,
        send_email=payload.send_email,
    )
    return AdminPaymentLinkOut(**result)


@router.get("/payments", response_model=list[PaymentOut])
def list_my_payments(staff_session=Depends(get_staff_session), db: Session = Depends(get_db)):
    payments = payment_repository.list_for_staff(db, staff_session.user_id)
    return [
        PaymentOut.model_validate(payment).model_copy(
            update={
                "lead_name": payment.lead.full_name if payment.lead else None,
                "company": payment.lead.company if payment.lead else None,
                "quotation_number": payment.quotation.quotation_number if payment.quotation else None,
            }
        )
        for payment in payments
    ]
