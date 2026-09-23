# app/routes/service_records_routes.py

from fastapi import APIRouter, Body, Depends, HTTPException, Path, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from utils.db import get_async_db
from utils.csrf import verify_csrf
from .auth_routes import get_current_user

from models.machines import Machine
from models.sales import Sale
from models.warranty import Warranty

from schemas.service_records import (
    ServiceRecordCreate,
    ServiceRecordResponse,
)

from services.service_records_services import (
    create_service_record as create_service_record_service,
    get_all_service_records,
    get_service_record as get_service_record_service,
    get_machine_service_records,
    get_sale_service_records,
    get_warranty_service_records,
)

from typing import List


router = APIRouter()


@router.get("/", response_model=List[ServiceRecordResponse])
async def get_service_records(
    db: AsyncSession = Depends(get_async_db),
    user=Depends(get_current_user)
):
    return await get_all_service_records(db)


@router.get(
    "/machine/{machine_id}",
    response_model=List[ServiceRecordResponse]
)
async def get_service_records_for_machine(
    machine_id: int = Path(..., gt=0),
    db: AsyncSession = Depends(get_async_db),
    user=Depends(get_current_user)
):
    machine_result = await db.execute(
        select(Machine).where(Machine.id == machine_id)
    )
    machine = machine_result.scalar_one_or_none()

    if not machine:
        raise HTTPException(
            status_code=404,
            detail="Machine not found"
        )

    return await get_machine_service_records(
        db,
        machine_id
    )


@router.get(
    "/sale/{sale_id}",
    response_model=List[ServiceRecordResponse]
)
async def get_service_records_for_sale(
    sale_id: int = Path(..., gt=0),
    db: AsyncSession = Depends(get_async_db),
    user=Depends(get_current_user)
):
    sale_result = await db.execute(
        select(Sale).where(Sale.id == sale_id)
    )
    sale = sale_result.scalar_one_or_none()

    if not sale:
        raise HTTPException(
            status_code=404,
            detail="Sale not found"
        )

    return await get_sale_service_records(
        db,
        sale_id
    )


@router.get(
    "/warranty/{warranty_id}",
    response_model=List[ServiceRecordResponse]
)
async def get_service_records_for_warranty(
    warranty_id: int = Path(..., gt=0),
    db: AsyncSession = Depends(get_async_db),
    user=Depends(get_current_user)
):
    warranty_result = await db.execute(
        select(Warranty).where(
            Warranty.id == warranty_id
        )
    )
    warranty = warranty_result.scalar_one_or_none()

    if not warranty:
        raise HTTPException(
            status_code=404,
            detail="Warranty not found"
        )

    return await get_warranty_service_records(
        db,
        warranty_id
    )


@router.get(
    "/{service_record_id}",
    response_model=ServiceRecordResponse
)
async def get_service_record(
    service_record_id: int = Path(..., gt=0),
    db: AsyncSession = Depends(get_async_db),
    user=Depends(get_current_user)
):
    service_record = await get_service_record_service(
        db,
        service_record_id
    )

    if not service_record:
        raise HTTPException(
            status_code=404,
            detail="Service record not found"
        )

    return service_record


@router.post("/", response_model=ServiceRecordResponse)
async def create_service_record(
    request: Request,
    data: ServiceRecordCreate,
    db: AsyncSession = Depends(get_async_db),
    user=Depends(get_current_user)
):
    verify_csrf(request)

    machine_result = await db.execute(
        select(Machine).where(
            Machine.id == data.machine_id
        )
    )
    machine = machine_result.scalar_one_or_none()

    if not machine:
        raise HTTPException(
            status_code=404,
            detail="Machine not found"
        )

    if data.sale_id is not None:
        sale_result = await db.execute(
            select(Sale).where(
                Sale.id == data.sale_id
            )
        )
        sale = sale_result.scalar_one_or_none()

        if not sale:
            raise HTTPException(
                status_code=404,
                detail="Sale not found"
            )

        if sale.machine_id != data.machine_id:
            raise HTTPException(
                status_code=409,
                detail="Sale does not belong to this machine"
            )

    if data.warranty_id is not None:
        if data.sale_id is None:
            raise HTTPException(
                status_code=400,
                detail=(
                    "A warranty-linked service record "
                    "must also include the sale"
                )
            )

        warranty_result = await db.execute(
            select(Warranty).where(
                Warranty.id == data.warranty_id
            )
        )
        warranty = warranty_result.scalar_one_or_none()

        if not warranty:
            raise HTTPException(
                status_code=404,
                detail="Warranty not found"
            )

        if warranty.sale_id != data.sale_id:
            raise HTTPException(
                status_code=409,
                detail="Warranty does not belong to this sale"
            )

    if (
        data.covered_by_warranty
        and data.warranty_id is None
    ):
        raise HTTPException(
            status_code=400,
            detail="Warranty coverage requires a warranty"
        )

    return await create_service_record_service(
        db,
        data
    )