# backend/app/services/plant_analysis.py
"""PlantSense — plant health diagnosis from a photo.

Reuses the same vision LLM pipeline as Waste/Agri, with a plant-pathologist persona.
"""
import base64
import time
from typing import Any, Dict, List, Optional

import httpx

from app.core.config import settings
from app.core.logging import get_logger
from app.schemas.plant import (
    CareStep,
    DiseaseInfo,
    HealthVerdict,
    PlantAnalysisResponse,
    PlantIdentification,
)
from app.services.waste_analysis import WasteAnalyzerError, _extract_json

logger = get_logger(__name__)

PROMPT_TEMPLATE = """You are a senior plant pathologist, agronomist and horticulturist with 30 years of field experience across Indian crops and gardens.

A user photographed a plant (whole plant, leaf, stem, fruit or flower in the attached photo) and wants a full health check.

FARMING CONTEXT (if provided):
- Crop / plant type hint: {crop}
- Growth stage: {growth_stage}
- Soil type: {soil_type}
- Recent notes / symptoms: {notes}

Analyze the photo with maximum accuracy:

1. Identify the plant/crop (read leaves/flowers/fruits; if unclear, say unknown).
2. Assess overall health (healthy / stressed / diseased / critical) and score 0-100.
3. List nutrient deficiencies visible (yellowing, chlorosis, etc.).
4. Diagnose diseases/pests: for each, give pathogen_type (fungus/bacteria/virus/pest/abiotic/unknown), confidence, severity, symptoms and treatment.
5. Provide a practical care plan (watering, light, pruning, hygiene) and specific fertilizer/manure recommendations suitable for Indian availability.
6. Give watering_guidance and light_guidance concisely.

Return this JSON EXACTLY:
{{"summary": str (2-3 sentences), "plant_identification": {{"name": str, "type": str, "confidence": float, "description": str}}, "health": {{"status": str, "score": int, "reasoning": str}}, "deficiencies": [], "diseases": [{{"name": str, "pathogen_type": str, "confidence": float, "severity": str, "symptoms": [], "treatment": str}}], "care_plan": [{{"title": str, "detail": str}}], "fertilizer_recommendations": [], "manures_suggested": [], "watering_guidance": str, "light_guidance": str, "environmental_notes": str, "recommendations": []}}

Rules:
- health.reasoning MUST reference visible symptoms in the photo.
- If the image is not a plant (e.g. garbage, product, animal, empty), set plant_identification.confidence low, health.status "unknown", score 0, and explain in summary that no plant was detected — do NOT hallucinate a diagnosis.
- Be conservative: if no disease is visible, return empty diseases list rather than inventing one.
- Consider Indian farming realities (local manures: FYM, vermicompost, neem cake; fertilizers: urea, DAP, NPK; availability).
- Respond ONLY with valid JSON.
"""


class PlantAnalyzerError(Exception):
    pass


def _fmt(v: Optional[str], default: str = "not specified") -> str:
    v = (v or "").strip()
    return v if v else default


async def _call_gemini(image_b64: str, mime_type: str, context: Dict[str, Any]) -> Dict[str, Any]:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent"
    prompt = PROMPT_TEMPLATE.format(
        crop=_fmt(context.get("crop")),
        growth_stage=_fmt(context.get("growth_stage")),
        soil_type=_fmt(context.get("soil_type")),
        notes=_fmt(context.get("notes"), "none"),
    )
    payload = {
        "contents": [{"parts": [{"text": prompt}, {"inline_data": {"mime_type": mime_type, "data": image_b64}}]}],
        "generationConfig": {"response_mime_type": "application/json", "temperature": 0.25, "maxOutputTokens": 4096},
    }
    async with httpx.AsyncClient(timeout=settings.AI_TIMEOUT_SECONDS) as client:
        resp = await client.post(url, json=payload, headers={"x-goog-api-key": settings.GEMINI_API_KEY})
    if resp.status_code != 200:
        raise PlantAnalyzerError(f"Gemini API error {resp.status_code}: {resp.text[:500]}")
    data = resp.json()
    try:
        parts = data["candidates"][0]["content"]["parts"]
        return _extract_json("".join(p.get("text", "") for p in parts))
    except WasteAnalyzerError as exc:
        raise PlantAnalyzerError(str(exc)) from exc
    except (KeyError, IndexError) as exc:
        raise PlantAnalyzerError(f"Unexpected Gemini response: {data}") from exc


