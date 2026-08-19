# backend/app/schemas/energy.py
from datetime import date, datetime
from decimal import Decimal
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel


class ApplianceCreate(BaseModel):
    name: str
    category: str
    brand: Optional[str] = None
    model_number: Optional[str] = None
    wattage: int
    age_years: int = 0
    usage_hours_per_day: Decimal = Decimal("8")
    usage_days_per_week: int = 7
    efficiency_rating: Optional[str] = None
    location: Optional[str] = None
    is_smart: bool = False
    notes: Optional[str] = None


class ApplianceUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    model_number: Optional[str] = None
    wattage: Optional[int] = None
    age_years: Optional[int] = None
    usage_hours_per_day: Optional[Decimal] = None
    usage_days_per_week: Optional[int] = None
    efficiency_rating: Optional[str] = None
    location: Optional[str] = None
    is_smart: Optional[bool] = None
    notes: Optional[str] = None


class ApplianceResponse(BaseModel):
    id: UUID
    household_id: UUID
    name: str
    category: str
    brand: Optional[str] = None
    model_number: Optional[str] = None
    wattage: int
    age_years: int
    usage_hours_per_day: Decimal
    usage_days_per_week: int
    efficiency_rating: Optional[str] = None
    estimated_annual_cost: Optional[Decimal] = None
    created_at: datetime

    class Config:
        from_attributes = True


class EnergyBillCreate(BaseModel):
    billing_period_start: date
    billing_period_end: date
    electricity_kwh: Decimal = Decimal("0")
    gas_therms: Decimal = Decimal("0")
    water_gallons: Decimal = Decimal("0")
    total_cost: Decimal = Decimal("0")
    currency: str = "USD"
    utility_provider: Optional[str] = None


class EnergyBillResponse(BaseModel):
    id: UUID
    user_id: UUID
    household_id: UUID
    billing_period_start: date
    billing_period_end: date
    electricity_kwh: Decimal
    gas_therms: Decimal
    water_gallons: Decimal
    total_cost: Decimal
    currency: str
    utility_provider: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class EnergyAuditResponse(BaseModel):
    id: UUID
    household_id: UUID
    total_annual_kwh: Decimal
    baseline_kwh: Decimal
    savings_potential_kwh: Decimal
    savings_potential_usd: Decimal
    recommendations: dict
    model_version: str
    created_at: datetime

    class Config:
        from_attributes = True


class EnergyBillList(BaseModel):
    bills: List[EnergyBillResponse]
    total: int
    page: int
    per_page: int


class EnergyRecommendationResponse(BaseModel):
    title: str
    description: str
    priority: str
    estimated_savings_usd_year: float
    difficulty: str
