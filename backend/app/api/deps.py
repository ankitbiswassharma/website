from __future__ import annotations

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import hash_admin_session, utcnow
from app.db.session import get_db
from app.repositories.auth_repository import AuthRepository


auth_repository = AuthRepository()


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
