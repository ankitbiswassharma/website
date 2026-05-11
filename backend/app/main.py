from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import admin_auth, admin_companies, admin_dashboard, admin_leads, health, lead_management, public
from app.core.config import settings
from app.db.session import init_db


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(
    title=f"{settings.company_name} SaaS Platform API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix=settings.api_v1_prefix)
app.include_router(lead_management.router, prefix=settings.api_v1_prefix)
app.include_router(public.router, prefix=settings.api_v1_prefix)
app.include_router(admin_auth.router, prefix=settings.api_v1_prefix)
app.include_router(admin_leads.router, prefix=settings.api_v1_prefix)
app.include_router(admin_companies.router, prefix=settings.api_v1_prefix)
app.include_router(admin_dashboard.router, prefix=settings.api_v1_prefix)
