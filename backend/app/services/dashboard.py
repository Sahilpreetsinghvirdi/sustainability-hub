# backend/app/services/dashboard.py
from datetime import datetime, timedelta, date
from decimal import Decimal
from typing import List, Optional

from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import (
    ReceiptScan,
    EnergyBill,
    FoodWasteLog,
    FoodWasteStreak,
    EnergyAudit,
    User,
)
from app.schemas.dashboard import DashboardSummary


class DashboardService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_summary(
        self,
        household_id: UUID,
        period: str = "month",
        start_date: Optional[date] = None,
    ) -> DashboardSummary:
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

        # Carbon summary
        carbon_result = await self.db.execute(
            select(
                func.sum(ReceiptScan.total_carbon_kg),
                func.sum(ReceiptScan.total_carbon_kg).filter(ReceiptScan.scanned_at >= start_date),
            ).where(
                ReceiptScan.household_id == household_id,
                ReceiptScan.status == "completed",
            )
        )
        carbon_row = carbon_result.one()
        total_carbon = carbon_row[0] or Decimal("0")
        period_carbon = carbon_row[1] or Decimal("0")

        # Top carbon categories
        top_cats = await self.db.execute(
            select(
                ReceiptItem.category,
                func.sum(ReceiptItem.carbon_kg).label("total"),
            )
            .join(ReceiptScan)
            .where(
                ReceiptScan.household_id == household_id,
                ReceiptScan.status == "completed",
            )
            .group_by(ReceiptItem.category)
            .order_by(func.sum(ReceiptItem.carbon_kg).desc())
            .limit(5)
        )

        # Energy summary
        bills_result = await self.db.execute(
            select(EnergyBill)
            .where(EnergyBill.household_id == household_id)
            .order_by(desc(EnergyBill.billing_period_start))
            .limit(12)
        )
        bills = bills_result.scalars().all()
        total_energy = sum(b.electricity_kwh for b in bills)
        latest_energy = bills[0].electricity_kwh if bills else Decimal("0")
        monthly_cost = bills[0].total_cost if bills else Decimal("0")

        # Food waste summary
        waste_result = await self.db.execute(
            select(
                func.count(FoodWasteLog.id),
                func.sum(FoodWasteLog.avoidable_waste_kg),
                func.sum(FoodWasteLog.cost_usd),
            ).where(
                FoodWasteLog.household_id == household_id,
                FoodWasteLog.logged_at >= start_date,
            )
        )
        waste_row = waste_result.one()
        total_waste_logs = waste_row[0] or 0
        total_waste = waste_row[1] or Decimal("0")
        waste_cost = waste_row[2] or Decimal("0")

        # Streak
        streak_result = await self.db.execute(
            select(FoodWasteStreak).where(FoodWasteStreak.user_id == household_id)
        )
        streak = streak_result.scalar_one_or_none()

        # Goals (mock for now)
        goals = [
            {"goal_id": "carbon", "name": "Monthly Carbon Budget", "target": 200, "current": float(period_carbon), "unit": "kg CO₂e", "percentage": float(min(100, period_carbon / Decimal("200") * 100)), "on_track": period_carbon < Decimal("200")},
            {"goal_id": "energy", "name": "Monthly Energy Target", "target": 400, "current": float(latest_energy), "unit": "kWh", "percentage": float(min(100, latest_energy / Decimal("400") * 100)), "on_track": latest_energy < Decimal("400")},
            {"goal_id": "waste", "name": "Monthly Waste Target", "target": 3.5, "current": float(total_waste), "unit": "kg", "percentage": float(min(100, total_waste / Decimal("3.5") * 100)), "on_track": total_waste < Decimal("3.5")},
        ]

        return DashboardSummary(
            carbon={
                "total_kg": total_carbon,
                "period_kg": period_carbon,
                "daily_average_kg": period_carbon / Decimal(str(days)),
                "trend": "down" if period_carbon < total_carbon / Decimal("2") else "stable",
                "trend_percentage": Decimal("5.2"),
                "top_categories": [{"category": r[0], "total": float(r[1])} for r in top_cats],
            },
            energy={
                "total_kwh": total_energy,
                "period_kwh": latest_energy,
                "monthly_cost": monthly_cost,
                "cost_trend": "stable",
                "cost_trend_percentage": Decimal("0"),
                "efficiency_score": 65,
                "recommendations_count": 3,
            },
            food_waste={
                "total_logs": total_waste_logs,
                "total_waste_kg": total_waste,
                "avoidable_waste_kg": total_waste,
                "current_streak": streak.current_streak_days if streak else 0,
                "longest_streak": streak.longest_streak_days if streak else 0,
                "money_saved": streak.total_money_saved_usd if streak else Decimal("0"),
                "carbon_saved": streak.total_carbon_saved_kg if streak else Decimal("0"),
                "daily_average_waste_g": Decimal(str(float(total_waste) * 1000 / days)) if days > 0 else Decimal("0"),
            },
            goals=goals,
            recent_activity=[],
            updated_at=datetime.utcnow(),
        )

    async def get_trends(
        self,
        household_id: UUID,
        period: str = "month",
        metric: str = "carbon",
    ) -> dict:
        days = {"day": 1, "week": 7, "month": 30, "year": 365}.get(period, 30)
        start_date = date.today() - timedelta(days=days)

        if metric == "carbon":
            result = await self.db.execute(
                select(
                    func.date(ReceiptScan.scanned_at).label("date"),
                    func.sum(ReceiptScan.total_carbon_kg).label("value"),
                )
                .where(
                    ReceiptScan.household_id == household_id,
                    ReceiptScan.status == "completed",
                    ReceiptScan.scanned_at >= start_date,
                )
                .group_by(func.date(ReceiptScan.scanned_at))
                .order_by(func.date(ReceiptScan.scanned_at))
            )
        elif metric == "energy":
            result = await self.db.execute(
                select(
                    func.date(EnergyBill.billing_period_start).label("date"),
                    EnergyBill.electricity_kwh.label("value"),
                )
                .where(
                    EnergyBill.household_id == household_id,
                    EnergyBill.billing_period_start >= start_date,
                )
                .order_by(func.date(EnergyBill.billing_period_start))
            )
        elif metric == "food_waste":
            result = await self.db.execute(
                select(
                    func.date(FoodWasteLog.logged_at).label("date"),
                    func.sum(FoodWasteLog.avoidable_waste_kg).label("value"),
                )
                .where(
                    FoodWasteLog.household_id == household_id,
                    FoodWasteLog.logged_at >= start_date,
                )
                .group_by(func.date(FoodWasteLog.logged_at))
                .order_by(func.date(FoodWasteLog.logged_at))
            )
        else:
            return {"data": []}

        data = [{"date": str(r[0]), "value": float(r[1])} for r in result]
        return {"data": data}

    async def get_insights(self, household_id: UUID) -> dict:
        insights = [
            {"type": "info", "title": "Carbon Insight", "message": "Your carbon footprint is 12% lower than last month"},
            {"type": "warning", "title": "Energy Alert", "message": "Heating costs up 23% - consider thermostat adjustment"},
            {"type": "success", "title": "Waste Win", "message": "5 zero-waste meals this week! Keep it up"},
        ]
        return {"insights": insights}

    async def get_achievements(self, user_id: UUID) -> dict:
        achievements = [
            {"id": "first_scan", "title": "First Scan", "description": "Scanned your first receipt", "unlocked": True, "icon": "receipt"},
            {"id": "carbon_hero", "title": "Carbon Hero", "description": "Saved 500 kg CO₂e", "unlocked": False, "icon": "leaf"},
            {"id": "energy_saver", "title": "Energy Saver", "description": "Reduced energy by 20%", "unlocked": False, "icon": "flash"},
            {"id": "waste_free_week", "title": "Waste-Free Week", "description": "7 days of zero food waste", "unlocked": False, "icon": "star"},
        ]
        return {"achievements": achievements}

# Need to import ReceiptItem for the query
from app.db.models import ReceiptItem