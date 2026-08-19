# backend/app/api/v1/endpoints/dashboard.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from datetime import date

from app.db.session import get_db
from app.api.deps import get_current_active_user
from app.schemas.dashboard import DashboardSummary
from app.services.dashboard import DashboardService
from app.db.models import User

router = APIRouter()


@router.get("/summary", response_model=DashboardSummary)
async def get_dashboard_summary(
    period: str = Query("month", pattern="^(day|week|month|year)$"),
    start_date: Optional[date] = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    dashboard_service = DashboardService(db)
    return await dashboard_service.get_summary(
        household_id=current_user.household_id,
        period=period,
        start_date=start_date,
    )


@router.get("/trends")
async def get_dashboard_trends(
    period: str = Query("month", pattern="^(day|week|month|year)$"),
    metric: str = Query("carbon", pattern="^(carbon|energy|food_waste|total)$"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    dashboard_service = DashboardService(db)
    return await dashboard_service.get_trends(
        household_id=current_user.household_id,
        period=period,
        metric=metric,
    )


@router.get("/insights")
async def get_dashboard_insights(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    dashboard_service = DashboardService(db)
    return await dashboard_service.get_insights(current_user.household_id)


@router.get("/achievements")
async def get_achievements(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    dashboard_service = DashboardService(db)
    return await dashboard_service.get_achievements(current_user.id)