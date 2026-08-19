# backend/app/services/auth.py
from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.db.models import User
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenPair,
    AuthResponse,
)


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def register(self, data: RegisterRequest) -> AuthResponse:
        existing = await self.db.execute(select(User).where(User.email == data.email))
        if existing.scalar_one_or_none():
            raise ValueError("Email already registered")

        user = User(
            email=data.email,
            name=data.name,
            password_hash=hash_password(data.password),
        )
        self.db.add(user)
        await self.db.flush()

        tokens = self._create_tokens(user.id)
        return AuthResponse(
            user={
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "household_id": user.household_id,
                "preferences": user.preferences,
                "is_active": user.is_active,
                "is_verified": user.is_verified,
                "created_at": user.created_at,
                "updated_at": user.updated_at,
            },
            tokens=tokens,
        )

    async def login(self, data: LoginRequest) -> AuthResponse:
        result = await self.db.execute(select(User).where(User.email == data.email))
        user = result.scalar_one_or_none()

        if not user or not verify_password(data.password, user.password_hash):
            raise ValueError("Invalid email or password")

        if not user.is_active:
            raise ValueError("Account is deactivated")

        user.last_login_at = datetime.utcnow()
        await self.db.flush()

        tokens = self._create_tokens(user.id)
        return AuthResponse(
            user={
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "household_id": user.household_id,
                "preferences": user.preferences,
                "is_active": user.is_active,
                "is_verified": user.is_verified,
                "created_at": user.created_at,
                "updated_at": user.updated_at,
            },
            tokens=tokens,
        )

    async def refresh_token(self, refresh_token: str) -> TokenPair:
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise ValueError("Invalid refresh token")

        user_id = payload.get("sub")
        result = await self.db.execute(select(User).where(User.id == UUID(user_id)))
        user = result.scalar_one_or_none()

        if not user or not user.is_active:
            raise ValueError("Invalid refresh token")

        return self._create_tokens(user.id)

    async def change_password(self, user: User, current_password: str, new_password: str) -> None:
        if not verify_password(current_password, user.password_hash):
            raise ValueError("Current password is incorrect")

        user.password_hash = hash_password(new_password)
        await self.db.flush()

    def _create_tokens(self, user_id: UUID) -> TokenPair:
        access = create_access_token(user_id)
        refresh = create_refresh_token(user_id)
        from app.core.config import settings
        return TokenPair(
            access_token=access,
            refresh_token=refresh,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )
