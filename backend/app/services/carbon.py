# backend/app/services/carbon.py
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Optional, List
from uuid import UUID

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import ReceiptScan, ReceiptItem, CarbonFactor, User
from app.schemas.carbon import (
    ReceiptScanCreate,
    ReceiptScanResponse,
    ReceiptScanListResponse,
    ReceiptItemResponse,
)


class CarbonService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_scan(self, user: User, data: ReceiptScanCreate) -> ReceiptScanResponse:
        scan = ReceiptScan(
            user_id=user.id,
            household_id=user.household_id,
            image_url="manual",
            store_name=data.store_name,
            total_amount=data.total_amount or Decimal("0"),
            currency=data.currency,
            status="completed",
            processed_at=datetime.utcnow(),
        )
        self.db.add(scan)
        await self.db.flush()

        total_carbon = Decimal("0")
        for idx, item_data in enumerate(data.items):
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

        return await self.get_scan(user, scan.id)

    async def get_scan(self, user: User, scan_id: UUID) -> ReceiptScanResponse:
        result = await self.db.execute(
            select(ReceiptScan).where(
                ReceiptScan.id == scan_id,
                ReceiptScan.user_id == user.id,
            )
        )
        scan = result.scalar_one_or_none()
        if not scan:
            raise ValueError("Scan not found")

        items_result = await self.db.execute(
            select(ReceiptItem).where(ReceiptItem.scan_id == scan.id)
        )
        items = items_result.scalars().all()

        return ReceiptScanResponse(
            id=scan.id,
            user_id=scan.user_id,
            household_id=scan.household_id,
            image_url=scan.image_url,
            ocr_text=scan.ocr_text,
            total_carbon_kg=scan.total_carbon_kg,
            currency=scan.currency,
            total_amount=scan.total_amount,
            store_name=scan.store_name,
            scanned_at=scan.scanned_at,
            status=scan.status,
            items=[ReceiptItemResponse.model_validate(i) for i in items],
            created_at=scan.created_at,
        )

    async def list_scans(
        self, user: User, page: int = 1, page_size: int = 20, start_date: Optional[str] = None
    ) -> ReceiptScanListResponse:
        query = select(ReceiptScan).where(ReceiptScan.user_id == user.id)

        if start_date:
            query = query.where(ReceiptScan.scanned_at >= start_date)

        count_query = select(func.count()).select_from(query.subquery())
        total = (await self.db.execute(count_query)).scalar() or 0

        query = query.order_by(ReceiptScan.scanned_at.desc())
        query = query.offset((page - 1) * page_size).limit(page_size)

        result = await self.db.execute(query)
        scans = result.scalars().all()

        return ReceiptScanListResponse(
            scans=[ReceiptScanResponse.model_validate(s) for s in scans],
            total=total,
            page=page,
            page_size=page_size,
        )

    async def delete_scan(self, user: User, scan_id: UUID) -> bool:
        result = await self.db.execute(
            select(ReceiptScan).where(
                ReceiptScan.id == scan_id,
                ReceiptScan.user_id == user.id,
            )
        )
        scan = result.scalar_one_or_none()
        if not scan:
            return False
        await self.db.delete(scan)
        return True

    async def get_summary(self, user: User, days: int = 30) -> dict:
        since = datetime.utcnow() - timedelta(days=days)
        result = await self.db.execute(
            select(func.sum(ReceiptScan.total_carbon_kg)).where(
                ReceiptScan.user_id == user.id,
                ReceiptScan.scanned_at >= since,
            )
        )
        total = result.scalar() or Decimal("0")

        return {
            "total_kg": float(total),
            "period_days": days,
            "daily_average_kg": float(total / days) if days > 0 else 0,
        }

    async def _get_carbon_factor(self, category: str) -> Optional[Decimal]:
        result = await self.db.execute(
            select(CarbonFactor).where(CarbonFactor.product_category == category)
        )
        factor = result.scalar_one_or_none()
        return factor.kg_co2e_per_unit if factor else None
