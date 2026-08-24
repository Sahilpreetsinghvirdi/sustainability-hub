# backend/app/services/waste_analysis.py
"""AI-powered garbage image analysis.

Uses a vision LLM (Google Gemini or OpenAI) to identify materials in a photo of
garbage and return a structured breakdown: composition percentages, harmfulness,
toxins, uses, eco-alternatives, and disposal guidance.
"""
import base64
import json
import re
import time
from typing import Any, Dict, List, Optional

import httpx

from app.core.config import settings
from app.core.logging import get_logger
from app.schemas.waste import (
    DisposalInfo,
    HazardInfo,
    MaterialAnalysis,
    WasteAnalysisResponse,
)

logger = get_logger(__name__)

PROMPT_TEMPLATE = """You are an expert waste-management scientist, materials engineer and environmental toxicologist.

Analyze the attached photo of garbage/waste with maximum accuracy. Identify EVERY distinct material or object you can see.

For each material provide:
1. name: specific item/material (e.g. "PET plastic water bottle", "banana peel")
2. category: one of [plastic, paper, organic, metal, glass, e_waste, textile, hazardous, rubber, construction, other]
3. percentage: estimated share of the total pile by visible mass/volume. ALL percentages must sum to ~100.
4. confidence: your detection confidence 0.0-1.0
5. description: 1-2 sentence description
6. hazard: {{level: low|medium|high|critical, score: 0-100 harmfulness, toxins: [specific chemicals/compounds e.g. BPA, phthalates, lead, dioxins], health_risks: [...], environmental_risks: [...]}}
7. common_uses: what this material is typically used for (2-4 items)
8. reuse_ideas: practical ways this item could be reused/upcycled at home (1-3 items)
9. eco_alternatives: greener replacements for this product (1-3 items)
10. disposal: {{method: correct disposal method, destination: where it should go (recycling facility, compost, e-waste collection center, hazardous waste facility, local scrap dealer/kabadiwala etc.), recyclable: bool}}

Also return:
- summary: 2-3 sentence overview of the pile
- overall_hazard: aggregate hazard for the whole pile (same shape as per-material hazard)
- recommendations: 3-5 bullet points on safe handling, segregation and next steps
- environmental_impact: short paragraph on impact if landfilled/left in open
- estimated_decomposition: rough decomposition time range of the longest-lived material (e.g. "450+ years")

Rules:
- Base everything ONLY on what is visible; use realistic estimates where exact identification is impossible.
- Consider the Indian context for disposal destinations (dry/wet waste segregation, kabadiwala, municipal collection).
- If the image contains no recognizable waste, return empty materials list and explain in summary.
- Respond ONLY with valid JSON matching exactly this structure:
{{"summary": str, "overall_hazard": {{"level": str, "score": int, "toxins": [], "health_risks": [], "environmental_risks": []}}, "materials": [{{"name": str, "category": str, "percentage": float, "confidence": float, "description": str, "hazard": {{"level": str, "score": int, "toxins": [], "health_risks": [], "environmental_risks": []}}, "common_uses": [], "reuse_ideas": [], "eco_alternatives": [], "disposal": {{"method": str, "destination": str, "recyclable": bool}}}}], "recommendations": [], "environmental_impact": str, "estimated_decomposition": str}}

User question: {question}"""


class WasteAnalyzerError(Exception):
    pass


def _extract_json(text: str) -> Dict[str, Any]:
    """Extract a JSON object from model output, tolerating code fences."""
    text = text.strip()
    fence_match = re.search(r"```(?:json)?\s*(\{.*\})\s*```", text, re.DOTALL)
    if fence_match:
        text = fence_match.group(1)
    else:
        brace_start = text.find("{")
        brace_end = text.rfind("}")
        if brace_start != -1 and brace_end > brace_start:
            text = text[brace_start : brace_end + 1]
    try:
        return json.loads(text)
    except json.JSONDecodeError as exc:
        raise WasteAnalyzerError(f"Model returned invalid JSON: {exc}") from exc


async def _call_gemini(image_b64: str, mime_type: str, question: str) -> Dict[str, Any]:
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{settings.GEMINI_MODEL}:generateContent"
    )
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": PROMPT_TEMPLATE.format(question=question)},
                    {
                        "inline_data": {
                            "mime_type": mime_type,
                            "data": image_b64,
                        }
                    },
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
        raise WasteAnalyzerError(f"Gemini API error {response.status_code}: {detail}")
    data = response.json()
    try:
        parts = data["candidates"][0]["content"]["parts"]
        return _extract_json("".join(p.get("text", "") for p in parts))
    except (KeyError, IndexError) as exc:
        raise WasteAnalyzerError(f"Unexpected Gemini response structure: {data}") from exc


async def _call_openai(image_b64: str, mime_type: str, question: str) -> Dict[str, Any]:
    payload = {
        "model": settings.OPENAI_MODEL,
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:{mime_type};base64,{image_b64}"},
                    },
                    {"type": "text", "text": PROMPT_TEMPLATE.format(question=question)},
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
        raise WasteAnalyzerError(f"OpenAI API error {response.status_code}: {detail}")
    data = response.json()
    try:
        content = data["choices"][0]["message"]["content"]
        return _extract_json(content)
    except (KeyError, IndexError) as exc:
        raise WasteAnalyzerError(f"Unexpected OpenAI response structure") from exc


