# backend/app/services/agri_analysis.py
"""AI-powered fertilizer/manure suitability advisor (AgriSense).

Uses the same vision LLM pipeline as the waste analyzer, but with an
agronomist persona. The user supplies a photo of a fertilizer/manure product
plus farming context (crop, growth stage, soil type, irrigation, season) and
gets a structured suitability assessment.
"""
import base64
import time
from typing import Any, Dict, List, Optional

import httpx

from app.core.config import settings
from app.core.logging import get_logger
from app.schemas.agri import (
    AgriAnalysisResponse,
    ApplicationStep,
    CropFit,
    NutrientProfile,
    ProductIdentification,
    SuitabilityVerdict,
)
from app.services.waste_analysis import WasteAnalyzerError, _extract_json

logger = get_logger(__name__)

PROMPT_TEMPLATE = """You are a senior agronomist and soil scientist with 30 years of field experience across Indian farms.

A farmer photographed a fertilizer / manure / soil amendment product (the bag, pile or sample in the attached photo).
They want to know whether it is good for THEIR crop under THEIR conditions.

FARMING CONTEXT:
- Crop: {crop}
- Growth stage: {growth_stage}
- Soil type: {soil_type}
- Irrigation: {irrigation}
- Season: {season}
- Farmer notes/question: {notes}

Analyze the photo with maximum accuracy:
1. Identify the product (read any label/bag text visible; otherwise identify from appearance).
2. Estimate its nutrient profile.
3. Judge how suitable it is FOR THIS CROP UNDER THESE CONDITIONS specifically — not generically.

Return this JSON structure EXACTLY:
{{"summary": str (2-3 sentences), "product_identification": {{"name": str, "type": str, "confidence": float, "description": str}}, "nutrient_profile": {{"npk": str, "organic_matter": str|null, "micronutrients": [], "ph_effect": str}}, "verdict": {{"suitability": "beneficial|conditionally_beneficial|neutral|harmful", "score": int 0-100, "reasoning": str}}, "crop_fit": {{"suitable_for_current_crop": bool, "explanation": str}}, "benefits": [], "risks_cautions": [], "application_guidance": [{{"title": str, "detail": str}}], "dosage": str, "best_timing": str, "alternatives": [], "environmental_notes": str, "recommendations": []}}

Rules:
- verdict.reasoning MUST reference the specific crop/soil/stage given above.
- dosage & best_timing: concrete numbers where possible (kg/hectare or g/plant, growth-stage timing).
- risks_cautions: over-application, crop-specific harm (e.g. chloride sensitivity), soil effects.
- Consider Indian farming realities (FPO guidance, soil health card scheme, local availability).
- If the image shows no recognizable fertilizer/manure/soil product, set confidence low, suitability neutral, and explain in summary.
- Respond ONLY with valid JSON."""


class AgriAdvisorError(Exception):
    pass


def _fmt(value: Optional[str], default: str = "not specified") -> str:
    v = (value or "").strip()
    return v if v else default


async def _call_gemini(image_b64: str, mime_type: str, context: Dict[str, Any]) -> Dict[str, Any]:
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{settings.GEMINI_MODEL}:generateContent"
    )
    prompt = PROMPT_TEMPLATE.format(
        crop=_fmt(context.get("crop")),
        growth_stage=_fmt(context.get("growth_stage")),
        soil_type=_fmt(context.get("soil_type")),
        irrigation=_fmt(context.get("irrigation")),
        season=_fmt(context.get("season")),
        notes=_fmt(context.get("notes"), "none"),
    )
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt},
                    {"inline_data": {"mime_type": mime_type, "data": image_b64}},
                ]
            }
        ],
        "generationConfig": {
            "response_mime_type": "application/json",
            "temperature": 0.2,
            "maxOutputTokens": 4096,
        },
    }
    async with httpx.AsyncClient(timeout=settings.AI_TIMEOUT_SECONDS) as client:
        response = await client.post(
            url,
            json=payload,
            headers={"x-goog-api-key": settings.GEMINI_API_KEY},
        )
    if response.status_code != 200:
        detail = response.text[:500]
        raise AgriAdvisorError(f"Gemini API error {response.status_code}: {detail}")
    data = response.json()
    try:
        parts = data["candidates"][0]["content"]["parts"]
        return _extract_json("".join(p.get("text", "") for p in parts))
    except WasteAnalyzerError as exc:
        raise AgriAdvisorError(str(exc)) from exc
    except (KeyError, IndexError) as exc:
        raise AgriAdvisorError(f"Unexpected Gemini response structure: {data}") from exc


async def _call_openai(image_b64: str, mime_type: str, context: Dict[str, Any]) -> Dict[str, Any]:
    prompt = PROMPT_TEMPLATE.format(
        crop=_fmt(context.get("crop")),
        growth_stage=_fmt(context.get("growth_stage")),
        soil_type=_fmt(context.get("soil_type")),
        irrigation=_fmt(context.get("irrigation")),
        season=_fmt(context.get("season")),
        notes=_fmt(context.get("notes"), "none"),
    )
    payload = {
        "model": settings.OPENAI_MODEL,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "image_url", "image_url": {"url": f"data:{mime_type};base64,{image_b64}"}},
                    {"type": "text", "text": prompt},
                ],
            }
        ],
        "response_format": {"type": "json_object"},
        "max_tokens": 4096,
        "temperature": 0.2,
    }
    async with httpx.AsyncClient(timeout=settings.AI_TIMEOUT_SECONDS) as client:
        response = await client.post(
            "https://api.openai.com/v1/chat/completions",
            json=payload,
            headers={
                "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                "Content-Type": "application/json",
            },
        )
    if response.status_code != 200:
        detail = response.text[:500]
        raise AgriAdvisorError(f"OpenAI API error {response.status_code}: {detail}")
    data = response.json()
    try:
        content = data["choices"][0]["message"]["content"]
        return _extract_json(content)
    except WasteAnalyzerError as exc:
        raise AgriAdvisorError(str(exc)) from exc
    except (KeyError, IndexError) as exc:
        raise AgriAdvisorError("Unexpected OpenAI response structure") from exc


