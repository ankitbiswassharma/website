from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

from app.api.deps import get_admin_session
from app.db.session import get_db
from app.schemas.campaign import (
    CampaignEngagementSummary,
    CampaignRecipientOut,
    ColdOutreachIn,
    ColdOutreachResult,
    SuppressionOut,
)
from app.services.campaign_service import campaign_service, parse_emails


router = APIRouter(prefix="/admin/campaigns", tags=["admin-campaigns"])


@router.get("/cold-outreach/preview", response_class=HTMLResponse)
def preview_cold_outreach(_: object = Depends(get_admin_session)):
    """Rendered HTML of the capabilities email, for the admin preview pane."""
    return HTMLResponse(content=campaign_service.render_preview())


@router.post("/cold-outreach", response_model=ColdOutreachResult)
def send_cold_outreach(
    payload: ColdOutreachIn,
    background_tasks: BackgroundTasks,
    _: object = Depends(get_admin_session),
    db: Session = Depends(get_db),
):
    valid, _invalid, _dupes = parse_emails(payload.emails)
    if not valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Enter at least one valid email address.",
        )
    # Queue recipients synchronously (fast), then send in the background so the
    # request returns immediately even for large batches.
    summary, recipient_ids = campaign_service.enqueue_cold_outreach(
        db,
        raw_emails=payload.emails,
        subject=payload.subject,
    )
    if recipient_ids:
        background_tasks.add_task(campaign_service.run_background_send, recipient_ids)
    return summary


@router.get("/recipients", response_model=CampaignEngagementSummary)
def list_campaign_recipients(
    limit: int = 200,
    _: object = Depends(get_admin_session),
    db: Session = Depends(get_db),
):
    recipients = campaign_service.list_recipients(db, limit=max(1, min(limit, 500)))
    items = []
    sent = 0
    failed = 0
    opened = 0
    clicked = 0
    for recipient in recipients:
        is_clicked = (recipient.click_count or 0) > 0
        is_opened = (recipient.open_count or 0) > 0 or is_clicked
        if recipient.status == "sent":
            sent += 1
        elif recipient.status in {"failed", "skipped"}:
            failed += 1
        if is_opened:
            opened += 1
        if is_clicked:
            clicked += 1
        items.append(
            CampaignRecipientOut.model_validate(recipient).model_copy(
                update={"clicked": is_clicked, "opened": is_opened}
            )
        )
    return CampaignEngagementSummary(
        total=len(items),
        sent=sent,
        failed=failed,
        opened=opened,
        clicked=clicked,
        recipients=items,
    )


@router.get("/suppressions", response_model=list[SuppressionOut])
def list_suppressions(
    _: object = Depends(get_admin_session),
    db: Session = Depends(get_db),
):
    return [SuppressionOut.model_validate(s) for s in campaign_service.list_suppressions(db)]
