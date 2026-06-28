"""
Record a completed purchase made in the Musk-IT ERP system as a Won lead +
paid quotation + payment, so it shows up under the website admin Leads and
Dashboard (revenue).

Called by the signed endpoint POST /api/v1/public/erp/purchase.
"""

from __future__ import annotations

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

    series = build_quotation_series(company_code, lead_reference)
    quotation = Quotation(
        quotation_number=build_quotation_number(series, 0),
        quote_code=generate_quote_code(),
        quotation_series=series,
        revision_number=0,
        lead_id=lead.id,
        status=QuotationStatus.PAID,
        currency=currency,
        title="Musk-IT ERP Annual License",
        tax_label="GST",
        tax_rate=Decimal("0"),
        subtotal=total,
        tax_amount=Decimal("0"),
        total_amount=total,
        valid_until=(now + timedelta(days=settings.quote_validity_days)).date(),
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
            title="Musk-IT ERP — Annual License (all modules)"
            + (" · Founding rate" if is_founding else ""),
            description=f"Company code: {company_code or '—'}",
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

    db.commit()
    db.refresh(lead)
    logger.info("Recorded ERP purchase lead %s for %s", lead.id, email)
    return lead
