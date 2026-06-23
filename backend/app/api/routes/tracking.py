from fastapi import APIRouter, Depends, Header, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.services.campaign_service import campaign_service


router = APIRouter(tags=["tracking"])


@router.get("/c/{token}")
def track_click(
    token: str,
    request: Request,
    user_agent: str | None = Header(default=None),
    db: Session = Depends(get_db),
):
    """Record a campaign link click, then redirect to the real destination."""
    fallback = f"{settings.frontend_url.rstrip('/')}/consultation"
    target = campaign_service.register_click(db, token=token, user_agent=user_agent) or fallback
    # 302 so the link can be clicked (and re-counted) more than once.
    return RedirectResponse(url=target, status_code=302)
