# app/routes/customers_routes.py

from fastapi import APIRouter, Depends, HTTPException, Path, Body, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from utils.db import get_async_db
from .auth_routes import get_current_user
from utils.csrf import verify_csrf
from models.customer import Customer
from models.sales import Sale
from models.machines import Machine
from schemas.customers import CustomerCreate, CustomerUpdate, CustomerResponse, CustomerDetailResponse
from typing import List


router = APIRouter()


@router.get("/", response_model=List[CustomerResponse])
async def get_customers(
    db: AsyncSession = Depends(get_async_db),
    user=Depends(get_current_user)
):
    result = await db.execute(select(Customer))
    return result.scalars().all()


@router.get("/{customer_id}", response_model=CustomerDetailResponse)
async def get_customer(
    customer_id: int = Path(..., gt=0),
    db: AsyncSession = Depends(get_async_db),
    user=Depends(get_current_user)
):
    result = await db.execute(
        select(Customer)
        .options(
            selectinload(Customer.sales)
            .selectinload(Sale.machine)
            .selectinload(Machine.equipment_profile),

            selectinload(Customer.sales)
            .selectinload(Sale.machine)
            .selectinload(Machine.images),

            selectinload(Customer.sales).selectinload(Sale.warranty),
            selectinload(Customer.sales).selectinload(Sale.service_records),
        )
        .where(Customer.id == customer_id)
    )
    customer = result.scalar_one_or_none()

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    return customer


@router.post("/", response_model=CustomerResponse)
async def create_customer(
    request: Request,
    data: CustomerCreate,
    db: AsyncSession = Depends(get_async_db),
    user=Depends(get_current_user)
):
    verify_csrf(request)

    customer = Customer(**data.dict())
    db.add(customer)
    await db.commit()
    await db.refresh(customer)

    return customer


@router.patch("/{customer_id}", response_model=CustomerResponse)
async def update_customer(
    request: Request,
    customer_id: int = Path(..., gt=0),
    data: CustomerUpdate = Body(),
    db: AsyncSession = Depends(get_async_db),
    user=Depends(get_current_user)
):
    verify_csrf(request)

    result = await db.execute(
        select(Customer).where(Customer.id == customer_id)
    )
    customer = result.scalar_one_or_none()

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    updates = data.dict(exclude_unset=True)

    for key, value in updates.items():
        setattr(customer, key, value)

    await db.commit()
    await db.refresh(customer)

    return customer


@router.delete("/{customer_id}")
async def delete_customer(
    request: Request,
    customer_id: int,
    db: AsyncSession = Depends(get_async_db),
    user=Depends(get_current_user)
):
    verify_csrf(request)

    result = await db.execute(
        select(Customer).where(Customer.id == customer_id)
    )
    customer = result.scalar_one_or_none()

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    sales_result = await db.execute(
        select(Sale.id)
        .where(Sale.customer_id == customer_id)
        .limit(1)
    )

    if sales_result.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=409,
            detail="Customer cannot be deleted because they have existing sales"
        )

    await db.delete(customer)
    await db.commit()

    return {"message": "Customer deleted"}
