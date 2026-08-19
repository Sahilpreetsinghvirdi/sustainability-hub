# backend/app/api/v1/endpoints/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.db.session import get_db
from app.api.deps import get_current_active_user
from app.schemas.users import UserUpdate, UserPreferencesUpdate, UserResponse
from app.db.models import User

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_profile(
    current_user: User = Depends(get_current_active_user),
):
    return UserResponse.model_validate(current_user)


@router.patch("/me", response_model=UserResponse)
async def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    update_data = user_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    await db.commit()
    await db.refresh(current_user)
    return UserResponse.model_validate(current_user)


@router.patch("/me/preferences", response_model=UserResponse)
async def update_preferences(
    prefs_update: UserPreferencesUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    current_prefs = current_user.preferences or {}
    update_data = prefs_update.model_dump(exclude_unset=True)
    current_prefs.update(update_data)
    current_user.preferences = current_prefs
    await db.commit()
    await db.refresh(current_user)
    return UserResponse.model_validate(current_user)


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    await db.delete(current_user)
    await db.commit()