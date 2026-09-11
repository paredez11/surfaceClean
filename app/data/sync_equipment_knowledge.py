# app/data/sync_equipment_knowledge.py

import asyncio

from sqlalchemy import select

from data.equipment_knowledge import EQUIPMENT_KNOWLEDGE
from models.equipment_profiles import EquipmentProfile
from utils.db import AsyncSessionLocal


async def sync_equipment_knowledge():
    async with AsyncSessionLocal() as db:
        for equipment_data in EQUIPMENT_KNOWLEDGE:
            manufacturer = equipment_data["manufacturer"]
            model = equipment_data["model"]

            result = await db.execute(
                select(EquipmentProfile).where(
                    EquipmentProfile.manufacturer == manufacturer,
                    EquipmentProfile.model == model,
                )
            )
            equipment_profile = result.scalar_one_or_none()

            if equipment_profile:
                for field, value in equipment_data.items():
                    setattr(equipment_profile, field, value)

                print(f"Updated: {manufacturer} {model}")
            else:
                equipment_profile = EquipmentProfile(**equipment_data)
                db.add(equipment_profile)

                print(f"Created: {manufacturer} {model}")

        await db.commit()

    print("Equipment knowledge sync complete.")


if __name__ == "__main__":
    asyncio.run(sync_equipment_knowledge())