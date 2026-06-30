"""
Record a completed purchase made in the Musk-IT ERP system as a Won lead +
paid quotation + payment, so it shows up under the website admin Leads and
Dashboard (revenue).

Called by the signed endpoint POST /api/v1/public/erp/purchase.
"""

from __future__ import annotations

import json
import logging
from datetime import timedelta
from decimal import Decimal

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import utcnow
from app.models.enums import (
    ActivityType,
    LeadRequestType,
    LeadStatus,
    PaymentStatus,
    QuotationStatus,
)
from app.models.lead import Lead
from app.models.payment import Payment
from app.models.quotation import Quotation, QuotationItem
from app.repositories.lead_repository import LeadRepository
from app.services.pdf_service import PdfServiceUnavailableError, pdf_service
from app.utils.formatting import (
    build_quotation_number,
    build_quotation_series,
    decimalize,
    generate_invoice_number,
    generate_lead_reference,
    generate_quote_code,
)

logger = logging.getLogger(__name__)
lead_repository = LeadRepository()

# The six modules shipped with a Musk-IT ERP annual license. Sourced from the
# ERP marketing site (erp.muskit.in) so the quotation describes exactly what the
# customer purchased. Rendered as descriptive sections in the quotation PDF.
ERP_MODULES: list[tuple[str, str]] = [
    (
        "Drawing Tracker",
        "Track every drawing, revision, and approval. Submission logs, overdue "
        "alerts, and consultant replies — all in one place.",
    ),
    (
        "BOQ Management",
        "Handle any client BOQ format. Schema-driven parsing means adding a new "
        "client format takes minutes, not days.",
    ),
    (
        "Daily Task Tracker",
        "Assign, track, and close tasks daily. Directly linked to drawings so "
        "nothing falls through the cracks.",
    ),
    (
        "Site Execution Tracker",
        "MSP-style daily site progress log — digital. What was planned, what was "
        "done, who was on site, every day.",
    ),
    (
        "Manpower Planning",
        "Plan and track labour deployment by trade and date. Planned vs actual "
        "gaps visible in one dashboard.",
    ),
    (
        "EVM Dashboard",
        "Earned Value Management built in. CPI, SPI, and cost variance — "
        "automatically calculated from your project data.",
    ),
]

# What the annual license entitlement covers, beyond the modules themselves.
ERP_LICENSE_INCLUSIONS = (
    "All 6 modules included · Unlimited projects & users · Custom BOQ schema "
    "setup · Priority WhatsApp support · Admin account · 1-year license. "
    "Pricing is GST inclusive."
)


def _build_erp_sections(*, plan: str, is_founding: bool, valid_until) -> str:
    """Serialize the ERP feature catalog into quotation `sections_json`."""
    sections: list[dict[str, str]] = [
        {
            "title": "Modules included",
            "content": "Six modules built around EPC workflows — all connected, "
            "all in one system:",
        }
    ]
    sections.extend({"title": title, "content": content} for title, content in ERP_MODULES)
    sections.append(
        {
            "title": "Your annual license",
            "content": (
                f"{ERP_LICENSE_INCLUSIONS} "
                f"Plan: {plan.title()}"
                + (" (Founding rate)" if is_founding else "")
                + f". License valid until {valid_until:%d %b %Y}."
            ),
        }
    )
    return json.dumps(sections)


def _render_quotation_pdf(quotation: Quotation, lead: Lead) -> None:
    """Render and attach the quotation PDF. Never raises — a PDF failure must not
    break ERP purchase provisioning; the lead/payment are still recorded."""
    context = {
        "company_name": settings.company_name,
        "company_tagline": settings.company_tagline,
        "company_address": settings.company_address,
        "company_website": settings.company_website,
        "admin_name": settings.admin_name,
        "admin_email": settings.admin_email,
        "admin_phone": settings.admin_phone,
        "lead": lead,
        "quotation": quotation,
        "items": quotation.items,
        "sections": quotation.sections,
        "payment_page_url": quotation.payment_page_url,
    }
    destination = settings.quotation_storage_dir / f"{quotation.quotation_number}.pdf"
    try:
        pdf_service.render_quotation(context, destination)
        quotation.pdf_path = str(destination)
    except PdfServiceUnavailableError as exc:
        logger.warning("ERP quotation PDF not rendered (%s): %s", quotation.quotation_number, exc)
    except Exception:  # pragma: no cover - defensive
        logger.exception("Unexpected error rendering ERP quotation PDF %s", quotation.quotation_number)


def _str(payload: dict, key: str) -> str | None:
    value = payload.get(key)
    if value is None:
        return None
    value = str(value).strip()
    return value or None


