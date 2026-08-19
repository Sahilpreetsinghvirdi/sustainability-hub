# backend/app/api/v1/endpoints/food_waste.py
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Optional, List
from datetime import date

from app.db.session import get_db
from app.api.deps import get_current_active_user
from app.schemas.food_waste import (
    FoodWasteLogCreate,
    FoodWasteLogResponse,
    FoodWasteLogList,
    FoodWasteStreakResponse,
    FoodWasteSummary,
)
from app.services.food_waste import FoodWasteService
from app.db.models import User

router = APIRouter()


@router.post("/logs", response_model=FoodWasteLogResponse, status_code=status.HTTP_202_ACCEPTED)
async def log_food_waste(
    meal_image: UploadFile = File(...),
    waste_image: UploadFile = File(...),
    meal_type: str = Form(...),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    food_waste_service = FoodWasteService(db)
    log = await food_waste_service.process_waste_log(
        meal_image=meal_image,
        waste_image=waste_image,
        meal_type=meal_type,
        user_id=current_user.id,
        household_id=current_user.household_id,
    )
    return FoodWasteLogResponse.model_validate(log)


@router.post("/logs/manual", response_model=FoodWasteLogResponse, status_code=status.HTTP_201_CREATED)
async def create_manual_log(
    log_data: FoodWasteLogCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    food_waste_service = FoodWasteService(db)
    log = await food_waste_service.create_manual_log(
        log_data=log_data,
        user_id=current_user.id,
        household_id=current_user.household_id,
    )
    return FoodWasteLogResponse.model_validate(log)


@router.get("/logs", response_model=FoodWasteLogList)
async def list_food_waste_logs(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    meal_type: Optional[str] = Query(None, pattern="^(breakfast|lunch|dinner|snack)$"),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    food_waste_service = FoodWasteService(db)
    return await food_waste_service.get_user_logs(
        user_id=current_user.id,
        household_id=current_user.household_id,
        page=page,
        per_page=per_page,
        meal_type=meal_type,
        start_date=start_date,
        end_date=end_date,
    )


@router.get("/logs/{log_id}", response_model=FoodWasteLogResponse)
async def get_food_waste_log(
    log_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    food_waste_service = FoodWasteService(db)
    log = await food_waste_service.get_log_by_id(log_id, current_user.household_id)
    if not log:
        raise HTTPException(status_code=404, detail="Food waste log not found")
    return FoodWasteLogResponse.model_validate(log)


@router.get("/streak", response_model=FoodWasteStreakResponse)
async def get_streak(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    food_waste_service = FoodWasteService(db)
    streak = await food_waste_service.get_streak(current_user.id)
    return FoodWasteStreakResponse.model_validate(streak)


@router.get("/summary", response_model=FoodWasteSummary)
async def get_food_waste_summary(
    period: str = Query("month", pattern="^(day|week|month|year)$"),
    start_date: Optional[date] = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    food_waste_service = FoodWasteService(db)
    return await food_waste_service.get_summary(
        household_id=current_user.household_id,
        period=period,
        start_date=start_date,
    )