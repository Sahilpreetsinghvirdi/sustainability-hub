# backend/app/api/v1/endpoints/sync.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any
from uuid import UUID
from datetime import datetime

from app.db.session import get_db
from app.api.deps import get_current_active_user
from app.schemas.sync import (
    SyncRequest,
    SyncResponse,
    SyncConflict,
    SyncStatus,
)
from app.services.sync import SyncService
from app.db.models import User, SyncLog

router = APIRouter()


@router.post("/push", response_model=SyncResponse)
async def push_changes(
    sync_request: SyncRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    sync_service = SyncService(db)
    return await sync_service.push_changes(
        user_id=current_user.id,
        household_id=current_user.household_id,
        device_id=sync_request.device_id,
        changes=sync_request.changes,
    )


@router.post("/pull", response_model=SyncResponse)
async def pull_changes(
    since: datetime,
    device_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    sync_service = SyncService(db)
    return await sync_service.pull_changes(
        user_id=current_user.id,
        household_id=current_user.household_id,
        device_id=device_id,
        since=since,
    )


@router.post("/resolve-conflicts", response_model=SyncResponse)
async def resolve_conflicts(
    conflicts: List[SyncConflict],
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    sync_service = SyncService(db)
    return await sync_service.resolve_conflicts(
        user_id=current_user.id,
        household_id=current_user.household_id,
        conflicts=conflicts,
    )


@router.get("/status", response_model=SyncStatus)
async def get_sync_status(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    sync_service = SyncService(db)
    return await sync_service.get_status(
        user_id=current_user.id,
        household_id=current_user.household_id,
    )