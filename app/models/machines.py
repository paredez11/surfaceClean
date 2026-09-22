# app/models/machines.py

from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Float, Integer, Numeric, String, Text, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from utils.db import Base


class Machine(Base):
    __tablename__ = "machines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    condition = Column(String, nullable=False)
    hours_used = Column(Numeric(10, 2), nullable=True)

    status: Mapped[str] = mapped_column(
        String,
        nullable=False,
        default="listed"
    )

    listed_at = Column(
        DateTime(timezone=True),
        nullable=True,
        default=lambda: datetime.now(timezone.utc),
    )

    sold_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    delivered_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    sale_price: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    has_warranty: Mapped[bool] = mapped_column(
    Boolean,
    nullable=False,
    default=False,
    )

    warranty_duration: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    warranty_duration_unit: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    warranty_notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    seo_title = Column(String, nullable=True)
    seo_description = Column(String, nullable=True)
    best_for = Column(Text, nullable=True)
    not_for = Column(Text, nullable=True)
    key_benefits = Column(Text, nullable=True)
    common_uses = Column(Text, nullable=True)
    faq = Column(Text, nullable=True)
    comparison_notes = Column(Text, nullable=True)
    slug = Column(String, unique=True, index=True, nullable=True)

    images = relationship("Image", back_populates="machine")

    sales = relationship(
        "Sale",
        back_populates="machine",
    )

    service_records = relationship(
        "ServiceRecord",
        back_populates="machine",
    )

    equipment_profile_id = Column(
        Integer,
        ForeignKey("equipment_profiles.id"),
        nullable=True,
    )

    equipment_profile = relationship(
        "EquipmentProfile",
        back_populates="machines",
    )
