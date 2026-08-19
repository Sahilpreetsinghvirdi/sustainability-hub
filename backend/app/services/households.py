# backend/app/services/households.py
from typing import Optional, List
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Household, User
from app.schemas.households import HouseholdCreate, HouseholdResponse, HouseholdMemberResponse


class HouseholdService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_household(self, user: User, data: HouseholdCreate) -> HouseholdResponse:
        household = Household(
            name=data.name,
            location={"zip_code": data.zip_code, "home_type": data.home_type} if data.zip_code else None,
        )
        self.db.add(household)
        await self.db.flush()

        user.household_id = household.id
        await self.db.flush()

        return HouseholdResponse(
            id=household.id,
            name=household.name,
            location=household.location,
            members=[
                HouseholdMemberResponse(
                    id=user.id,
                    name=user.name,
                    email=user.email,
                    role="owner",
                    joined_at=user.created_at,
                )
            ],
            created_at=household.created_at,
            updated_at=household.updated_at,
        )

    async def get_household(self, user: User) -> Optional[HouseholdResponse]:
        if not user.household_id:
            return None

        result = await self.db.execute(
            select(Household).where(Household.id == user.household_id)
        )
        household = result.scalar_one_or_none()
        if not household:
            return None

        members_result = await self.db.execute(
            select(User).where(User.household_id == household.id)
        )
        members = members_result.scalars().all()

        return HouseholdResponse(
            id=household.id,
            name=household.name,
            location=household.location,
            members=[
                HouseholdMemberResponse(
                    id=m.id,
                    name=m.name,
                    email=m.email,
                    role="owner" if m.id == user.id else "member",
                    joined_at=m.created_at,
                )
                for m in members
            ],
            created_at=household.created_at,
            updated_at=household.updated_at,
        )

    async def update_household(self, user: User, data: dict) -> Optional[HouseholdResponse]:
        if not user.household_id:
            return None

        result = await self.db.execute(
            select(Household).where(Household.id == user.household_id)
        )
        household = result.scalar_one_or_none()
        if not household:
            return None

        for key, value in data.items():
            if hasattr(household, key) and value is not None:
                setattr(household, key, value)

        await self.db.flush()
        return await self.get_household(user)

    async def delete_household(self, user: User) -> bool:
        if not user.household_id:
            return False

        result = await self.db.execute(
            select(Household).where(Household.id == user.household_id)
        )
        household = result.scalar_one_or_none()
        if not household:
            return False

        # Remove all members
        members_result = await self.db.execute(
            select(User).where(User.household_id == household.id)
        )
        for member in members_result.scalars().all():
            member.household_id = None

        await self.db.delete(household)
        return True
