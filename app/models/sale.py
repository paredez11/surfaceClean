# app/models/sale.py

from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from utils.db import Base


class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)

    customer_id = Column(
        Integer,
        ForeignKey("customers.id"),
        nullable=False,
        index=True,
    )

    machine_id = Column(
        Integer,
        ForeignKey("machines.id"),
        nullable=False,
        unique=True,
        index=True,
    )

    asking_price = Column(Float, nullable=True)
    sale_price = Column(Float, nullable=False)

    status = Column(String, nullable=False, default="sold")

    sold_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    delivered_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

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

    customer = relationship(
        "Customer",
        back_populates="sales",
    )

    machine = relationship(
        "Machine",
        back_populates="sale",
    )