# app/services/equipment_profiles_services.py

from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from models.equipment_profiles import EquipmentProfile
from schemas.equipment_profiles import (
    EquipmentProfileCreate,
    EquipmentProfileUpdate,
)


async def create_equipment_profile(
    db: AsyncSession,
    profile_data: EquipmentProfileCreate,
) -> EquipmentProfile:
    profile = EquipmentProfile(**profile_data.model_dump())

    db.add(profile)
    await db.commit()
    await db.refresh(profile)

    return profile


async def get_equipment_profiles(
    db: AsyncSession,
) -> list[EquipmentProfile]:
    result = await db.execute(
        select(EquipmentProfile).order_by(
            EquipmentProfile.manufacturer,
            EquipmentProfile.model,
        )
    )

    return list(result.scalars().all())


async def get_equipment_profile(
    db: AsyncSession,
    profile_id: int,
) -> Optional[EquipmentProfile]:
    result = await db.execute(
        select(EquipmentProfile)
        .options(selectinload(EquipmentProfile.machines))
        .where(EquipmentProfile.id == profile_id)
    )

    return result.scalar_one_or_none()


async def update_equipment_profile(
    db: AsyncSession,
    profile_id: int,
    profile_data: EquipmentProfileUpdate,
) -> Optional[EquipmentProfile]:
    result = await db.execute(
        select(EquipmentProfile).where(
            EquipmentProfile.id == profile_id
        )
    )

    profile = result.scalar_one_or_none()

    if not profile:
        return None

    for key, value in profile_data.model_dump(exclude_unset=True).items():
        setattr(profile, key, value)

    await db.commit()
    await db.refresh(profile)

    return profile


async def delete_equipment_profile(
    db: AsyncSession,
    profile_id: int,
) -> bool:
    result = await db.execute(
        select(EquipmentProfile).where(
            EquipmentProfile.id == profile_id
        )
    )

    profile = result.scalar_one_or_none()

    if not profile:
        return False

    await db.delete(profile)
    await db.commit()

    return True