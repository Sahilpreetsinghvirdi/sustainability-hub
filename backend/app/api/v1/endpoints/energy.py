# backend/app/api/v1/endpoints/energy.py
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Optional, List
from datetime import date

from app.db.session import get_db
from app.api.deps import get_current_active_user
from app.schemas.energy import (
    EnergyBillCreate,
    EnergyBillResponse,
    EnergyBillList,
    ApplianceCreate,
    ApplianceResponse,
    ApplianceUpdate,
    EnergyAuditResponse,
    EnergyRecommendationResponse,
)
from app.services.energy import EnergyService
from app.db.models import User

router = APIRouter()


@router.post("/bills", response_model=EnergyBillResponse, status_code=status.HTTP_202_ACCEPTED)
async def upload_energy_bill(
    image: UploadFile = File(...),
    utility_provider: Optional[str] = Form(None),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    energy_service = EnergyService(db)
    bill = await energy_service.process_bill_image(
        image=image,
        user_id=current_user.id,
        household_id=current_user.household_id,
        utility_provider=utility_provider,
    )
    return EnergyBillResponse.model_validate(bill)


@router.post("/bills/manual", response_model=EnergyBillResponse, status_code=status.HTTP_201_CREATED)
async def create_manual_bill(
    bill_data: EnergyBillCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    energy_service = EnergyService(db)
    bill = await energy_service.create_manual_bill(
        bill_data=bill_data,
        user_id=current_user.id,
        household_id=current_user.household_id,
    )
    return EnergyBillResponse.model_validate(bill)


@router.get("/bills", response_model=EnergyBillList)
async def list_energy_bills(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    energy_service = EnergyService(db)
    return await energy_service.get_household_bills(
        household_id=current_user.household_id,
        page=page,
        per_page=per_page,
        start_date=start_date,
        end_date=end_date,
    )


@router.get("/bills/{bill_id}", response_model=EnergyBillResponse)
async def get_energy_bill(
    bill_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    energy_service = EnergyService(db)
    bill = await energy_service.get_bill_by_id(bill_id, current_user.household_id)
    if not bill:
        raise HTTPException(status_code=404, detail="Energy bill not found")
    return EnergyBillResponse.model_validate(bill)


@router.post("/appliances", response_model=ApplianceResponse, status_code=status.HTTP_201_CREATED)
async def create_appliance(
    appliance_data: ApplianceCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    energy_service = EnergyService(db)
    appliance = await energy_service.create_appliance(
        appliance_data=appliance_data,
        household_id=current_user.household_id,
    )
    return ApplianceResponse.model_validate(appliance)


@router.get("/appliances", response_model=List[ApplianceResponse])
async def list_appliances(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    energy_service = EnergyService(db)
    return await energy_service.get_household_appliances(current_user.household_id)


@router.patch("/appliances/{appliance_id}", response_model=ApplianceResponse)
async def update_appliance(
    appliance_id: UUID,
    appliance_update: ApplianceUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    energy_service = EnergyService(db)
    appliance = await energy_service.update_appliance(
        appliance_id=appliance_id,
        household_id=current_user.household_id,
        update_data=appliance_update.model_dump(exclude_unset=True),
    )
    if not appliance:
        raise HTTPException(status_code=404, detail="Appliance not found")
    return ApplianceResponse.model_validate(appliance)


@router.delete("/appliances/{appliance_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_appliance(
    appliance_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    energy_service = EnergyService(db)
    await energy_service.delete_appliance(appliance_id, current_user.household_id)


@router.post("/audit", response_model=EnergyAuditResponse, status_code=status.HTTP_201_CREATED)
async def generate_energy_audit(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    energy_service = EnergyService(db)
    audit = await energy_service.generate_audit(current_user.household_id)
    return EnergyAuditResponse.model_validate(audit)


@router.get("/audits", response_model=List[EnergyAuditResponse])
async def list_energy_audits(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    energy_service = EnergyService(db)
    return await energy_service.get_household_audits(current_user.household_id)


@router.get("/recommendations", response_model=List[EnergyRecommendationResponse])
async def get_recommendations(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    energy_service = EnergyService(db)
    return await energy_service.get_recommendations(current_user.household_id)