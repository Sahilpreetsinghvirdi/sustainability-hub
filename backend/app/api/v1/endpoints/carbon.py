# backend/app/api/v1/endpoints/carbon.py
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from uuid import UUID
from typing import Optional, List
from datetime import datetime, date

from app.db.session import get_db
from app.api.deps import get_current_active_user
from app.schemas.carbon import (
    ReceiptScanCreate,
    ReceiptScanResponse,
    ReceiptScanList,
    ReceiptItemResponse,
    CarbonFactorResponse,
    CarbonSummary,
)
from app.services.carbon import CarbonService
from app.db.models import User, ReceiptScan, ReceiptItem, CarbonFactor

router = APIRouter()


@router.post("/scan", response_model=ReceiptScanResponse, status_code=status.HTTP_202_ACCEPTED)
async def scan_receipt(
    image: UploadFile = File(...),
    store_name: Optional[str] = Form(None),
    total_amount: Optional[float] = Form(None),
    currency: str = Form("USD"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    carbon_service = CarbonService(db)
    scan = await carbon_service.process_receipt(
        image=image,
        user_id=current_user.id,
        household_id=current_user.household_id,
        store_name=store_name,
        total_amount=total_amount,
        currency=currency,
    )
    return ReceiptScanResponse.model_validate(scan)


@router.post("/scan/manual", response_model=ReceiptScanResponse, status_code=status.HTTP_201_CREATED)
async def manual_receipt_entry(
    receipt_data: ReceiptScanCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    carbon_service = CarbonService(db)
    scan = await carbon_service.create_manual_receipt(
        receipt_data=receipt_data,
        user_id=current_user.id,
        household_id=current_user.household_id,
    )
    return ReceiptScanResponse.model_validate(scan)


@router.get("/scans", response_model=ReceiptScanList)
async def list_receipt_scans(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    status_filter: Optional[str] = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    carbon_service = CarbonService(db)
    return await carbon_service.get_user_scans(
        user_id=current_user.id,
        household_id=current_user.household_id,
        page=page,
        per_page=per_page,
        start_date=start_date,
        end_date=end_date,
        status_filter=status_filter,
    )


@router.get("/scans/{scan_id}", response_model=ReceiptScanResponse)
async def get_receipt_scan(
    scan_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    carbon_service = CarbonService(db)
    scan = await carbon_service.get_scan_by_id(scan_id, current_user.household_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Receipt scan not found")
    return ReceiptScanResponse.model_validate(scan)


@router.get("/scans/{scan_id}/items", response_model=List[ReceiptItemResponse])
async def get_receipt_items(
    scan_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    carbon_service = CarbonService(db)
    items = await carbon_service.get_scan_items(scan_id, current_user.household_id)
    return [ReceiptItemResponse.model_validate(item) for item in items]


@router.patch("/scans/{scan_id}/items/{item_id}", response_model=ReceiptItemResponse)
async def update_receipt_item(
    scan_id: UUID,
    item_id: UUID,
    item_update: dict,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    carbon_service = CarbonService(db)
    item = await carbon_service.update_item(item_id, item_update, current_user.household_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return ReceiptItemResponse.model_validate(item)


@router.get("/factors", response_model=List[CarbonFactorResponse])
async def list_carbon_factors(
    category: Optional[str] = Query(None),
    region: str = Query("US"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    carbon_service = CarbonService(db)
    factors = await carbon_service.get_factors(category=category, region=region)
    return [CarbonFactorResponse.model_validate(f) for f in factors]


@router.get("/summary", response_model=CarbonSummary)
async def get_carbon_summary(
    period: str = Query("month", pattern="^(day|week|month|year)$"),
    start_date: Optional[date] = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    carbon_service = CarbonService(db)
    return await carbon_service.get_summary(
        household_id=current_user.household_id,
        period=period,
        start_date=start_date,
    )