from __future__ import annotations

from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import StaffOtpRequest, StaffSession, StaffUser


class UserRepository:
    def list(self, db: Session) -> list[StaffUser]:
        stmt = select(StaffUser).order_by(StaffUser.created_at.desc())
        return list(db.scalars(stmt).all())

    def get(self, db: Session, user_id: str) -> StaffUser | None:
        return db.get(StaffUser, user_id)

    def get_by_email(self, db: Session, email: str) -> StaffUser | None:
        stmt = select(StaffUser).where(StaffUser.email == email.strip().lower())
        return db.scalar(stmt)

    def add(self, db: Session, user: StaffUser) -> StaffUser:
        db.add(user)
        db.flush()
        return user

    # ── OTP ──────────────────────────────────────────────────────────────────
    def get_recent_otp_request(self, db: Session, email: str, since: datetime) -> StaffOtpRequest | None:
        stmt = (
            select(StaffOtpRequest)
            .where(StaffOtpRequest.email == email, StaffOtpRequest.created_at >= since)
            .order_by(StaffOtpRequest.created_at.desc())
            .limit(1)
        )
        return db.scalar(stmt)

    def create_otp_request(self, db: Session, otp_request: StaffOtpRequest) -> StaffOtpRequest:
        db.add(otp_request)
        db.flush()
        return otp_request

    def get_otp_request(self, db: Session, challenge_id: str) -> StaffOtpRequest | None:
        return db.get(StaffOtpRequest, challenge_id)

    # ── Sessions ─────────────────────────────────────────────────────────────
    def create_session(self, db: Session, session: StaffSession) -> StaffSession:
        db.add(session)
        db.flush()
        return session

    def get_session(self, db: Session, token_hash: str) -> StaffSession | None:
        stmt = select(StaffSession).where(StaffSession.token_hash == token_hash)
        return db.scalar(stmt)
