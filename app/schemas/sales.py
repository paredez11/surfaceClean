# app/schemas/sales.py

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SaleBase(BaseModel):
    customer_id: int
    machine_id: int

    asking_price: float | None = None
    sale_price: float

    status: str = "sold"

    sold_at: datetime | None = None
    delivered_at: datetime | None = None

    notes: str | None = None


class SaleCreate(SaleBase):
    pass


class SaleUpdate(BaseModel):
    customer_id: int | None = None
    machine_id: int | None = None

    asking_price: float | None = None
    sale_price: float | None = None

    status: str | None = None

    sold_at: datetime | None = None
    delivered_at: datetime | None = None

    notes: str | None = None


class SaleResponse(SaleBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)