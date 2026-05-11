from __future__ import annotations

import re
import secrets
import string
from datetime import date, datetime
from html import escape
from decimal import Decimal, ROUND_HALF_UP

import bleach


ALLOWED_HTML_TAGS = [
    "p",
    "br",
    "strong",
    "em",
    "b",
    "i",
    "u",
    "ul",
    "ol",
    "li",
    "blockquote",
]


def sanitize_rich_text(html: str | None) -> tuple[str, str]:
    cleaned = bleach.clean(
        html or "",
        tags=ALLOWED_HTML_TAGS,
        attributes={},
        strip=True,
    )
    text = re.sub(r"\s+", " ", bleach.clean(cleaned, tags=[], strip=True)).strip()
    return cleaned, text


def plain_text_to_html(text: str | None) -> str:
    escaped = escape((text or "").strip())
    return escaped.replace("\n", "<br>")


def decimalize(value: Decimal | float | int | str) -> Decimal:
    return Decimal(str(value)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def generate_quote_code() -> str:
    alphabet = string.ascii_uppercase + string.digits
    return "QT" + "".join(secrets.choice(alphabet) for _ in range(10))


def generate_invoice_number() -> str:
    alphabet = string.ascii_uppercase + string.digits
    return "INV-" + "".join(secrets.choice(alphabet) for _ in range(8))


def sanitize_company_code(value: str | None) -> str:
    return re.sub(r"[^A-Z0-9]+", "", (value or "").upper())


def derive_company_code(company_name: str | None) -> str:
    words = [sanitize_company_code(part) for part in re.split(r"\s+", (company_name or "").strip()) if part]
    words = [word for word in words if word]
    if not words:
        return "COMP"
    if len(words) == 1:
        seed = words[0]
        return (seed[:8] or "COMP").ljust(4, "X")
    initials = "".join(word[0] for word in words)
    if len(initials) >= 4:
        return initials[:8]
    seed = initials + "".join(words)
    return (seed[:8] or "COMP").ljust(4, "X")


def generate_lead_reference(company_code: str, sequence: int) -> str:
    return f"MUSK_{sanitize_company_code(company_code)[:12]}_{sequence:03d}"


def parse_lead_reference_sequence(value: str | None) -> int | None:
    match = re.search(r"_(\d{3,})$", value or "")
    return int(match.group(1)) if match else None


def quotation_financial_year(value: date | datetime | None = None) -> str:
    if isinstance(value, datetime):
        current_date = value.date()
    elif isinstance(value, date):
        current_date = value
    else:
        current_date = datetime.utcnow().date()

    start_year = current_date.year if current_date.month >= 4 else current_date.year - 1
    return f"{start_year}-{(start_year + 1) % 100:02d}"


def build_quotation_series(
    company_code: str | None,
    lead_reference: str | None,
    *,
    issued_on: date | datetime | None = None,
    fallback_sequence: int | None = None,
) -> str:
    normalized_code = sanitize_company_code(company_code)[:12] or "COMP"
    sequence = parse_lead_reference_sequence(lead_reference) or fallback_sequence or 1
    return f"Q_{normalized_code}_{quotation_financial_year(issued_on)}_{sequence:03d}"


def build_quotation_number(series: str, revision_number: int | None = None) -> str:
    revision = max(int(revision_number or 0), 0)
    return f"{(series or 'Q_COMP_0000-00_001').strip()}_R{revision}"


def parse_quotation_series(value: str | None) -> str | None:
    match = re.match(r"^(Q_[A-Z0-9]+_\d{4}-\d{2}_\d{3,})_R\d+$", (value or "").strip().upper())
    return match.group(1) if match else None


def parse_quotation_revision(value: str | None) -> int | None:
    match = re.search(r"_R(\d+)$", (value or "").strip().upper())
    return int(match.group(1)) if match else None
