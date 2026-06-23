import base64

from fastapi import APIRouter, Depends, Header, Request
from fastapi.responses import HTMLResponse, RedirectResponse, Response
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.services.campaign_service import campaign_service


router = APIRouter(tags=["tracking"])

# 1x1 transparent GIF
_PIXEL = base64.b64decode("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7")


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


@router.get("/o/{token}.png")
def track_open(token: str, db: Session = Depends(get_db)):
    """Email open tracking pixel — records the open and returns a 1x1 image."""
    campaign_service.register_open(db, token=token)
    return Response(
        content=_PIXEL,
        media_type="image/gif",
        headers={"Cache-Control": "no-store, no-cache, must-revalidate, private"},
    )


@router.get("/u/{token}", response_class=HTMLResponse)
def unsubscribe(token: str, db: Session = Depends(get_db)):
    """One-click unsubscribe — suppresses the recipient's email."""
    campaign_service.register_unsubscribe(db, token=token)
    company = settings.company_name
    html = f"""<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Unsubscribed — {company}</title>
<style>
  body{{margin:0;font-family:Segoe UI,Arial,sans-serif;background:#edf2f8;color:#0f172a;
       display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px;}}
  .card{{max-width:480px;background:#fff;border-radius:20px;padding:40px;text-align:center;
         box-shadow:0 24px 64px rgba(15,23,42,.15);}}
  h1{{font-size:22px;margin:0 0 10px;}} p{{color:#475569;line-height:1.7;font-size:15px;}}
  .badge{{display:inline-flex;width:54px;height:54px;border-radius:50%;background:#dcfce7;
          align-items:center;justify-content:center;margin-bottom:16px;font-size:26px;}}
  a{{color:#4f46e5;}}
</style></head><body><div class="card">
<div class="badge">✓</div>
<h1>You've been unsubscribed</h1>
<p>You won't receive any more outreach emails from {company}. If this was a mistake or you
change your mind, just email us and we'll add you back.</p>
<p><a href="{settings.company_website}">Return to {company}</a></p>
</div></body></html>"""
    return HTMLResponse(content=html)