def _clamp(value: Any, lo: float, hi: float, default: float) -> float:
    try:
        v = float(value)
    except (TypeError, ValueError):
        return default
    return max(lo, min(hi, v))


VALID_SUITABILITY = {"beneficial", "conditionally_beneficial", "neutral", "harmful"}


def _normalize(data: Dict[str, Any], analyzer_model: str, elapsed_ms: int) -> AgriAnalysisResponse:
    pid_raw = data.get("product_identification") if isinstance(data.get("product_identification"), dict) else {}
    npk_raw = data.get("nutrient_profile") if isinstance(data.get("nutrient_profile"), dict) else {}
    verdict_raw = data.get("verdict") if isinstance(data.get("verdict"), dict) else {}
    fit_raw = data.get("crop_fit") if isinstance(data.get("crop_fit"), dict) else {}

    suitability = str(verdict_raw.get("suitability", "neutral")).lower().replace("-", "_").replace(" ", "_")
    if suitability not in VALID_SUITABILITY:
        suitability = "neutral"

    guidance: List[ApplicationStep] = []
    for step in (data.get("application_guidance") or [])[:8]:
        if isinstance(step, dict) and step.get("title"):
            guidance.append(
                ApplicationStep(
                    title=str(step["title"])[:120],
                    detail=str(step.get("detail", "")),
                )
            )

    micros = [str(m) for m in (npk_raw.get("micronutrients") or [])][:12]

    return AgriAnalysisResponse(
        summary=str(data.get("summary", "")) or "No analysis summary returned.",
        product_identification=ProductIdentification(
            name=str(pid_raw.get("name", "Unknown product"))[:150],
            type=str(pid_raw.get("type", "unknown"))[:80],
            confidence=_clamp(pid_raw.get("confidence", 0.5), 0, 1, 0.5),
            description=str(pid_raw.get("description", "")),
        ),
        nutrient_profile=NutrientProfile(
            npk=str(npk_raw.get("npk", ""))[:200],
            organic_matter=(str(npk_raw["organic_matter"]) if npk_raw.get("organic_matter") is not None else None),
            micronutrients=micros,
            ph_effect=str(npk_raw.get("ph_effect", "")),
        ),
        verdict=SuitabilityVerdict(
            suitability=suitability,
            score=int(_clamp(verdict_raw.get("score", 50), 0, 100, 50)),
            reasoning=str(verdict_raw.get("reasoning", "")),
        ),
        crop_fit=CropFit(
            suitable_for_current_crop=bool(fit_raw.get("suitable_for_current_crop", False)),
            explanation=str(fit_raw.get("explanation", "")),
        ),
        benefits=[str(b) for b in (data.get("benefits") or [])][:10],
        risks_cautions=[str(r) for r in (data.get("risks_cautions") or [])][:10],
        application_guidance=guidance,
        dosage=str(data.get("dosage", "")),
        best_timing=str(data.get("best_timing", "")),
        alternatives=[str(a) for a in (data.get("alternatives") or [])][:10],
        environmental_notes=str(data.get("environmental_notes", "")),
        recommendations=[str(r) for r in (data.get("recommendations") or [])][:10],
        analyzer_model=analyzer_model,
        processing_time_ms=elapsed_ms,
    )


async def analyze_fertilizer_image(
    image_bytes: bytes,
    mime_type: str,
    context: Dict[str, Any],
) -> AgriAnalysisResponse:
    """Run AI agronomy analysis on a fertilizer/manure photo."""
    provider = settings.AI_PROVIDER.lower()
    if provider == "gemini" and not settings.GEMINI_API_KEY:
        if settings.OPENAI_API_KEY:
            provider = "openai"
        else:
            raise AgriAdvisorError(
                "AI is not configured. Set GEMINI_API_KEY (or switch AI_PROVIDER to 'openai' "
                "and set OPENAI_API_KEY) in backend/.env."
            )
    if provider == "openai" and not settings.OPENAI_API_KEY:
        if settings.GEMINI_API_KEY:
            provider = "gemini"
        else:
            raise AgriAdvisorError("AI is not configured. Set OPENAI_API_KEY in backend/.env.")

    image_b64 = base64.b64encode(image_bytes).decode("utf-8")
    started = time.monotonic()
    logger.info("Running agri analysis via %s (%s)...", provider, mime_type)

    if provider == "openai":
        raw = await _call_openai(image_b64, mime_type, context)
        model_name = settings.OPENAI_MODEL
    else:
        raw = await _call_gemini(image_b64, mime_type, context)
        model_name = settings.GEMINI_MODEL

    elapsed_ms = int((time.monotonic() - started) * 1000)
    result = _normalize(raw, analyzer_model=model_name, elapsed_ms=elapsed_ms)
    logger.info(
        "Agri analysis done in %dms: %s (%d/100)",
        elapsed_ms, result.verdict.suitability, result.verdict.score,
    )
    return result
