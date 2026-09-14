# app/schemas/machines.py

from datetime import datetime
from decimal import Decimal
from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

from .equipment_profiles import EquipmentProfileResponse
from .images import ImageResponse


class MachineBase(BaseModel):
    # fields that can be patched
    name: Optional[str] = None
    price: Optional[float] = None
    condition: Optional[str] = None
    description: Optional[str] = None
    hours_used: Optional[Decimal] = None

    equipment_profile_id: Optional[int] = None
    
    status: Optional[Literal["listed", "sold", "delivered"]] = None
    sale_price: Optional[float] = None

    has_warranty: Optional[bool] = None
    warranty_duration: Optional[int] = None
    warranty_duration_unit: Optional[str] = None
    warranty_notes: Optional[str] = None


class MachineCreate(BaseModel):
    # required when creating
    equipment_profile_id: int
    price: float
    condition: str
    
    description: Optional[str] = None
    hours_used: Optional[Decimal] = None

    has_warranty: bool = False
    warranty_duration: Optional[int] = None
    warranty_duration_unit: Optional[str] = None
    warranty_notes: Optional[str] = None


class MachineUpdate(MachineBase):
    # all optional – inherits from MachineBase
    pass


class MachineResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    price: float
    condition: str
    description: Optional[str] = None
    hours_used: Optional[Decimal] = None

    equipment_profile_id: Optional[int] = None
    equipment_profile: Optional[EquipmentProfileResponse] = None

    images: List[ImageResponse] = Field(default_factory=list)

    status: Literal["listed", "sold", "delivered"]
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
    slug: Optional[str] = None