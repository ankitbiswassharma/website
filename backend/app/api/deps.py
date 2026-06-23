from __future__ import annotations

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import hash_admin_session, utcnow
from app.db.session import get_db
from app.repositories.auth_repository import AuthRepository
from app.repositories.user_repository import UserRepository


auth_repository = AuthRepository()
user_repository = UserRepository()


def get_admin_session(
    x_admin_token: str | None = Header(default=None),
    db: Session = Depends(get_db),
):
    if not x_admin_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing admin token")
    session = auth_repository.get_session(db, hash_admin_session(x_admin_token))
    if not session or session.revoked_at or session.expires_at <= utcnow():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    session.last_seen_at = utcnow()
    db.add(session)
    db.commit()
    return session


def get_client_session(
    x_client_token: str | None = Header(default=None),
    db: Session = Depends(get_db),
):
    from app.models.client_auth import ClientSession

    if not x_client_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing client token")
    session = db.get(ClientSession, hash_admin_session(x_client_token))
    if not session or session.revoked_at or session.expires_at <= utcnow():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    session.last_seen_at = utcnow()
    db.add(session)
    db.commit()
    return session


def get_staff_session(
    x_staff_token: str | None = Header(default=None),
    db: Session = Depends(get_db),
):
    if not x_staff_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing staff token")
    session = user_repository.get_session(db, hash_admin_session(x_staff_token))
    if not session or session.revoked_at or session.expires_at <= utcnow():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    user = user_repository.get(db, session.user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is not available.")
    session.last_seen_at = utcnow()
    db.add(session)
    db.commit()
    return session
