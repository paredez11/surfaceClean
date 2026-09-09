# app/schemas/machines.py

from datetime import datetime
from decimal import Decimal
from typing import List, Literal, Optional

from pydantic import BaseModel

from .images import ImageResponse


class MachineBase(BaseModel):
    # fields that can be patched
    name: Optional[str] = None
    price: Optional[float] = None
    condition: Optional[str] = None
    description: Optional[str] = None
    hours_used: Optional[Decimal] = None

    status: Optional[Literal["listed", "sold", "delivered"]] = None
    listed_at: Optional[datetime] = None
    sold_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    sale_price: Optional[float] = None

    has_warranty: Optional[bool] = None
    warranty_duration: Optional[int] = None
    warranty_duration_unit: Optional[str] = None
    warranty_notes: Optional[str] = None

    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    best_for: Optional[str] = None
    not_for: Optional[str] = None
    key_benefits: Optional[str] = None
    common_uses: Optional[str] = None
    faq: Optional[str] = None
    comparison_notes: Optional[str] = None
    slug: Optional[str] = None


class MachineCreate(BaseModel):
    # required when creating
    name: str
    price: float
    condition: str
    description: Optional[str] = None
    hours_used: Optional[Decimal] = None

    has_warranty: bool = False
    warranty_duration: Optional[int] = None
    warranty_duration_unit: Optional[str] = None
    warranty_notes: Optional[str] = None

    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    best_for: Optional[str] = None
    not_for: Optional[str] = None
    key_benefits: Optional[str] = None
    common_uses: Optional[str] = None
    faq: Optional[str] = None
    comparison_notes: Optional[str] = None
    slug: Optional[str] = None


class MachineUpdate(MachineBase):
    # all optional – inherits from MachineBase
    pass


class MachineResponse(BaseModel):
    id: int
    name: str
    price: float
    condition: str
    description: Optional[str] = None
    hours_used: Optional[Decimal] = None
    images: List[ImageResponse] = []

    status: str
    listed_at: Optional[datetime] = None
    sold_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    sale_price: Optional[float] = None

    has_warranty: bool
    warranty_duration: Optional[int] = None
    warranty_duration_unit: Optional[str] = None
    warranty_notes: Optional[str] = None

    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    best_for: Optional[str] = None
    not_for: Optional[str] = None
    key_benefits: Optional[str] = None
    common_uses: Optional[str] = None
    faq: Optional[str] = None
    comparison_notes: Optional[str] = None
    slug: Optional[str] = None

    class Config:
        model_config = {"from_attributes": True}