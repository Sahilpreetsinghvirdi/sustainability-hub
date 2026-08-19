# backend/app/services/food_waste.py
from datetime import datetime, date, timedelta
from decimal import Decimal
from typing import Optional, List
from uuid import UUID

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import FoodWasteLog, FoodWasteStreak, User
from app.schemas.food_waste import (
    FoodWasteLogCreate,
    FoodWasteLogResponse,
    FoodWasteLogListResponse,
    FoodWasteStreakResponse,
)


class FoodWasteService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_log(self, user: User, data: FoodWasteLogCreate) -> FoodWasteLogResponse:
        # Analyze images (simplified - in production this would call ML models)
        analysis = self._analyze_waste(data.plate_analysis, data.waste_analysis)

        log = FoodWasteLog(
            user_id=user.id,
            household_id=user.household_id,
            meal_type=data.meal_type,
            meal_image_url=data.meal_image_url,
            waste_image_url=data.waste_image_url,
            plate_analysis=data.plate_analysis,
            waste_analysis=data.waste_analysis,
            avoidable_waste_kg=analysis["avoidable_kg"],
            unavoidable_waste_kg=analysis["unavoidable_kg"],
            cost_usd=analysis["cost_usd"],
            carbon_kg=analysis["carbon_kg"],
            logged_at=datetime.utcnow(),
        )
        self.db.add(log)
        await self.db.flush()

        # Update streak
        await self._update_streak(user, analysis)

        return FoodWasteLogResponse.model_validate(log)

    async def get_log(self, user: User, log_id: UUID) -> Optional[FoodWasteLogResponse]:
        result = await self.db.execute(
            select(FoodWasteLog).where(
                FoodWasteLog.id == log_id,
                FoodWasteLog.user_id == user.id,
            )
        )
        log = result.scalar_one_or_none()
        return FoodWasteLogResponse.model_validate(log) if log else None

    async def list_logs(
        self, user: User, page: int = 1, page_size: int = 20, meal_type: Optional[str] = None
    ) -> FoodWasteLogListResponse:
        query = select(FoodWasteLog).where(FoodWasteLog.user_id == user.id)

        if meal_type:
            query = query.where(FoodWasteLog.meal_type == meal_type)

        count_query = select(func.count()).select_from(query.subquery())
        total = (await self.db.execute(count_query)).scalar() or 0

        query = query.order_by(FoodWasteLog.logged_at.desc())
        query = query.offset((page - 1) * page_size).limit(page_size)

        result = await self.db.execute(query)
        logs = result.scalars().all()

        return FoodWasteLogListResponse(
            logs=[FoodWasteLogResponse.model_validate(l) for l in logs],
            total=total,
            page=page,
            page_size=page_size,
        )

    async def delete_log(self, user: User, log_id: UUID) -> bool:
        result = await self.db.execute(
            select(FoodWasteLog).where(
                FoodWasteLog.id == log_id, FoodWasteLog.user_id == user.id
            )
        )
        log = result.scalar_one_or_none()
        if not log:
            return False
        await self.db.delete(log)
        return True

    async def get_streak(self, user: User) -> FoodWasteStreakResponse:
        result = await self.db.execute(
            select(FoodWasteStreak).where(FoodWasteStreak.user_id == user.id)
        )
        streak = result.scalar_one_or_none()

        if not streak:
            streak = FoodWasteStreak(user_id=user.id)
            self.db.add(streak)
            await self.db.flush()

        return FoodWasteStreakResponse.model_validate(streak)

    async def get_summary(self, user: User, days: int = 30) -> dict:
        since = datetime.utcnow() - timedelta(days=days)

        result = await self.db.execute(
            select(
                func.count(FoodWasteLog.id),
                func.sum(FoodWasteLog.avoidable_waste_kg),
                func.sum(FoodWasteLog.cost_usd),
                func.sum(FoodWasteLog.carbon_kg),
            ).where(
                FoodWasteLog.user_id == user.id,
                FoodWasteLog.logged_at >= since,
            )
        )
        row = result.one()

        return {
            "total_logs": row[0] or 0,
            "total_waste_kg": float(row[1] or 0),
            "total_cost_usd": float(row[2] or 0),
            "total_carbon_kg": float(row[3] or 0),
            "period_days": days,
        }

    async def _update_streak(self, user: User, analysis: dict) -> None:
        result = await self.db.execute(
            select(FoodWasteStreak).where(FoodWasteStreak.user_id == user.id)
        )
        streak = result.scalar_one_or_none()

        if not streak:
            streak = FoodWasteStreak(user_id=user.id)
            self.db.add(streak)

        today = date.today()
        if streak.last_log_date:
            if streak.last_log_date == today:
                return
            elif streak.last_log_date == today - timedelta(days=1):
                streak.current_streak_days += 1
            else:
                streak.current_streak_days = 1
        else:
            streak.current_streak_days = 1

        streak.last_log_date = today
        streak.longest_streak_days = max(streak.longest_streak_days, streak.current_streak_days)

        if analysis.get("avoidable_kg", 0) == 0:
            streak.total_waste_avoided_kg += Decimal("0.5")
            streak.total_money_saved_usd += Decimal("1.5")
            streak.total_carbon_saved_kg += Decimal("0.8")

        await self.db.flush()

    def _analyze_waste(self, plate_analysis: dict, waste_analysis: dict) -> dict:
        # Simplified analysis - in production, ML models would run here
        waste_items = waste_analysis.get("items", [])
        total_waste = sum(item.get("weight_grams", 0) for item in waste_items)
        avoidable = sum(
            item.get("weight_grams", 0)
            for item in waste_items
            if item.get("type") != "unavoidable"
        )
        return {
            "avoidable_kg": Decimal(str(avoidable / 1000)),
            "unavoidable_kg": Decimal(str((total_waste - avoidable) / 1000)),
            "cost_usd": Decimal(str(total_waste * 0.01)),
            "carbon_kg": Decimal(str(total_waste * 0.004)),
        }
