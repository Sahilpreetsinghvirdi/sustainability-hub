# backend/app/api/v1/endpoints/plant.py
"""PlantSense — plant health diagnosis endpoints."""
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.core.config import settings
from app.core.logging import get_logger
from app.schemas.plant import PlantAnalysisResponse
from app.services.plant_analysis import PlantAnalyzerError, analyze_plant_image
from app.services.waste_analysis import active_provider, ai_configured

logger = get_logger(__name__)
router = APIRouter()

MAX_IMAGE_SIZE = 10 * 1024 * 1024
ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"}


@router.get("/status", tags=["PlantSense"])
async def plant_status():
    return {
        "ai_configured": ai_configured(),
        "provider": active_provider(),
        "model": settings.OPENAI_MODEL if active_provider() == "openai" else settings.GEMINI_MODEL,
    }


def _field(v: Optional[str], max_len: int = 200) -> str:
    return (v or "").strip()[:max_len]


@router.post("/analyze", response_model=PlantAnalysisResponse)
async def analyze_plant(
    file: UploadFile = File(..., description="Photo of the plant / leaf / crop"),
    crop: str = Form(default="", description="Crop/plant hint e.g. tomato, rice"),
    growth_stage: str = Form(default="", description="Seedling / vegetative / flowering / fruiting"),
    soil_type: str = Form(default="", description="Soil type if known"),
    notes: str = Form(default="", description="Symptoms or question e.g. yellow leaves"),
):
    if not ai_configured():
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="AI vision is not configured. Set GEMINI_API_KEY in backend/.env and restart.")
    mime = (file.content_type or "").lower().split(";")[0]
    if mime not in ALLOWED_MIME:
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail=f"Unsupported image type '{mime}'. Use JPEG, PNG or WebP.")
    image_bytes = await file.read()
    if len(image_bytes) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty file uploaded.")
    if len(image_bytes) > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="Image too large (max 10 MB).")
    context = {"crop": _field(crop), "growth_stage": _field(growth_stage), "soil_type": _field(soil_type), "notes": _field(notes, 1000)}
    try:
        return await analyze_plant_image(image_bytes, mime, context)
    except PlantAnalyzerError as exc:
        logger.warning("Plant analysis failed: %s", exc)
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc))
