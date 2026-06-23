import base64
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


# ── Password hashing (PBKDF2-HMAC-SHA256, stdlib only) ──────────────────────────
_PBKDF2_ITERATIONS = 240_000


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    derived = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, _PBKDF2_ITERATIONS)
    return f"pbkdf2_sha256${_PBKDF2_ITERATIONS}${salt.hex()}${derived.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        algorithm, iterations, salt_hex, hash_hex = (stored or "").split("$")
        if algorithm != "pbkdf2_sha256":
            return False
        derived = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            bytes.fromhex(salt_hex),
            int(iterations),
        )
        return hmac.compare_digest(derived.hex(), hash_hex)
    except (ValueError, AttributeError):
        return False


def generate_temp_password(length: int = 12) -> str:
    # Avoid ambiguous characters so the emailed credential is easy to type.
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789"
    symbols = "@#$%&*"
    body = "".join(secrets.choice(alphabet) for _ in range(length - 2))
    return body + secrets.choice(symbols) + secrets.choice("23456789")


# ── Reversible field encryption (HMAC-SHA256 keystream + tag, stdlib only) ──────
def _encryption_key() -> bytes:
    return hashlib.sha256(("field-enc:" + settings.admin_session_secret).encode("utf-8")).digest()


def _keystream(key: bytes, nonce: bytes, length: int) -> bytes:
    out = bytearray()
    counter = 0
    while len(out) < length:
        block = hmac.new(key, nonce + counter.to_bytes(8, "big"), hashlib.sha256).digest()
        out.extend(block)
        counter += 1
    return bytes(out[:length])


def encrypt_value(plaintext: str) -> str:
    if plaintext is None:
        plaintext = ""
    key = _encryption_key()
    nonce = secrets.token_bytes(16)
    data = plaintext.encode("utf-8")
    cipher = bytes(a ^ b for a, b in zip(data, _keystream(key, nonce, len(data))))
    tag = hmac.new(key, nonce + cipher, hashlib.sha256).digest()
    return base64.urlsafe_b64encode(nonce + tag + cipher).decode("ascii")


def decrypt_value(token: str) -> str:
    if not token:
        return ""
    key = _encryption_key()
    raw = base64.urlsafe_b64decode(token.encode("ascii"))
    nonce, tag, cipher = raw[:16], raw[16:48], raw[48:]
    expected = hmac.new(key, nonce + cipher, hashlib.sha256).digest()
    if not hmac.compare_digest(tag, expected):
        raise ValueError("Encrypted value failed integrity check")
    data = bytes(a ^ b for a, b in zip(cipher, _keystream(key, nonce, len(cipher))))
    return data.decode("utf-8")


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
