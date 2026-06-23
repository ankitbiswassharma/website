import uuid

from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.enums import LeadRequestType
from app.repositories.company_repository import CompanyRepository
from app.schemas.lead import LeadCreatedOut, PublicLeadCreate
from app.utils.rate_limit import client_ip, lead_form_limiter
from app.schemas.payment import PaymentVerifyIn, PaymentVerifyOut, PaymentWebhookOut
from app.schemas.company import PublicCompanyOut
from app.schemas.quotation import PublicPaymentOrderOut, PublicQuotationView, QuotationOut
from app.services.lead_service import lead_service
from app.services.payment_service import payment_service
from app.repositories.quotation_repository import QuotationRepository


router = APIRouter(tags=["public"])
quotation_repository = QuotationRepository()
company_repository = CompanyRepository()


def _guard_public_lead(payload: PublicLeadCreate, request: Request) -> LeadCreatedOut | None:
    """Return a fake-success response for bots (honeypot), enforce rate limiting.

    Returns a LeadCreatedOut to short-circuit the request, or None to proceed.
    """
    if (payload.company_website or "").strip():
        return LeadCreatedOut(lead_id=str(uuid.uuid4()), status="new")
    if not lead_form_limiter.allow(client_ip(request)):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many submissions. Please try again in a few minutes.",
        )
    return None


@router.post("/public/leads/contact", response_model=LeadCreatedOut)
def submit_contact_form(payload: PublicLeadCreate, request: Request, db: Session = Depends(get_db)):
    short_circuit = _guard_public_lead(payload, request)
    if short_circuit is not None:
        return short_circuit
    payload.request_type = LeadRequestType.CONTACT
    lead = lead_service.create_public_lead(
        db,
        payload,
        request_ip=request.client.host if request.client else None,
        request_user_agent=request.headers.get("user-agent"),
    )
    return LeadCreatedOut(lead_id=lead.id, status=lead.status.value)


@router.post("/public/leads/demo", response_model=LeadCreatedOut)
def submit_demo_form(payload: PublicLeadCreate, request: Request, db: Session = Depends(get_db)):
    short_circuit = _guard_public_lead(payload, request)
    if short_circuit is not None:
        return short_circuit
    payload.request_type = LeadRequestType.DEMO
    lead = lead_service.create_public_lead(
        db,
        payload,
        request_ip=request.client.host if request.client else None,
        request_user_agent=request.headers.get("user-agent"),
    )
    return LeadCreatedOut(lead_id=lead.id, status=lead.status.value)


@router.get("/public/companies", response_model=list[PublicCompanyOut])
def list_public_companies(db: Session = Depends(get_db)):
    companies = company_repository.list(db, active_only=True)
    return [PublicCompanyOut.model_validate(company) for company in companies]


@router.get("/public/quotations/{quote_code}", response_model=PublicQuotationView)
def get_public_quotation(quote_code: str, db: Session = Depends(get_db)):
    quotation = quotation_repository.get_by_code(db, quote_code)
    if not quotation:
        from fastapi import HTTPException, status

        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quotation not found")
    return PublicQuotationView(
        **QuotationOut.model_validate(quotation).model_dump(),
        lead_name=quotation.lead.full_name,
        company=quotation.lead.company,
    )


@router.post("/public/quotations/{quote_code}/payment-order", response_model=PublicPaymentOrderOut)
async def create_payment_order(quote_code: str, db: Session = Depends(get_db)):
    result = await payment_service.get_public_payment_order(db, quote_code)
    return PublicPaymentOrderOut(**result)


@router.post("/public/payments/verify", response_model=PaymentVerifyOut)
def verify_payment(payload: PaymentVerifyIn, db: Session = Depends(get_db)):
    payment = payment_service.finalize_payment(
        db,
        order_id=payload.razorpay_order_id,
        payment_id=payload.razorpay_payment_id,
        signature=payload.razorpay_signature,
        gateway_payload=payload.model_dump(),
        event_source="checkout",
    )
    return PaymentVerifyOut(invoice_number=payment.invoice_number, lead_status=payment.lead.status.value)


@router.post("/public/payments/webhooks/razorpay", response_model=PaymentWebhookOut)
async def razorpay_webhook(
    request: Request,
    x_razorpay_signature: str | None = Header(default=None),
    db: Session = Depends(get_db),
):
    result = payment_service.handle_webhook(db, raw_body=await request.body(), signature=x_razorpay_signature)
    return PaymentWebhookOut(**result)
