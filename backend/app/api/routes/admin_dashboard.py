from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_admin_session
from app.db.session import get_db
from app.repositories.payment_repository import PaymentRepository
from app.schemas.dashboard import DashboardSummaryOut
from app.schemas.payment import PaymentOut
from app.services.dashboard_service import dashboard_service


router = APIRouter(prefix="/admin", tags=["admin-dashboard"])
payment_repository = PaymentRepository()


@router.get("/dashboard/summary", response_model=DashboardSummaryOut)
def dashboard_summary(_: object = Depends(get_admin_session), db: Session = Depends(get_db)):
    return DashboardSummaryOut(**dashboard_service.summary(db))


@router.get("/payments", response_model=list[PaymentOut])
def list_payments(_: object = Depends(get_admin_session), db: Session = Depends(get_db)):
    payments = payment_repository.list(db)
    return [
        PaymentOut(
            **PaymentOut.model_validate(payment).model_dump(),
            lead_name=payment.lead.full_name if payment.lead else None,
            company=payment.lead.company if payment.lead else None,
            quotation_number=payment.quotation.quotation_number if payment.quotation else None,
        )
        for payment in payments
    ]