def _clamp(value: float, lo: float, hi: float, default: float) -> float:
    try:
        v = float(value)
    except (TypeError, ValueError):
        return default
    return max(lo, min(hi, v))


def _parse_hazard(raw: Any, level_default: str = "low") -> HazardInfo:
    raw = raw if isinstance(raw, dict) else {}
    valid_levels = {"low", "medium", "high", "critical"}
    level = str(raw.get("level", level_default)).lower()
    if level not in valid_levels:
        level = level_default
    return HazardInfo(
        level=level,
        score=int(_clamp(raw.get("score", 10), 0, 100, 10)),
        toxins=[str(t) for t in (raw.get("toxins") or [])][:15],
        health_risks=[str(r) for r in (raw.get("health_risks") or [])][:15],
        environmental_risks=[str(r) for r in (raw.get("environmental_risks") or [])][:15],
    )


def _normalize(data: Dict[str, Any], analyzer_model: str, elapsed_ms: int) -> WasteAnalysisResponse:
    materials_raw = data.get("materials") or []
    materials: List[MaterialAnalysis] = []
    for m in materials_raw[:20]:
        if not isinstance(m, dict) or not m.get("name"):
            continue
        disposal_raw = m.get("disposal") if isinstance(m.get("disposal"), dict) else {}
        materials.append(
            MaterialAnalysis(
                name=str(m["name"])[:120],
                category=str(m.get("category", "other")).lower().replace("-", "_"),
                percentage=_clamp(m.get("percentage", 0), 0, 100, 0),
                confidence=_clamp(m.get("confidence", 0.7), 0, 1, 0.7),
                description=str(m.get("description", "")),
                hazard=_parse_hazard(m.get("hazard")),
                common_uses=[str(u) for u in (m.get("common_uses") or [])][:8],
                reuse_ideas=[str(u) for u in (m.get("reuse_ideas") or [])][:8],
                eco_alternatives=[str(a) for a in (m.get("eco_alternatives") or [])][:8],
                disposal=DisposalInfo(
                    method=str(disposal_raw.get("method", "Consult local municipal guidelines")),
                    destination=str(disposal_raw.get("destination", "Municipal dry/wet waste collection")),
                    recyclable=bool(disposal_raw.get("recyclable", False)),
                ),
            )
        )

    # Normalize composition so percentages always sum to 100 when possible.
    total = sum(m.percentage for m in materials)
    if total > 0:
        scale = 100.0 / total
        materials = [
            m.model_copy(update={"percentage": round(m.percentage * scale, 1)})
            for m in materials
        ]
    materials.sort(key=lambda m: m.percentage, reverse=True)

    return WasteAnalysisResponse(
        summary=str(data.get("summary", "")) or "No analysis summary returned.",
        overall_hazard=_parse_hazard(data.get("overall_hazard")),
        materials=materials,
        recommendations=[str(r) for r in (data.get("recommendations") or [])][:10],
        environmental_impact=str(data.get("environmental_impact", "")),
        estimated_decomposition=data.get("estimated_decomposition"),
        analyzer_model=analyzer_model,
        processing_time_ms=elapsed_ms,
    )


async def analyze_waste_image(
    image_bytes: bytes,
    mime_type: str,
    question: Optional[str] = None,
) -> WasteAnalysisResponse:
    """Run AI analysis on a garbage photo and return a validated structured result."""
    provider = settings.AI_PROVIDER.lower()
    if provider == "gemini" and not settings.GEMINI_API_KEY:
        raise WasteAnalyzerError(
            "AI is not configured. Set GEMINI_API_KEY (or switch AI_PROVIDER to 'openai' "
            "and set OPENAI_API_KEY) in backend/.env — see backend/.env.example."
        )
    if provider == "openai" and not settings.OPENAI_API_KEY:
        # Graceful fallback: user only has a Gemini key but config says openai.
        if settings.GEMINI_API_KEY:
            provider = "gemini"
        else:
            raise WasteAnalyzerError(
                "AI is not configured. Set OPENAI_API_KEY in backend/.env."
            )

    image_b64 = base64.b64encode(image_bytes).decode("utf-8")
    question = (question or "").strip() or "Analyze this garbage/waste image."

    started = time.monotonic()
    logger.info("Running waste analysis via %s (%s)...", provider, mime_type)

    if provider == "openai":
        raw = await _call_openai(image_b64, mime_type, question)
        model_name = settings.OPENAI_MODEL
    else:
        raw = await _call_gemini(image_b64, mime_type, question)
        model_name = settings.GEMINI_MODEL

    elapsed_ms = int((time.monotonic() - started) * 1000)
    result = _normalize(raw, analyzer_model=model_name, elapsed_ms=elapsed_ms)
    logger.info(
        "Waste analysis done in %dms: %d materials, hazard=%s",
        elapsed_ms, len(result.materials), result.overall_hazard.level,
    )
    return result


def ai_configured() -> bool:
    """True if any vision provider key is present."""
    return bool(settings.GEMINI_API_KEY or settings.OPENAI_API_KEY)


def active_provider() -> Optional[str]:
    if settings.AI_PROVIDER == "openai":
        return "openai" if settings.OPENAI_API_KEY else ("gemini" if settings.GEMINI_API_KEY else None)
    return "gemini" if settings.GEMINI_API_KEY else ("openai" if settings.OPENAI_API_KEY else None)