async def _call_openai(image_b64: str, mime_type: str, context: Dict[str, Any]) -> Dict[str, Any]:
    prompt = PROMPT_TEMPLATE.format(
        crop=_fmt(context.get("crop")),
        growth_stage=_fmt(context.get("growth_stage")),
        soil_type=_fmt(context.get("soil_type")),
        notes=_fmt(context.get("notes"), "none"),
    )
    payload = {
        "model": settings.OPENAI_MODEL,
        "messages": [{"role": "user", "content": [{"type": "image_url", "image_url": {"url": f"data:{mime_type};base64,{image_b64}"}}, {"type": "text", "text": prompt}]}],
        "response_format": {"type": "json_object"},
        "max_tokens": 4096,
        "temperature": 0.25,
    }
    async with httpx.AsyncClient(timeout=settings.AI_TIMEOUT_SECONDS) as client:
        resp = await client.post("https://api.openai.com/v1/chat/completions", json=payload, headers={"Authorization": f"Bearer {settings.OPENAI_API_KEY}", "Content-Type": "application/json"})
    if resp.status_code != 200:
        raise PlantAnalyzerError(f"OpenAI API error {resp.status_code}: {resp.text[:500]}")
    data = resp.json()
    try:
        content = data["choices"][0]["message"]["content"]
        return _extract_json(content)
    except WasteAnalyzerError as exc:
        raise PlantAnalyzerError(str(exc)) from exc
    except (KeyError, IndexError) as exc:
        raise PlantAnalyzerError("Unexpected OpenAI response") from exc


def _clamp(v: Any, lo: float, hi: float, default: float) -> float:
    try:
        f = float(v)
    except (TypeError, ValueError):
        return default
    return max(lo, min(hi, f))


VALID_HEALTH = {"healthy", "stressed", "diseased", "critical", "unknown"}


def _normalize(data: Dict[str, Any], analyzer_model: str, elapsed_ms: int) -> PlantAnalysisResponse:
    pid_raw = data.get("plant_identification") if isinstance(data.get("plant_identification"), dict) else {}
    health_raw = data.get("health") if isinstance(data.get("health"), dict) else {}

    status = str(health_raw.get("status", "unknown")).lower().replace(" ", "_")
    if status not in VALID_HEALTH:
        status = "unknown"

    diseases: List[DiseaseInfo] = []
    for d in (data.get("diseases") or [])[:8]:
        if not isinstance(d, dict) or not d.get("name"):
            continue
        diseases.append(DiseaseInfo(
            name=str(d["name"])[:120],
            pathogen_type=str(d.get("pathogen_type", "unknown")).lower()[:20],
            confidence=_clamp(d.get("confidence", 0.5), 0, 1, 0.5),
            severity=str(d.get("severity", "medium")).lower()[:20],
            symptoms=[str(s) for s in (d.get("symptoms") or [])][:6],
            treatment=str(d.get("treatment", "")),
        ))

    care: List[CareStep] = []
    for s in (data.get("care_plan") or [])[:8]:
        if isinstance(s, dict) and s.get("title"):
            care.append(CareStep(title=str(s["title"])[:120], detail=str(s.get("detail", ""))))

    return PlantAnalysisResponse(
        summary=str(data.get("summary", "")) or "No analysis summary returned.",
        plant_identification=PlantIdentification(
            name=str(pid_raw.get("name", "Unknown plant"))[:150],
            type=str(pid_raw.get("type", "unknown"))[:80],
            confidence=_clamp(pid_raw.get("confidence", 0.5), 0, 1, 0.5),
            description=str(pid_raw.get("description", "")),
        ),
        health=HealthVerdict(
            status=status,
            score=int(_clamp(health_raw.get("score", 50), 0, 100, 50)),
            reasoning=str(health_raw.get("reasoning", "")),
        ),
        deficiencies=[str(x) for x in (data.get("deficiencies") or [])][:10],
        diseases=diseases,
        care_plan=care,
        fertilizer_recommendations=[str(x) for x in (data.get("fertilizer_recommendations") or [])][:10],
        manures_suggested=[str(x) for x in (data.get("manures_suggested") or [])][:10],
        watering_guidance=str(data.get("watering_guidance", "")),
        light_guidance=str(data.get("light_guidance", "")),
        environmental_notes=str(data.get("environmental_notes", "")),
        recommendations=[str(x) for x in (data.get("recommendations") or [])][:10],
        analyzer_model=analyzer_model,
        processing_time_ms=elapsed_ms,
    )


async def analyze_plant_image(image_bytes: bytes, mime_type: str, context: Dict[str, Any]) -> PlantAnalysisResponse:
    provider = settings.AI_PROVIDER.lower()
    if provider == "gemini" and not settings.GEMINI_API_KEY:
        if settings.OPENAI_API_KEY:
            provider = "openai"
        else:
            raise PlantAnalyzerError("AI is not configured. Set GEMINI_API_KEY in backend/.env.")
    if provider == "openai" and not settings.OPENAI_API_KEY:
        if settings.GEMINI_API_KEY:
            provider = "gemini"
        else:
            raise PlantAnalyzerError("AI is not configured. Set OPENAI_API_KEY in backend/.env.")

    image_b64 = base64.b64encode(image_bytes).decode("utf-8")
    started = time.monotonic()
    logger.info("Running plant analysis via %s (%s)...", provider, mime_type)
    if provider == "openai":
        raw = await _call_openai(image_b64, mime_type, context)
        model_name = settings.OPENAI_MODEL
    else:
        raw = await _call_gemini(image_b64, mime_type, context)
        model_name = settings.GEMINI_MODEL
    elapsed_ms = int((time.monotonic() - started) * 1000)
    result = _normalize(raw, analyzer_model=model_name, elapsed_ms=elapsed_ms)
    logger.info("Plant analysis done in %dms: %s (%d/100)", elapsed_ms, result.health.status, result.health.score)
    return result
