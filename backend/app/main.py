from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import (
    admin_auth,
    admin_campaigns,
    admin_companies,
    admin_dashboard,
    admin_leads,
    admin_users,
    client_portal,
    health,
    integrations,
    lead_management,
    public,
    staff_auth,
    staff_leads,
    staff_quotations,
    tracking,
)
from app.core.config import settings
from app.db.session import init_db


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


# Don't expose the interactive docs / OpenAPI schema publicly in production —
# it enumerates every admin/staff/client route and their request payloads.
_is_production = settings.app_env.strip().lower() == "production"

app = FastAPI(
    title=f"{settings.company_name} SaaS Platform API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url=None if _is_production else "/docs",
    redoc_url=None if _is_production else "/redoc",
    openapi_url=None if _is_production else "/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_api_crawl_headers(request: Request, call_next):
    response = await call_next(request)
    if request.url.path.startswith(settings.api_v1_prefix):
        response.headers.setdefault("X-Robots-Tag", "noindex, nofollow")
    return response


app.include_router(health.router, prefix=settings.api_v1_prefix)
app.include_router(lead_management.router, prefix=settings.api_v1_prefix)
app.include_router(public.router, prefix=settings.api_v1_prefix)
app.include_router(tracking.router, prefix=settings.api_v1_prefix)
app.include_router(integrations.router, prefix=settings.api_v1_prefix)
app.include_router(admin_auth.router, prefix=settings.api_v1_prefix)
app.include_router(admin_campaigns.router, prefix=settings.api_v1_prefix)
app.include_router(admin_leads.router, prefix=settings.api_v1_prefix)
app.include_router(admin_companies.router, prefix=settings.api_v1_prefix)
app.include_router(admin_dashboard.router, prefix=settings.api_v1_prefix)
app.include_router(admin_users.router, prefix=settings.api_v1_prefix)
app.include_router(client_portal.router, prefix=settings.api_v1_prefix)
app.include_router(staff_auth.router, prefix=settings.api_v1_prefix)
app.include_router(staff_leads.router, prefix=settings.api_v1_prefix)
app.include_router(staff_quotations.router, prefix=settings.api_v1_prefix)
