# app/models/equipment_profiles.py

from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship

from utils.db import Base


class EquipmentProfile(Base):
    __tablename__ = "equipment_profiles"

    id = Column(Integer, primary_key=True)

    # Equipment identity
    manufacturer = Column(String, nullable=False, index=True)
    model = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False)

    # Manufacturer / equipment information
    description = Column(Text, nullable=True)
    specifications = Column(Text, nullable=True)

    # Customer-facing knowledge
    best_for = Column(Text, nullable=True)
    not_for = Column(Text, nullable=True)
    key_benefits = Column(Text, nullable=True)
    common_uses = Column(Text, nullable=True)
    faq = Column(Text, nullable=True)
    comparison_notes = Column(Text, nullable=True)

    # Source / verification
    manufacturer_url = Column(String, nullable=True)
    source_notes = Column(Text, nullable=True)

    # Physical inventory units associated with this profile
    machines = relationship(
        "Machine",
        back_populates="equipment_profile",
    )