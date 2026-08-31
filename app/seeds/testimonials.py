# app/seeds/testimonials.py

import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from utils.db import AsyncSessionLocal
from models.testimonials import Testimonial

async def seed_testimonials():
    # Ensure schema exists

    async with AsyncSessionLocal() as db:
        testimonials = [
            Testimonial(
                author_name="Mike",
                stars=5,
                notables="Punctuality, Communication, Pricing, Item Description",
                content="Super nice honest person"
            ),
            Testimonial(
                author_name="Evangeline",
                stars=5,
                notables="Punctuality, Communication, Pricing, Item Description",
                content=None
            ),
            Testimonial(
                author_name="Dillion",
                stars=5,
                notables="Punctuality, Communication, Pricing, Item Description",
                content=None
            ),
            Testimonial(
                author_name="James",
                stars=5,
                notables="Punctuality, Friendliness, Communication, Reliability, Pricing, Item Description",
                content=None
            ),
            Testimonial(
                author_name="Juan",
                stars=5,
                notables=None,
                content=None
            ),
        ]

        db.add_all(testimonials)
        await db.commit()
        print("💬 Seeded testimonials")

async def undo_testimonials():
    async with AsyncSessionLocal() as db:
        await db.execute(text("DELETE FROM testimonials"))
        await db.commit()
        print("🗑️ Deleted all testimonials")

# Optional standalone runner
if __name__ == "__main__":
    asyncio.run(seed_testimonials())