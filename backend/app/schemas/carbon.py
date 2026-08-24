# backend/app/schemas/carbon.py
from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel


class ReceiptItemCreate(BaseModel):
    name: str
    quantity: Decimal = Decimal("1")
    unit: str = "item"
    price: Decimal = Decimal("0")
    category: str


class ReceiptItemResponse(BaseModel):
    id: UUID
    name: str
    quantity: Decimal
    unit: str
    price: Decimal
    category: str
    carbon_kg: Decimal
    carbon_source: str
    confidence: Decimal
    position: int

    class Config:
        from_attributes = True


class ReceiptScanCreate(BaseModel):
    store_name: Optional[str] = None
    total_amount: Optional[Decimal] = None
    currency: str = "USD"
    items: List[ReceiptItemCreate] = []


class ReceiptScanResponse(BaseModel):
    id: UUID
    user_id: UUID
    household_id: UUID
    image_url: str
    ocr_text: Optional[str] = None
    total_carbon_kg: Decimal
    currency: str
    total_amount: Decimal
    store_name: Optional[str] = None
    scanned_at: datetime
    status: str
    items: List[ReceiptItemResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True


class ReceiptScanListResponse(BaseModel):
    scans: List[ReceiptScanResponse]
    total: int
    page: int
    page_size: int


# Alias for endpoint compatibility
ReceiptScanList = ReceiptScanListResponse


class CarbonFactorsResponse(BaseModel):
    category: str
    kg_co2e_per_unit: Decimal
    unit: str
    source: str
    confidence: str


# Alias for endpoint compatibility
CarbonFactorResponse = CarbonFactorsResponse


class CarbonTopCategory(BaseModel):
    category: str
    total: float


class CarbonSummary(BaseModel):
    total_kg: Decimal
    period_kg: Decimal
    daily_average_kg: Decimal
    trend: str = "stable"
    trend_percentage: Decimal = Decimal("0")
    top_categories: List[CarbonTopCategory] = []
