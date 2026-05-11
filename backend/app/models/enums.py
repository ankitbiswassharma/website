from enum import Enum


class LeadStatus(str, Enum):
    NEW = "new"
    CONTACTED = "contacted"
    QUALIFIED = "qualified"
    PROPOSAL_SENT = "proposal_sent"
    WON = "won"
    LOST = "lost"


class LeadRequestType(str, Enum):
    CONTACT = "contact"
    DEMO = "demo"


class ActivityType(str, Enum):
    NOTE = "note"
    STATUS = "status"
    EMAIL = "email"
    QUOTE = "quote"
    PAYMENT = "payment"
    SYSTEM = "system"


class QuotationStatus(str, Enum):
    DRAFT = "draft"
    SENT = "sent"
    PAID = "paid"
    EXPIRED = "expired"
    CANCELLED = "cancelled"


class PaymentStatus(str, Enum):
    PENDING = "pending"
    CREATED = "created"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"
