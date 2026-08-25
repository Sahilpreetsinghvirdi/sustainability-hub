# backend/app/schemas/plant.py
"""Pydantic models for PlantSense — plant health diagnosis."""
from typing import List, Optional

from pydantic import BaseModel, Field


class PlantIdentification(BaseModel):
    name: str = Field(default="Unknown plant")
    type: str = Field(default="unknown", description="e.g. tomato, rice, rose, unknown")
    confidence: float = Field(default=0.0, ge=0, le=1)
    description: str = ""


class HealthVerdict(BaseModel):
    status: str = Field(default="unknown", description="healthy | stressed | diseased | critical | unknown")
    score: int = Field(default=50, ge=0, le=100, description="Overall health score 0-100 (100 = thriving)")
    reasoning: str = ""


class DiseaseInfo(BaseModel):
    name: str
    pathogen_type: str = Field(default="unknown", description="fungus | bacteria | virus | pest | abiotic | unknown")
    confidence: float = Field(default=0.0, ge=0, le=1)
    severity: str = Field(default="medium", description="low | medium | high | critical")
    symptoms: List[str] = []
    treatment: str = ""


class CareStep(BaseModel):
    title: str
    detail: str


class PlantAnalysisResponse(BaseModel):
    summary: str
    plant_identification: PlantIdentification
    health: HealthVerdict
    deficiencies: List[str] = []
    diseases: List[DiseaseInfo] = []
    care_plan: List[CareStep] = []
    fertilizer_recommendations: List[str] = []
    manures_suggested: List[str] = []
    watering_guidance: str = ""
    light_guidance: str = ""
    environmental_notes: str = ""
    recommendations: List[str] = []
    analyzer_model: str = ""
    processing_time_ms: int = 0
