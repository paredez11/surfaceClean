# app/routes/machines_routes.py

from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Body, Depends, HTTPException, Path, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from models.machines import Machine
from schemas.machines import MachineCreate, MachineResponse, MachineUpdate
from services.machines_services import (
    create_machine as create_machine_service,
    delete_machine as delete_machine_service,
)
from utils.csrf import verify_csrf
from utils.db import get_async_db
from .auth_routes import get_current_user


router = APIRouter()


def machine_query():
    return select(Machine).options(
        selectinload(Machine.images),
        selectinload(Machine.equipment_profile),
    )


@router.get("/", response_model=List[MachineResponse])
async def get_machines(
    db: AsyncSession = Depends(get_async_db),
):
    result = await db.execute(machine_query())
    return result.scalars().all()


@router.get("/{machine_id}", response_model=MachineResponse)
async def get_machine(
    machine_id: int = Path(..., gt=0),
    db: AsyncSession = Depends(get_async_db),
):
    result = await db.execute(
        machine_query().where(Machine.id == machine_id)
    )

    machine = result.scalar_one_or_none()

    if not machine:
        raise HTTPException(
            status_code=404,
            detail="Machine not found",
        )

    return machine


@router.post("/", response_model=MachineResponse)
async def create_machine(
    request: Request,
    data: MachineCreate,
    db: AsyncSession = Depends(get_async_db),
    user=Depends(get_current_user),
):
    verify_csrf(request)

    try:
        machine = await create_machine_service(db, data)
    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc

    result = await db.execute(
        machine_query().where(Machine.id == machine.id)
    )

    return result.scalar_one()


@router.patch("/{machine_id}", response_model=MachineResponse)
async def update_machine(
    request: Request,
    machine_id: int = Path(..., gt=0),
    data: MachineUpdate = Body(...),
    db: AsyncSession = Depends(get_async_db),
    user=Depends(get_current_user),
):
    verify_csrf(request)

    result = await db.execute(
        select(Machine).where(Machine.id == machine_id)
    )

    machine = result.scalar_one_or_none()

    if not machine:
        raise HTTPException(
            status_code=404,
            detail="Machine not found",
        )

    updates = data.model_dump(exclude_unset=True)

    new_status = updates.pop("status", None)

    for key, value in updates.items():
        setattr(machine, key, value)

    if new_status is not None and new_status != machine.status:
        machine.status = new_status

        if new_status == "sold" and machine.sold_at is None:
            machine.sold_at = datetime.now(timezone.utc)

        elif new_status == "delivered" and machine.delivered_at is None:
            machine.delivered_at = datetime.now(timezone.utc)

    await db.commit()

    result = await db.execute(
        machine_query().where(Machine.id == machine_id)
    )

    return result.scalar_one()


@router.delete("/{machine_id}")
async def delete_machine(
    request: Request,
    machine_id: int,
    db: AsyncSession = Depends(get_async_db),
    user=Depends(get_current_user),
):
    verify_csrf(request)

    deleted = await delete_machine_service(db, machine_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Machine not found",
        )

    return {"message": "Machine deleted"}