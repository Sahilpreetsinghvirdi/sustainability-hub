# backend/app/api/v1/router.py
from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    users,
    households,
    carbon,
    energy,
    food_waste,
    dashboard,
    sync,
    health,
    waste,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(households.router, prefix="/households", tags=["Households"])
api_router.include_router(carbon.router, prefix="/carbon", tags=["Carbon"])
api_router.include_router(energy.router, prefix="/energy", tags=["Energy"])
api_router.include_router(food_waste.router, prefix="/food-waste", tags=["Food Waste"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(sync.router, prefix="/sync", tags=["Sync"])
api_router.include_router(health.router, prefix="/health", tags=["Health"])
api_router.include_router(waste.router, prefix="/waste", tags=["Waste Analyzer"])