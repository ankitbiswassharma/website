from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class AdminOtpRequestIn(BaseModel):
    email: EmailStr


class AdminOtpRequestOut(BaseModel):
    success: bool = True
    challenge_id: str
    masked_email: str
    expires_in_seconds: int
    otp_digits: int
    delivery_mode: Literal["email", "development"] = "email"
    message: str | None = None
    dev_otp: str | None = None


class AdminOtpVerifyIn(BaseModel):
    email: EmailStr
    challenge_id: str = Field(min_length=1)
    otp: str = Field(min_length=4, max_length=8)


class AdminSessionOut(BaseModel):
    success: bool = True
    token: str
    admin_email: EmailStr
    expires_at: datetime
