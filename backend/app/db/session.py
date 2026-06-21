from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings
from app.db.base import Base


engine = create_engine(settings.database_url, pool_pre_ping=True, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)


def _ensure_runtime_schema() -> None:
    inspector = inspect(engine)
    table_names = set(inspector.get_table_names())
    if "leads" not in table_names:
        return

    existing_columns = {column["name"] for column in inspector.get_columns("leads")}
    statements: list[str] = []
    if "company_code" not in existing_columns:
        statements.append("ALTER TABLE leads ADD COLUMN company_code VARCHAR(20)")
    if "company_login_url" not in existing_columns:
        statements.append("ALTER TABLE leads ADD COLUMN company_login_url VARCHAR(255)")
    if "lead_reference" not in existing_columns:
        statements.append("ALTER TABLE leads ADD COLUMN lead_reference VARCHAR(40)")

    if "quotations" in table_names:
        quotation_columns = {column["name"] for column in inspector.get_columns("quotations")}
        if "docx_path" not in quotation_columns:
            statements.append("ALTER TABLE quotations ADD COLUMN docx_path VARCHAR(500)")
        if "personalized_message" not in quotation_columns:
            statements.append("ALTER TABLE quotations ADD COLUMN personalized_message TEXT")
        if "sections_json" not in quotation_columns:
            statements.append("ALTER TABLE quotations ADD COLUMN sections_json TEXT")
        if "quotation_series" not in quotation_columns:
            statements.append("ALTER TABLE quotations ADD COLUMN quotation_series VARCHAR(32)")
        if "revision_number" not in quotation_columns:
            statements.append("ALTER TABLE quotations ADD COLUMN revision_number INTEGER NOT NULL DEFAULT 0")

    if "quotation_items" in table_names:
        quotation_item_columns = {column["name"] for column in inspector.get_columns("quotation_items")}
        if "unit" not in quotation_item_columns:
            statements.append("ALTER TABLE quotation_items ADD COLUMN unit VARCHAR(30)")
            statements.append("UPDATE quotation_items SET unit = 'Nos' WHERE unit IS NULL OR unit = ''")

    if not statements:
        return

    with engine.begin() as connection:
        for statement in statements:
            connection.execute(text(statement))


def init_db() -> None:
    from app.models import activity, auth, company, email_log, integration, lead, payment, quotation  # noqa: F401
    from app.services.company_service import company_service
    from app.services.quotation_service import quotation_service

    Base.metadata.create_all(bind=engine)
    _ensure_runtime_schema()
    settings.quotation_storage_dir.mkdir(parents=True, exist_ok=True)

    with SessionLocal() as db:
        company_service.backfill_existing_data(db)
        quotation_service.backfill_existing_numbering(db)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
