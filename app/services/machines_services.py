# app/services/machines_services.py

import re
import secrets
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from models.images import Image
from models.machines import Machine
from models.equipment_profiles import EquipmentProfile
from schemas.machines import MachineCreate, MachineUpdate
from utils.cloudinary import delete_image as delete_from_cloudinary


def generate_machine_slug(name: str) -> str:
    base_slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    suffix = secrets.token_hex(2)

    return f"{base_slug}-{suffix}"


def generate_seo_title(name: str) -> str:
    return f"Used {name} | Surface Clean"


def generate_seo_description(
    name: str,
    condition: str,
    hours_used,
    description: str | None,
) -> str:
    parts = [f"Used {name} for sale"]

    if condition:
        parts.append(f"in {condition.lower()} condition")

    if hours_used is not None:
        parts.append(f"with {hours_used} hours")

    sentence = " ".join(parts) + "."

    if description:
        sentence = f"{sentence} {description}"

    return sentence[:160]


async def create_machine(
    db: AsyncSession,
    machine_data: MachineCreate,
) -> Machine:
    profile_result = await db.execute(
        select(EquipmentProfile).where(
            EquipmentProfile.id == machine_data.equipment_profile_id
        )
    )

    equipment_profile = profile_result.scalar_one_or_none()

    if not equipment_profile:
        raise ValueError("Equipment profile not found")

    name = (
        f"{equipment_profile.manufacturer} "
        f"{equipment_profile.model} "
        f"{equipment_profile.category}"
    )

    machine_values = machine_data.model_dump()

    machine = Machine(
        **machine_values,
        name=name,
        slug=generate_machine_slug(name),
        seo_title=generate_seo_title(name),
        seo_description=generate_seo_description(
            name,
            machine_data.condition,
            machine_data.hours_used,
            machine_data.description,
        ),
    )

    db.add(machine)
    await db.commit()

    result = await db.execute(
        select(Machine)
        .options(
            selectinload(Machine.images),
            selectinload(Machine.equipment_profile),
        )
        .where(Machine.id == machine.id)
    )

    return result.scalar_one()


async def get_all_machines(db: AsyncSession) -> list[Machine]:
    result = await db.execute(
        select(Machine).options(
            selectinload(Machine.images),
            selectinload(Machine.equipment_profile),
        )
    )

    return list(result.scalars().all())


async def update_machine(
    db: AsyncSession,
    machine_id: int,
    machine_data: MachineUpdate,
) -> Optional[Machine]:
    result = await db.execute(
        select(Machine).where(Machine.id == machine_id)
    )

    machine = result.scalar_one_or_none()

    if not machine:
        return None

    for key, value in machine_data.dict(exclude_unset=True).items():
        setattr(machine, key, value)

    await db.commit()

    result = await db.execute(
        select(Machine)
        .options(
            selectinload(Machine.images),
            selectinload(Machine.equipment_profile),
        )
        .where(Machine.id == machine_id)
    )

    return result.scalar_one()


async def delete_machine(
    db: AsyncSession,
    machine_id: int,
) -> Optional[Machine]:
    result = await db.execute(
        select(Machine).where(Machine.id == machine_id)
    )

    machine = result.scalar_one_or_none()

    if not machine:
        return None

    images_result = await db.execute(
        select(Image).where(Image.machine_id == machine_id)
    )
    images = images_result.scalars().all()

    for img in images:
        try:
            await delete_from_cloudinary(img.public_id)
        except Exception:
            pass

        await db.delete(img)

    await db.delete(machine)
    await db.commit()

    return machine