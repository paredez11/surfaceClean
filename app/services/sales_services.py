# app/services/sales_services.py

from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from models.machines import Machine
from models.sales import Sale
from models.warranty import Warranty
from models.service_record import ServiceRecord
from schemas.sales import SaleCreate, SaleUpdate


async def create_sale(
    db: AsyncSession,
    sale_data: SaleCreate,
    machine: Machine
) -> Sale:
    sold_at = sale_data.sold_at or datetime.now(timezone.utc)

    data = sale_data.dict()
    data["status"] = "sold"
    data["sold_at"] = sold_at
    data["delivered_at"] = None

    sale = Sale(**data)

    machine.status = "sold"
    machine.sale_price = sale_data.sale_price
    machine.sold_at = sold_at
    machine.delivered_at = None

    db.add(sale)

    await db.commit()
    await db.refresh(sale)

    return sale


async def get_all_sales(
    db: AsyncSession
) -> list[Sale]:
    result = await db.execute(
        select(Sale).order_by(Sale.sold_at.desc())
    )

    return list(result.scalars().all())


async def get_sale(
    db: AsyncSession,
    sale_id: int
) -> Optional[Sale]:
    result = await db.execute(
        select(Sale).where(Sale.id == sale_id)
    )

    return result.scalar_one_or_none()


async def get_active_machine_sale(
    db: AsyncSession,
    machine_id: int
) -> Optional[Sale]:
    result = await db.execute(
        select(Sale)
        .where(
            Sale.machine_id == machine_id,
            Sale.status != "cancelled"
        )
        .limit(1)
    )

    return result.scalar_one_or_none()


async def update_sale(
    db: AsyncSession,
    sale: Sale,
    machine: Machine,
    sale_data: SaleUpdate
) -> Sale:
    updates = sale_data.dict(exclude_unset=True)
    new_status = updates.get("status", sale.status)

    if new_status == "sold":
        updates["delivered_at"] = None

        machine.status = "sold"
        machine.delivered_at = None

    elif new_status == "delivered":
        delivered_at = (
            updates.get("delivered_at")
            or sale.delivered_at
            or datetime.now(timezone.utc)
        )

        updates["delivered_at"] = delivered_at

        machine.status = "delivered"
        machine.delivered_at = delivered_at

    elif new_status == "cancelled":
        updates["delivered_at"] = None

        machine.status = "listed"
        machine.sale_price = None
        machine.sold_at = None
        machine.delivered_at = None

    for key, value in updates.items():
        setattr(sale, key, value)

    if sale.status in ("sold", "delivered"):
        machine.sale_price = sale.sale_price
        machine.sold_at = sale.sold_at

    await db.commit()
    await db.refresh(sale)

    return sale


async def sale_has_warranty(
    db: AsyncSession,
    sale_id: int
) -> bool:
    result = await db.execute(
        select(Warranty.id)
        .where(Warranty.sale_id == sale_id)
        .limit(1)
    )

    return result.scalar_one_or_none() is not None


async def sale_has_service_history(
    db: AsyncSession,
    sale_id: int
) -> bool:
    result = await db.execute(
        select(ServiceRecord.id)
        .where(ServiceRecord.sale_id == sale_id)
        .limit(1)
    )

    return result.scalar_one_or_none() is not None


async def delete_sale(
    db: AsyncSession,
    sale: Sale
) -> Sale:
    await db.delete(sale)
    await db.commit()

    return sale