# app/schemas/service_records.py

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ServiceRecordBase(BaseModel):
    machine_id: int

    sale_id: int | None = None
    warranty_id: int | None = None

    service_type: str

    reported_issue: str | None = None
    diagnosis: str | None = None
    work_performed: str | None = None

    service_date: datetime | None = None

    covered_by_warranty: bool = False

    labor_cost: float | None = None
    parts_cost: float | None = None
    total_cost: float | None = None

    technician: str | None = None

    notes: str | None = None


class ServiceRecordCreate(ServiceRecordBase):
    pass


class ServiceRecordUpdate(BaseModel):
    service_type: str | None = None

    reported_issue: str | None = None
    diagnosis: str | None = None
    work_performed: str | None = None

    service_date: datetime | None = None

    covered_by_warranty: bool | None = None

    labor_cost: float | None = None
    parts_cost: float | None = None
    total_cost: float | None = None

    technician: str | None = None

    notes: str | None = None


class ServiceRecordResponse(ServiceRecordBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)