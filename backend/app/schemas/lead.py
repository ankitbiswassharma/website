from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.enums import LeadRequestType, LeadStatus
from app.schemas.common import ORMModel


class PublicLeadCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=160)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=40)
    company: str | None = Field(default=None, max_length=160)
    designation: str | None = Field(default=None, max_length=120)
    project_type: str | None = Field(default=None, max_length=120)
    source: str | None = Field(default="website")
    client_requirements_html: str = Field(default="")
    preferred_demo_date: date | None = None
    preferred_demo_time: str | None = Field(default=None, max_length=30)
    request_type: LeadRequestType = LeadRequestType.CONTACT
    # Honeypot: real users never see/fill this; bots usually do.
    company_website: str | None = Field(default=None, max_length=200)


class LeadCreateIn(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=2, max_length=160)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=40)
    company_name: str | None = Field(default=None, max_length=160)
    requirements: str = Field(min_length=1, max_length=5000)
    # Honeypot: real users never see/fill this; bots usually do.
    company_website: str | None = Field(default=None, max_length=200)


class LeadStatusUpdateIn(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: LeadStatus


class LeadOut(ORMModel):
    id: str
    name: str
    email: str
    phone: str | None
    company_name: str | None
    company_code: str | None = None
    company_login_url: str | None = None
    lead_reference: str | None = None
    requirements: str | None
    status: str
    created_at: datetime


class LeadActivityOut(ORMModel):
    id: int
    activity_type: str
    description: str
    created_by: str
    created_at: datetime


class LeadListItem(ORMModel):
    id: str
    full_name: str
    email: str
    phone: str | None
    company: str | None
    company_code: str | None = None
    company_login_url: str | None = None
    lead_reference: str | None = None
    project_type: str | None
    request_type: str
    status: str
    created_at: datetime
    updated_at: datetime
    preferred_demo_date: date | None
    preferred_demo_time: str | None
    assigned_staff_id: str | None = None
    assigned_staff_name: str | None = None


class LeadDetail(LeadListItem):
    designation: str | None
    source: str | None
    client_requirements_html: str | None
    client_requirements_text: str | None
    admin_notes: str | None
    latest_quotation_id: str | None = None
    latest_quotation_number: str | None = None
    latest_quote_code: str | None = None
    latest_payment_status: str | None = None
    activities: list[LeadActivityOut] = []


class LeadUpdateIn(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: LeadStatus | None = None
    admin_notes: str | None = None


class LeadNotesUpdateIn(BaseModel):
    model_config = ConfigDict(extra="forbid")

    admin_notes: str | None = None


class LeadAssignmentIn(BaseModel):
    model_config = ConfigDict(extra="forbid")

    staff_user_id: str | None = None  # null clears the assignment


class LeadActivityCreate(BaseModel):
    description: str = Field(min_length=2)
    created_by: str = Field(default="admin")


class LeadCreatedOut(BaseModel):
    success: bool = True
    lead_id: str
    status: str
