# backend/app/schemas/dashboard.py
from datetime import datetime, date
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel


class CarbonSummary(BaseModel):
    total_kg: Decimal
    this_month_kg: Decimal
    daily_average_kg: Decimal
    trend: str  # "up", "down", "stable"
    trend_percentage: Decimal
    top_categories: List[dict]


class EnergySummary(BaseModel):
    total_kwh: Decimal
    this_month_kwh: Decimal
    monthly_cost: Decimal
    cost_trend: str
    cost_trend_percentage: Decimal
    efficiency_score: int
    recommendations_count: int


class FoodWasteSummary(BaseModel):
    total_logs: int
    total_waste_kg: Decimal
    avoidable_waste_kg: Decimal
    current_streak: int
    longest_streak: int
    money_saved: Decimal
    carbon_saved: Decimal
    daily_average_waste_g: Decimal


class GoalProgress(BaseModel):
    goal_id: str
    name: str
    target: Decimal
    current: Decimal
    unit: str
    percentage: Decimal
    on_track: bool


class DashboardResponse(BaseModel):
    carbon: CarbonSummary
    energy: EnergySummary
    food_waste: FoodWasteSummary
    goals: List[GoalProgress]
    recent_activity: List[dict]
    updated_at: datetime


# Alias for endpoint compatibility
DashboardSummary = DashboardResponse
