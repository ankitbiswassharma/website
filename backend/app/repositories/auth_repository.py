from __future__ import annotations

from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.auth import AdminOtpRequest, AdminSession


class AuthRepository:
    def get_recent_otp_request(self, db: Session, email: str, since: datetime) -> AdminOtpRequest | None:
        stmt = (
            select(AdminOtpRequest)
            .where(AdminOtpRequest.email == email, AdminOtpRequest.created_at >= since)
            .order_by(AdminOtpRequest.created_at.desc())
            .limit(1)
        )
        return db.scalar(stmt)

    def create_otp_request(self, db: Session, otp_request: AdminOtpRequest) -> AdminOtpRequest:
        db.add(otp_request)
        db.flush()
        return otp_request

    def get_otp_request(self, db: Session, challenge_id: str) -> AdminOtpRequest | None:
        return db.get(AdminOtpRequest, challenge_id)

    def create_session(self, db: Session, session: AdminSession) -> AdminSession:
        db.add(session)
        db.flush()
        return session

    def get_session(self, db: Session, token_hash: str) -> AdminSession | None:
        stmt = select(AdminSession).where(AdminSession.token_hash == token_hash)
        return db.scalar(stmt)
