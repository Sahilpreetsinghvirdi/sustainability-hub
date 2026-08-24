# backend/app/schemas/agri.py
"""Pydantic models for the AgriSense fertilizer advisor."""
from typing import List, Optional

from pydantic import BaseModel, Field


class ProductIdentification(BaseModel):
    name: str = Field(default="Unknown product")
    type: str = Field(default="unknown", description="e.g. organic manure, urea, DAP, NPK blend, compost, bio-fertilizer")
    confidence: float = Field(default=0.0, ge=0, le=1)
    description: str = ""


class NutrientProfile(BaseModel):
    npk: str = Field(default="", description="e.g. 'N 46% · P 0% · K 0%' or approximate ratio")
    organic_matter: Optional[str] = None
    micronutrients: List[str] = []
    ph_effect: str = ""


class SuitabilityVerdict(BaseModel):
    suitability: str = Field(default="neutral", description="beneficial | conditionally_beneficial | neutral | harmful")
    score: int = Field(default=50, ge=0, le=100, description="Suitability score for the specified crop & conditions")
    reasoning: str = ""


class CropFit(BaseModel):
    suitable_for_current_crop: bool = False
    explanation: str = ""


class ApplicationStep(BaseModel):
    title: str
    detail: str


class AgriAnalysisResponse(BaseModel):
    summary: str
    product_identification: ProductIdentification
    nutrient_profile: NutrientProfile
    verdict: SuitabilityVerdict
    crop_fit: CropFit
    benefits: List[str] = []
    risks_cautions: List[str] = []
    application_guidance: List[ApplicationStep] = []
    dosage: str = ""
    best_timing: str = ""
    alternatives: List[str] = []
    environmental_notes: str = ""
    recommendations: List[str] = []
    analyzer_model: str = ""
    processing_time_ms: int = 0