def record_purchase(db: Session, payload: dict) -> Lead:
    now = utcnow()
    full_name = _str(payload, "full_name") or "ERP Customer"
    email = (_str(payload, "email") or "").lower()
    company = _str(payload, "company")
    company_code = _str(payload, "company_code")
    amount = int(payload.get("amount") or 0)
    currency = _str(payload, "currency") or settings.razorpay_currency
    total = decimalize(amount)
    is_founding = bool(payload.get("is_founding"))
    plan = _str(payload, "plan") or "annual"

    lead_reference = generate_lead_reference(company_code or "COMP", 1)

    lead = Lead(
        full_name=full_name,
        email=email,
        phone=_str(payload, "phone"),
        company=company,
        company_code=company_code,
        company_login_url=_str(payload, "company_login_url"),
        lead_reference=lead_reference,
        designation=_str(payload, "designation"),
        request_type=LeadRequestType.CONTACT,
        source=_str(payload, "source") or "erp_purchase",
        status=LeadStatus.WON,
        client_requirements_text=f"Purchased Musk-IT ERP ({plan}) via ERP checkout.",
        won_at=now,
        created_at=now,
        updated_at=now,
    )
    lead_repository.create(db, lead)

    valid_until = (now + timedelta(days=settings.quote_validity_days)).date()
    series = build_quotation_series(company_code, lead_reference)
    quotation = Quotation(
        quotation_number=build_quotation_number(series, 0),
        quote_code=generate_quote_code(),
        quotation_series=series,
        revision_number=0,
        lead_id=lead.id,
        status=QuotationStatus.PAID,
        currency=currency,
        title="Musk-IT ERP — Annual License",
        intro_message=(
            f"Thank you for purchasing Musk-IT ERP. This is your paid quotation "
            f"and tax invoice reference for the {plan.title()} plan"
            + (" at the Founding rate" if is_founding else "")
            + ". Your admin account and 1-year license are active."
        ),
        requirements_summary=(
            "Musk-IT ERP is purpose-built for Indian EPC firms — drawings, BOQ, "
            "site execution, and manpower in one connected system."
        ),
        tax_label="GST",
        tax_rate=Decimal("0"),
        subtotal=total,
        tax_amount=Decimal("0"),
        total_amount=total,
        sections_json=_build_erp_sections(plan=plan, is_founding=is_founding, valid_until=valid_until),
        valid_until=valid_until,
        paid_at=now,
        created_at=now,
        updated_at=now,
    )
    db.add(quotation)
    db.flush()

    db.add(
        QuotationItem(
            quotation_id=quotation.id,
            sort_order=0,
            title="Musk-IT ERP — Annual License (all 6 modules)"
            + (" · Founding rate" if is_founding else ""),
            description=(
                f"Unlimited projects & users · 1-year license · GST inclusive. "
                f"Company code: {company_code or '—'}."
            ),
            unit="license",
            quantity=Decimal("1"),
            unit_price=total,
            line_total=total,
        )
    )

    payment = Payment(
        lead_id=lead.id,
        quotation_id=quotation.id,
        status=PaymentStatus.PAID,
        provider="razorpay",
        currency=currency,
        subtotal=total,
        tax_amount=Decimal("0"),
        total_amount=total,
        receipt=f"ERP-{_str(payload, 'razorpay_order_id') or generate_invoice_number()}",
        razorpay_order_id=_str(payload, "razorpay_order_id"),
        razorpay_payment_id=_str(payload, "razorpay_payment_id"),
        invoice_number=generate_invoice_number(),
        gateway_payload={"source": "erp_purchase", "raw": payload},
        paid_at=now,
        created_at=now,
        updated_at=now,
    )
    db.add(payment)

    lead_repository.add_activity(
        db,
        lead_id=lead.id,
        activity_type=ActivityType.SYSTEM,
        description="Lead created from a Musk-IT ERP purchase",
        payload={"company_code": company_code, "mode": _str(payload, "mode")},
    )
    lead_repository.add_activity(
        db,
        lead_id=lead.id,
        activity_type=ActivityType.PAYMENT,
        description=f"Payment received via ERP checkout ({currency} {amount:,})",
        payload={
            "amount": amount,
            "currency": currency,
            "is_founding": is_founding,
            "razorpay_payment_id": _str(payload, "razorpay_payment_id"),
            "invoice_number": payment.invoice_number,
        },
    )

    # Refresh so the quotation relationship (items) is loaded before rendering.
    db.flush()
    db.refresh(quotation)
    _render_quotation_pdf(quotation, lead)

    db.commit()
    db.refresh(lead)
    logger.info("Recorded ERP purchase lead %s for %s", lead.id, email)
    return lead
