# app/models/service_record.py

from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from utils.db import Base


class ServiceRecord(Base):
    __tablename__ = "service_records"

    id = Column(Integer, primary_key=True, index=True)

    machine_id = Column(
        Integer,
        ForeignKey("machines.id"),
        nullable=False,
        index=True,
    )

    sale_id = Column(
        Integer,
        ForeignKey("sales.id"),
        nullable=True,
        index=True,
    )

    warranty_id = Column(
        Integer,
        ForeignKey("warranties.id"),
        nullable=True,
        index=True,
    )

    service_type = Column(String, nullable=False)

    reported_issue = Column(Text, nullable=True)
    diagnosis = Column(Text, nullable=True)
    work_performed = Column(Text, nullable=True)

    service_date = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    covered_by_warranty = Column(
        Boolean,
        nullable=False,
        default=False,
    )

    labor_cost = Column(Float, nullable=True)
    parts_cost = Column(Float, nullable=True)
    total_cost = Column(Float, nullable=True)

    technician = Column(String, nullable=True)

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

    machine = relationship(
        "Machine",
        back_populates="service_records",
    )

    sale = relationship(
        "Sale",
        back_populates="service_records",
    )

    warranty = relationship(
        "Warranty",
        back_populates="service_records",
    )