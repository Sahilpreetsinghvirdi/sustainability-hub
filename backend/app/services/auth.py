# backend/app/services/auth.py
from datetime import datetime, timedelta
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

    async def get_user_by_email(self, email: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        try:
            uid = UUID(user_id)
        except ValueError:
            return None
        result = await self.db.execute(select(User).where(User.id == uid))
        return result.scalar_one_or_none()

    async def create_user(self, user_data: RegisterRequest) -> User:
        user = User(
            email=user_data.email,
            name=user_data.name,
            password_hash=hash_password(user_data.password),
        )
        self.db.add(user)
        await self.db.flush()
        return user

    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        user = await self.get_user_by_email(email)
        if not user or not verify_password(password, user.password_hash):
            return None
        return user

    async def store_refresh_token(self, user_id: UUID, token: str) -> None:
        # In production, store in Redis with TTL
        # For now, we'll store a hash in user preferences
        user = await self.get_user_by_id(str(user_id))
        if user:
            user.preferences = {**user.preferences, "refresh_token_hash": hash_password(token)}
            await self.db.flush()

    async def verify_refresh_token(self, user_id: UUID, token: str) -> bool:
        user = await self.get_user_by_id(str(user_id))
        if not user:
            return False
        stored_hash = user.preferences.get("refresh_token_hash")
        if not stored_hash:
            return False
        return verify_password(token, stored_hash)

    async def revoke_refresh_token(self, user_id: str) -> None:
        user = await self.get_user_by_id(user_id)
        if user:
            user.preferences = {k: v for k, v in user.preferences.items() if k != "refresh_token_hash"}
            await self.db.flush()

    async def request_password_reset(self, email: str) -> None:
        # In production, send email with reset token
        # For now, just acknowledge
        pass

    async def reset_password(self, token: str, new_password: str) -> None:
        # In production, verify token and reset password
        pass

    async def register(self, data: RegisterRequest) -> AuthResponse:
        existing = await self.get_user_by_email(data.email)
        if existing:
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