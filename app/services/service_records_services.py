# app/services/service_records_services.py

from datetime import datetime, timezone
from typing import Optional

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from models.sales import Sale
from models.service_record import ServiceRecord
from models.warranty import Warranty
from schemas.service_records import ServiceRecordCreate


async def create_service_record(
    db: AsyncSession,
    service_record_data: ServiceRecordCreate
) -> ServiceRecord:
    sale = None

    if service_record_data.sale_id is not None:
        sale_result = await db.execute(
            select(Sale).where(Sale.id == service_record_data.sale_id)
        )
        sale = sale_result.scalar_one_or_none()

        if not sale:
            raise HTTPException(
                status_code=404,
                detail="Sale not found"
            )

        if sale.machine_id != service_record_data.machine_id:
            raise HTTPException(
                status_code=409,
                detail="Service record machine does not match the sale"
            )

    if service_record_data.covered_by_warranty:
        if sale is None:
            raise HTTPException(
                status_code=400,
                detail="Warranty-covered service requires a sale"
            )

        if service_record_data.warranty_id is None:
            raise HTTPException(
                status_code=400,
                detail="Warranty-covered service requires a warranty"
            )

        warranty_result = await db.execute(
            select(Warranty).where(
                Warranty.id == service_record_data.warranty_id
            )
        )
        warranty = warranty_result.scalar_one_or_none()

        if not warranty:
            raise HTTPException(
                status_code=404,
                detail="Warranty not found"
            )

        if warranty.sale_id != sale.id:
            raise HTTPException(
                status_code=409,
                detail="Warranty does not belong to this sale"
            )

        now = datetime.now(timezone.utc)

        if warranty.end_date < now:
            raise HTTPException(
                status_code=409,
                detail="Warranty has expired"
            )

    service_record = ServiceRecord(**service_record_data.dict())

    db.add(service_record)
    await db.commit()
    await db.refresh(service_record)

    return service_record


async def get_all_service_records(
    db: AsyncSession
) -> list[ServiceRecord]:
    result = await db.execute(
        select(ServiceRecord).order_by(ServiceRecord.service_date.desc())
    )

    return list(result.scalars().all())


async def get_service_record(
    db: AsyncSession,
    service_record_id: int
) -> Optional[ServiceRecord]:
    result = await db.execute(
        select(ServiceRecord).where(
            ServiceRecord.id == service_record_id
        )
    )

    return result.scalar_one_or_none()


async def get_machine_service_records(
    db: AsyncSession,
    machine_id: int
) -> list[ServiceRecord]:
    result = await db.execute(
        select(ServiceRecord)
        .where(ServiceRecord.machine_id == machine_id)
        .order_by(ServiceRecord.service_date.desc())
    )

    return list(result.scalars().all())


async def get_sale_service_records(
    db: AsyncSession,
    sale_id: int
) -> list[ServiceRecord]:
    result = await db.execute(
        select(ServiceRecord)
        .where(ServiceRecord.sale_id == sale_id)
        .order_by(ServiceRecord.service_date.desc())
    )

    return list(result.scalars().all())


async def get_warranty_service_records(
    db: AsyncSession,
    warranty_id: int
) -> list[ServiceRecord]:
    result = await db.execute(
        select(ServiceRecord)
        .where(ServiceRecord.warranty_id == warranty_id)
        .order_by(ServiceRecord.service_date.desc())
    )

    return list(result.scalars().all())
