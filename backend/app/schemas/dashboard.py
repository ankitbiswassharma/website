from __future__ import annotations

from decimal import Decimal

from pydantic import BaseModel


class DashboardSummaryOut(BaseModel):
    total_leads: int
    qualified_leads: int
    proposal_sent: int
    won_leads: int
    lost_leads: int
    conversion_rate: float
    revenue: Decimal
