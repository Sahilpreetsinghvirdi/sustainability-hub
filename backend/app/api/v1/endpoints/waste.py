# backend/app/api/v1/endpoints/waste.py
"""AI garbage-image analysis endpoints."""
from fastapi import APIRouter, File, HTTPException, UploadFile, Form, status

from app.core.config import settings
from app.core.logging import get_logger
from app.schemas.waste import WasteAnalysisResponse
from app.services.waste_analysis import (
    WasteAnalyzerError,
    active_provider,
    ai_configured,
    analyze_waste_image,
)

logger = get_logger(__name__)

router = APIRouter()

MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"}


@router.get("/status", tags=["Waste Analyzer"])
async def analyzer_status():
    """Report whether the AI vision provider is configured."""
    return {
        "ai_configured": ai_configured(),
        "provider": active_provider(),
        "model": settings.OPENAI_MODEL if active_provider() == "openai" else settings.GEMINI_MODEL,
    }


@router.post("/analyze", response_model=WasteAnalysisResponse)
async def analyze_garbage_image(
    file: UploadFile = File(..., description="Photo of the garbage/waste to analyze"),
    question: str = Form(default="", description="Optional extra question about the image"),
):
    """Analyze a photo of garbage: materials & percentages, harmfulness/toxins,
    uses, eco-alternatives and where each material can be used/recycled."""
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

    try:
        return await analyze_waste_image(image_bytes, mime, question)
    except WasteAnalyzerError as exc:
        logger.warning("Waste analysis failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        )
