"""Network-safety helpers.

Guards against SSRF: outbound webhook targets are operator-supplied URLs, so we
must ensure they resolve to public addresses before the server dispatches to
them. Without this, an admin-registered endpoint like ``http://169.254.169.254``
or ``http://backend:8000`` would let the platform be used to reach internal
services (cloud metadata, the DB, other containers).
"""

from __future__ import annotations

import ipaddress
import socket
from urllib.parse import urlsplit


class UnsafeWebhookURL(ValueError):
    """Raised when a webhook target URL is not a safe, public HTTP(S) endpoint."""


def _resolved_ips(host: str) -> list[str]:
    infos = socket.getaddrinfo(host, None)
    return [info[4][0] for info in infos]


def _is_public_ip(raw: str) -> bool:
    try:
        ip = ipaddress.ip_address(raw)
    except ValueError:
        return False
    return not (
        ip.is_private
        or ip.is_loopback
        or ip.is_link_local
        or ip.is_multicast
        or ip.is_reserved
        or ip.is_unspecified
    )


def assert_public_http_url(url: str) -> None:
    """Reject non-HTTP(S) schemes and hosts that resolve to non-public addresses.

    Raises ``UnsafeWebhookURL`` on failure; returns ``None`` when the URL is safe.
    """
    parts = urlsplit(url)
    if parts.scheme not in ("http", "https"):
        raise UnsafeWebhookURL("Only http and https webhook URLs are allowed.")
    host = parts.hostname
    if not host:
        raise UnsafeWebhookURL("Webhook URL must include a host.")

    # A literal IP in the URL is checked directly; a hostname is resolved and
    # every returned address must be public (defends against DNS that returns a
    # private A record, though not a fully TOCTOU-safe rebind — good enough as a
    # first-line guard on an admin-only endpoint).
    try:
        candidates = [host] if _is_ip_literal(host) else _resolved_ips(host)
    except socket.gaierror as exc:
        raise UnsafeWebhookURL(f"Webhook host could not be resolved: {host}") from exc

    if not candidates:
        raise UnsafeWebhookURL(f"Webhook host could not be resolved: {host}")
    for addr in candidates:
        if not _is_public_ip(addr):
            raise UnsafeWebhookURL(
                f"Webhook host resolves to a non-public address ({addr})."
            )


def _is_ip_literal(host: str) -> bool:
    try:
        ipaddress.ip_address(host)
        return True
    except ValueError:
        return False
