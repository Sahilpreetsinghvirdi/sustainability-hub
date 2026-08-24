# backend/app/api/v1/endpoints/agri.py
"""AgriSense — fertilizer/manure suitability advisor endpoints."""
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.core.config import settings
from app.core.logging import get_logger
from app.schemas.agri import AgriAnalysisResponse
from app.services.agri_analysis import AgriAdvisorError, analyze_fertilizer_image
from app.services.waste_analysis import active_provider, ai_configured

logger = get_logger(__name__)

router = APIRouter()

MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"}


@router.get("/status", tags=["AgriSense"])
async def advisor_status():
    """Report whether the AI vision provider is configured."""
    return {
        "ai_configured": ai_configured(),
        "provider": active_provider(),
        "model": settings.OPENAI_MODEL if active_provider() == "openai" else settings.GEMINI_MODEL,
    }


def _field(form_value: Optional[str], max_len: int = 200) -> str:
    return (form_value or "").strip()[:max_len]


@router.post("/analyze", response_model=AgriAnalysisResponse)
async def analyze_fertilizer(
    file: UploadFile = File(..., description="Photo of the fertilizer/manure product"),
    crop: str = Form(..., description="Crop being grown, e.g. wheat, tomato"),
    growth_stage: str = Form(default="", description="Seedling / vegetative / flowering / fruiting / not sure"),
    soil_type: str = Form(default="", description="Alluvial / black / red / sandy / loamy / clayey / not sure"),
    irrigation: str = Form(default="", description="Rainfed / flood / drip / sprinkler"),
    season: str = Form(default="", description="Kharif / Rabi / Zaid / year-round"),
    notes: str = Form(default="", description="Optional farmer question or extra context"),
):
    """Assess whether a fertilizer/manure product is suitable for the given crop & conditions."""
    if not ai_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "AI vision is not configured on this server. Set GEMINI_API_KEY "
                "(or OPENAI_API_KEY) in backend/.env and restart."
            ),
        )

    mime = (file.content_type or "").lower().split(";")[0]
    if mime not in ALLOWED_MIME:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported image type '{mime}'. Use JPEG, PNG or WebP.",
        )

    image_bytes = await file.read()
    if len(image_bytes) == 0:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Empty file uploaded.")
    if len(image_bytes) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Image too large (max 10 MB).",
        )

    context = {
        "crop": _field(crop),
        "growth_stage": _field(growth_stage),
        "soil_type": _field(soil_type),
        "irrigation": _field(irrigation),
        "season": _field(season),
        "notes": _field(notes, 1000),
    }

    try:
        return await analyze_fertilizer_image(image_bytes, mime, context)
    except AgriAdvisorError as exc:
        logger.warning("Agri analysis failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        )
