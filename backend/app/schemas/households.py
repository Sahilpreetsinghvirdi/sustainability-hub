# backend/app/schemas/households.py
from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, EmailStr


class HouseholdCreate(BaseModel):
    name: str
    zip_code: Optional[str] = None
    home_type: Optional[str] = "apartment"


class HouseholdUpdate(BaseModel):
    name: Optional[str] = None
    zip_code: Optional[str] = None
    home_type: Optional[str] = None


class HouseholdMemberResponse(BaseModel):
    id: UUID
    name: str
    email: str
    role: str
    joined_at: datetime

    class Config:
        from_attributes = True


class HouseholdResponse(BaseModel):
    id: UUID
    name: str
    location: Optional[dict] = None
    members: List[HouseholdMemberResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class InviteMemberRequest(BaseModel):
    email: EmailStr
    role: str = "member"


# Alias for endpoint compatibility
HouseholdInvite = InviteMemberRequest
