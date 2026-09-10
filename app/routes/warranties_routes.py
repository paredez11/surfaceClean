# app/routes/warranties_routes.py

from fastapi import APIRouter, Body, Depends, HTTPException, Path, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from utils.db import get_async_db
from utils.csrf import verify_csrf
from .auth_routes import get_current_user

from models.sales import Sale
from models.service_record import ServiceRecord
from schemas.warranties import WarrantyCreate, WarrantyUpdate, WarrantyResponse
from services.warranties_services import (
    create_warranty as create_warranty_service,
    get_all_warranties,
    get_warranty as get_warranty_service,
    get_sale_warranty,
    update_warranty as update_warranty_service,
    delete_warranty as delete_warranty_service,
)

from typing import List


router = APIRouter()


@router.get("/", response_model=List[WarrantyResponse])
async def get_warranties(
    db: AsyncSession = Depends(get_async_db),
    user=Depends(get_current_user)
):
    return await get_all_warranties(db)


@router.get("/sale/{sale_id}", response_model=WarrantyResponse)
async def get_warranty_for_sale(
    sale_id: int = Path(..., gt=0),
    db: AsyncSession = Depends(get_async_db),
    user=Depends(get_current_user)
):
    sale_result = await db.execute(
        select(Sale).where(Sale.id == sale_id)
    )
    sale = sale_result.scalar_one_or_none()

    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")

    warranty = await get_sale_warranty(db, sale_id)

    if not warranty:
        raise HTTPException(status_code=404, detail="Warranty not found")

    return warranty


@router.get("/{warranty_id}", response_model=WarrantyResponse)
async def get_warranty(
    warranty_id: int = Path(..., gt=0),
    db: AsyncSession = Depends(get_async_db),
    user=Depends(get_current_user)
):
    warranty = await get_warranty_service(db, warranty_id)

    if not warranty:
        raise HTTPException(status_code=404, detail="Warranty not found")

    return warranty


@router.post("/", response_model=WarrantyResponse)
async def create_warranty(
    request: Request,
    data: WarrantyCreate,
    db: AsyncSession = Depends(get_async_db),
    user=Depends(get_current_user)
):
    verify_csrf(request)

    sale_result = await db.execute(
        select(Sale).where(Sale.id == data.sale_id)
    )
    sale = sale_result.scalar_one_or_none()

    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")

    if sale.status == "cancelled":
        raise HTTPException(
            status_code=409,
            detail="A cancelled sale cannot have a warranty"
        )

    existing_warranty = await get_sale_warranty(db, data.sale_id)

    if existing_warranty:
        raise HTTPException(
            status_code=409,
            detail="Sale already has a warranty"
        )

    if data.end_date <= data.start_date:
        raise HTTPException(
            status_code=400,
            detail="Warranty end date must be after start date"
        )

    return await create_warranty_service(db, data)


@router.patch("/{warranty_id}", response_model=WarrantyResponse)
async def update_warranty(
    request: Request,
    warranty_id: int = Path(..., gt=0),
    data: WarrantyUpdate = Body(),
    db: AsyncSession = Depends(get_async_db),
    user=Depends(get_current_user)
):
    verify_csrf(request)

    warranty = await get_warranty_service(db, warranty_id)

    if not warranty:
        raise HTTPException(status_code=404, detail="Warranty not found")

    updates = data.dict(exclude_unset=True)

    start_date = updates.get("start_date", warranty.start_date)
    end_date = updates.get("end_date", warranty.end_date)

    if end_date <= start_date:
        raise HTTPException(
            status_code=400,
            detail="Warranty end date must be after start date"
        )

    return await update_warranty_service(
        db,
        warranty,
        data
    )


@router.delete("/{warranty_id}")
async def delete_warranty(
    request: Request,
    warranty_id: int = Path(..., gt=0),
    db: AsyncSession = Depends(get_async_db),
    user=Depends(get_current_user)
):
    verify_csrf(request)

    warranty = await get_warranty_service(db, warranty_id)

    if not warranty:
        raise HTTPException(status_code=404, detail="Warranty not found")

    service_result = await db.execute(
        select(ServiceRecord.id)
        .where(ServiceRecord.warranty_id == warranty.id)
        .limit(1)
    )

    if service_result.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=409,
            detail="Warranty cannot be deleted because it has service history"
        )

    await delete_warranty_service(
        db,
        warranty
    )

    return {"message": "Warranty deleted"}