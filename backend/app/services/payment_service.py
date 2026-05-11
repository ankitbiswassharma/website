from __future__ import annotations

import base64
import hashlib
import hmac
import json
from typing import Any

import httpx
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import utcnow
from app.models.enums import ActivityType, LeadStatus, PaymentStatus, QuotationStatus
from app.models.payment import Payment
from app.repositories.lead_repository import LeadRepository
from app.repositories.payment_repository import PaymentRepository
from app.repositories.quotation_repository import QuotationRepository
from app.services.company_service import company_service
from app.services.email_service import email_service
from app.utils.formatting import generate_invoice_number


payment_repository = PaymentRepository()
quotation_repository = QuotationRepository()
lead_repository = LeadRepository()


class PaymentService:
    def _payment_prefill(self, quotation) -> dict[str, str | None]:
        return {
            "name": quotation.lead.full_name,
            "email": quotation.lead.email,
            "contact": quotation.lead.phone,
        }

    def _payment_response(self, quotation, payment: Payment, *, message: str | None = None) -> dict[str, Any]:
        return {
            "mode": "razorpay",
            "status": payment.status.value,
            "payment_id": payment.id,
            "key_id": settings.razorpay_key_id,
            "order_id": payment.razorpay_order_id,
            "amount": int(payment.total_amount * 100),
            "currency": payment.currency,
            "prefill": self._payment_prefill(quotation),
            "payment_page_url": payment.payment_page_url or quotation.payment_page_url,
            "message": message,
        }

    def _manual_response(self, quotation, *, message: str, mode: str = "manual") -> dict[str, Any]:
        return {
            "mode": mode,
            "status": PaymentStatus.PENDING.value,
            "payment_id": None,
            "payment_page_url": quotation.payment_page_url,
            "message": message,
        }

    def _merge_gateway_payload(
        self,
        current_payload: dict | None,
        *,
        payload: dict | None,
        key: str,
    ) -> dict | None:
        merged_payload = dict(current_payload or {})
        if payload:
            merged_payload[key] = payload
        return merged_payload or None

    async def _create_razorpay_order(self, db: Session, quotation) -> Payment:
        if not settings.razorpay_enabled:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Razorpay is not configured. Add Razorpay keys before generating payment links.",
            )

        amount_paise = int(quotation.total_amount * 100)
        receipt = f"{quotation.quotation_number}-{int(utcnow().timestamp())}"
        auth_token = base64.b64encode(
            f"{settings.razorpay_key_id}:{settings.razorpay_key_secret}".encode("utf-8")
        ).decode("utf-8")
        headers = {
            "Authorization": f"Basic {auth_token}",
            "Content-Type": "application/json",
        }
        payload = {
            "amount": amount_paise,
            "currency": settings.razorpay_currency,
            "receipt": receipt,
            "notes": {
                "quotation_number": quotation.quotation_number,
                "lead_id": quotation.lead_id,
                "quote_code": quotation.quote_code,
            },
        }

        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post("https://api.razorpay.com/v1/orders", json=payload, headers=headers)

        if response.status_code >= 400:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Razorpay order creation failed: {response.text}",
            )

        response_data = response.json()
        payment = Payment(
            lead_id=quotation.lead_id,
            quotation_id=quotation.id,
            status=PaymentStatus.CREATED,
            provider="razorpay",
            currency=settings.razorpay_currency,
            subtotal=quotation.subtotal,
            tax_amount=quotation.tax_amount,
            total_amount=quotation.total_amount,
            receipt=receipt,
            razorpay_order_id=response_data["id"],
            payment_page_url=quotation.payment_page_url,
            gateway_payload=self._merge_gateway_payload(None, payload=response_data, key="order_creation"),
            created_at=utcnow(),
            updated_at=utcnow(),
        )
        payment_repository.create(db, payment)
        lead_repository.add_activity(
            db,
            lead_id=quotation.lead_id,
            activity_type=ActivityType.PAYMENT,
            description=f"Razorpay order created for quotation {quotation.quotation_number}",
            created_by="system",
            payload={"order_id": response_data["id"], "payment_id": payment.id},
        )
        return payment

    def _get_latest_payment(self, db: Session, quotation_id: str) -> Payment | None:
        return payment_repository.get_latest_for_quotation(db, quotation_id)

    async def get_public_payment_order(self, db: Session, quote_code: str) -> dict[str, Any]:
        quotation = quotation_repository.get_by_code(db, quote_code)
        if not quotation:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quotation not found")

        latest_payment = self._get_latest_payment(db, quotation.id)
        if quotation.status == QuotationStatus.PAID or (
            latest_payment and latest_payment.status == PaymentStatus.PAID
        ):
            return self._manual_response(
                quotation,
                mode="paid",
                message="This quotation has already been paid.",
            )

        if latest_payment and latest_payment.status == PaymentStatus.CREATED and latest_payment.razorpay_order_id:
            return self._payment_response(quotation, latest_payment)

        if not settings.razorpay_enabled:
            return self._manual_response(
                quotation,
                message="Razorpay is not configured yet. Please contact sales for manual payment.",
            )

        return self._manual_response(
            quotation,
            mode="inactive",
            message="Payment link is not active yet. Please use the payment email sent by sales or contact the team.",
        )

    async def create_admin_payment_link(
        self,
        db: Session,
        *,
        quotation_id: str,
        message: str | None,
        send_email: bool,
    ) -> dict[str, Any]:
        quotation = quotation_repository.get(db, quotation_id)
        if not quotation:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quotation not found")

        latest_payment = self._get_latest_payment(db, quotation.id)
        if quotation.status == QuotationStatus.PAID or (
            latest_payment and latest_payment.status == PaymentStatus.PAID
        ):
            return {
                "success": True,
                "quotation_id": quotation.id,
                "quote_code": quotation.quote_code,
                "payment_id": latest_payment.id if latest_payment else None,
                "status": PaymentStatus.PAID.value,
                "mode": "paid",
                "order_id": latest_payment.razorpay_order_id if latest_payment else None,
                "payment_page_url": quotation.payment_page_url,
                "email_sent": False,
                "message": "This quotation has already been paid.",
            }

        if not settings.razorpay_enabled:
            return {
                "success": True,
                "quotation_id": quotation.id,
                "quote_code": quotation.quote_code,
                "payment_id": None,
                "status": PaymentStatus.PENDING.value,
                "mode": "manual",
                "order_id": None,
                "payment_page_url": quotation.payment_page_url,
                "email_sent": False,
                "message": "Razorpay is not configured yet. Add Razorpay credentials before sending payment links.",
            }

        if latest_payment and latest_payment.status == PaymentStatus.CREATED and latest_payment.razorpay_order_id:
            payment = latest_payment
        else:
            payment = await self._create_razorpay_order(db, quotation)

        lead = quotation.lead
        now = utcnow()
        if quotation.status == QuotationStatus.DRAFT:
            quotation.status = QuotationStatus.SENT
            quotation.sent_at = quotation.sent_at or now
            quotation.updated_at = now
            db.add(quotation)
        if lead.status not in {LeadStatus.WON, LeadStatus.LOST}:
            lead.status = LeadStatus.PROPOSAL_SENT
            lead.proposal_sent_at = lead.proposal_sent_at or now
            lead.updated_at = now
            db.add(lead)

        email_result = None
        payment_message = (
            message.strip()
            if message and message.strip()
            else (
                f"Hi {lead.full_name}, your quotation {quotation.quotation_number} is ready for confirmation. "
                "Use the secure payment link below to complete the payment and we will start the project handoff immediately."
            )
        )
        if send_email:
            email_result = email_service.send_template(
                db=db,
                template_name="payment_link_email.html",
                context={
                    "lead": lead,
                    "quotation": quotation,
                    "payment": payment,
                    "company_name": settings.company_name,
                    "company_tagline": settings.company_tagline,
                    "admin_name": settings.admin_name,
                    "admin_phone": settings.admin_phone,
                    "payment_page_url": payment.payment_page_url or quotation.payment_page_url,
                    "payment_message": payment_message,
                },
                to_email=lead.email,
                subject=f"Payment link for {quotation.quotation_number}",
                lead_id=lead.id,
                quotation_id=quotation.id,
                payment_id=payment.id,
                payload={
                    "event": "payment_link_sent",
                    "quotation_number": quotation.quotation_number,
                    "order_id": payment.razorpay_order_id,
                },
            )

        lead_repository.add_activity(
            db,
            lead_id=lead.id,
            activity_type=ActivityType.PAYMENT,
            description=(
                f"Payment link emailed for quotation {quotation.quotation_number}"
                if email_result and email_result.success
                else f"Payment link generated for quotation {quotation.quotation_number}"
            ),
            created_by="admin",
            payload={
                "payment_id": payment.id,
                "order_id": payment.razorpay_order_id,
                "email_sent": email_result.success if email_result else False,
                "email_status": email_result.status if email_result else "skipped",
                "payment_page_url": payment.payment_page_url or quotation.payment_page_url,
            },
        )

        db.commit()
        db.refresh(payment)
        return {
            "success": True,
            "quotation_id": quotation.id,
            "quote_code": quotation.quote_code,
            "payment_id": payment.id,
            "status": payment.status.value,
            "mode": "razorpay",
            "order_id": payment.razorpay_order_id,
            "payment_page_url": payment.payment_page_url or quotation.payment_page_url,
            "email_sent": email_result.success if email_result else False,
            "message": (
                f"Payment link emailed to {lead.email}."
                if email_result and email_result.success
                else "Payment link generated. Email delivery was skipped or failed."
            ),
        }

    def verify_signature(self, *, order_id: str, payment_id: str, signature: str) -> bool:
        expected = hmac.new(
            settings.razorpay_key_secret.encode("utf-8"),
            f"{order_id}|{payment_id}".encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()
        return hmac.compare_digest(expected, signature)

    def verify_webhook_signature(self, *, raw_body: bytes, signature: str) -> bool:
        expected = hmac.new(
            settings.razorpay_webhook_secret.encode("utf-8"),
            raw_body,
            hashlib.sha256,
        ).hexdigest()
        return hmac.compare_digest(expected, signature)

    def finalize_payment(
        self,
        db: Session,
        *,
        order_id: str,
        payment_id: str,
        signature: str | None = None,
        signature_verified: bool = False,
        gateway_payload: dict | None = None,
        event_source: str = "checkout",
    ) -> Payment:
        payment = payment_repository.get_by_order_id(db, order_id)
        if not payment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment order not found")

        if payment.status == PaymentStatus.PAID:
            should_update = False
            if payment_id and not payment.razorpay_payment_id:
                payment.razorpay_payment_id = payment_id
                should_update = True
            if signature and not payment.razorpay_signature:
                if not signature_verified and not self.verify_signature(
                    order_id=order_id,
                    payment_id=payment_id,
                    signature=signature,
                ):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Payment signature verification failed",
                    )
                payment.razorpay_signature = signature
                should_update = True
            if gateway_payload:
                payment.gateway_payload = self._merge_gateway_payload(
                    payment.gateway_payload,
                    payload=gateway_payload,
                    key=event_source,
                )
                should_update = True
            if should_update:
                payment.updated_at = utcnow()
                db.add(payment)
                db.commit()
                db.refresh(payment)
            return payment

        if not signature_verified:
            if not signature or not self.verify_signature(order_id=order_id, payment_id=payment_id, signature=signature):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Payment signature verification failed",
                )

        quotation = payment.quotation
        lead = payment.lead
        payment.status = PaymentStatus.PAID
        payment.razorpay_payment_id = payment_id
        payment.razorpay_signature = signature
        payment.invoice_number = payment.invoice_number or generate_invoice_number()
        payment.paid_at = utcnow()
        payment.updated_at = utcnow()
        payment.gateway_payload = self._merge_gateway_payload(
            payment.gateway_payload,
            payload=(
                gateway_payload
                or {
                    "razorpay_order_id": order_id,
                    "razorpay_payment_id": payment_id,
                    "razorpay_signature": signature,
                }
            ),
            key=event_source,
        )

        quotation.status = QuotationStatus.PAID
        quotation.paid_at = utcnow()
        quotation.updated_at = utcnow()

        lead.status = LeadStatus.WON
        lead.won_at = utcnow()
        lead.updated_at = utcnow()

        db.add(payment)
        db.add(quotation)
        db.add(lead)

        lead_repository.add_activity(
            db,
            lead_id=lead.id,
            activity_type=ActivityType.PAYMENT,
            description=f"Payment received for quotation {quotation.quotation_number}",
            created_by="system",
            payload={"invoice_number": payment.invoice_number, "payment_id": payment_id, "source": event_source},
        )

        admin_result = email_service.send_template(
            db=db,
            template_name="payment_received_admin.html",
            context={
                "lead": lead,
                "payment": payment,
                "quotation": quotation,
                "company_name": settings.company_name,
                "dashboard_url": f"{settings.frontend_url}/dashboard",
            },
            to_email=settings.admin_email,
            subject=f"Payment received for {quotation.quotation_number}",
            lead_id=lead.id,
            quotation_id=quotation.id,
            payment_id=payment.id,
            payload={"event": "payment_received_admin", "source": event_source},
        )
        client_result = email_service.send_template(
            db=db,
            template_name="payment_received_client.html",
            context={
                "lead": lead,
                "payment": payment,
                "quotation": quotation,
                "company_name": settings.company_name,
                "company_tagline": settings.company_tagline,
                "admin_name": settings.admin_name,
            },
            to_email=lead.email,
            subject=f"Payment confirmed for {quotation.quotation_number}",
            lead_id=lead.id,
            quotation_id=quotation.id,
            payment_id=payment.id,
            payload={"event": "payment_received_client", "source": event_source},
        )
        lead_repository.add_activity(
            db,
            lead_id=lead.id,
            activity_type=ActivityType.EMAIL,
            description=(
                "Payment confirmation emails sent"
                if admin_result.success and client_result.success
                else "Payment recorded but one or more confirmation emails failed"
            ),
            created_by="system",
            payload={
                "admin_email_status": admin_result.status,
                "client_email_status": client_result.status,
                "source": event_source,
            },
        )

        company_service.notify_company_domain_ready(
            db,
            lead=lead,
            quotation=quotation,
            payment=payment,
        )

        db.commit()
        db.refresh(payment)
        return payment

    def handle_webhook(self, db: Session, *, raw_body: bytes, signature: str | None) -> dict[str, Any]:
        if not settings.razorpay_webhook_secret:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Razorpay webhook secret is not configured.",
            )
        if not signature:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing Razorpay webhook signature")
        if not self.verify_webhook_signature(raw_body=raw_body, signature=signature):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Razorpay webhook signature")

        try:
            payload = json.loads(raw_body.decode("utf-8"))
        except json.JSONDecodeError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid webhook payload") from exc

        event = payload.get("event", "")
        payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {}) or {}
        order_entity = payload.get("payload", {}).get("order", {}).get("entity", {}) or {}

        if event in {"payment.captured", "order.paid"}:
            order_id = payment_entity.get("order_id") or order_entity.get("id")
            razorpay_payment_id = payment_entity.get("id")
            if not order_id or not razorpay_payment_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Webhook payload is missing payment identifiers",
                )
            payment = self.finalize_payment(
                db,
                order_id=order_id,
                payment_id=razorpay_payment_id,
                signature_verified=True,
                gateway_payload=payload,
                event_source="webhook",
            )
            return {
                "success": True,
                "event": event,
                "status": payment.status.value,
                "message": f"Payment {payment.id} marked as paid.",
            }

        if event == "payment.failed":
            order_id = payment_entity.get("order_id")
            payment = payment_repository.get_by_order_id(db, order_id) if order_id else None
            if payment and payment.status != PaymentStatus.PAID:
                payment.status = PaymentStatus.FAILED
                payment.updated_at = utcnow()
                payment.gateway_payload = self._merge_gateway_payload(
                    payment.gateway_payload,
                    payload=payload,
                    key="webhook",
                )
                db.add(payment)
                lead_repository.add_activity(
                    db,
                    lead_id=payment.lead_id,
                    activity_type=ActivityType.PAYMENT,
                    description=f"Payment failed for quotation {payment.quotation.quotation_number}",
                    created_by="system",
                    payload={"order_id": order_id},
                )
                db.commit()
            return {
                "success": True,
                "event": event,
                "status": PaymentStatus.FAILED.value,
                "message": "Payment failure recorded.",
            }

        return {
            "success": True,
            "event": event or "unknown",
            "status": "ignored",
            "message": "Webhook event ignored.",
        }


payment_service = PaymentService()
