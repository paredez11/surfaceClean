# app/schemas/dashboard.py

from datetime import datetime

from pydantic import BaseModel


class InventorySummary(BaseModel):
    available: int
    awaiting_delivery: int


class BusinessSummary(BaseModel):
    customers: int
    completed_sales: int
    total_revenue: float


class WarrantySummary(BaseModel):
    active: int
    expiring_soon: int


class ServiceSummary(BaseModel):
    total_records: int
    warranty_covered: int
    non_warranty: int
    total_cost: float


class AttentionItem(BaseModel):
    type: str
    sale_id: int
    machine_id: int
    customer_id: int
    machine_name: str
    customer_name: str
    date: datetime


class RecentActivityItem(BaseModel):
    type: str
    sale_id: int | None = None
    service_record_id: int | None = None
    machine_id: int
    customer_id: int
    machine_name: str
    customer_name: str
    date: datetime


class DashboardResponse(BaseModel):
    inventory: InventorySummary
    business: BusinessSummary
    warranty: WarrantySummary
    service: ServiceSummary
    needs_attention: list[AttentionItem]
    recent_activity: list[RecentActivityItem]