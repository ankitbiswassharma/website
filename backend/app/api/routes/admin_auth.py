from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_admin_session
from app.db.session import get_db
from app.schemas.auth import AdminOtpRequestIn, AdminOtpRequestOut, AdminOtpVerifyIn, AdminSessionOut
from app.schemas.common import ApiMessage
from app.services.auth_service import auth_service
from app.utils.rate_limit import RateLimiter, client_ip


router = APIRouter(prefix="/admin/auth", tags=["admin-auth"])

# Per-IP guards on the admin login flow (same pattern as the client portal).
# The per-challenge attempt_count in auth_service still applies on top.
_otp_request_limiter = RateLimiter(max_calls=5, window_seconds=600)
_otp_verify_limiter = RateLimiter(max_calls=10, window_seconds=600)


def _enforce(limiter: RateLimiter, request: Request) -> None:
    if not limiter.allow(client_ip(request)):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Please try again in a few minutes.",
        )


@router.post("/request-otp", response_model=AdminOtpRequestOut)
def request_otp(payload: AdminOtpRequestIn, request: Request, db: Session = Depends(get_db)):
    _enforce(_otp_request_limiter, request)
    result = auth_service.request_otp(
        db,
        email=payload.email,
        requested_ip=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    return AdminOtpRequestOut(**result)


@router.post("/verify-otp", response_model=AdminSessionOut)
def verify_otp(payload: AdminOtpVerifyIn, request: Request, db: Session = Depends(get_db)):
    _enforce(_otp_verify_limiter, request)
    result = auth_service.verify_otp(
        db,
        email=payload.email,
        challenge_id=payload.challenge_id,
        otp=payload.otp,
    )
    return AdminSessionOut(**result)


@router.post("/logout", response_model=ApiMessage)
def logout(admin_session=Depends(get_admin_session), db: Session = Depends(get_db)):
    auth_service.revoke_session(db, admin_session.token_hash)
    return ApiMessage(message="Logged out successfully")
