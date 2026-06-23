from pathlib import Path

from pydantic import AliasChoices, Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_env: str = Field(default="development", alias="APP_ENV")
    api_v1_prefix: str = "/api/v1"
    backend_port: int = Field(default=8000, alias="BACKEND_PORT")
    frontend_url: str = Field(default="http://localhost:3000", alias="FRONTEND_URL")
    cors_origins: str = Field(default="", alias="CORS_ORIGINS")
    api_base_url: str = Field(default="http://localhost:8000", alias="API_BASE_URL")
    database_url: str = Field(
        default="postgresql+psycopg://postgres:postgres@localhost:5432/muskit_platform",
        alias="DATABASE_URL",
    )

    admin_email: str = Field(default="ankitbiswassharma@muskit.in", alias="ADMIN_EMAIL")
    admin_name: str = Field(default="Ankit Biswas Sharma", alias="ADMIN_NAME")
    admin_phone: str = Field(default="+91 70478 59422", alias="ADMIN_PHONE")
    admin_whatsapp: str = Field(default="917047859422", alias="ADMIN_WHATSAPP")
    admin_session_secret: str = Field(default="change-me", alias="ADMIN_SESSION_SECRET")
    admin_otp_digits: int = Field(default=6, alias="ADMIN_OTP_DIGITS")
    admin_otp_expires_minutes: int = Field(default=10, alias="ADMIN_OTP_EXPIRES_MINUTES")
    admin_otp_cooldown_seconds: int = Field(default=60, alias="ADMIN_OTP_COOLDOWN_SECONDS")
    admin_otp_max_attempts: int = Field(default=5, alias="ADMIN_OTP_MAX_ATTEMPTS")
    admin_session_ttl_hours: int = Field(default=24, alias="ADMIN_SESSION_TTL_HOURS")

    smtp_host: str = Field(default="", validation_alias=AliasChoices("SMTP_HOST", "MAIL_HOST", "MAIL_SERVER"))
    smtp_port: int = Field(default=587, validation_alias=AliasChoices("SMTP_PORT", "MAIL_PORT"))
    smtp_user: str = Field(default="", validation_alias=AliasChoices("SMTP_USER", "MAIL_USERNAME", "MAIL_USER"))
    smtp_password: str = Field(default="", validation_alias=AliasChoices("SMTP_PASSWORD", "MAIL_PASSWORD"))
    smtp_from: str = Field(default="", validation_alias=AliasChoices("SMTP_FROM", "MAIL_FROM"))
    smtp_from_address: str = Field(
        default="",
        validation_alias=AliasChoices("SMTP_FROM_ADDRESS", "MAIL_FROM_ADDRESS"),
    )
    smtp_from_name: str = Field(default="", validation_alias=AliasChoices("SMTP_FROM_NAME", "MAIL_FROM_NAME"))
    smtp_starttls: bool = Field(default=True, validation_alias=AliasChoices("SMTP_STARTTLS", "MAIL_STARTTLS"))
    smtp_ssl: bool = Field(default=False, validation_alias=AliasChoices("SMTP_SSL", "MAIL_SSL_TLS"))
    smtp_encryption: str = Field(
        default="",
        validation_alias=AliasChoices("SMTP_ENCRYPTION", "MAIL_ENCRYPTION"),
    )
    smtp_timeout: int = Field(default=20, validation_alias=AliasChoices("SMTP_TIMEOUT", "MAIL_TIMEOUT"))
    email_provider: str = Field(default="smtp", validation_alias=AliasChoices("EMAIL_PROVIDER", "MAIL_MAILER"))
    email_reply_to: str = Field(default="", alias="EMAIL_REPLY_TO")
    sendgrid_api_key: str = Field(default="", alias="SENDGRID_API_KEY")
    sendgrid_from_email: str = Field(default="", alias="SENDGRID_FROM_EMAIL")
    sendgrid_from_name: str = Field(default="", alias="SENDGRID_FROM_NAME")

    company_name: str = Field(default="Musk-IT", alias="COMPANY_NAME")
    company_tagline: str = Field(default="Build | Automate | Grow", alias="COMPANY_TAGLINE")
    company_website: str = Field(default="https://muskit.in", alias="COMPANY_WEBSITE")
    # Public base used to build click-tracking links embedded in outbound emails.
    # Must be reachable by recipients and proxy /api/v1 to the backend.
    public_base_url: str = Field(default="", alias="PUBLIC_BASE_URL")
    company_address: str = Field(default="India", alias="COMPANY_ADDRESS")
    company_tax_label: str = Field(default="GST", alias="COMPANY_TAX_LABEL")
    default_tax_rate: float = Field(default=18.0, alias="DEFAULT_TAX_RATE")
    quote_validity_days: int = Field(default=14, alias="QUOTE_VALIDITY_DAYS")
    enterprise_base_domain: str = Field(default="muskit.in", alias="ENTERPRISE_BASE_DOMAIN")
    quotation_stamp_path: str = Field(default="", alias="QUOTATION_STAMP_PATH")

    integrations_inbound_secret: str = Field(default="", alias="INTEGRATIONS_INBOUND_SECRET")
    integrations_dispatch_timeout: int = Field(default=10, alias="INTEGRATIONS_DISPATCH_TIMEOUT")

    razorpay_key_id: str = Field(default="", alias="RAZORPAY_KEY_ID")
    razorpay_key_secret: str = Field(default="", alias="RAZORPAY_KEY_SECRET")
    razorpay_webhook_secret: str = Field(default="", alias="RAZORPAY_WEBHOOK_SECRET")
    razorpay_currency: str = Field(default="INR", alias="RAZORPAY_CURRENCY")

    storage_path: str = "app/storage"

    @property
    def quotation_storage_dir(self) -> Path:
        return Path(__file__).resolve().parents[1] / "storage" / "quotations"

    @property
    def cors_allowed_origins(self) -> list[str]:
        default_origins = {self.frontend_url.strip().rstrip("/")}
        if self.company_website.startswith(("http://", "https://")):
            default_origins.add(self.company_website.strip().rstrip("/"))
        if self.app_env.strip().lower() != "production":
            default_origins.update(
                {
                    "http://localhost:3000",
                    "http://127.0.0.1:3000",
                }
            )
        configured_origins = {
            origin.strip().rstrip("/")
            for origin in self.cors_origins.split(",")
            if origin.strip()
        }
        return sorted(default_origins | configured_origins)

    @model_validator(mode="after")
    def validate_production_settings(self):
        if self.app_env.strip().lower() != "production":
            return self
        weak_admin_secrets = {
            "change-me",
            "change-this-local-secret",
            "replace-with-at-least-32-random-characters",
        }
        if self.admin_session_secret in weak_admin_secrets:
            raise ValueError("ADMIN_SESSION_SECRET must be set to a strong secret in production.")
        if len(self.admin_session_secret) < 32:
            raise ValueError("ADMIN_SESSION_SECRET must be at least 32 characters in production.")
        local_markers = ("localhost", "127.0.0.1")
        if any(marker in self.frontend_url for marker in local_markers):
            raise ValueError("FRONTEND_URL must be set to the public production URL.")
        if any(marker in self.api_base_url for marker in local_markers):
            raise ValueError("API_BASE_URL must be set to the public production URL.")
        return self

    @property
    def smtp_enabled(self) -> bool:
        return bool(self.smtp_host and self.smtp_user and self.smtp_password)

    @property
    def smtp_use_ssl(self) -> bool:
        encryption = self.smtp_encryption.strip().lower()
        if encryption in {"ssl", "ssl_tls", "smtps"}:
            return True
        if encryption in {"tls", "starttls"}:
            return False
        if self.smtp_ssl and self.smtp_starttls:
            return self.smtp_port == 465
        return self.smtp_ssl

    @property
    def smtp_use_starttls(self) -> bool:
        encryption = self.smtp_encryption.strip().lower()
        if encryption in {"tls", "starttls"}:
            return True
        if encryption in {"ssl", "ssl_tls", "smtps"}:
            return False
        if self.smtp_ssl and self.smtp_starttls:
            return self.smtp_port != 465
        return self.smtp_starttls

    @property
    def sendgrid_enabled(self) -> bool:
        return bool(self.sendgrid_api_key and (self.sendgrid_from_email or self.smtp_from or self.smtp_user))

    @property
    def active_email_provider(self) -> str:
        requested_provider = self.email_provider.strip().lower()
        if requested_provider == "sendgrid":
            return "sendgrid" if self.sendgrid_enabled else "none"
        if requested_provider == "smtp":
            return "smtp" if self.smtp_enabled else "none"
        if self.sendgrid_enabled:
            return "sendgrid"
        if self.smtp_enabled:
            return "smtp"
        return "none"

    @property
    def razorpay_enabled(self) -> bool:
        return bool(self.razorpay_key_id and self.razorpay_key_secret)


settings = Settings()
