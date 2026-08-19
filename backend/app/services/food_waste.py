# backend/app/services/food_waste.py
from datetime import datetime, date, timedelta
from decimal import Decimal
from typing import Optional, List
from uuid import UUID

from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import FoodWasteLog, FoodWasteStreak, User
from app.schemas.food_waste import (
    FoodWasteLogCreate,
    FoodWasteLogResponse,
    FoodWasteStreakResponse,
    FoodWasteSummary,
)


class FoodWasteService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def process_waste_log(
        self,
        meal_image,
        waste_image,
        meal_type: str,
        user_id: UUID,
        household_id: UUID,
    ) -> FoodWasteLog:
        # Create a pending log - in production this would queue ML analysis
        log = FoodWasteLog(
            user_id=user_id,
            household_id=household_id,
            meal_type=meal_type,
            meal_image_url="pending",
            waste_image_url="pending",
            plate_analysis={},
            waste_analysis={},
            avoidable_waste_kg=Decimal("0"),
            unavoidable_waste_kg=Decimal("0"),
            cost_usd=Decimal("0"),
            carbon_kg=Decimal("0"),
        )
        self.db.add(log)
        await self.db.flush()
        return log

    async def create_manual_log(
        self,
        log_data: FoodWasteLogCreate,
        user_id: UUID,
        household_id: UUID,
    ) -> FoodWasteLog:
        analysis = self._analyze_waste(log_data.plate_analysis, log_data.waste_analysis)

        log = FoodWasteLog(
            user_id=user_id,
            household_id=household_id,
            meal_type=log_data.meal_type,
            meal_image_url=log_data.meal_image_url,
            waste_image_url=log_data.waste_image_url,
            plate_analysis=log_data.plate_analysis,
            waste_analysis=log_data.waste_analysis,
            avoidable_waste_kg=analysis["avoidable_kg"],
            unavoidable_waste_kg=analysis["unavoidable_kg"],
            cost_usd=analysis["cost_usd"],
            carbon_kg=analysis["carbon_kg"],
        )
        self.db.add(log)
        await self.db.flush()

        # Update streak
        await self._update_streak(user_id, analysis)

        return log

    async def get_user_logs(
        self,
        user_id: UUID,
        household_id: UUID,
        page: int = 1,
        per_page: int = 20,
        meal_type: Optional[str] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> dict:
        query = select(FoodWasteLog).where(
            FoodWasteLog.user_id == user_id,
            FoodWasteLog.household_id == household_id,
        )

        if meal_type:
            query = query.where(FoodWasteLog.meal_type == meal_type)
        if start_date:
            query = query.where(FoodWasteLog.logged_at >= start_date)
        if end_date:
            query = query.where(FoodWasteLog.logged_at <= end_date)

        count_query = select(func.count()).select_from(query.subquery())
        total = (await self.db.execute(count_query)).scalar() or 0

        query = query.order_by(desc(FoodWasteLog.logged_at))
        query = query.offset((page - 1) * per_page).limit(per_page)

        result = await self.db.execute(query)
        logs = result.scalars().all()

        return {
            "logs": logs,
            "total": total,
            "page": page,
            "per_page": per_page,
        }

    async def get_log_by_id(self, log_id: UUID, household_id: UUID) -> Optional[FoodWasteLog]:
        result = await self.db.execute(
            select(FoodWasteLog).where(
                FoodWasteLog.id == log_id,
                FoodWasteLog.household_id == household_id,
            )
        )
        return result.scalar_one_or_none()

    async def get_streak(self, user_id: UUID) -> FoodWasteStreak:
        result = await self.db.execute(
            select(FoodWasteStreak).where(FoodWasteStreak.user_id == user_id)
        )
        streak = result.scalar_one_or_none()

        if not streak:
            streak = FoodWasteStreak(user_id=user_id)
            self.db.add(streak)
            await self.db.flush()

        return streak

    async def get_summary(
        self,
        household_id: UUID,
        period: str = "month",
        start_date: Optional[date] = None,
    ) -> FoodWasteSummary:
        if period == "day":
            days = 1
        elif period == "week":
            days = 7
        elif period == "month":
            days = 30
        elif period == "year":
            days = 365
        else:
            days = 30

        if not start_date:
            start_date = date.today() - timedelta(days=days)

        # Total logs
        total_result = await self.db.execute(
            select(func.count(FoodWasteLog.id)).where(
                FoodWasteLog.household_id == household_id,
                FoodWasteLog.logged_at >= start_date,
            )
        )
        total_logs = total_result.scalar() or 0

        # Total waste
        waste_result = await self.db.execute(
            select(
                func.sum(FoodWasteLog.avoidable_waste_kg),
                func.sum(FoodWasteLog.cost_usd),
                func.sum(FoodWasteLog.carbon_kg),
            ).where(
                FoodWasteLog.household_id == household_id,
                FoodWasteLog.logged_at >= start_date,
            )
        )
        row = waste_result.one()
        avoidable_waste = row[0] or Decimal("0")
        total_cost = row[1] or Decimal("0")
        total_carbon = row[2] or Decimal("0")

        # Streak
        streak_result = await self.db.execute(
            select(FoodWasteStreak).where(FoodWasteStreak.user_id == household_id)
        )
        streak = streak_result.scalar_one_or_none()

        return FoodWasteSummary(
            total_logs=total_logs,
            total_waste_kg=avoidable_waste,
            avoidable_waste_kg=avoidable_waste,
            current_streak=streak.current_streak_days if streak else 0,
            longest_streak=streak.longest_streak_days if streak else 0,
            money_saved=streak.total_money_saved_usd if streak else Decimal("0"),
            carbon_saved=streak.total_carbon_saved_kg if streak else Decimal("0"),
            daily_average_waste_g=Decimal(str(float(avoidable_waste) * 1000 / days)) if days > 0 else Decimal("0"),
        )

    async def _update_streak(self, user_id: UUID, analysis: dict) -> None:
        result = await self.db.execute(
            select(FoodWasteStreak).where(FoodWasteStreak.user_id == user_id)
        )
        streak = result.scalar_one_or_none()

        if not streak:
            streak = FoodWasteStreak(user_id=user_id)
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