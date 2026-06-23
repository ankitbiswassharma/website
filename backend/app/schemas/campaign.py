from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ColdOutreachIn(BaseModel):
    """Admin supplies one or more recipient emails (comma / newline / semicolon separated)."""

    emails: str = Field(..., min_length=3, description="Recipient emails, comma separated")
    subject: str | None = Field(default=None, max_length=255)


class ColdOutreachRecipientResult(BaseModel):
    email: str
    status: str
    error_message: str | None = None


class ColdOutreachResult(BaseModel):
    requested: int
    valid: int
    queued: int = 0
    sent: int
    failed: int
    skipped_invalid: list[str] = Field(default_factory=list)
    skipped_duplicates: list[str] = Field(default_factory=list)
    skipped_suppressed: list[str] = Field(default_factory=list)
    results: list[ColdOutreachRecipientResult] = Field(default_factory=list)
    subject: str


class CampaignRecipientOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    recipient_email: str
    subject: str
    status: str
    error_message: str | None = None
    click_count: int
    open_count: int = 0
    clicked: bool = False
    opened: bool = False
    created_at: datetime
    sent_at: datetime | None = None
    first_opened_at: datetime | None = None
    last_opened_at: datetime | None = None
    first_clicked_at: datetime | None = None
    last_clicked_at: datetime | None = None


class CampaignEngagementSummary(BaseModel):
    total: int
    sent: int
    failed: int
    opened: int
    clicked: int
    recipients: list[CampaignRecipientOut] = Field(default_factory=list)


class SuppressionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    email: str
    reason: str
    created_at: datetime
