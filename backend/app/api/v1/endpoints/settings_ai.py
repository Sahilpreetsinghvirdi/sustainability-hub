# backend/app/api/v1/endpoints/settings_ai.py
"""AI provider settings — lets the desktop Settings UI configure Gemini / OpenAI keys without hand-editing .env."""
from pathlib import Path
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.core.config import settings

router = APIRouter()


def _mask(key: Optional[str]) -> Optional[str]:
    if not key:
        return None
    k = key.strip()
    if not k:
        return None
    if len(k) <= 8:
        return "•" * len(k)
    return f"{k[:4]}{'•' * (len(k) - 8)}{k[-4:]}"


def _env_path() -> Path:
    # Try cwd/.env first (when uvicorn is launched from backend/), then fallback to file-relative
    p = Path.cwd() / ".env"
    if p.exists():
        return p
    # backend/app/api/v1/endpoints/settings_ai.py -> parents[4] = Sustainability, parents[3]=backend
    try:
        return Path(__file__).resolve().parents[3] / ".env"
    except Exception:
        return p


def _upsert_env(key: str, value: str) -> None:
    """Create or update a single KEY=VALUE line in the .env file. Preserves comments and other keys."""
    env = _env_path()
    lines: list[str] = []
    found = False
    if env.exists():
        lines = env.read_text(encoding="utf-8").splitlines()
    new_lines: list[str] = []
    for line in lines:
        stripped = line.strip()
        # Keep comments / empty lines as-is
        if not stripped or stripped.startswith("#") or "=" not in line:
            new_lines.append(line)
            continue
        k = line.split("=", 1)[0].strip()
        if k == key:
            new_lines.append(f"{key}={value}")
            found = True
        else:
            new_lines.append(line)
    if not found:
        # ensure trailing newline before append
        if new_lines and new_lines[-1].strip() != "":
            new_lines.append("")
        new_lines.append(f"{key}={value}")
    env.write_text("\n".join(new_lines) + "\n", encoding="utf-8")


class AISettingsResponse(BaseModel):
    gemini_api_key_masked: Optional[str] = None
    openai_api_key_masked: Optional[str] = None
    gemini_model: str
    openai_model: str
    ai_provider: str
    ai_configured: bool
    gemini_configured: bool
    openai_configured: bool


class AISettingsUpdate(BaseModel):
    gemini_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None
    gemini_model: Optional[str] = None
    openai_model: Optional[str] = None
    ai_provider: Optional[str] = None


@router.get("/ai", response_model=AISettingsResponse)
async def get_ai_settings():
    return AISettingsResponse(
        gemini_api_key_masked=_mask(settings.GEMINI_API_KEY),
        openai_api_key_masked=_mask(settings.OPENAI_API_KEY),
        gemini_model=settings.GEMINI_MODEL,
        openai_model=settings.OPENAI_MODEL,
        ai_provider=settings.AI_PROVIDER,
        ai_configured=bool(settings.GEMINI_API_KEY or settings.OPENAI_API_KEY),
        gemini_configured=bool(settings.GEMINI_API_KEY),
        openai_configured=bool(settings.OPENAI_API_KEY),
    )


@router.post("/ai", response_model=AISettingsResponse)
async def update_ai_settings(payload: AISettingsUpdate):
    # Provider
    if payload.ai_provider is not None:
        p = payload.ai_provider.strip().lower()
        if p in ("gemini", "openai"):
            settings.AI_PROVIDER = p
            _upsert_env("AI_PROVIDER", p)

    # Gemini model
    if payload.gemini_model is not None:
        m = payload.gemini_model.strip()
        if m:
            settings.GEMINI_MODEL = m
            _upsert_env("GEMINI_MODEL", m)

    # OpenAI model
    if payload.openai_model is not None:
        m = payload.openai_model.strip()
        if m:
            settings.OPENAI_MODEL = m
            _upsert_env("OPENAI_MODEL", m)

    # Gemini key — ignore masked placeholder, empty string clears
    if payload.gemini_api_key is not None:
        raw = payload.gemini_api_key.strip()
        if "•" in raw:
            # masked value sent back by GET — treat as "no change"
            pass
        elif raw == "":
            settings.GEMINI_API_KEY = None
            _upsert_env("GEMINI_API_KEY", "")
        elif raw:
            settings.GEMINI_API_KEY = raw
            _upsert_env("GEMINI_API_KEY", raw)

    # OpenAI key
    if payload.openai_api_key is not None:
        raw = payload.openai_api_key.strip()
        if "•" in raw:
            pass
        elif raw == "":
            settings.OPENAI_API_KEY = None
            _upsert_env("OPENAI_API_KEY", "")
        elif raw:
            settings.OPENAI_API_KEY = raw
            _upsert_env("OPENAI_API_KEY", raw)

    return await get_ai_settings()
