# backend/app/schemas/users.py
from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    timezone: Optional[str] = None
    preferences: Optional[dict] = None


class UserResponse(BaseModel):
    id: UUID
    email: str
    name: str
    household_id: Optional[UUID] = None
    preferences: dict = {}
    is_active: bool = True
    is_verified: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
