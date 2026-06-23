from __future__ import annotations

import logging
import secrets
import uuid
from datetime import date, timedelta

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    build_expiry,
    encrypt_value,
    generate_numeric_otp,
    generate_temp_password,
    hash_admin_otp,
    hash_admin_session,
    hash_password,
    utcnow,
    verify_hash,
    verify_password,
)
from app.models.user import StaffOtpRequest, StaffSession, StaffUser
from app.repositories.user_repository import UserRepository
from app.services.email_service import email_service


user_repository = UserRepository()
logger = logging.getLogger(__name__)


def mask_email(email: str) -> str:
    local, _, domain = email.partition("@")
    visible = local[: min(2, len(local))]
    return f"{visible}{'*' * max(len(local) - len(visible), 1)}@{domain}"


class UserService:
    # ── Admin: user management ────────────────────────────────────────────────
    def list_users(self, db: Session) -> list[StaffUser]:
        return user_repository.list(db)

    def create_user(
        self,
        db: Session,
        *,
        name: str,
        email: str,
        phone: str,
        address: str,
        aadhaar_number: str,
        qualification: str,
        gender: str,
        date_of_birth: date,
        created_by: str | None,
    ) -> tuple[StaffUser, bool]:
        normalized_email = email.strip().lower()
        if user_repository.get_by_email(db, normalized_email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email already exists.",
            )

        temp_password = generate_temp_password()
        now = utcnow()
        user = StaffUser(
            name=name.strip(),
            email=normalized_email,
            phone=phone.strip(),
            address=address.strip(),
            aadhaar_encrypted=encrypt_value(aadhaar_number),
            aadhaar_last4=aadhaar_number[-4:],
            qualification=qualification.strip(),
            gender=gender,
            date_of_birth=date_of_birth,
            password_hash=hash_password(temp_password),
            must_change_password=True,
            is_active=True,
            created_by=created_by,
            created_at=now,
            updated_at=now,
        )
        user_repository.add(db, user)

        email_result = email_service.send_template(
            db=db,
            template_name="staff_credentials.html",
            context={
                "user_name": user.name,
                "login_email": user.email,
                "temp_password": temp_password,
                "login_url": f"{settings.frontend_url}/staff/login",
                "company_name": settings.company_name,
                "company_tagline": settings.company_tagline,
                "admin_name": settings.admin_name,
            },
            to_email=user.email,
            subject=f"Your {settings.company_name} staff account",
            payload={"event": "staff_user_created"},
        )
        if not email_result.success:
            logger.error(
                "Failed to send staff credentials to %s: %s",
                user.email,
                email_result.error_message or email_result.status,
            )

        db.commit()
        db.refresh(user)
        return user, email_result.success

    def update_user(
        self,
        db: Session,
        user_id: str,
        *,
        name: str | None = None,
        phone: str | None = None,
        address: str | None = None,
        aadhaar_number: str | None = None,
        qualification: str | None = None,
        gender: str | None = None,
        date_of_birth: date | None = None,
        is_active: bool | None = None,
    ) -> StaffUser:
        user = user_repository.get(db, user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        if name is not None:
            user.name = name.strip()
        if phone is not None:
            user.phone = phone.strip()
        if address is not None:
            user.address = address.strip()
        if aadhaar_number is not None:
            user.aadhaar_encrypted = encrypt_value(aadhaar_number)
            user.aadhaar_last4 = aadhaar_number[-4:]
        if qualification is not None:
            user.qualification = qualification.strip()
        if gender is not None:
            user.gender = gender
        if date_of_birth is not None:
            user.date_of_birth = date_of_birth
        if is_active is not None:
            user.is_active = is_active

        user.updated_at = utcnow()
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    # ── Staff: login (password) → OTP challenge ───────────────────────────────
    def start_login(
        self,
        db: Session,
        *,
        email: str,
        password: str,
        requested_ip: str | None,
        user_agent: str | None,
    ) -> dict:
        invalid = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )
        normalized_email = email.strip().lower()
        user = user_repository.get_by_email(db, normalized_email)
        if not user or not verify_password(password, user.password_hash):
            raise invalid
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This account has been deactivated. Contact your administrator.",
            )

        recent = user_repository.get_recent_otp_request(
            db,
            normalized_email,
            utcnow() - timedelta(seconds=settings.admin_otp_cooldown_seconds),
        )
        if recent:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Please wait {settings.admin_otp_cooldown_seconds} seconds before requesting another OTP.",
            )

        challenge_id = str(uuid.uuid4())
        otp = generate_numeric_otp(settings.admin_otp_digits)
        otp_request = StaffOtpRequest(
            id=challenge_id,
            user_id=user.id,
            email=normalized_email,
            otp_hash=hash_admin_otp(challenge_id, otp),
            requested_ip=requested_ip,
            user_agent=user_agent,
            attempt_count=0,
            created_at=utcnow(),
            expires_at=build_expiry(minutes=settings.admin_otp_expires_minutes),
        )
        user_repository.create_otp_request(db, otp_request)

        email_result = email_service.send_template(
            db=db,
            template_name="staff_otp.html",
            context={
                "user_name": user.name,
                "otp": otp,
                "expires_minutes": settings.admin_otp_expires_minutes,
                "company_name": settings.company_name,
                "company_tagline": settings.company_tagline,
                "frontend_url": settings.frontend_url,
                "requested_ip": requested_ip or "Unknown IP",
            },
            to_email=user.email,
            subject=f"{settings.company_name} staff login OTP",
            payload={"event": "staff_otp_request", "requested_ip": requested_ip},
        )
        if not email_result.success:
            logger.error(
                "SMTP delivery failed for staff OTP for %s: %s",
                normalized_email,
                email_result.error_message or email_result.status,
            )
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Could not send OTP email. Try again shortly.",
            )

        db.commit()
        return {
            "challenge_id": challenge_id,
            "masked_email": mask_email(user.email),
            "otp_digits": settings.admin_otp_digits,
            "expires_in_seconds": settings.admin_otp_expires_minutes * 60,
            "message": f"OTP sent to {mask_email(user.email)}.",
        }

    def verify_login_otp(self, db: Session, *, email: str, challenge_id: str, otp: str) -> dict:
        normalized_email = email.strip().lower()
        otp_request = user_repository.get_otp_request(db, challenge_id)
        if not otp_request or otp_request.email != normalized_email or otp_request.used_at:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="OTP expired or invalid")
        if otp_request.expires_at <= utcnow():
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="OTP expired or invalid")
        if otp_request.attempt_count >= settings.admin_otp_max_attempts:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many incorrect OTP attempts. Request a new code.",
            )

        provided_hash = hash_admin_otp(challenge_id, otp)
        if not verify_hash(otp_request.otp_hash, provided_hash):
            otp_request.attempt_count += 1
            db.add(otp_request)
            db.commit()
            attempts_left = max(settings.admin_otp_max_attempts - otp_request.attempt_count, 0)
            detail = (
                f"Incorrect OTP. {attempts_left} attempt{'s' if attempts_left != 1 else ''} left."
                if attempts_left
                else "Too many incorrect OTP attempts. Request a new code."
            )
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)

        user = user_repository.get(db, otp_request.user_id)
        if not user or not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is not available.")

        otp_request.used_at = utcnow()
        token = secrets.token_hex(32)
        session = StaffSession(
            token_hash=hash_admin_session(token),
            user_id=user.id,
            email=user.email,
            created_at=utcnow(),
            last_seen_at=utcnow(),
            expires_at=build_expiry(hours=settings.admin_session_ttl_hours),
        )
        user_repository.create_session(db, session)
        user.last_login_at = utcnow()
        db.add(otp_request)
        db.add(user)
        db.commit()
        return {
            "token": token,
            "email": user.email,
            "name": user.name,
            "must_change_password": user.must_change_password,
            "expires_at": session.expires_at,
        }

    def change_password(self, db: Session, *, user_id: str, current_password: str, new_password: str) -> None:
        user = user_repository.get(db, user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        if not verify_password(current_password, user.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Current password is incorrect.")
        if verify_password(new_password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password must be different from the current password.",
            )
        user.password_hash = hash_password(new_password)
        user.must_change_password = False
        user.updated_at = utcnow()
        db.add(user)
        db.commit()

    def revoke_session(self, db: Session, token_hash: str) -> None:
        session = user_repository.get_session(db, token_hash)
        if session:
            session.revoked_at = utcnow()
            db.add(session)
            db.commit()


user_service = UserService()
