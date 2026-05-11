from __future__ import annotations

from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.enums import LeadStatus, PaymentStatus
from app.models.lead import Lead
from app.models.payment import Payment


class DashboardService:
    def summary(self, db: Session) -> dict:
        total_leads = db.scalar(select(func.count(Lead.id))) or 0
        qualified = db.scalar(select(func.count(Lead.id)).where(Lead.status == LeadStatus.QUALIFIED)) or 0
        proposal_sent = db.scalar(select(func.count(Lead.id)).where(Lead.status == LeadStatus.PROPOSAL_SENT)) or 0
        won = db.scalar(select(func.count(Lead.id)).where(Lead.status == LeadStatus.WON)) or 0
        lost = db.scalar(select(func.count(Lead.id)).where(Lead.status == LeadStatus.LOST)) or 0
        revenue = db.scalar(select(func.coalesce(func.sum(Payment.total_amount), 0)).where(Payment.status == PaymentStatus.PAID))
        conversion_rate = round((won / total_leads) * 100, 2) if total_leads else 0.0
        return {
            "total_leads": total_leads,
            "qualified_leads": qualified,
            "proposal_sent": proposal_sent,
            "won_leads": won,
            "lost_leads": lost,
            "conversion_rate": conversion_rate,
            "revenue": revenue if isinstance(revenue, Decimal) else Decimal(str(revenue or 0)),
        }


dashboard_service = DashboardService()
