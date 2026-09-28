# app/routes/dashboard_routes.py

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from schemas.dashboard import DashboardResponse
from services.dashboard_services import get_dashboard_summary
from utils.db import get_async_db
from .auth_routes import get_current_user


router = APIRouter()


@router.get(
    "/",
    response_model=DashboardResponse,
)
async def get_dashboard(
    db: AsyncSession = Depends(get_async_db),
    user=Depends(get_current_user),
):
    return await get_dashboard_summary(db)