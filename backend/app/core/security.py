import hashlib
import hmac
import secrets
from datetime import UTC, datetime, timedelta

from app.core.config import settings


def utcnow() -> datetime:
    return datetime.now(UTC)


def generate_numeric_otp(digits: int) -> str:
    upper_bound = 10**digits
    return str(secrets.randbelow(upper_bound)).zfill(digits)


def hash_scoped_value(scope: str, value: str) -> str:
    digest = hmac.new(
        settings.admin_session_secret.encode("utf-8"),
        msg=f"{scope}:{value}".encode("utf-8"),
        digestmod=hashlib.sha256,
    )
    return digest.hexdigest()


def hash_admin_otp(challenge_id: str, otp: str) -> str:
    return hash_scoped_value("otp", f"{challenge_id}:{otp}")


def hash_admin_session(token: str) -> str:
    return hash_scoped_value("session", token)


def verify_hash(expected: str, actual: str) -> bool:
    return hmac.compare_digest(expected or "", actual or "")


def build_expiry(hours: int | None = None, minutes: int | None = None) -> datetime:
    delta = timedelta(
        hours=hours or 0,
        minutes=minutes or 0,
    )
    return utcnow() + delta
