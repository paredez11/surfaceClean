# app/seeds/users.py

import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from utils.db import AsyncSessionLocal
from models.users import User
from utils.auth import hash_password

async def seed_users():
    # Ensure schema exists

    async with AsyncSessionLocal() as db:
        # Define users
        seed_data = [
            {
                "email": "jjparedez3@gmail.com",
                "first_name": "Johnny",
                "last_name": "Paredez III",
                "password": "BAtFitFMA13#*"
            },
            {
                "email": "surfaceclean111@yahoo.com",
                "first_name": "Dave",
                "last_name": "Siano",
                "password": "password"
            }
        ]

        result = await db.execute(select(User).where(User.email.in_([u["email"] for u in seed_data])))
        existing_emails = {user.email for user in result.scalars().all()}

        for user_data in seed_data:
            if user_data["email"] not in existing_emails:
                user = User(
                    email=user_data["email"],
                    first_name=user_data["first_name"],
                    last_name=user_data["last_name"],
                    hashed_password=hash_password(user_data["password"]),
                )
                db.add(user)
                print(f"✅ Created user: {user.email}")

        await db.commit()

async def undo_users():
    async with AsyncSessionLocal() as db:
        await db.execute(text("DELETE FROM users"))
        await db.commit()
        print("🗑️ Deleted all users")

# Optional standalone runner
if __name__ == "__main__":
    asyncio.run(seed_users())