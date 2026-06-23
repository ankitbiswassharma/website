from __future__ import annotations

from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.schemas.common import ORMModel


def _normalize_aadhaar(value: str) -> str:
    digits = "".join(ch for ch in value if ch.isdigit())
    if len(digits) != 12:
        raise ValueError("Aadhaar number must be exactly 12 digits")
    return digits


class StaffUserCreateIn(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    email: EmailStr
    phone: str = Field(min_length=5, max_length=40)
    address: str = Field(min_length=2, max_length=2000)
    aadhaar_number: str = Field(min_length=12, max_length=20)
    qualification: str = Field(min_length=1, max_length=200)
    gender: Literal["male", "female", "other", "prefer_not_to_say"]
    date_of_birth: date

    @field_validator("aadhaar_number")
    @classmethod
    def validate_aadhaar(cls, value: str) -> str:
        return _normalize_aadhaar(value)


class StaffUserUpdateIn(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=160)
    phone: str | None = Field(default=None, min_length=5, max_length=40)
    address: str | None = Field(default=None, min_length=2, max_length=2000)
    aadhaar_number: str | None = Field(default=None, min_length=12, max_length=20)
    qualification: str | None = Field(default=None, min_length=1, max_length=200)
    gender: Literal["male", "female", "other", "prefer_not_to_say"] | None = None
    date_of_birth: date | None = None
    is_active: bool | None = None

    @field_validator("aadhaar_number")
    @classmethod
    def validate_aadhaar(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return _normalize_aadhaar(value)


class StaffUserOut(ORMModel):
    id: str
    name: str
    email: str
    phone: str | None
    address: str | None
    aadhaar_last4: str | None
    qualification: str | None
    gender: str | None
    date_of_birth: date | None
    is_active: bool
    must_change_password: bool
    last_login_at: datetime | None
    created_at: datetime


class StaffUserCreatedOut(StaffUserOut):
    credentials_emailed: bool


class StaffLoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=200)


class StaffOtpChallengeOut(BaseModel):
    success: bool = True
    challenge_id: str
    masked_email: str
    otp_digits: int
    expires_in_seconds: int
    message: str | None = None


class StaffOtpVerifyIn(BaseModel):
    email: EmailStr
    challenge_id: str = Field(min_length=1)
    otp: str = Field(min_length=4, max_length=8)


class StaffSessionOut(BaseModel):
    success: bool = True
    token: str
    email: EmailStr
    name: str
    must_change_password: bool
    expires_at: datetime


class StaffMeOut(BaseModel):
    email: EmailStr
    name: str
    must_change_password: bool


class StaffChangePasswordIn(BaseModel):
    current_password: str = Field(min_length=1, max_length=200)
    new_password: str = Field(min_length=8, max_length=200)
