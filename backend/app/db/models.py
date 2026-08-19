# backend/app/db/models.py
from datetime import datetime, date
from decimal import Decimal
from typing import Optional, List
from uuid import UUID, uuid4

from sqlalchemy import (
    String, Text, DateTime, Date, Numeric, Integer, Boolean, 
    ForeignKey, UniqueConstraint, Index, CheckConstraint, JSON
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSONB

from app.db.base import Base


class User(Base):
    __tablename__ = "users"
    
    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    household_id: Mapped[Optional[UUID]] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("households.id", ondelete="SET NULL"), nullable=True, index=True
    )
    preferences: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    household: Mapped[Optional["Household"]] = relationship(back_populates="members")
    receipt_scans: Mapped[List["ReceiptScan"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    energy_bills: Mapped[List["EnergyBill"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    food_waste_logs: Mapped[List["FoodWasteLog"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    food_waste_streak: Mapped[Optional["FoodWasteStreak"]] = relationship(back_populates="user", uselist=False, cascade="all, delete-orphan")


class Household(Base):
    __tablename__ = "households"
    
    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    location: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    members: Mapped[List["User"]] = relationship(back_populates="household")
    receipt_scans: Mapped[List["ReceiptScan"]] = relationship(back_populates="household")
    energy_bills: Mapped[List["EnergyBill"]] = relationship(back_populates="household")
    appliances: Mapped[List["Appliance"]] = relationship(back_populates="household", cascade="all, delete-orphan")
    energy_audits: Mapped[List["EnergyAudit"]] = relationship(back_populates="household", cascade="all, delete-orphan")
    food_waste_logs: Mapped[List["FoodWasteLog"]] = relationship(back_populates="household")


class HouseholdMember(Base):
    __tablename__ = "household_members"
    __table_args__ = (
        PrimaryKeyConstraint("household_id", "user_id", name="pk_household_members"),
    )
    
    household_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("households.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=False, default="member")
    joined_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    
    # Relationships
    household: Mapped["Household"] = relationship()
    user: Mapped["User"] = relationship()


# ============ CARBON ============

class ReceiptScan(Base):
    __tablename__ = "receipt_scans"
    
    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    household_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("households.id", ondelete="CASCADE"), nullable=False, index=True)
    image_url: Mapped[str] = mapped_column(String(500), nullable=False)
    image_thumbnail_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    ocr_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    total_carbon_kg: Mapped[Decimal] = mapped_column(Numeric(10, 3), nullable=False, default=Decimal("0"))
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="USD")
    total_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, default=Decimal("0"))
    store_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    scanned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, index=True)
    processed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user: Mapped["User"] = relationship(back_populates="receipt_scans")
    household: Mapped["Household"] = relationship(back_populates="receipt_scans")
    items: Mapped[List["ReceiptItem"]] = relationship(back_populates="scan", cascade="all, delete-orphan", order_by="ReceiptItem.position")
    
    __table_args__ = (
        CheckConstraint("status IN ('pending', 'processing', 'completed', 'failed')", name="ck_receipt_scan_status"),
        Index("ix_receipt_scans_user_date", "user_id", "scanned_at"),
        Index("ix_receipt_scans_household_date", "household_id", "scanned_at"),
    )


class ReceiptItem(Base):
    __tablename__ = "receipt_items"
    
    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    scan_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("receipt_scans.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    quantity: Mapped[Decimal] = mapped_column(Numeric(10, 3), nullable=False, default=Decimal("1"))
    unit: Mapped[str] = mapped_column(String(50), nullable=False, default="item")
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, default=Decimal("0"))
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    carbon_kg: Mapped[Decimal] = mapped_column(Numeric(10, 3), nullable=False, default=Decimal("0"))
    carbon_source: Mapped[str] = mapped_column(String(20), nullable=False, default="estimated")
    confidence: Mapped[Decimal] = mapped_column(Numeric(3, 2), nullable=False, default=Decimal("0.5"))
    barcode: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    matched_product_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    
    # Relationships
    scan: Mapped["ReceiptScan"] = relationship(back_populates="items")
    
    __table_args__ = (
        CheckConstraint("carbon_source IN ('openlca', 'ecoinvent', 'openfoodfacts', 'estimated', 'manual')", name="ck_receipt_item_source"),
        Index("ix_receipt_items_scan", "scan_id"),
    )


class CarbonFactor(Base):
    __tablename__ = "carbon_factors"
    
    product_category: Mapped[str] = mapped_column(String(50), primary_key=True)
    kg_co2e_per_unit: Mapped[Decimal] = mapped_column(Numeric(10, 4), nullable=False)
    unit: Mapped[str] = mapped_column(String(20), nullable=False)
    source: Mapped[str] = mapped_column(String(50), nullable=False)
    region: Mapped[str] = mapped_column(String(10), nullable=False, default="US")
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    confidence: Mapped[str] = mapped_column(String(10), nullable=False, default="medium")
    metadata: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (
        CheckConstraint("confidence IN ('high', 'medium', 'low')", name="ck_carbon_factor_confidence"),
    )


class Product(Base):
    __tablename__ = "products"
    
    id: Mapped[str] = mapped_column(String(100), primary_key=True)  # barcode or OFF ID
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    brand: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    category: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    carbon_kg_per_unit: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 4), nullable=True)
    unit: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    source: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    metadata: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)


# ============ ENERGY ============

