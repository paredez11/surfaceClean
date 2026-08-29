# app/api/machines_routes.py

from fastapi import APIRouter, Depends, HTTPException, Path, Body, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from utils.db import get_async_db
from .auth_routes import get_current_user
from utils.csrf import verify_csrf
from models.machines import Machine
from schemas.machines import MachineCreate, MachineUpdate, MachineResponse
from typing import List
from services.machines_services import delete_machine as delete_machine_service
from seeds.machines import seed_machines
from sqlalchemy import text
from utils.db import AsyncSessionLocal

router = APIRouter()

@router.get("/", response_model=List[MachineResponse])
async def get_machines(db: AsyncSession = Depends(get_async_db)):
    result = await db.execute(
        select(Machine).options(selectinload(Machine.images))
    )
    return result.scalars().all()

@router.get("/{machine_id}", response_model=MachineResponse)
async def get_machine(
    machine_id: int = Path(..., gt=0),
    db: AsyncSession = Depends(get_async_db)
):
    result = await db.execute(
        select(Machine)
        .options(selectinload(Machine.images))
        .where(Machine.id == machine_id)
    )
    machine = result.scalar_one_or_none()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")
    return machine

@router.post("/", response_model=MachineResponse)
async def create_machine(
    request: Request,
    data: MachineCreate,
    db: AsyncSession = Depends(get_async_db),
    user=Depends(get_current_user)
):
    verify_csrf(request)
    machine = Machine(**data.dict())
    db.add(machine)
    await db.commit()
    # Re-query with images eagerly loaded to avoid MissingGreenlet during serialization
    result = await db.execute(
        select(Machine)
        .options(selectinload(Machine.images))
        .where(Machine.id == machine.id)
    )
    return result.scalar_one()

@router.patch("/{machine_id}", response_model=MachineResponse)
async def update_machine(
    request: Request,
    machine_id: int = Path(..., gt=0),
    data: MachineUpdate = Body(),
    db: AsyncSession = Depends(get_async_db),
    user=Depends(get_current_user)
):
    verify_csrf(request)
    result = await db.execute(select(Machine).where(Machine.id == machine_id))
    machine = result.scalar_one_or_none()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")

    for key, value in data.dict(exclude_unset=True).items():
        setattr(machine, key, value)

    await db.commit()
    # Re-query with images eagerly loaded to avoid MissingGreenlet during serialization
    result = await db.execute(
        select(Machine)
        .options(selectinload(Machine.images))
        .where(Machine.id == machine_id)
    )
    return result.scalar_one()

@router.delete("/{machine_id}")
async def delete_machine(
    request: Request,
    machine_id: int,
    db: AsyncSession = Depends(get_async_db),
    user=Depends(get_current_user)
):
    verify_csrf(request)
    deleted = await delete_machine_service(db, machine_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Machine not found")
    return {"message": "Machine deleted"}

from seeds.machines import seed_machines, undo_machines


# FOR DEV USE ONLY #

# @router.post("/dev/reset-machines")
# async def reset_machines():
#     async with AsyncSessionLocal() as db:
#         await db.execute(text("DELETE FROM images"))
#         await db.execute(text("DELETE FROM machines"))
#         await db.commit()

#     await seed_machines()

#     return {"message": "Machines reset"}