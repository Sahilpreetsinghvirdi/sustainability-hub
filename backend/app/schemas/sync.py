# backend/app/schemas/sync.py
from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel


class SyncRequest(BaseModel):
    device_id: str
    last_sync_at: Optional[datetime] = None
    changes: List[dict] = []


class SyncResponse(BaseModel):
    sync_id: str
    status: str  # "success", "partial", "failed"
    records_synced: int
    server_time: datetime
    conflicts: List[dict] = []


class SyncLogResponse(BaseModel):
    id: int
    user_id: Optional[UUID] = None
    device_id: Optional[str] = None
    endpoint: str
    status: str
    records_synced: int
    error_message: Optional[str] = None
    duration_ms: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ConflictResolution(BaseModel):
    conflict_id: str
    resolution: str  # "client", "server", "merge"
    merged_data: Optional[dict] = None
