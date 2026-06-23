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


class FunnelStage(BaseModel):
    key: str
    label: str
    count: int
    pct_of_total: float          # share of all leads (for bar widths)
    conversion_from_prev: float  # % that advanced from the previous stage


class FunnelSourceRow(BaseModel):
    source: str
    count: int


class FunnelTrendPoint(BaseModel):
    month: str  # "YYYY-MM"
    leads: int


class FunnelOut(BaseModel):
    total_leads: int
    won_leads: int
    paid_leads: int
    revenue: Decimal
    win_rate: float
    stages: list[FunnelStage]
    sources: list[FunnelSourceRow]
    trend: list[FunnelTrendPoint]
