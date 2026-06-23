from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.api.deps import get_client_session
from app.db.session import get_db
from app.schemas.client import (
    ClientLoginIn,
    ClientOtpChallengeOut,
    ClientOtpVerifyIn,
    ClientPortalOverview,
    ClientSessionOut,
)
from app.schemas.common import ApiMessage
from app.services.client_service import client_service
from app.utils.rate_limit import RateLimiter, client_ip


router = APIRouter(prefix="/client", tags=["client-portal"])

# Limit OTP requests per IP (separate from the lead-form limiter).
_otp_limiter = RateLimiter(max_calls=6, window_seconds=600)


@router.post("/auth/request-otp", response_model=ClientOtpChallengeOut)
def request_otp(payload: ClientLoginIn, request: Request, db: Session = Depends(get_db)):
    from fastapi import HTTPException, status

    if not _otp_limiter.allow(client_ip(request)):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Please try again in a few minutes.",
        )
    result = client_service.request_otp(
        db,
        email=payload.email,
        requested_ip=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    return ClientOtpChallengeOut(**result)


@router.post("/auth/verify-otp", response_model=ClientSessionOut)
def verify_otp(payload: ClientOtpVerifyIn, db: Session = Depends(get_db)):
    result = client_service.verify_otp(
        db,
        email=payload.email,
        challenge_id=payload.challenge_id,
        otp=payload.otp,
    )
    return ClientSessionOut(**result)


@router.post("/auth/logout", response_model=ApiMessage)
def logout(client_session=Depends(get_client_session), db: Session = Depends(get_db)):
    client_service.revoke_session(db, client_session.token_hash)
    return ApiMessage(message="Logged out successfully")


@router.get("/portal/overview", response_model=ClientPortalOverview)
def portal_overview(client_session=Depends(get_client_session), db: Session = Depends(get_db)):
    return ClientPortalOverview(**client_service.overview(db, email=client_session.email))
