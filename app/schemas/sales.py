# app/schemas/sales.py

from datetime import datetime
from pydantic import BaseModel, ConfigDict
from schemas.customers import CustomerResponse
from schemas.machines import MachineResponse


class SaleBase(BaseModel):
    customer_id: int
    machine_id: int

    asking_price: float | None = None
    sale_price: float

    status: str = "sold"

    sold_at: datetime | None = None
    delivered_at: datetime | None = None

    billing_address_line_1: str | None = None
    billing_address_line_2: str | None = None
    billing_city: str | None = None
    billing_state: str | None = None
    billing_postal_code: str | None = None

    delivery_same_as_billing: bool = True

    delivery_address_line_1: str | None = None
    delivery_address_line_2: str | None = None
    delivery_city: str | None = None
    delivery_state: str | None = None
    delivery_postal_code: str | None = None

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

    billing_address_line_1: str | None = None
    billing_address_line_2: str | None = None
    billing_city: str | None = None
    billing_state: str | None = None
    billing_postal_code: str | None = None

    delivery_same_as_billing: bool | None = None

    delivery_address_line_1: str | None = None
    delivery_address_line_2: str | None = None
    delivery_city: str | None = None
    delivery_state: str | None = None
    delivery_postal_code: str | None = None

    notes: str | None = None


class SaleResponse(SaleBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SaleDetailResponse(SaleResponse):
    customer: CustomerResponse
    machine: MachineResponse

    model_config = ConfigDict(from_attributes=True)