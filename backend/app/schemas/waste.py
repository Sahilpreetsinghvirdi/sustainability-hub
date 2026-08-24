# backend/app/schemas/waste.py
"""Schemas for the AI garbage-image analyzer."""
from typing import List, Optional
from pydantic import BaseModel, Field


class HazardInfo(BaseModel):
    level: str = Field(description="low | medium | high | critical")
    score: int = Field(ge=0, le=100, description="Harmfulness score 0-100")
    toxins: List[str] = Field(default_factory=list, description="Specific toxins / harmful compounds present")
    health_risks: List[str] = Field(default_factory=list)
    environmental_risks: Optional[List[str]] = Field(default_factory=list)


class DisposalInfo(BaseModel):
    method: str = Field(description="How to dispose of it correctly")
    destination: str = Field(description="Where it can be sent / used (recycler, compost, e-waste center, etc.)")
    recyclable: bool = False


class MaterialAnalysis(BaseModel):
    name: str
    category: str = Field(description="plastic | paper | organic | metal | glass | e_waste | textile | hazardous | rubber | construction | other")
    percentage: float = Field(ge=0, le=100, description="Estimated share of the pile by visible mass/volume")
    confidence: float = Field(ge=0, le=1, default=0.7)
    description: str = ""
    hazard: HazardInfo
    common_uses: List[str] = Field(default_factory=list, description="What this material is typically used for")
    reuse_ideas: List[str] = Field(default_factory=list, description="Practical ways to reuse this item/material")
    eco_alternatives: List[str] = Field(default_factory=list, description="Greener alternatives to this product/material")
    disposal: DisposalInfo


class WasteAnalysisResponse(BaseModel):
    summary: str
    overall_hazard: HazardInfo
    materials: List[MaterialAnalysis]
    recommendations: List[str] = Field(default_factory=list, description="Safe handling & segregation advice")
    environmental_impact: str = ""
    estimated_decomposition: Optional[str] = None
    analyzer_model: str = ""
    processing_time_ms: int = 0
