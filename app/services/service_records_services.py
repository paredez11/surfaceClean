# app/services/service_records_services.py

from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from models.service_record import ServiceRecord
from schemas.service_records import ServiceRecordCreate, ServiceRecordUpdate


async def create_service_record(
    db: AsyncSession,
    service_record_data: ServiceRecordCreate
) -> ServiceRecord:
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


async def update_service_record(
    db: AsyncSession,
    service_record: ServiceRecord,
    service_record_data: ServiceRecordUpdate
) -> ServiceRecord:
    updates = service_record_data.dict(exclude_unset=True)

    for key, value in updates.items():
        setattr(service_record, key, value)

    await db.commit()
    await db.refresh(service_record)

    return service_record


async def delete_service_record(
    db: AsyncSession,
    service_record: ServiceRecord
) -> ServiceRecord:
    await db.delete(service_record)
    await db.commit()

    return service_record