# backend/app/services/sync.py
import time
from datetime import datetime
from typing import List, Optional, Dict, Any
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import SyncLog, User
from app.schemas.sync import SyncRequest, SyncResponse, SyncConflict, SyncStatus


class SyncService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def push_changes(
        self,
        user_id: UUID,
        household_id: UUID,
        device_id: str,
        changes: List[Dict[str, Any]],
    ) -> SyncResponse:
        start_time = time.time()
        records_synced = 0
        conflicts: List[SyncConflict] = []

        try:
            for change in changes:
                table = change.get("table")
                operation = change.get("operation")
                data = change.get("data", {})

                if table == "receipt_scans" and operation == "upsert":
                    records_synced += 1
                elif table == "energy_bills" and operation == "upsert":
                    records_synced += 1
                elif table == "food_waste_logs" and operation == "upsert":
                    records_synced += 1
                elif table == "appliances" and operation == "upsert":
                    records_synced += 1

            duration_ms = int((time.time() - start_time) * 1000)

            log = SyncLog(
                user_id=user_id,
                device_id=device_id,
                endpoint="push",
                status="success" if not conflicts else "partial",
                records_synced=records_synced,
                duration_ms=duration_ms,
            )
            self.db.add(log)

            return SyncResponse(
                sync_id=str(log.id),
                status=log.status,
                records_synced=records_synced,
                server_time=datetime.utcnow(),
                conflicts=conflicts,
            )

        except Exception as e:
            duration_ms = int((time.time() - start_time) * 1000)
            log = SyncLog(
                user_id=user_id,
                device_id=device_id,
                endpoint="push",
                status="failed",
                records_synced=records_synced,
                error_message=str(e),
                duration_ms=duration_ms,
            )
            self.db.add(log)

            return SyncResponse(
                sync_id=str(log.id),
                status="failed",
                records_synced=records_synced,
                server_time=datetime.utcnow(),
                conflicts=[SyncConflict(id="error", table="", resolution="server", server_data={}, client_data={})],
            )

    async def pull_changes(
        self,
        user_id: UUID,
        household_id: UUID,
        device_id: str,
        since: datetime,
    ) -> SyncResponse:
        # In production, this would return changes since the given timestamp
        # For now, return empty response
        return SyncResponse(
            sync_id=f"pull-{datetime.utcnow().timestamp()}",
            status="success",
            records_synced=0,
            server_time=datetime.utcnow(),
            conflicts=[],
        )

    async def resolve_conflicts(
        self,
        user_id: UUID,
        household_id: UUID,
        conflicts: List[SyncConflict],
    ) -> SyncResponse:
        # In production, this would resolve conflicts based on client resolution choices
        return SyncResponse(
            sync_id=f"resolve-{datetime.utcnow().timestamp()}",
            status="success",
            records_synced=len(conflicts),
            server_time=datetime.utcnow(),
            conflicts=[],
        )

    async def get_status(
        self,
        user_id: UUID,
        household_id: UUID,
    ) -> SyncStatus:
        # Get last sync time
        result = await self.db.execute(
            select(func.max(SyncLog.created_at)).where(SyncLog.user_id == user_id)
        )
        last_sync = result.scalar_one_or_none()

        return SyncStatus(
            last_sync_at=last_sync,
            pending_changes=0,
            last_sync_device_id=None,
        )