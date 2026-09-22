# app/services/sales_services.py

from datetime import datetime, timezone
from dateutil.relativedelta import relativedelta
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

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

    if data["delivery_same_as_billing"]:
        data["delivery_address_line_1"] = data["billing_address_line_1"]
        data["delivery_address_line_2"] = data["billing_address_line_2"]
        data["delivery_city"] = data["billing_city"]
        data["delivery_state"] = data["billing_state"]
        data["delivery_postal_code"] = data["billing_postal_code"]

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
        select(Sale)
        .options(
            selectinload(Sale.customer),
            selectinload(Sale.machine)
            .selectinload(Machine.equipment_profile),
            selectinload(Sale.machine)
            .selectinload(Machine.images),
        )
        .order_by(Sale.sold_at.desc())
    )

    return list(result.scalars().all())


async def get_sale(
    db: AsyncSession,
    sale_id: int
) -> Optional[Sale]:
    result = await db.execute(
        select(Sale)
        .options(
            selectinload(Sale.customer),
            selectinload(Sale.machine)
            .selectinload(Machine.equipment_profile),
            selectinload(Sale.machine)
            .selectinload(Machine.images),
        )
        .where(Sale.id == sale_id)
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


def calculate_warranty_end_date(
    start_date: datetime,
    duration: int,
    duration_unit: str,
) -> datetime:
    if duration_unit == "days":
        return start_date + relativedelta(days=duration)

    if duration_unit == "months":
        return start_date + relativedelta(months=duration)

    if duration_unit == "years":
        return start_date + relativedelta(years=duration)

    raise ValueError(
        f"Unsupported warranty duration unit: {duration_unit}"
    )


async def update_sale(
    db: AsyncSession,
    sale: Sale,
    machine: Machine,
    sale_data: SaleUpdate
) -> Sale:
    updates = sale_data.dict(exclude_unset=True)
    new_status = updates.get("status", sale.status)

    if updates.get("delivery_same_as_billing") is True:
        updates["delivery_address_line_1"] = updates.get(
            "billing_address_line_1",
            sale.billing_address_line_1
        )
        updates["delivery_address_line_2"] = updates.get(
            "billing_address_line_2",
            sale.billing_address_line_2
        )
        updates["delivery_city"] = updates.get(
            "billing_city",
            sale.billing_city
        )
        updates["delivery_state"] = updates.get(
            "billing_state",
            sale.billing_state
        )
        updates["delivery_postal_code"] = updates.get(
            "billing_postal_code",
            sale.billing_postal_code
        )

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
        
        warranty_duration = machine.warranty_duration
        warranty_duration_unit = machine.warranty_duration_unit

        if (
            machine.has_warranty
            and warranty_duration is not None
            and warranty_duration_unit is not None
            and not await sale_has_warranty(db, sale.id)
        ):
            warranty = Warranty(
            sale_id=sale.id,
            start_date=delivered_at,
            end_date=calculate_warranty_end_date(
                delivered_at,
                warranty_duration,
                warranty_duration_unit,
            ),
            duration=warranty_duration,
            duration_unit=warranty_duration_unit,
            status="active",
            notes=machine.warranty_notes,
            )

            db.add(warranty)

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
