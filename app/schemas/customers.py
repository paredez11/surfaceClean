# app/schemas/customers.py

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CustomerBase(BaseModel):
    customer_type: str = "business"

    first_name: str | None = None
    last_name: str | None = None
    business_name: str | None = None

    email: str | None = None
    phone: str | None = None

    address_line_1: str | None = None
    address_line_2: str | None = None
    city: str | None = None
    state: str | None = None
    postal_code: str | None = None

    notes: str | None = None


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    customer_type: str | None = None

    first_name: str | None = None
    last_name: str | None = None
    business_name: str | None = None

    email: str | None = None
    phone: str | None = None

    address_line_1: str | None = None
    address_line_2: str | None = None
    city: str | None = None
    state: str | None = None
    postal_code: str | None = None

    notes: str | None = None


class CustomerResponse(CustomerBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)