# app/routes/equipment_profiles_routes.py

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from schemas.equipment_profiles import (
    EquipmentProfileCreate,
    EquipmentProfileResponse,
    EquipmentProfileUpdate,
)
from services.equipment_profiles_services import (
    create_equipment_profile,
    delete_equipment_profile,
    get_equipment_profile,
    get_equipment_profiles,
    update_equipment_profile,
)
from utils.csrf import verify_csrf
from utils.db import get_async_db
from .auth_routes import get_current_user


router = APIRouter()


@router.post(
    "/",
    response_model=EquipmentProfileResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_profile(
    request: Request,
    profile_data: EquipmentProfileCreate,
    db: AsyncSession = Depends(get_async_db),
    user=Depends(get_current_user),
):
    verify_csrf(request)

    return await create_equipment_profile(db, profile_data)


@router.get(
    "/",
    response_model=list[EquipmentProfileResponse],
)
async def get_profiles(
    db: AsyncSession = Depends(get_async_db),
):
    return await get_equipment_profiles(db)


@router.get(
    "/{profile_id}",
    response_model=EquipmentProfileResponse,
)
async def get_profile(
    profile_id: int,
    db: AsyncSession = Depends(get_async_db),
):
    profile = await get_equipment_profile(db, profile_id)

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment profile not found",
        )

    return profile


@router.patch(
    "/{profile_id}",
    response_model=EquipmentProfileResponse,
)
async def update_profile(
    request: Request,
    profile_id: int,
    profile_data: EquipmentProfileUpdate,
    db: AsyncSession = Depends(get_async_db),
    user=Depends(get_current_user),
):
    verify_csrf(request)

    profile = await update_equipment_profile(
        db,
        profile_id,
        profile_data,
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment profile not found",
        )

    return profile


@router.delete(
    "/{profile_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_profile(
    request: Request,
    profile_id: int,
    db: AsyncSession = Depends(get_async_db),
    user=Depends(get_current_user),
):
    verify_csrf(request)

    deleted = await delete_equipment_profile(db, profile_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment profile not found",
        )