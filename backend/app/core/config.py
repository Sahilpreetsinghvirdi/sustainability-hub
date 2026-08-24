# backend/app/core/config.py
from functools import lru_cache
from typing import List, Optional
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Environment
    ENVIRONMENT: str = Field(default="development")
    DEBUG: bool = Field(default=True)
    LOG_LEVEL: str = Field(default="INFO")

    # App
    APP_NAME: str = "Sustainability Hub API"
    APP_VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"

    # Database
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/sustainability"
    )
    DB_ECHO: bool = Field(default=False)
    DB_POOL_SIZE: int = Field(default=20)
    DB_MAX_OVERFLOW: int = Field(default=10)

    # Redis (for caching, sessions)
    REDIS_URL: str = Field(default="redis://localhost:6379/0")

    # Security
    SECRET_KEY: str = Field(default="your-super-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    BCRYPT_ROUNDS: int = 12

    # CORS
    CORS_ORIGINS: List[str] = Field(default=[
        "http://localhost:3000",
        "http://localhost:8081",
        "exp://localhost:8081",
        "http://localhost:1420",      # Vite dev server (desktop)
        "http://tauri.localhost",     # Tauri v2 webview origin
        "https://tauri.localhost",
    ])
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: List[str] = ["*"]
    CORS_ALLOW_HEADERS: List[str] = ["*"]

    # File upload
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    UPLOAD_DIR: str = "uploads"
    ALLOWED_IMAGE_TYPES: List[str] = ["image/jpeg", "image/png", "image/webp", "image/heic"]
    ALLOWED_DOCUMENT_TYPES: List[str] = ["application/pdf"]

    # External APIs
    OPENFOODFACTS_API_URL: str = "https://world.openfoodfacts.org/api/v0"
    OPENFOODFACTS_USER_AGENT: str = "SustainabilityHub/1.0"
    ECOINVENT_API_URL: Optional[str] = None
    ECOINVENT_API_KEY: Optional[str] = None

    # ML Models
    FOOD_WASTE_MODEL_PATH: str = "models/food_waste_v1.2.0.tflite"
    ENERGY_MODEL_PATH: str = "models/energy_v1.0.0.joblib"
    MODEL_CONFIDENCE_THRESHOLD: float = 0.5

    # AI Waste Analyzer (vision LLM)
    AI_PROVIDER: str = Field(default="gemini")  # "gemini" | "openai"
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-2.0-flash"
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"
    AI_TIMEOUT_SECONDS: int = 90

    # OCR
    PADDLE_OCR_LANG: str = "en"
    PADDLE_OCR_USE_GPU: bool = False
    OCR_MIN_CONFIDENCE: float = 0.6

    # Email (for verification, notifications)
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAIL_FROM: str = "noreply@sustainabilityhub.app"
    EMAIL_FROM_NAME: str = "Sustainability Hub"

    # Push notifications (Firebase)
    FIREBASE_PROJECT_ID: Optional[str] = None
    FIREBASE_PRIVATE_KEY: Optional[str] = None
    FIREBASE_CLIENT_EMAIL: Optional[str] = None

    # Analytics
    ANALYTICS_ENABLED: bool = False
    ANALYTICS_SAMPLE_RATE: float = 1.0

    # Rate limiting
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW: int = 60  # seconds

    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()