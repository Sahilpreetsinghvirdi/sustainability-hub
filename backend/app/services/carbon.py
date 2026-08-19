# backend/app/services/carbon.py
from datetime import datetime, date, timedelta
from decimal import Decimal
from typing import Optional, List
from uuid import UUID

from sqlalchemy import select, func, and_, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import ReceiptScan, ReceiptItem, CarbonFactor, User
from app.schemas.carbon import (
    ReceiptScanCreate,
    ReceiptScanResponse,
    ReceiptItemResponse,
    CarbonFactorResponse,
    CarbonSummary,
)


class CarbonService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def process_receipt(
        self,
        image,
        user_id: UUID,
        household_id: UUID,
        store_name: Optional[str] = None,
        total_amount: Optional[float] = None,
        currency: str = "USD",
    ) -> ReceiptScan:
        # Create a pending scan - in production this would queue OCR processing
        scan = ReceiptScan(
            user_id=user_id,
            household_id=household_id,
            image_url="pending",
            store_name=store_name,
            total_amount=Decimal(str(total_amount)) if total_amount else Decimal("0"),
            currency=currency,
            status="processing",
        )
        self.db.add(scan)
        await self.db.flush()
        return scan

    async def create_manual_receipt(
        self,
        receipt_data: ReceiptScanCreate,
        user_id: UUID,
        household_id: UUID,
    ) -> ReceiptScan:
        scan = ReceiptScan(
            user_id=user_id,
            household_id=household_id,
            image_url="manual",
            store_name=receipt_data.store_name,
            total_amount=receipt_data.total_amount or Decimal("0"),
            currency=receipt_data.currency,
            status="completed",
            processed_at=datetime.utcnow(),
        )
        self.db.add(scan)
        await self.db.flush()

        total_carbon = Decimal("0")
        for idx, item_data in enumerate(receipt_data.items):
            factor = await self._get_carbon_factor(item_data.category)
            carbon = (item_data.quantity * factor) if factor else Decimal("0")

            item = ReceiptItem(
                scan_id=scan.id,
                name=item_data.name,
                quantity=item_data.quantity,
                unit=item_data.unit,
                price=item_data.price,
                category=item_data.category,
                carbon_kg=carbon,
                carbon_source="estimated" if not factor else "openfoodfacts",
                confidence=Decimal("0.7") if not factor else Decimal("0.9"),
                position=idx,
            )
            self.db.add(item)
            total_carbon += carbon

        scan.total_carbon_kg = total_carbon
        await self.db.flush()
        return scan

    async def get_user_scans(
        self,
        user_id: UUID,
        household_id: UUID,
        page: int = 1,
        per_page: int = 20,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        status_filter: Optional[str] = None,
    ) -> dict:
        query = select(ReceiptScan).where(
            ReceiptScan.user_id == user_id,
            ReceiptScan.household_id == household_id,
        )

        if start_date:
            query = query.where(ReceiptScan.scanned_at >= start_date)
        if end_date:
            query = query.where(ReceiptScan.scanned_at <= end_date)
        if status_filter:
            query = query.where(ReceiptScan.status == status_filter)

        count_query = select(func.count()).select_from(query.subquery())
        total = (await self.db.execute(count_query)).scalar() or 0

        query = query.order_by(desc(ReceiptScan.scanned_at))
        query = query.offset((page - 1) * per_page).limit(per_page)

        result = await self.db.execute(query)
        scans = result.scalars().all()

        return {
            "scans": scans,
            "total": total,
            "page": page,
            "per_page": per_page,
        }

    async def get_scan_by_id(self, scan_id: UUID, household_id: UUID) -> Optional[ReceiptScan]:
        result = await self.db.execute(
            select(ReceiptScan).where(
                ReceiptScan.id == scan_id,
                ReceiptScan.household_id == household_id,
            )
        )
        return result.scalar_one_or_none()

    async def get_scan_items(self, scan_id: UUID, household_id: UUID) -> List[ReceiptItem]:
        # Verify scan belongs to household
        scan = await self.get_scan_by_id(scan_id, household_id)
        if not scan:
            return []

        result = await self.db.execute(
            select(ReceiptItem).where(ReceiptItem.scan_id == scan_id)
        )
        return result.scalars().all()

    async def update_item(
        self, item_id: UUID, item_update: dict, household_id: UUID
    ) -> Optional[ReceiptItem]:
        result = await self.db.execute(
            select(ReceiptItem).join(ReceiptScan).where(
                ReceiptItem.id == item_id,
                ReceiptScan.household_id == household_id,
            )
        )
        item = result.scalar_one_or_none()
        if not item:
            return None

        for field, value in item_update.items():
            if hasattr(item, field):
                setattr(item, field, value)

        # Recalculate carbon if category or quantity changed
        if "category" in item_update or "quantity" in item_update:
            factor = await self._get_carbon_factor(item.category)
            item.carbon_kg = (item.quantity * factor) if factor else Decimal("0")

        await self.db.flush()
        return item

    async def get_factors(self, category: Optional[str] = None, region: str = "US") -> List[CarbonFactor]:
        query = select(CarbonFactor).where(CarbonFactor.region == region)
        if category:
            query = query.where(CarbonFactor.product_category == category)
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_summary(
        self,
        household_id: UUID,
        period: str = "month",
        start_date: Optional[date] = None,
    ) -> CarbonSummary:
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

        # Total carbon
        total_result = await self.db.execute(
            select(func.sum(ReceiptScan.total_carbon_kg)).where(
                ReceiptScan.household_id == household_id,
                ReceiptScan.status == "completed",
            )
        )
        total_kg = total_result.scalar() or Decimal("0")

        # Period carbon
        period_result = await self.db.execute(
            select(func.sum(ReceiptScan.total_carbon_kg)).where(
                ReceiptScan.household_id == household_id,
                ReceiptScan.status == "completed",
                ReceiptScan.scanned_at >= start_date,
            )
        )
        period_kg = period_result.scalar() or Decimal("0")

        # Top categories
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

        return CarbonSummary(
            total_kg=total_kg,
            period_kg=period_kg,
            daily_average_kg=period_kg / Decimal(str(days)),
            trend="stable",
            trend_percentage=Decimal("0"),
            top_categories=[{"category": r[0], "total": float(r[1])} for r in top_cats],
        )

    async def _get_carbon_factor(self, category: str) -> Optional[Decimal]:
        result = await self.db.execute(
            select(CarbonFactor).where(CarbonFactor.product_category == category)
        )
        factor = result.scalar_one_or_none()
        return factor.kg_co2e_per_unit if factor else None