# app/services/customers_services.py

from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from models.customer import Customer
from models.sales import Sale
from schemas.customers import CustomerCreate, CustomerUpdate


async def create_customer(
    db: AsyncSession,
    customer_data: CustomerCreate
) -> Customer:
    customer = Customer(**customer_data.dict())
    db.add(customer)
    await db.commit()
    await db.refresh(customer)
    return customer


async def get_all_customers(db: AsyncSession) -> list[Customer]:
    result = await db.execute(select(Customer))
    return list(result.scalars().all())


async def get_customer(
    db: AsyncSession,
    customer_id: int
) -> Optional[Customer]:
    result = await db.execute(
        select(Customer).where(Customer.id == customer_id)
    )
    return result.scalar_one_or_none()


async def update_customer(
    db: AsyncSession,
    customer_id: int,
    customer_data: CustomerUpdate
) -> Optional[Customer]:
    result = await db.execute(
        select(Customer).where(Customer.id == customer_id)
    )
    customer = result.scalar_one_or_none()

    if not customer:
        return None

    for key, value in customer_data.dict(exclude_unset=True).items():
        setattr(customer, key, value)

    await db.commit()
    await db.refresh(customer)
    return customer


async def delete_customer(
    db: AsyncSession,
    customer_id: int
) -> Optional[Customer]:
    result = await db.execute(
        select(Customer).where(Customer.id == customer_id)
    )
    customer = result.scalar_one_or_none()

    if not customer:
        return None

    sales_result = await db.execute(
        select(Sale.id).where(Sale.customer_id == customer_id).limit(1)
    )

    if sales_result.scalar_one_or_none() is not None:
        return None

    await db.delete(customer)
    await db.commit()
    return customer