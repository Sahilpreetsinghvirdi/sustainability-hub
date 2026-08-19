# backend/app/services/energy.py
from datetime import datetime, date
from decimal import Decimal
from typing import Optional, List
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import EnergyBill, Appliance, EnergyAudit, User
from app.schemas.energy import (
    EnergyBillCreate,
    EnergyBillResponse,
    ApplianceCreate,
    ApplianceUpdate,
    ApplianceResponse,
    EnergyAuditResponse,
)


class EnergyService:
    def __init__(self, db: AsyncSession):
        self.db = db

    # ── Bills ────────────────────────────────────────────────────────────────

    async def create_bill(self, user: User, data: EnergyBillCreate) -> EnergyBillResponse:
        bill = EnergyBill(
            user_id=user.id,
            household_id=user.household_id,
            billing_period_start=data.billing_period_start,
            billing_period_end=data.billing_period_end,
            electricity_kwh=data.electricity_kwh,
            gas_therms=data.gas_therms,
            water_gallons=data.water_gallons,
            total_cost=data.total_cost,
            currency=data.currency,
            utility_provider=data.utility_provider,
        )
        self.db.add(bill)
        await self.db.flush()
        return EnergyBillResponse.model_validate(bill)

    async def list_bills(self, user: User, limit: int = 12) -> List[EnergyBillResponse]:
        result = await self.db.execute(
            select(EnergyBill)
            .where(EnergyBill.user_id == user.id)
            .order_by(EnergyBill.billing_period_start.desc())
            .limit(limit)
        )
        return [EnergyBillResponse.model_validate(b) for b in result.scalars().all()]

    async def get_latest_bill(self, user: User) -> Optional[EnergyBillResponse]:
        result = await self.db.execute(
            select(EnergyBill)
            .where(EnergyBill.user_id == user.id)
            .order_by(EnergyBill.billing_period_start.desc())
            .limit(1)
        )
        bill = result.scalar_one_or_none()
        return EnergyBillResponse.model_validate(bill) if bill else None

    async def delete_bill(self, user: User, bill_id: UUID) -> bool:
        result = await self.db.execute(
            select(EnergyBill).where(
                EnergyBill.id == bill_id, EnergyBill.user_id == user.id
            )
        )
        bill = result.scalar_one_or_none()
        if not bill:
            return False
        await self.db.delete(bill)
        return True

    # ── Appliances ───────────────────────────────────────────────────────────

    async def create_appliance(self, user: User, data: ApplianceCreate) -> ApplianceResponse:
        appliance = Appliance(
            household_id=user.household_id,
            name=data.name,
            category=data.category,
            brand=data.brand,
            model=data.model_number,
            wattage=data.wattage,
            age_years=data.age_years,
            usage_hours_per_day=data.usage_hours_per_day,
            usage_days_per_week=data.usage_days_per_week,
            efficiency_rating=data.efficiency_rating,
            location=data.location,
            is_smart=data.is_smart,
            notes=data.notes,
        )
        self.db.add(appliance)
        await self.db.flush()
        return ApplianceResponse.model_validate(appliance)

    async def list_appliances(self, user: User) -> List[ApplianceResponse]:
        result = await self.db.execute(
            select(Appliance)
            .where(Appliance.household_id == user.household_id)
            .order_by(Appliance.name)
        )
        return [ApplianceResponse.model_validate(a) for a in result.scalars().all()]

    async def update_appliance(self, user: User, appliance_id: UUID, data: ApplianceUpdate) -> Optional[ApplianceResponse]:
        result = await self.db.execute(
            select(Appliance).where(
                Appliance.id == appliance_id,
                Appliance.household_id == user.household_id,
            )
        )
        appliance = result.scalar_one_or_none()
        if not appliance:
            return None

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(appliance, field, value)

        await self.db.flush()
        return ApplianceResponse.model_validate(appliance)

    async def delete_appliance(self, user: User, appliance_id: UUID) -> bool:
        result = await self.db.execute(
            select(Appliance).where(
                Appliance.id == appliance_id,
                Appliance.household_id == user.household_id,
            )
        )
        appliance = result.scalar_one_or_none()
        if not appliance:
            return False
        await self.db.delete(appliance)
        return True

    # ── Audits ───────────────────────────────────────────────────────────────

    async def generate_audit(self, user: User) -> EnergyAuditResponse:
        # Calculate annual kWh from bills
        bills_result = await self.db.execute(
            select(func.sum(EnergyBill.electricity_kwh)).where(
                EnergyBill.user_id == user.id,
                EnergyBill.billing_period_start >= date.today().replace(month=1),
            )
        )
        annual_kwh = bills_result.scalar() or Decimal("0")

        # Get appliances total wattage * hours
        appliances = await self.list_appliances(user)
        appliance_kwh = sum(
            (a.wattage * float(a.usage_hours_per_day) * 365) / 1000
            for a in appliances
        )

        baseline = max(annual_kwh, Decimal(str(appliance_kwh)))
        savings = baseline * Decimal("0.15")  # 15% typical savings

        audit = EnergyAudit(
            household_id=user.household_id,
            total_annual_kwh=annual_kwh,
            baseline_kwh=baseline,
            savings_potential_kwh=savings,
            savings_potential_usd=savings * Decimal("0.15"),
            recommendations={
                "actions": [
                    {"title": "Upgrade old appliances", "priority": "high"},
                    {"title": "Seal air leaks", "priority": "medium"},
                    {"title": "Switch to LED lighting", "priority": "low"},
                ]
            },
            model_version="v1.0",
        )
        self.db.add(audit)
        await self.db.flush()
        return EnergyAuditResponse.model_validate(audit)

    async def get_latest_audit(self, user: User) -> Optional[EnergyAuditResponse]:
        result = await self.db.execute(
            select(EnergyAudit)
            .where(EnergyAudit.household_id == user.household_id)
            .order_by(EnergyAudit.created_at.desc())
            .limit(1)
        )
        audit = result.scalar_one_or_none()
        return EnergyAuditResponse.model_validate(audit) if audit else None
