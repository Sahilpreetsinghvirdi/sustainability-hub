# backend/app/services/energy.py
from datetime import date, datetime
from decimal import Decimal
from typing import Optional, List
from uuid import UUID

from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import EnergyBill, Appliance, EnergyAudit, User
from app.schemas.energy import (
    EnergyBillCreate,
    EnergyBillResponse,
    ApplianceCreate,
    ApplianceUpdate,
    ApplianceResponse,
    EnergyAuditResponse,
    EnergyRecommendationResponse,
)


class EnergyService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def process_bill_image(
        self,
        image,
        user_id: UUID,
        household_id: UUID,
        utility_provider: Optional[str] = None,
    ) -> EnergyBill:
        # Create a pending bill - in production this would queue OCR processing
        bill = EnergyBill(
            user_id=user_id,
            household_id=household_id,
            utility_provider=utility_provider,
            billing_period_start=date.today().replace(day=1),
            billing_period_end=date.today(),
            electricity_kwh=Decimal("0"),
            total_cost=Decimal("0"),
            bill_image_url="pending",
            parsed_data={},
        )
        self.db.add(bill)
        await self.db.flush()
        return bill

    async def create_manual_bill(
        self,
        bill_data: EnergyBillCreate,
        user_id: UUID,
        household_id: UUID,
    ) -> EnergyBill:
        bill = EnergyBill(
            user_id=user_id,
            household_id=household_id,
            billing_period_start=bill_data.billing_period_start,
            billing_period_end=bill_data.billing_period_end,
            electricity_kwh=bill_data.electricity_kwh,
            gas_therms=bill_data.gas_therms,
            water_gallons=bill_data.water_gallons,
            total_cost=bill_data.total_cost,
            currency=bill_data.currency,
            utility_provider=bill_data.utility_provider,
        )
        self.db.add(bill)
        await self.db.flush()
        return bill

    async def get_household_bills(
        self,
        household_id: UUID,
        page: int = 1,
        per_page: int = 20,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> dict:
        query = select(EnergyBill).where(EnergyBill.household_id == household_id)

        if start_date:
            query = query.where(EnergyBill.billing_period_start >= start_date)
        if end_date:
            query = query.where(EnergyBill.billing_period_end <= end_date)

        count_query = select(func.count()).select_from(query.subquery())
        total = (await self.db.execute(count_query)).scalar() or 0

        query = query.order_by(desc(EnergyBill.billing_period_start))
        query = query.offset((page - 1) * per_page).limit(per_page)

        result = await self.db.execute(query)
        bills = result.scalars().all()

        return {
            "bills": bills,
            "total": total,
            "page": page,
            "per_page": per_page,
        }

    async def get_bill_by_id(self, bill_id: UUID, household_id: UUID) -> Optional[EnergyBill]:
        result = await self.db.execute(
            select(EnergyBill).where(
                EnergyBill.id == bill_id,
                EnergyBill.household_id == household_id,
            )
        )
        return result.scalar_one_or_none()

    async def create_appliance(
        self,
        appliance_data: ApplianceCreate,
        household_id: UUID,
    ) -> Appliance:
        appliance = Appliance(
            household_id=household_id,
            name=appliance_data.name,
            category=appliance_data.category,
            brand=appliance_data.brand,
            model=appliance_data.model_number,
            wattage=appliance_data.wattage,
            age_years=appliance_data.age_years,
            usage_hours_per_day=appliance_data.usage_hours_per_day,
            usage_days_per_week=appliance_data.usage_days_per_week,
            efficiency_rating=appliance_data.efficiency_rating,
            location=appliance_data.location,
            is_smart=appliance_data.is_smart,
            notes=appliance_data.notes,
        )
        self.db.add(appliance)
        await self.db.flush()
        return appliance

    async def get_household_appliances(self, household_id: UUID) -> List[Appliance]:
        result = await self.db.execute(
            select(Appliance)
            .where(Appliance.household_id == household_id)
            .order_by(Appliance.name)
        )
        return result.scalars().all()

    async def update_appliance(
        self,
        appliance_id: UUID,
        household_id: UUID,
        update_data: dict,
    ) -> Optional[Appliance]:
        result = await self.db.execute(
            select(Appliance).where(
                Appliance.id == appliance_id,
                Appliance.household_id == household_id,
            )
        )
        appliance = result.scalar_one_or_none()
        if not appliance:
            return None

        for field, value in update_data.items():
            setattr(appliance, field, value)

        await self.db.flush()
        return appliance

    async def delete_appliance(self, appliance_id: UUID, household_id: UUID) -> bool:
        result = await self.db.execute(
            select(Appliance).where(
                Appliance.id == appliance_id,
                Appliance.household_id == household_id,
            )
        )
        appliance = result.scalar_one_or_none()
        if not appliance:
            return False
        await self.db.delete(appliance)
        return True

    async def generate_audit(self, household_id: UUID) -> EnergyAudit:
        # Get bills from last year
        start_date = date.today().replace(month=1, day=1)
        bills_result = await self.db.execute(
            select(func.sum(EnergyBill.electricity_kwh)).where(
                EnergyBill.household_id == household_id,
                EnergyBill.billing_period_start >= start_date,
            )
        )
        annual_kwh = bills_result.scalar() or Decimal("0")

        # Get appliances total wattage * hours
        appliances = await self.get_household_appliances(household_id)
        appliance_kwh = sum(
            (a.wattage * float(a.usage_hours_per_day) * 365) / 1000
            for a in appliances
        )

        baseline = max(annual_kwh, Decimal(str(appliance_kwh)))
        savings = baseline * Decimal("0.15")  # 15% typical savings

        recommendations = {
            "actions": [
                {"title": "Upgrade old appliances", "priority": "high", "estimated_savings_usd_year": 200, "difficulty": "Medium"},
                {"title": "Seal air leaks", "priority": "medium", "estimated_savings_usd_year": 120, "difficulty": "Easy"},
                {"title": "Switch to LED lighting", "priority": "low", "estimated_savings_usd_year": 60, "difficulty": "Easy"},
            ]
        }

        audit = EnergyAudit(
            household_id=household_id,
            total_annual_kwh=annual_kwh,
            baseline_kwh=baseline,
            savings_potential_kwh=savings,
            savings_potential_usd=savings * Decimal("0.15"),
            recommendations=recommendations,
            model_version="v1.0",
        )
        self.db.add(audit)
        await self.db.flush()
        return audit

    async def get_household_audits(self, household_id: UUID) -> List[EnergyAudit]:
        result = await self.db.execute(
            select(EnergyAudit)
            .where(EnergyAudit.household_id == household_id)
            .order_by(desc(EnergyAudit.created_at))
        )
        return result.scalars().all()

    async def get_recommendations(self, household_id: UUID) -> List[dict]:
        audit = await self.generate_audit(household_id)
        return audit.recommendations.get("actions", [])