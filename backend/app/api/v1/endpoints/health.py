# backend/app/api/v1/endpoints/health.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.db.session import get_db

router = APIRouter()


@router.get("/live")
async def liveness_check():
    return {"status": "alive"}


@router.get("/ready")
async def readiness_check(db: AsyncSession = Depends(get_db)):
    try:
        await db.execute(text("SELECT 1"))
        return {"status": "ready", "database": "connected"}
    except Exception as e:
        return {"status": "not ready", "database": "disconnected", "error": str(e)}


@router.get("/version")
async def version_check():
    from app.core.config import settings
    return {
        "version": settings.APP_VERSION,
        "name": settings.APP_NAME,
        "environment": settings.ENVIRONMENT,
    }