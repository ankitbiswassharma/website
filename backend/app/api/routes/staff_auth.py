from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_staff_session
from app.db.session import get_db
from app.schemas.common import ApiMessage
from app.schemas.user import (
    StaffChangePasswordIn,
    StaffLoginIn,
    StaffMeOut,
    StaffOtpChallengeOut,
    StaffOtpVerifyIn,
    StaffSessionOut,
)
from app.services.user_service import user_service
from app.utils.rate_limit import RateLimiter, client_ip


router = APIRouter(prefix="/staff/auth", tags=["staff-auth"])

# Per-IP guards on the staff login flow (password brute-force + OTP guessing).
_login_limiter = RateLimiter(max_calls=5, window_seconds=300)
_otp_verify_limiter = RateLimiter(max_calls=10, window_seconds=600)


def _enforce(limiter: RateLimiter, request: Request) -> None:
    if not limiter.allow(client_ip(request)):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Please try again in a few minutes.",
        )


@router.post("/login", response_model=StaffOtpChallengeOut)
def login(payload: StaffLoginIn, request: Request, db: Session = Depends(get_db)):
    _enforce(_login_limiter, request)
    result = user_service.start_login(
        db,
        email=payload.email,
        password=payload.password,
        requested_ip=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    return StaffOtpChallengeOut(**result)


@router.post("/verify-otp", response_model=StaffSessionOut)
def verify_otp(payload: StaffOtpVerifyIn, request: Request, db: Session = Depends(get_db)):
    _enforce(_otp_verify_limiter, request)
    result = user_service.verify_login_otp(
        db,
        email=payload.email,
        challenge_id=payload.challenge_id,
        otp=payload.otp,
    )
    return StaffSessionOut(**result)


@router.get("/me", response_model=StaffMeOut)
def me(staff_session=Depends(get_staff_session), db: Session = Depends(get_db)):
    from app.repositories.user_repository import UserRepository

    user = UserRepository().get(db, staff_session.user_id)
    return StaffMeOut(
        email=user.email,
        name=user.name,
        must_change_password=user.must_change_password,
    )


@router.post("/change-password", response_model=ApiMessage)
def change_password(
    payload: StaffChangePasswordIn,
    staff_session=Depends(get_staff_session),
    db: Session = Depends(get_db),
):
    user_service.change_password(
        db,
        user_id=staff_session.user_id,
        current_password=payload.current_password,
        new_password=payload.new_password,
    )
    return ApiMessage(message="Password updated successfully.")


@router.post("/logout", response_model=ApiMessage)
def logout(staff_session=Depends(get_staff_session), db: Session = Depends(get_db)):
    user_service.revoke_session(db, staff_session.token_hash)
    return ApiMessage(message="Logged out successfully")
