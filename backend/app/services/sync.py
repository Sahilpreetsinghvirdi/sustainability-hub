# backend/app/services/sync.py
import time
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import SyncLog, User
from app.schemas.sync import SyncRequest, SyncResponse


class SyncService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def sync_data(self, user: User, request: SyncRequest) -> SyncResponse:
        start_time = time.time()
        records_synced = 0
        conflicts: List[dict] = []

        try:
            for change in request.changes:
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
                user_id=user.id,
                device_id=request.device_id,
                endpoint="sync",
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
                user_id=user.id,
                device_id=request.device_id,
                endpoint="sync",
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
                conflicts=[{"error": str(e)}],
            )

    async def get_sync_history(self, user: User, limit: int = 20) -> List[dict]:
        result = await self.db.execute(
            select(SyncLog)
            .where(SyncLog.user_id == user.id)
            .order_by(SyncLog.created_at.desc())
            .limit(limit)
        )
        logs = result.scalars().all()

        return [
            {
                "id": log.id,
                "device_id": log.device_id,
                "status": log.status,
                "records_synced": log.records_synced,
                "duration_ms": log.duration_ms,
                "created_at": log.created_at.isoformat(),
            }
            for log in logs
        ]
