from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.api.deps import get_admin_session
from app.db.session import get_db
from app.schemas.auth import AdminOtpRequestIn, AdminOtpRequestOut, AdminOtpVerifyIn, AdminSessionOut
from app.schemas.common import ApiMessage
from app.services.auth_service import auth_service


router = APIRouter(prefix="/admin/auth", tags=["admin-auth"])


@router.post("/request-otp", response_model=AdminOtpRequestOut)
def request_otp(payload: AdminOtpRequestIn, request: Request, db: Session = Depends(get_db)):
    result = auth_service.request_otp(
        db,
        email=payload.email,
        requested_ip=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    return AdminOtpRequestOut(**result)


@router.post("/verify-otp", response_model=AdminSessionOut)
def verify_otp(payload: AdminOtpVerifyIn, db: Session = Depends(get_db)):
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
