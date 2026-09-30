# app/services/warranties_services.py

from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from models.warranty import Warranty
from models.sales import Sale
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
    db: AsyncSession,
    status: str | None = None,
):
    now = datetime.now(timezone.utc)

    query = (
        select(Warranty)
        .options(
            selectinload(Warranty.sale).selectinload(Sale.customer),
            selectinload(Warranty.sale).selectinload(Sale.machine),
        )
        .order_by(Warranty.end_date.asc())
    )

    if status == "active":
        query = query.where(
            Warranty.start_date <= now,
            Warranty.end_date >= now,
        )
    elif status == "expired":
        query = query.where(
            Warranty.end_date < now,
        )

    result = await db.execute(query)
    warranties = result.scalars().all()

    return [
        {
            "id": warranty.id,
            "sale_id": warranty.sale_id,
            "start_date": warranty.start_date,
            "end_date": warranty.end_date,
            "duration": warranty.duration,
            "duration_unit": warranty.duration_unit,
            "status": warranty.status,
            "coverage_terms": warranty.coverage_terms,
            "exclusions": warranty.exclusions,
            "notes": warranty.notes,
            "created_at": warranty.created_at,
            "updated_at": warranty.updated_at,
            "customer": warranty.sale.customer,
            "machine": warranty.sale.machine,
        }
        for warranty in warranties
    ]


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
