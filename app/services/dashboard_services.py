# app/services/dashboard_services.py

from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models.customer import Customer
from models.machines import Machine
from models.sales import Sale
from models.service_record import ServiceRecord
from models.warranty import Warranty


def _customer_name(customer: Customer) -> str:
    business_name = getattr(customer, "business_name", None)

    if business_name:
        return str(business_name)

    first_name = getattr(customer, "first_name", None)
    last_name = getattr(customer, "last_name", None)

    full_name = " ".join(
        str(part)
        for part in (first_name, last_name)
        if part
    )

    return full_name or "Unknown Customer"


async def get_dashboard_summary(db: AsyncSession):
    now = datetime.now(timezone.utc)
    expiration_cutoff = now + timedelta(days=30)

    # ---------------------------------------------------------
    # Inventory Summary
    # ---------------------------------------------------------

    available_result = await db.execute(
        select(func.count(Machine.id))
        .where(Machine.status == "listed")
    )
    available = available_result.scalar_one()

    awaiting_delivery_result = await db.execute(
        select(func.count(Sale.id))
        .where(Sale.status == "sold")
    )
    awaiting_delivery = awaiting_delivery_result.scalar_one()

    # ---------------------------------------------------------
    # Business Summary
    # ---------------------------------------------------------

    customers_result = await db.execute(
        select(func.count(Customer.id))
    )
    customers = customers_result.scalar_one()

    completed_sales_result = await db.execute(
        select(func.count(Sale.id))
        .where(Sale.status == "delivered")
    )
    completed_sales = completed_sales_result.scalar_one()

    revenue_result = await db.execute(
        select(
            func.coalesce(
                func.sum(Sale.sale_price),
                0.0,
            )
        )
        .where(Sale.status == "delivered")
    )
    total_revenue = float(revenue_result.scalar_one())

    # ---------------------------------------------------------
    # Warranty Summary
    # ---------------------------------------------------------

    active_warranties_result = await db.execute(
        select(func.count(Warranty.id))
        .where(
            Warranty.status == "active",
            Warranty.start_date <= now,
            Warranty.end_date >= now,
        )
    )
    active_warranties = active_warranties_result.scalar_one()

    expiring_soon_result = await db.execute(
        select(func.count(Warranty.id))
        .where(
            Warranty.status == "active",
            Warranty.end_date >= now,
            Warranty.end_date <= expiration_cutoff,
        )
    )
    expiring_soon = expiring_soon_result.scalar_one()

    # ---------------------------------------------------------
    # Service Summary
    # ---------------------------------------------------------

    total_service_result = await db.execute(
        select(func.count(ServiceRecord.id))
    )
    total_service_records = total_service_result.scalar_one()

    warranty_service_result = await db.execute(
        select(func.count(ServiceRecord.id))
        .where(ServiceRecord.covered_by_warranty.is_(True))
    )
    warranty_covered = warranty_service_result.scalar_one()

    non_warranty_service_result = await db.execute(
        select(func.count(ServiceRecord.id))
        .where(ServiceRecord.covered_by_warranty.is_(False))
    )
    non_warranty = non_warranty_service_result.scalar_one()

    service_cost_result = await db.execute(
        select(
            func.coalesce(
                func.sum(ServiceRecord.total_cost),
                0.0,
            )
        )
    )
    total_service_cost = float(service_cost_result.scalar_one())

    # ---------------------------------------------------------
    # Needs Attention
    # ---------------------------------------------------------

    needs_attention = []

    awaiting_delivery_records_result = await db.execute(
        select(Sale)
        .options(
            selectinload(Sale.machine),
            selectinload(Sale.customer),
        )
        .where(Sale.status == "sold")
        .order_by(Sale.sold_at.asc())
    )

    awaiting_delivery_records = (
        awaiting_delivery_records_result
        .scalars()
        .all()
    )

    for sale in awaiting_delivery_records:
        needs_attention.append(
            {
                "type": "awaiting_delivery",
                "sale_id": sale.id,
                "machine_id": sale.machine_id,
                "customer_id": sale.customer_id,
                "machine_name": sale.machine.name,
                "customer_name": _customer_name(sale.customer),
                "date": sale.sold_at,
            }
        )

    expiring_warranty_records_result = await db.execute(
        select(Warranty)
        .options(
            selectinload(Warranty.sale)
            .selectinload(Sale.machine),
            selectinload(Warranty.sale)
            .selectinload(Sale.customer),
        )
        .where(
            Warranty.status == "active",
            Warranty.end_date >= now,
            Warranty.end_date <= expiration_cutoff,
        )
        .order_by(Warranty.end_date.asc())
    )

    expiring_warranty_records = (
        expiring_warranty_records_result
        .scalars()
        .all()
    )

    for warranty in expiring_warranty_records:
        sale = warranty.sale

        needs_attention.append(
            {
                "type": "warranty_expiring",
                "sale_id": sale.id,
                "machine_id": sale.machine_id,
                "customer_id": sale.customer_id,
                "machine_name": sale.machine.name,
                "customer_name": _customer_name(sale.customer),
                "date": warranty.end_date,
            }
        )

    # ---------------------------------------------------------
    # Recent Activity
    # ---------------------------------------------------------

    recent_activity = []

    recent_sales_result = await db.execute(
        select(Sale)
        .options(
            selectinload(Sale.machine),
            selectinload(Sale.customer),
        )
        .order_by(Sale.sold_at.desc())
        .limit(5)
    )

    recent_sales = recent_sales_result.scalars().all()

    for sale in recent_sales:
        recent_activity.append(
            {
                "type": "sale",
                "sale_id": sale.id,
                "service_record_id": None,
                "machine_id": sale.machine_id,
                "customer_id": sale.customer_id,
                "machine_name": sale.machine.name,
                "customer_name": _customer_name(sale.customer),
                "date": sale.sold_at,
            }
        )

    recent_deliveries_result = await db.execute(
        select(Sale)
        .options(
            selectinload(Sale.machine),
            selectinload(Sale.customer),
        )
        .where(Sale.delivered_at.is_not(None))
        .order_by(Sale.delivered_at.desc())
        .limit(5)
    )

    recent_deliveries = recent_deliveries_result.scalars().all()

    for sale in recent_deliveries:
        recent_activity.append(
            {
                "type": "delivery",
                "sale_id": sale.id,
                "service_record_id": None,
                "machine_id": sale.machine_id,
                "customer_id": sale.customer_id,
                "machine_name": sale.machine.name,
                "customer_name": _customer_name(sale.customer),
                "date": sale.delivered_at,
            }
        )

    recent_service_result = await db.execute(
        select(ServiceRecord)
        .options(
            selectinload(ServiceRecord.machine),
            selectinload(ServiceRecord.sale)
            .selectinload(Sale.customer),
        )
        .order_by(ServiceRecord.service_date.desc())
        .limit(5)
    )

    recent_service_records = recent_service_result.scalars().all()

    for service_record in recent_service_records:
        sale = service_record.sale

        recent_activity.append(
            {
                "type": "service",
                "sale_id": service_record.sale_id,
                "service_record_id": service_record.id,
                "machine_id": service_record.machine_id,
                "customer_id": sale.customer_id,
                "machine_name": service_record.machine.name,
                "customer_name": _customer_name(sale.customer),
                "date": service_record.service_date,
            }
        )

    recent_activity.sort(
        key=lambda item: item["date"],
        reverse=True,
    )

    recent_activity = recent_activity[:10]

    # ---------------------------------------------------------
    # Dashboard Response
    # ---------------------------------------------------------

    return {
        "inventory": {
            "available": available,
            "awaiting_delivery": awaiting_delivery,
        },
        "business": {
            "customers": customers,
            "completed_sales": completed_sales,
            "total_revenue": total_revenue,
        },
        "warranty": {
            "active": active_warranties,
            "expiring_soon": expiring_soon,
        },
        "service": {
            "total_records": total_service_records,
            "warranty_covered": warranty_covered,
            "non_warranty": non_warranty,
            "total_cost": total_service_cost,
        },
        "needs_attention": needs_attention,
        "recent_activity": recent_activity,
    }