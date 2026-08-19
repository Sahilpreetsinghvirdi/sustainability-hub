# backend/app/api/v1/endpoints/auth.py
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, EmailStr

from app.db.session import get_db
from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    verify_password,
    get_password_hash,
    decode_token,
    TokenData,
)
from app.schemas.auth import (
    Token,
    TokenRefresh,
    UserRegister,
    UserLogin,
    UserResponse,
)
from app.services.auth import AuthService
from app.api.deps import get_current_user, get_current_active_user
from app.db.models import User

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserRegister,
    db: AsyncSession = Depends(get_db),
):
    auth_service = AuthService(db)
    existing = await auth_service.get_user_by_email(user_data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    user = await auth_service.create_user(user_data)
    return UserResponse.model_validate(user)


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    auth_service = AuthService(db)
    user = await auth_service.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )

    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    # Store refresh token (in production, use Redis with expiry)
    await auth_service.store_refresh_token(user.id, refresh_token)

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/refresh", response_model=Token)
async def refresh_token(
    token_data: TokenRefresh,
    db: AsyncSession = Depends(get_db),
):
    auth_service = AuthService(db)
    payload = decode_token(token_data.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    user_id = payload.get("sub")
    user = await auth_service.get_user_by_id(user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )

    # Verify refresh token is valid
    if not await auth_service.verify_refresh_token(user_id, token_data.refresh_token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token revoked",
        )

    # Revoke old, issue new
    await auth_service.revoke_refresh_token(user_id)

    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    new_refresh_token = create_refresh_token(data={"sub": str(user.id)})
    await auth_service.store_refresh_token(user.id, new_refresh_token)

    return Token(
        access_token=access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    auth_service = AuthService(db)
    await auth_service.revoke_refresh_token(str(current_user.id))
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user),
):
    return UserResponse.model_validate(current_user)


@router.post("/forgot-password")
async def forgot_password(
    email: EmailStr,
    db: AsyncSession = Depends(get_db),
):
    auth_service = AuthService(db)
    await auth_service.request_password_reset(email)
    return {"message": "If the email exists, a reset link has been sent"}


@router.post("/reset-password")
async def reset_password(
    token: str,
    new_password: str,
    db: AsyncSession = Depends(get_db),
):
    auth_service = AuthService(db)
    await auth_service.reset_password(token, new_password)
    return {"message": "Password has been reset"}