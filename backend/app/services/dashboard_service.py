from __future__ import annotations

from collections import OrderedDict
from datetime import timedelta
from decimal import Decimal

from sqlalchemy import distinct, func, select
from sqlalchemy.orm import Session

from app.core.security import utcnow
from app.models.enums import LeadStatus, PaymentStatus
from app.models.lead import Lead
from app.models.payment import Payment


def _pct(part: int, whole: int) -> float:
    return round((part / whole) * 100, 1) if whole else 0.0


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

    def funnel(self, db: Session) -> dict:
        total = db.scalar(select(func.count(Lead.id))) or 0
        # "Reached a stage" uses the stage timestamps so a won lead still counts
        # toward every earlier stage it passed through.
        qualified = db.scalar(select(func.count(Lead.id)).where(Lead.qualified_at.is_not(None))) or 0
        proposal = db.scalar(select(func.count(Lead.id)).where(Lead.proposal_sent_at.is_not(None))) or 0
        won = db.scalar(select(func.count(Lead.id)).where(Lead.won_at.is_not(None))) or 0
        paid_leads = db.scalar(
            select(func.count(distinct(Payment.lead_id))).where(Payment.status == PaymentStatus.PAID)
        ) or 0
        revenue = db.scalar(
            select(func.coalesce(func.sum(Payment.total_amount), 0)).where(Payment.status == PaymentStatus.PAID)
        )
        revenue = revenue if isinstance(revenue, Decimal) else Decimal(str(revenue or 0))

        raw_stages = [
            ("leads", "Leads captured", total, total),
            ("qualified", "Qualified", qualified, total),
            ("proposal", "Proposal sent", proposal, qualified),
            ("won", "Won", won, proposal),
            ("paid", "Paid", paid_leads, won),
        ]
        stages = [
            {
                "key": key,
                "label": label,
                "count": count,
                "pct_of_total": _pct(count, total),
                "conversion_from_prev": _pct(count, prev),
            }
            for key, label, count, prev in raw_stages
        ]

        # Source breakdown (top 8)
        source_rows = db.execute(
            select(func.coalesce(Lead.source, "unknown"), func.count(Lead.id))
            .group_by(Lead.source)
            .order_by(func.count(Lead.id).desc())
            .limit(8)
        ).all()
        sources = [{"source": (s or "unknown"), "count": c} for s, c in source_rows]

        # Last 6 months trend (new leads per month), zero-filled.
        now = utcnow()
        buckets: "OrderedDict[str, int]" = OrderedDict()
        year, month = now.year, now.month
        months = []
        for _ in range(6):
            months.append(f"{year:04d}-{month:02d}")
            month -= 1
            if month == 0:
                month = 12
                year -= 1
        for key in reversed(months):
            buckets[key] = 0
        window_start = now - timedelta(days=200)
        recent = db.execute(
            select(Lead.created_at).where(Lead.created_at >= window_start)
        ).scalars().all()
        for created in recent:
            key = f"{created.year:04d}-{created.month:02d}"
            if key in buckets:
                buckets[key] += 1
        trend = [{"month": k, "leads": v} for k, v in buckets.items()]

        return {
            "total_leads": total,
            "won_leads": won,
            "paid_leads": paid_leads,
            "revenue": revenue,
            "win_rate": _pct(won, total),
            "stages": stages,
            "sources": sources,
            "trend": trend,
        }


dashboard_service = DashboardService()
