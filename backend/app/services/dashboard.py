# backend/app/services/dashboard.py
from datetime import datetime, timedelta
from decimal import Decimal
from typing import List

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import (
    ReceiptScan,
    EnergyBill,
    FoodWasteLog,
    FoodWasteStreak,
    EnergyAudit,
    User,
)
from app.schemas.dashboard import (
    CarbonSummary,
    EnergySummary,
    FoodWasteSummary,
    DashboardResponse,
)


class DashboardService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_dashboard(self, user: User) -> DashboardResponse:
        carbon = await self._carbon_summary(user)
        energy = await self._energy_summary(user)
        food_waste = await self._food_waste_summary(user)

        return DashboardResponse(
            carbon=carbon,
            energy=energy,
            food_waste=food_waste,
            goals=[],
            recent_activity=[],
            updated_at=datetime.utcnow(),
        )

    async def _carbon_summary(self, user: User) -> CarbonSummary:
        since = datetime.utcnow() - timedelta(days=30)
        total = await self.db.execute(
            select(func.sum(ReceiptScan.total_carbon_kg)).where(
                ReceiptScan.user_id == user.id
            )
        )
        this_month = await self.db.execute(
            select(func.sum(ReceiptScan.total_carbon_kg)).where(
                ReceiptScan.user_id == user.id,
                ReceiptScan.scanned_at >= since,
            )
        )
        total_kg = total.scalar() or Decimal("0")
        month_kg = this_month.scalar() or Decimal("0")

        # Get top categories
        top_cats = await self.db.execute(
            select(
                ReceiptItem.category,
                func.sum(ReceiptItem.carbon_kg).label("total"),
            )
            .join(ReceiptScan)
            .where(ReceiptScan.user_id == user.id)
            .group_by(ReceiptItem.category)
            .order_by(func.sum(ReceiptItem.carbon_kg).desc())
            .limit(5)
        )

        return CarbonSummary(
            total_kg=total_kg,
            this_month_kg=month_kg,
            daily_average_kg=month_kg / Decimal("30"),
            trend="down",
            trend_percentage=Decimal("5.2"),
            top_categories=[{"category": r[0], "total": float(r[1])} for r in top_cats],
        )

    async def _energy_summary(self, user: User) -> EnergySummary:
        bills_result = await self.db.execute(
            select(EnergyBill)
            .where(EnergyBill.user_id == user.id)
            .order_by(EnergyBill.billing_period_start.desc())
            .limit(12)
        )
        bills = bills_result.scalars().all()

        total_kwh = sum(b.electricity_kwh for b in bills)
        latest_kwh = bills[0].electricity_kwh if bills else Decimal("0")
        monthly_cost = bills[0].total_cost if bills else Decimal("0")

        audit_result = await self.db.execute(
            select(EnergyAudit)
            .where(EnergyAudit.household_id == user.household_id)
            .order_by(EnergyAudit.created_at.desc())
            .limit(1)
        )
        audit = audit_result.scalar_one_or_none()
        recommendations_count = 0
        if audit and audit.recommendations:
            recommendations_count = len(audit.recommendations.get("actions", []))

        return EnergySummary(
            total_kwh=total_kwh,
            this_month_kwh=latest_kwh,
            monthly_cost=monthly_cost,
            cost_trend="stable",
            cost_trend_percentage=Decimal("0"),
            efficiency_score=65,
            recommendations_count=recommendations_count,
        )

    async def _food_waste_summary(self, user: User) -> FoodWasteSummary:
        streak_result = await self.db.execute(
            select(FoodWasteStreak).where(FoodWasteStreak.user_id == user.id)
        )
        streak = streak_result.scalar_one_or_none()

        since = datetime.utcnow() - timedelta(days=30)
        logs_result = await self.db.execute(
            select(
                func.count(FoodWasteLog.id),
                func.sum(FoodWasteLog.avoidable_waste_kg),
                func.sum(FoodWasteLog.cost_usd),
            ).where(
                FoodWasteLog.user_id == user.id,
                FoodWasteLog.logged_at >= since,
            )
        )
        row = logs_result.one()

        return FoodWasteSummary(
            total_logs=row[0] or 0,
            total_waste_kg=row[1] or Decimal("0"),
            avoidable_waste_kg=row[1] or Decimal("0"),
            current_streak=streak.current_streak_days if streak else 0,
            longest_streak=streak.longest_streak_days if streak else 0,
            money_saved=streak.total_money_saved_usd if streak else Decimal("0"),
            carbon_saved=streak.total_carbon_saved_kg if streak else Decimal("0"),
            daily_average_waste_g=Decimal("0"),
        )