class EnergyBill(Base):
    __tablename__ = "energy_bills"
    
    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    household_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("households.id", ondelete="CASCADE"), nullable=False, index=True)
    billing_period_start: Mapped[date] = mapped_column(Date, nullable=False)
    billing_period_end: Mapped[date] = mapped_column(Date, nullable=False)
    electricity_kwh: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, default=Decimal("0"))
    gas_therms: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, default=Decimal("0"))
    water_gallons: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, default=Decimal("0"))
    total_cost: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, default=Decimal("0"))
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="USD")
    utility_provider: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    bill_image_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    parsed_data: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user: Mapped["User"] = relationship(back_populates="energy_bills")
    household: Mapped["Household"] = relationship(back_populates="energy_bills")
    
    __table_args__ = (
        UniqueConstraint("household_id", "billing_period_start", "billing_period_end", name="uq_energy_bill_period"),
        Index("ix_energy_bills_household_period", "household_id", "billing_period_start"),
    )


class Appliance(Base):
    __tablename__ = "appliances"
    
    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    household_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("households.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    brand: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    model: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    age_years: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    power_watts: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    usage_hours_per_day: Mapped[Decimal] = mapped_column(Numeric(4, 2), nullable=False, default=Decimal("0"))
    usage_days_per_week: Mapped[int] = mapped_column(Integer, nullable=False, default=7)
    efficiency_rating: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    is_smart: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    household: Mapped["Household"] = relationship(back_populates="appliances")


class EnergyAudit(Base):
    __tablename__ = "energy_audits"
    
    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    household_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("households.id", ondelete="CASCADE"), nullable=False, index=True)
    total_annual_kwh: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=Decimal("0"))
    baseline_kwh: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=Decimal("0"))
    savings_potential_kwh: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=Decimal("0"))
    savings_potential_usd: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, default=Decimal("0"))
    recommendations: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    model_version: Mapped[str] = mapped_column(String(20), nullable=False, default="v1.0")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    
    # Relationships
    household: Mapped["Household"] = relationship(back_populates="energy_audits")
    
    __table_args__ = (
        Index("ix_energy_audits_household", "household_id", "created_at"),
    )


# ============ FOOD WASTE ============

class FoodWasteLog(Base):
    __tablename__ = "food_waste_logs"
    
    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    household_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("households.id", ondelete="CASCADE"), nullable=False, index=True)
    meal_type: Mapped[str] = mapped_column(String(20), nullable=False)
    meal_image_url: Mapped[str] = mapped_column(String(500), nullable=False)
    waste_image_url: Mapped[str] = mapped_column(String(500), nullable=False)
    plate_analysis: Mapped[dict] = mapped_column(JSONB, nullable=False)
    waste_analysis: Mapped[dict] = mapped_column(JSONB, nullable=False)
    avoidable_waste_kg: Mapped[Decimal] = mapped_column(Numeric(8, 3), nullable=False, default=Decimal("0"))
    unavoidable_waste_kg: Mapped[Decimal] = mapped_column(Numeric(8, 3), nullable=False, default=Decimal("0"))
    cost_usd: Mapped[Decimal] = mapped_column(Numeric(8, 2), nullable=False, default=Decimal("0"))
    carbon_kg: Mapped[Decimal] = mapped_column(Numeric(8, 3), nullable=False, default=Decimal("0"))
    logged_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    
    # Relationships
    user: Mapped["User"] = relationship(back_populates="food_waste_logs")
    household: Mapped["Household"] = relationship(back_populates="food_waste_logs")
    predictions: Mapped[List["FoodWastePrediction"]] = relationship(back_populates="log", cascade="all, delete-orphan")
    
    __table_args__ = (
        CheckConstraint("meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')", name="ck_food_waste_meal_type"),
        Index("ix_food_waste_user_date", "user_id", "logged_at"),
        Index("ix_food_waste_household_date", "household_id", "logged_at"),
    )


class FoodWasteStreak(Base):
    __tablename__ = "food_waste_streaks"
    
    user_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    current_streak_days: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    longest_streak_days: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    last_log_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    total_waste_avoided_kg: Mapped[Decimal] = mapped_column(Numeric(10, 3), nullable=False, default=Decimal("0"))
    total_money_saved_usd: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, default=Decimal("0"))
    total_carbon_saved_kg: Mapped[Decimal] = mapped_column(Numeric(10, 3), nullable=False, default=Decimal("0"))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user: Mapped["User"] = relationship(back_populates="food_waste_streak")


class FoodWastePrediction(Base):
    __tablename__ = "food_waste_predictions"
    
    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    log_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("food_waste_logs.id", ondelete="CASCADE"), nullable=False, index=True)
    model_version: Mapped[str] = mapped_column(String(20), nullable=False)
    plate_detections: Mapped[dict] = mapped_column(JSONB, nullable=False)
    waste_detections: Mapped[dict] = mapped_column(JSONB, nullable=False)
    inference_time_ms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    
    # Relationships
    log: Mapped["FoodWasteLog"] = relationship(back_populates="predictions")


# ============ SYNC LOG ============

class SyncLog(Base):
    __tablename__ = "sync_log"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[Optional[UUID]] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    device_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    endpoint: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    records_synced: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    duration_ms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    
    __table_args__ = (
        CheckConstraint("status IN ('success', 'partial', 'failed')", name="ck_sync_log_status"),
        Index("ix_sync_log_user_date", "user_id", "created_at"),
    )