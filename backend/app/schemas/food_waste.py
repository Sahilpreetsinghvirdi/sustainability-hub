# backend/app/schemas/food_waste.py
from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel


class FoodWasteLogCreate(BaseModel):
    meal_type: str
    meal_image_url: str
    waste_image_url: str
    plate_analysis: dict = {}
    waste_analysis: dict = {}


class FoodWasteLogResponse(BaseModel):
    id: UUID
    user_id: UUID
    household_id: UUID
    meal_type: str
    meal_image_url: str
    waste_image_url: str
    plate_analysis: dict
    waste_analysis: dict
    avoidable_waste_kg: Decimal
    unavoidable_waste_kg: Decimal
    cost_usd: Decimal
    carbon_kg: Decimal
    logged_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class FoodWasteLogListResponse(BaseModel):
    logs: List[FoodWasteLogResponse]
    total: int
    page: int
    page_size: int


# Alias for endpoint compatibility
FoodWasteLogList = FoodWasteLogListResponse


class FoodWasteStreakResponse(BaseModel):
    current_streak_days: int
    longest_streak_days: int
    last_log_date: Optional[datetime] = None
    total_waste_avoided_kg: Decimal
    total_money_saved_usd: Decimal
    total_carbon_saved_kg: Decimal

    class Config:
        from_attributes = True


class FoodWasteSummary(BaseModel):
    total_logs: int
    total_waste_kg: Decimal
    avoidable_waste_kg: Decimal
    current_streak: int
    longest_streak: int
    money_saved: Decimal
    carbon_saved: Decimal
    daily_average_waste_g: Decimal


class FoodWastePredictionResponse(BaseModel):
    id: UUID
    log_id: UUID
    model_version: str
    plate_detections: dict
    waste_detections: dict
    inference_time_ms: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True
