from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True, use_enum_values=True)


class MonetaryAmount(ORMModel):
    subtotal: Decimal
    tax_amount: Decimal
    total_amount: Decimal
    currency: str


class ApiMessage(ORMModel):
    message: str
    timestamp: datetime | None = None


class DateFilter(ORMModel):
    start_date: date | None = None
    end_date: date | None = None
