from __future__ import annotations

import base64
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, select_autoescape

from app.core.config import settings


template_env = Environment(
    loader=FileSystemLoader(Path(__file__).resolve().parents[1] / "templates" / "pdf"),
    autoescape=select_autoescape(["html", "xml"]),
)


def _indian_group(int_str: str) -> str:
    """Group an integer string using the Indian system (e.g. 12,34,567)."""
    if len(int_str) <= 3:
        return int_str
    head, tail = int_str[:-3], int_str[-3:]
    parts: list[str] = []
    while len(head) > 2:
        parts.insert(0, head[-2:])
        head = head[:-2]
    if head:
        parts.insert(0, head)
    return ",".join(parts) + "," + tail


def format_money(value, currency: str = "INR") -> str:
    """Format a monetary amount with a currency symbol and thousands grouping."""
    try:
        amount = float(value)
    except (TypeError, ValueError):
        return str(value)
    negative = amount < 0
    whole = f"{abs(amount):.2f}"
    int_part, decimals = whole.split(".")
    code = (currency or "INR").upper()
    if code == "INR":
        body = f"₹{_indian_group(int_part)}.{decimals}"
    else:
        body = f"{code} {int(int_part):,}.{decimals}"
    return f"-{body}" if negative else body


template_env.filters["money"] = format_money


class PdfServiceUnavailableError(RuntimeError):
    pass


class PdfService:
    def _load_renderer(self):
        try:
            from weasyprint import HTML
        except (ImportError, OSError) as exc:
            raise PdfServiceUnavailableError(
                "PDF rendering dependencies are unavailable. Install the WeasyPrint system libraries before generating quotations."
            ) from exc
        return HTML

    def _resolve_stamp_path(self) -> Path | None:
        configured_path = settings.quotation_stamp_path.strip()
        candidate_paths = []
        if configured_path:
            candidate_paths.append(Path(configured_path))
        asset_root = Path(__file__).resolve().parents[1] / "assets"
        candidate_paths.extend(
            [
                asset_root / "muskit_stamp_red_seal.png",
                asset_root / "muskit_stamp_blue_red.png",
            ]
        )
        for candidate in candidate_paths:
            if candidate.exists():
                return candidate
        return None

    def _resolve_logo_path(self) -> Path | None:
        asset_root = Path(__file__).resolve().parents[1] / "assets"
        candidate_paths = [
            asset_root / "muskit_logo.jpeg",
            asset_root / "muskit_logo.jpg",
            asset_root / "muskit_logo.png",
        ]
        for candidate in candidate_paths:
            if candidate.exists():
                return candidate
        return None

    def _file_data_uri(self, asset_path: Path | None) -> str | None:
        if not asset_path:
            return None
        encoded = base64.b64encode(asset_path.read_bytes()).decode("utf-8")
        return f"data:image/{asset_path.suffix.lstrip('.').lower()};base64,{encoded}"

    def _stamp_data_uri(self) -> str | None:
        return self._file_data_uri(self._resolve_stamp_path())

    def render_quotation(self, context: dict, destination: Path) -> Path:
        html_renderer = self._load_renderer()
        template = template_env.get_template("quotation.html")
        html = template.render(
            **{
                **context,
                "stamp_data_uri": self._stamp_data_uri(),
                "logo_data_uri": self._file_data_uri(self._resolve_logo_path()),
            }
        )
        destination.parent.mkdir(parents=True, exist_ok=True)
        html_renderer(string=html, base_url=str(destination.parent)).write_pdf(destination)
        return destination


pdf_service = PdfService()
