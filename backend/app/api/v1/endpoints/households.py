# backend/app/api/v1/endpoints/households.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from typing import List, Optional

from app.db.session import get_db
from app.api.deps import get_current_active_user
from app.schemas.households import (
    HouseholdCreate,
    HouseholdUpdate,
    HouseholdResponse,
    HouseholdMemberResponse,
    HouseholdInvite,
)
from app.services.households import HouseholdService
from app.db.models import User, Household

router = APIRouter()


@router.post("", response_model=HouseholdResponse, status_code=status.HTTP_201_CREATED)
async def create_household(
    household_data: HouseholdCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    household_service = HouseholdService(db)
    household = await household_service.create_household(
        household_data=household_data,
        creator_id=current_user.id,
    )
    return HouseholdResponse.model_validate(household)


@router.get("/me", response_model=HouseholdResponse)
async def get_my_household(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.household_id:
        raise HTTPException(status_code=404, detail="No household found")
    household_service = HouseholdService(db)
    household = await household_service.get_household(current_user.household_id)
    return HouseholdResponse.model_validate(household)


@router.patch("/me", response_model=HouseholdResponse)
async def update_household(
    household_update: HouseholdUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.household_id:
        raise HTTPException(status_code=404, detail="No household found")
    household_service = HouseholdService(db)
    household = await household_service.update_household(
        household_id=current_user.household_id,
        user_id=current_user.id,
        update_data=household_update.model_dump(exclude_unset=True),
    )
    return HouseholdResponse.model_validate(household)


@router.get("/me/members", response_model=List[HouseholdMemberResponse])
async def list_household_members(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.household_id:
        raise HTTPException(status_code=404, detail="No household found")
    household_service = HouseholdService(db)
    return await household_service.get_members(current_user.household_id)


@router.post("/me/invite", response_model=dict)
async def invite_member(
    invite: HouseholdInvite,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.household_id:
        raise HTTPException(status_code=404, detail="No household found")
    household_service = HouseholdService(db)
    return await household_service.invite_member(
        household_id=current_user.household_id,
        inviter_id=current_user.id,
        email=invite.email,
        role=invite.role,
    )


@router.delete("/me/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_member(
    user_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.household_id:
        raise HTTPException(status_code=404, detail="No household found")
    household_service = HouseholdService(db)
    await household_service.remove_member(
        household_id=current_user.household_id,
        requester_id=current_user.id,
        member_id=user_id,
    )


@router.post("/me/leave", status_code=status.HTTP_204_NO_CONTENT)
async def leave_household(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.household_id:
        raise HTTPException(status_code=404, detail="No household found")
    household_service = HouseholdService(db)
    await household_service.leave_household(
        household_id=current_user.household_id,
        user_id=current_user.id,
    )