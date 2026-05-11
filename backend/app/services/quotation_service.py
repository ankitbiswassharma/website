from __future__ import annotations

import json
from datetime import timedelta
from pathlib import Path

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import utcnow
from app.models.enums import ActivityType, LeadStatus, QuotationStatus
from app.models.quotation import Quotation, QuotationItem
from app.repositories.lead_repository import LeadRepository
from app.repositories.quotation_repository import QuotationRepository
from app.services.docx_service import DocxParseError, DocxServiceUnavailableError, docx_service
from app.services.email_service import email_service
from app.services.pdf_service import PdfServiceUnavailableError, pdf_service
from app.utils.formatting import (
    build_quotation_number,
    build_quotation_series,
    decimalize,
    generate_quote_code,
    parse_quotation_revision,
    parse_quotation_series,
)


lead_repository = LeadRepository()
quotation_repository = QuotationRepository()


class QuotationService:
    def build_payment_page_url(self, quote_code: str) -> str:
        return f"{settings.frontend_url}/pay/{quote_code}"

    def backfill_existing_numbering(self, db: Session) -> None:
        quotations = quotation_repository.list(db)
        if not quotations:
            return

        grouped: dict[str, list[Quotation]] = {}
        for quotation in quotations:
            grouped.setdefault(quotation.lead_id, []).append(quotation)

        plans: list[dict] = []
        for lead_quotations in grouped.values():
            ordered = sorted(
                lead_quotations,
                key=lambda quotation: (quotation.created_at, quotation.updated_at, quotation.id),
            )
            base_quotation = ordered[0]
            series = (
                parse_quotation_series(base_quotation.quotation_number)
                or base_quotation.quotation_series
                or self._build_series_for_lead(base_quotation.lead, issued_on=base_quotation.created_at)
            )

            for revision_number, quotation in enumerate(ordered):
                expected_number = build_quotation_number(series, revision_number)
                expected_url = self.build_payment_page_url(quotation.quote_code)
                if (
                    quotation.quotation_series == series
                    and quotation.revision_number == revision_number
                    and quotation.quotation_number == expected_number
                    and quotation.payment_page_url == expected_url
                    and self._matches_asset_name(quotation.pdf_path, expected_number, ".pdf")
                    and self._matches_asset_name(quotation.docx_path, expected_number, ".docx")
                ):
                    continue
                plans.append(
                    {
                        "quotation": quotation,
                        "series": series,
                        "revision_number": revision_number,
                        "quotation_number": expected_number,
                        "payment_page_url": expected_url,
                        "pdf_path": quotation.pdf_path,
                        "docx_path": quotation.docx_path,
                    }
                )

        if not plans:
            return

        for plan in plans:
            quotation = plan["quotation"]
            quotation.quotation_series = plan["series"]
            quotation.revision_number = plan["revision_number"]
            quotation.payment_page_url = plan["payment_page_url"]
            if quotation.quotation_number != plan["quotation_number"]:
                quotation.quotation_number = self._temporary_backfill_number(quotation.id)
            db.add(quotation)

        db.flush()

        for plan in plans:
            quotation = plan["quotation"]
            quotation.quotation_series = plan["series"]
            quotation.revision_number = plan["revision_number"]
            quotation.quotation_number = plan["quotation_number"]
            quotation.payment_page_url = plan["payment_page_url"]
            quotation.pdf_path = self._relocate_asset(plan["pdf_path"], plan["quotation_number"], ".pdf")
            quotation.docx_path = self._relocate_asset(plan["docx_path"], plan["quotation_number"], ".docx")
            db.add(quotation)

        db.commit()

    def upsert_for_lead(self, db: Session, *, lead_id: str, payload):
        lead = lead_repository.get(db, lead_id)
        if not lead:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")

        now = utcnow()
        lead_quotations = quotation_repository.list(db, lead_id=lead.id)
        latest_quotation = lead_quotations[0] if lead_quotations else None
        is_new_revision = latest_quotation is None or self._is_locked_revision(latest_quotation)
        quotation = (
            self._new_revision_quotation(lead=lead, previous=latest_quotation, now=now)
            if is_new_revision
            else latest_quotation
        )

        quotation.payment_page_url = quotation.payment_page_url or self.build_payment_page_url(quotation.quote_code)
        quotation.status = QuotationStatus.DRAFT
        quotation.updated_at = now
        self._apply_quotation_values(
            quotation,
            title=payload.title,
            intro_message=payload.intro_message,
            requirements_summary=payload.requirements_summary or lead.client_requirements_text,
            personalized_message=payload.personalized_message,
            tax_label=settings.company_tax_label,
            tax_rate=payload.tax_rate if payload.tax_rate is not None else settings.default_tax_rate,
            valid_until=payload.valid_until,
            currency=settings.razorpay_currency,
            item_sources=payload.items,
            sections=payload.sections,
            now=now,
        )

        if is_new_revision:
            quotation_repository.create(db, quotation)
        else:
            db.add(quotation)

        self._render_assets(lead=lead, quotation=quotation, render_docx=True)
        db.add(quotation)

        lead_repository.add_activity(
            db,
            lead_id=lead.id,
            activity_type=ActivityType.QUOTE,
            description=(
                f"Quotation draft {quotation.quotation_number} prepared for "
                f"{quotation.total_amount} {quotation.currency}"
            ),
            created_by="admin",
            payload={"quote_code": quotation.quote_code, "quotation_id": quotation.id},
        )

        if payload.send_email:
            self._send_quotation_email(
                db,
                lead=lead,
                quotation=quotation,
                personalized_message=payload.personalized_message,
                now=now,
            )

        db.commit()
        db.refresh(quotation)
        return quotation

    def apply_uploaded_docx(self, db: Session, *, quotation_id: str, file_bytes: bytes):
        quotation = quotation_repository.get(db, quotation_id)
        if not quotation:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quotation not found")

        if not file_bytes:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded DOCX file is empty")

        try:
            parsed = docx_service.parse_quotation(file_bytes)
        except DocxParseError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

        now = utcnow()
        source_quotation = quotation
        if self._is_locked_revision(quotation):
            quotation = self._new_revision_quotation(lead=quotation.lead, previous=quotation, now=now)

        self._apply_quotation_values(
            quotation,
            title=parsed["title"],
            intro_message=parsed["intro_message"],
            requirements_summary=parsed["requirements_summary"] or source_quotation.requirements_summary,
            personalized_message=parsed["personalized_message"],
            tax_label=parsed["tax_label"] or source_quotation.tax_label,
            tax_rate=parsed["tax_rate"],
            valid_until=parsed["valid_until"] or source_quotation.valid_until,
            currency=parsed["currency"] or source_quotation.currency,
            item_sources=parsed["items"],
            sections=parsed["sections"],
            now=now,
        )

        if quotation is not source_quotation:
            quotation_repository.create(db, quotation)
        else:
            db.add(quotation)

        docx_destination = settings.quotation_storage_dir / f"{quotation.quotation_number}.docx"
        docx_destination.parent.mkdir(parents=True, exist_ok=True)
        docx_destination.write_bytes(file_bytes)
        quotation.docx_path = str(docx_destination)

        self._render_assets(lead=quotation.lead, quotation=quotation, render_docx=False)
        lead_repository.add_activity(
            db,
            lead_id=quotation.lead_id,
            activity_type=ActivityType.QUOTE,
            description=(
                f"Edited DOCX uploaded and review PDF regenerated for {quotation.quotation_number}"
                if quotation is source_quotation
                else (
                    f"Edited DOCX uploaded. New revision {quotation.quotation_number} created from "
                    f"{source_quotation.quotation_number}"
                )
            ),
            created_by="admin",
            payload={
                "quotation_id": quotation.id,
                "source_quotation_id": source_quotation.id,
            },
        )

        db.add(quotation)
        db.commit()
        db.refresh(quotation)
        return quotation

    def send_to_client(self, db: Session, *, quotation_id: str, personalized_message: str | None = None):
        quotation = quotation_repository.get(db, quotation_id)
        if not quotation:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quotation not found")
        if not quotation.pdf_path:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Generate and review the quotation PDF before sending it to the client",
            )

        now = utcnow()
        self._send_quotation_email(
            db,
            lead=quotation.lead,
            quotation=quotation,
            personalized_message=personalized_message,
            now=now,
        )

        db.commit()
        db.refresh(quotation)
        return quotation

    def _apply_quotation_values(
        self,
        quotation: Quotation,
        *,
        title: str | None,
        intro_message: str | None,
        requirements_summary: str | None,
        personalized_message: str | None,
        tax_label: str | None,
        tax_rate,
        valid_until,
        currency: str | None,
        item_sources,
        sections,
        now,
    ) -> None:
        subtotal = decimalize(0)
        items: list[QuotationItem] = []
        for index, source in enumerate(item_sources):
            source_title = self._read_value(source, "title")
            source_description = self._read_value(source, "description")
            source_unit = self._read_value(source, "unit")
            source_quantity = self._read_value(source, "quantity")
            source_unit_price = self._read_value(source, "unit_price")

            quantity = decimalize(source_quantity)
            unit_price = decimalize(source_unit_price)
            line_total = decimalize(quantity * unit_price)
            subtotal += line_total
            items.append(
                QuotationItem(
                    sort_order=index,
                    title=(source_title or "").strip(),
                    description=(source_description or "").strip() or None,
                    unit=(source_unit or "Nos").strip() or "Nos",
                    quantity=quantity,
                    unit_price=unit_price,
                    line_total=line_total,
                )
            )

        if not items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one quotation line item is required",
            )

        tax_rate_decimal = decimalize(tax_rate if tax_rate is not None else settings.default_tax_rate)
        tax_amount = decimalize(subtotal * tax_rate_decimal / 100)
        total_amount = decimalize(subtotal + tax_amount)

        quotation.title = (title or "Custom SaaS Proposal").strip() or "Custom SaaS Proposal"
        quotation.intro_message = (intro_message or "").strip() or None
        quotation.requirements_summary = (requirements_summary or "").strip() or None
        quotation.personalized_message = (personalized_message or "").strip() or None
        quotation.tax_label = (tax_label or settings.company_tax_label).strip() or settings.company_tax_label
        quotation.tax_rate = tax_rate_decimal
        quotation.subtotal = subtotal
        quotation.tax_amount = tax_amount
        quotation.total_amount = total_amount
        quotation.currency = (currency or settings.razorpay_currency).strip().upper() or settings.razorpay_currency
        quotation.valid_until = valid_until or (now.date() + timedelta(days=settings.quote_validity_days))
        quotation.sections_json = self._serialize_sections(sections)
        quotation.updated_at = now
        quotation.items = items

    def _render_assets(self, *, lead, quotation: Quotation, render_docx: bool) -> None:
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

        pdf_destination = settings.quotation_storage_dir / f"{quotation.quotation_number}.pdf"
        try:
            pdf_service.render_quotation(context, pdf_destination)
        except PdfServiceUnavailableError as exc:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
        quotation.pdf_path = str(pdf_destination)

        if not render_docx:
            return

        docx_destination = settings.quotation_storage_dir / f"{quotation.quotation_number}.docx"
        try:
            docx_service.render_quotation(context, docx_destination)
        except DocxServiceUnavailableError as exc:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
        quotation.docx_path = str(docx_destination)

    def _send_quotation_email(
        self,
        db: Session,
        *,
        lead,
        quotation: Quotation,
        personalized_message: str | None,
        now,
    ) -> None:
        message_to_send = (personalized_message or quotation.personalized_message or quotation.intro_message or "").strip() or None
        quotation.personalized_message = message_to_send
        quotation.status = QuotationStatus.SENT
        quotation.sent_at = quotation.sent_at or now
        quotation.updated_at = now

        if lead.status != LeadStatus.WON:
            lead.status = LeadStatus.PROPOSAL_SENT
            lead.proposal_sent_at = now
            lead.updated_at = now
            db.add(lead)

        attachment_path = Path(quotation.pdf_path)
        email_result = email_service.send_template(
            db=db,
            template_name="quotation_sent.html",
            context={
                "lead": lead,
                "quotation": quotation,
                "items": quotation.items,
                "company_name": settings.company_name,
                "company_tagline": settings.company_tagline,
                "admin_name": settings.admin_name,
                "admin_phone": settings.admin_phone,
                "quotation_url": quotation.payment_page_url,
                "personalized_message": message_to_send,
            },
            to_email=lead.email,
            subject=f"{settings.company_name} quotation {quotation.quotation_number}",
            attachments=[attachment_path],
            lead_id=lead.id,
            quotation_id=quotation.id,
            payload={"event": "quotation_sent", "quotation_number": quotation.quotation_number},
        )

        lead_repository.add_activity(
            db,
            lead_id=lead.id,
            activity_type=ActivityType.QUOTE,
            description=f"Quotation {quotation.quotation_number} approved for client delivery",
            created_by="admin",
            payload={"quotation_id": quotation.id},
        )
        lead_repository.add_activity(
            db,
            lead_id=lead.id,
            activity_type=ActivityType.EMAIL,
            description=(
                f"Quotation {quotation.quotation_number} emailed to client"
                if email_result.success
                else f"Quotation {quotation.quotation_number} email delivery failed"
            ),
            created_by="system",
            payload={
                "quotation_id": quotation.id,
                "email_status": email_result.status,
                "provider": email_result.provider,
            },
        )

        db.add(quotation)

    def _build_series_for_lead(self, lead, *, issued_on) -> str:
        fallback_sequence = None
        if not lead.lead_reference:
            seed = "".join(character for character in (lead.phone or lead.id or "") if character.isalnum())
            fallback_sequence = (sum(ord(character) for character in seed) % 900) + 100 if seed else 1
        return build_quotation_series(
            lead.company_code or lead.company or settings.company_name,
            lead.lead_reference,
            issued_on=issued_on,
            fallback_sequence=fallback_sequence,
        )

    def _is_locked_revision(self, quotation: Quotation) -> bool:
        return quotation.status != QuotationStatus.DRAFT or quotation.sent_at is not None or quotation.paid_at is not None

    def _new_revision_quotation(self, *, lead, previous: Quotation | None, now) -> Quotation:
        if previous:
            series = (
                previous.quotation_series
                or parse_quotation_series(previous.quotation_number)
                or self._build_series_for_lead(lead, issued_on=previous.created_at)
            )
            previous_revision = (
                previous.revision_number
                if previous.revision_number is not None
                else parse_quotation_revision(previous.quotation_number)
            )
            revision_number = int(previous_revision or 0) + 1
        else:
            series = self._build_series_for_lead(lead, issued_on=now)
            revision_number = 0

        quote_code = generate_quote_code()
        return Quotation(
            quotation_number=build_quotation_number(series, revision_number),
            quote_code=quote_code,
            quotation_series=series,
            revision_number=revision_number,
            lead_id=lead.id,
            status=QuotationStatus.DRAFT,
            title="Custom SaaS Proposal",
            intro_message=None,
            requirements_summary=None,
            tax_label=settings.company_tax_label,
            tax_rate=decimalize(0),
            subtotal=decimalize(0),
            tax_amount=decimalize(0),
            total_amount=decimalize(0),
            currency=settings.razorpay_currency,
            valid_until=now.date() + timedelta(days=settings.quote_validity_days),
            pdf_path=None,
            docx_path=None,
            sections_json="[]",
            payment_page_url=self.build_payment_page_url(quote_code),
            personalized_message=None,
            sent_at=None,
            created_at=now,
            updated_at=now,
            items=[],
        )

    def _matches_asset_name(self, current_path: str | None, quotation_number: str, suffix: str) -> bool:
        if not current_path:
            return True
        return Path(current_path).name == f"{quotation_number}{suffix}"

    def _temporary_backfill_number(self, quotation_id: str) -> str:
        compact = "".join(character for character in (quotation_id or "").upper() if character.isalnum())
        return f"TMP{compact[:12] or 'QUOTE'}"

    def _relocate_asset(self, current_path: str | None, quotation_number: str, suffix: str) -> str | None:
        if not current_path:
            return None

        source = Path(current_path)
        destination = settings.quotation_storage_dir / f"{quotation_number}{suffix}"
        if source == destination:
            return str(destination)

        destination.parent.mkdir(parents=True, exist_ok=True)
        if source.exists():
            if destination.exists() and destination != source:
                destination.unlink()
            source.replace(destination)
            return str(destination)

        return str(destination) if destination.exists() else current_path

    def _read_value(self, source, key: str):
        if isinstance(source, dict):
            return source.get(key)
        return getattr(source, key)

    def _serialize_sections(self, sections) -> str:
        normalized_sections: list[dict[str, str]] = []
        for source in sections or []:
            title = str(self._read_value(source, "title") or "").strip()
            content = str(self._read_value(source, "content") or "").strip()
            if not title:
                continue
            normalized_sections.append({"title": title, "content": content})
        return json.dumps(normalized_sections)


quotation_service = QuotationService()
