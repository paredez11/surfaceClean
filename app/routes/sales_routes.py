# app/routes/sales_routes.py

from fastapi import APIRouter, Body, Depends, HTTPException, Path, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from utils.db import get_async_db
from utils.csrf import verify_csrf
from .auth_routes import get_current_user

from models.customer import Customer
from models.machines import Machine

from schemas.sales import SaleCreate, SaleUpdate, SaleResponse, SaleDetailResponse

from services.sales_services import (
    create_sale as create_sale_service,
    get_all_sales,
    get_sale as get_sale_service,
    get_active_machine_sale,
    update_sale as update_sale_service,
    sale_has_warranty,
    sale_has_service_history,
    delete_sale as delete_sale_service,
)

from typing import List


router = APIRouter()


@router.get("/", response_model=List[SaleDetailResponse])
async def get_sales(
    db: AsyncSession = Depends(get_async_db),
    user=Depends(get_current_user)
):
    return await get_all_sales(db)


@router.get("/{sale_id}", response_model=SaleDetailResponse)
async def get_sale(
    sale_id: int = Path(..., gt=0),
    db: AsyncSession = Depends(get_async_db),
    user=Depends(get_current_user)
):
    sale = await get_sale_service(db, sale_id)

    if not sale:
        raise HTTPException(
            status_code=404,
            detail="Sale not found"
        )

    return sale


@router.post("/", response_model=SaleResponse)
async def create_sale(
    request: Request,
    data: SaleCreate,
    db: AsyncSession = Depends(get_async_db),
    user=Depends(get_current_user)
):
    verify_csrf(request)

    customer_result = await db.execute(
        select(Customer).where(Customer.id == data.customer_id)
    )
    customer = customer_result.scalar_one_or_none()

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    machine_result = await db.execute(
        select(Machine).where(Machine.id == data.machine_id)
    )
    machine = machine_result.scalar_one_or_none()

    if not machine:
        raise HTTPException(
            status_code=404,
            detail="Machine not found"
        )

    existing_sale = await get_active_machine_sale(
        db,
        data.machine_id
    )

    if existing_sale:
        raise HTTPException(
            status_code=409,
            detail="Machine already has an active sale"
        )

    if machine.status in ("sold", "delivered"):
        raise HTTPException(
            status_code=409,
            detail=f"Machine is already marked as {machine.status}"
        )

    return await create_sale_service(
        db,
        data,
        machine
    )


@router.patch("/{sale_id}", response_model=SaleResponse)
async def update_sale(
    request: Request,
    sale_id: int = Path(..., gt=0),
    data: SaleUpdate = Body(),
    db: AsyncSession = Depends(get_async_db),
    user=Depends(get_current_user)
):
    verify_csrf(request)

    sale = await get_sale_service(db, sale_id)

    if not sale:
        raise HTTPException(
            status_code=404,
            detail="Sale not found"
        )

    machine_result = await db.execute(
        select(Machine).where(Machine.id == sale.machine_id)
    )
    machine = machine_result.scalar_one_or_none()

    if not machine:
        raise HTTPException(
            status_code=404,
            detail="Machine not found"
        )

    updates = data.dict(exclude_unset=True)

    if "machine_id" in updates and updates["machine_id"] != sale.machine_id:
        raise HTTPException(
            status_code=409,
            detail="Machine cannot be changed after a sale is created"
        )

    if "customer_id" in updates:
        customer_result = await db.execute(
            select(Customer).where(
                Customer.id == updates["customer_id"]
            )
        )
        customer = customer_result.scalar_one_or_none()

        if not customer:
            raise HTTPException(
                status_code=404,
                detail="Customer not found"
            )

    new_status = updates.get("status", sale.status)

    if new_status not in ("sold", "delivered", "cancelled"):
        raise HTTPException(
            status_code=400,
            detail="Sale status must be sold, delivered, or cancelled"
        )

    if sale.status == "cancelled" and new_status != "cancelled":
        raise HTTPException(
            status_code=409,
            detail="A cancelled sale cannot be reopened"
        )

    if new_status == "cancelled":
        if await sale_has_warranty(db, sale.id):
            raise HTTPException(
                status_code=409,
                detail="Sale cannot be cancelled because it has a warranty"
            )

        if await sale_has_service_history(db, sale.id):
            raise HTTPException(
                status_code=409,
                detail="Sale cannot be cancelled because it has service history"
            )

    return await update_sale_service(
        db,
        sale,
        machine,
        data
    )


@router.delete("/{sale_id}")
async def delete_sale(
    request: Request,
    sale_id: int = Path(..., gt=0),
    db: AsyncSession = Depends(get_async_db),
    user=Depends(get_current_user)
):
    verify_csrf(request)

    sale = await get_sale_service(db, sale_id)

    if not sale:
        raise HTTPException(
            status_code=404,
            detail="Sale not found"
        )

    if await sale_has_warranty(db, sale.id):
        raise HTTPException(
            status_code=409,
            detail="Sale cannot be deleted because it has a warranty"
        )

    if await sale_has_service_history(db, sale.id):
        raise HTTPException(
            status_code=409,
            detail="Sale cannot be deleted because it has service history"
        )

    if sale.status != "cancelled":
        raise HTTPException(
            status_code=409,
            detail="Only cancelled sales can be deleted"
        )

    await delete_sale_service(db, sale)

    return {"message": "Sale deleted"}