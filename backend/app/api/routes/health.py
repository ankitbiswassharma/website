from fastapi import APIRouter

from app.core.config import settings
from app.core.security import utcnow


router = APIRouter(tags=["health"])


@router.get("/health")
def health():
    return {
        "status": "ok",
        "app": f"{settings.company_name} SaaS Platform API",
        "environment": settings.app_env,
        "timestamp": utcnow().isoformat(),
    }
