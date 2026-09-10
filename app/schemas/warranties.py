# app/schemas/warranties.py

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class WarrantyBase(BaseModel):
    sale_id: int

    start_date: datetime
    end_date: datetime

    duration: int
    duration_unit: str

    status: str = "active"

    coverage_terms: str | None = None
    exclusions: str | None = None
    notes: str | None = None


class WarrantyCreate(WarrantyBase):
    pass


class WarrantyUpdate(BaseModel):
    start_date: datetime | None = None
    end_date: datetime | None = None

    duration: int | None = None
    duration_unit: str | None = None

    status: str | None = None

    coverage_terms: str | None = None
    exclusions: str | None = None
    notes: str | None = None


class WarrantyResponse(WarrantyBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)