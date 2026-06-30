#!/usr/bin/env python3
"""
Backfill quotation PDFs for ERP-purchase leads.

Leads created from a Musk-IT ERP purchase (lead.source == "erp_purchase") had
their quotation recorded without a rendered PDF, so the admin/staff "View PDF"
action returned 404 ("Quotation PDF not found"). This script:

  1. Finds every quotation whose lead came from an ERP purchase and that has no
     pdf_path on disk.
  2. Backfills the descriptive sections / intro text (the ERP module catalog) on
     quotations created before that became automatic.
  3. Renders the PDF and sets pdf_path.

Safe to re-run: quotations that already have a readable PDF are skipped.

Usage (from backend/, inside the container or a venv with deps installed):
    python backfill_erp_quotation_pdfs.py            # apply
    python backfill_erp_quotation_pdfs.py --dry-run  # report only
"""

from __future__ import annotations

import argparse
import logging
import sys
from pathlib import Path

from app.db.session import SessionLocal
from app.models.lead import Lead
from app.models.quotation import Quotation
from app.services import erp_purchase_service as svc

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
logger = logging.getLogger("backfill_erp_quotation_pdfs")


def _purchase_payload(quotation: Quotation) -> dict:
    """Recover the original purchase payload from the linked payment, if any."""
    for payment in getattr(quotation, "payments", []) or []:
        gateway = payment.gateway_payload or {}
        raw = gateway.get("raw") if isinstance(gateway, dict) else None
        if isinstance(raw, dict):
            return raw
    return {}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true", help="report without writing")
    args = parser.parse_args()

    db = SessionLocal()
    fixed = skipped = failed = 0
    try:
        quotations = (
            db.query(Quotation)
            .join(Lead, Lead.id == Quotation.lead_id)
            .filter(Lead.source == "erp_purchase")
            .all()
        )
        logger.info("Found %d ERP-purchase quotation(s)", len(quotations))

        for quotation in quotations:
            existing = quotation.pdf_path
            if existing and Path(existing).exists():
                skipped += 1
                continue

            lead = quotation.lead
            payload = _purchase_payload(quotation)
            plan = str(payload.get("plan") or "annual")
            is_founding = bool(payload.get("is_founding"))

            # Backfill descriptive content on older records that predate it.
            if not quotation.sections_json:
                quotation.sections_json = svc._build_erp_sections(
                    plan=plan, is_founding=is_founding, valid_until=quotation.valid_until
                )
            if not quotation.requirements_summary:
                quotation.requirements_summary = (
                    "Musk-IT ERP is purpose-built for Indian EPC firms — drawings, "
                    "BOQ, site execution, and manpower in one connected system."
                )

            if args.dry_run:
                logger.info("[dry-run] would render PDF for %s (%s)", quotation.quotation_number, lead.email)
                fixed += 1
                continue

            svc._render_quotation_pdf(quotation, lead)
            if quotation.pdf_path and Path(quotation.pdf_path).exists():
                db.add(quotation)
                fixed += 1
                logger.info("Rendered %s -> %s", quotation.quotation_number, quotation.pdf_path)
            else:
                failed += 1
                logger.error("PDF still missing for %s after render attempt", quotation.quotation_number)

        if not args.dry_run:
            db.commit()
    finally:
        db.close()

    logger.info("Done. rendered=%d skipped=%d failed=%d", fixed, skipped, failed)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
