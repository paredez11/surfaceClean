# app/schemas/equipment_profiles.py

from typing import Optional

from pydantic import BaseModel, ConfigDict


class EquipmentProfileBase(BaseModel):
    manufacturer: str
    model: str
    category: str

    description: Optional[str] = None
    specifications: Optional[str] = None

    best_for: Optional[str] = None
    not_for: Optional[str] = None
    key_benefits: Optional[str] = None
    common_uses: Optional[str] = None
    faq: Optional[str] = None
    comparison_notes: Optional[str] = None

    manufacturer_url: Optional[str] = None
    source_notes: Optional[str] = None


class EquipmentProfileCreate(EquipmentProfileBase):
    pass


class EquipmentProfileUpdate(BaseModel):
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    category: Optional[str] = None

    description: Optional[str] = None
    specifications: Optional[str] = None

    best_for: Optional[str] = None
    not_for: Optional[str] = None
    key_benefits: Optional[str] = None
    common_uses: Optional[str] = None
    faq: Optional[str] = None
    comparison_notes: Optional[str] = None

    manufacturer_url: Optional[str] = None
    source_notes: Optional[str] = None


class EquipmentProfileResponse(EquipmentProfileBase):
    model_config = ConfigDict(from_attributes=True)

    id: int