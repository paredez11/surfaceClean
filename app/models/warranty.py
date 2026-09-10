# app/models/warranty.py

from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from utils.db import Base


class Warranty(Base):
    __tablename__ = "warranties"

    id = Column(Integer, primary_key=True, index=True)

    sale_id = Column(
        Integer,
        ForeignKey("sales.id"),
        nullable=False,
        unique=True,
        index=True,
    )

    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)

    duration = Column(Integer, nullable=False)
    duration_unit = Column(String, nullable=False)

    status = Column(String, nullable=False, default="active")

    coverage_terms = Column(Text, nullable=True)
    exclusions = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    sale = relationship(
        "Sale",
        back_populates="warranty",
    )
    
    service_records = relationship(
        "ServiceRecord",
        back_populates="warranty",
    )