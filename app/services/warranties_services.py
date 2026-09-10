# app/services/warranties_services.py

from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from models.warranty import Warranty
from schemas.warranties import WarrantyCreate, WarrantyUpdate


async def create_warranty(
    db: AsyncSession,
    warranty_data: WarrantyCreate
) -> Warranty:
    warranty = Warranty(**warranty_data.dict())

    db.add(warranty)
    await db.commit()
    await db.refresh(warranty)

    return warranty


async def get_all_warranties(
    db: AsyncSession
) -> list[Warranty]:
    result = await db.execute(
        select(Warranty).order_by(Warranty.created_at.desc())
    )

    return list(result.scalars().all())


async def get_warranty(
    db: AsyncSession,
    warranty_id: int
) -> Optional[Warranty]:
    result = await db.execute(
        select(Warranty).where(Warranty.id == warranty_id)
    )

    return result.scalar_one_or_none()


async def get_sale_warranty(
    db: AsyncSession,
    sale_id: int
) -> Optional[Warranty]:
    result = await db.execute(
        select(Warranty).where(Warranty.sale_id == sale_id)
    )

    return result.scalar_one_or_none()


async def update_warranty(
    db: AsyncSession,
    warranty: Warranty,
    warranty_data: WarrantyUpdate
) -> Warranty:
    updates = warranty_data.dict(exclude_unset=True)

    for key, value in updates.items():
        setattr(warranty, key, value)

    now = datetime.now(timezone.utc)

    if warranty.end_date < now:
        warranty.status = "expired"
    elif warranty.status == "expired" and warranty.end_date >= now:
        warranty.status = "active"

    await db.commit()
    await db.refresh(warranty)

    return warranty


async def delete_warranty(
    db: AsyncSession,
    warranty: Warranty
) -> Warranty:
    await db.delete(warranty)
    await db.commit()

    return warranty