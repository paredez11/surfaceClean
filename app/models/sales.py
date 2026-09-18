# app/models/sales.py

from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from utils.db import Base


class Sale(Base):
    __tablename__ = "sales"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    customer_id: Mapped[int] = mapped_column(
        ForeignKey("customers.id"),
        nullable=False,
        index=True,
    )

    machine_id: Mapped[int] = mapped_column(
        ForeignKey("machines.id"),
        nullable=False,
        index=True,
    )

    asking_price: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    sale_price: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String,
        nullable=False,
        default="sold",
    )

    sold_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    delivered_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    billing_address_line_1: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    billing_address_line_2: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    billing_city: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    billing_state: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    billing_postal_code: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    delivery_same_as_billing: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    delivery_address_line_1: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    delivery_address_line_2: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    delivery_city: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    delivery_state: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    delivery_postal_code: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )
    
    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    updated_at: Mapped[datetime] = mapped_column(
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
        back_populates="sales",
    )

    warranty = relationship(
        "Warranty",
        back_populates="sale",
        uselist=False,
    )

    service_records = relationship(
        "ServiceRecord",
        back_populates="sale",
    )