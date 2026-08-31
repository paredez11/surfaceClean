# app/seeds/machines.py

import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from utils.db import AsyncSessionLocal
from models.machines import Machine
from decimal import Decimal


async def seed_machines():
    # Ensure schema exists

    async with AsyncSessionLocal() as db:
        machines = [
            Machine(
                name="Tennant T300 walk behind scrubber",
                price=3950.00,
                hours_used=Decimal("61.00"),
                condition="Used - like new",
                description="Tennant T300 brush assist 20 inch scrubber. Only 61 original hours use. All wear items new. New batteries with onboard charger. Works fine new. Free delivery in DFW area. Sweeper floor concrete advance nilfisk powerboss factory cat",
                seo_title="Tennant T300 Walk-Behind Floor Scrubber | Compact Commercial Cleaning Machine",
                seo_description="The Tennant T300 is a compact walk-behind floor scrubber designed for commercial cleaning. Delivers up to 24,000 sq ft/hour productivity with quiet operation and versatile cleaning configurations.",
                best_for="Small to mid-size commercial environments like retail stores, schools, healthcare facilities, and offices where maneuverability and quiet cleaning are important",
                not_for="Large warehouses, distribution centers, or heavy industrial environments requiring high-capacity ride-on scrubbers",
                key_benefits="Compact walk-behind design for tight spaces. Multiple cleaning head options (disk, orbital, cylindrical) for different floor types. Quiet operation as low as ~57–66 dBA enabling daytime cleaning. Up to 3.8 hours runtime with onboard battery system. Strong water recovery system to reduce slip hazards.",
                common_uses="Daily cleaning of tile, concrete, and sealed floors in retail, clinics, offices, and schools. Ideal for maintaining smaller floor areas and navigating tight aisles or congested layouts.",
                faq="Q: How much area can the Tennant T300 clean? A: Up to about 24,000 sq ft per hour depending on configuration. Q: Is it suitable for use during business hours? A: Yes, it operates as low as ~57 dBA in quiet mode.",
                comparison_notes="The T300 sits at the entry-to-mid commercial level in Tennant’s lineup. It is smaller and more maneuverable than machines like the T600, but has lower tank capacity and productivity, making it better for tight or smaller environments rather than large facilities.",
                slug="tennant-t300-walk-behind-scrubber"
            ),
            Machine(
                name="Tennant T600",
                price=6500.00,
                hours_used=Decimal("203.00"),
                condition="Used - Good",
                description="Tennant T600 28 inch scrubber with new pad drivers. Only 203 original hours use. Great condition with slightly used higher capacity batteries. Has onboard charger. Works like new. Free delivery in DFW area. Sweeper scrubber floor concrete advance nilfisk powerboss factory cat Tennant",
                seo_title="Tennant T600 Walk-Behind Floor Scrubber | High-Capacity Commercial Cleaning Machine",
                seo_description="The Tennant T600 is a high-capacity walk-behind scrubber with up to 47,520 sq ft/hour productivity, 32-gallon solution tank, and multiple scrub head options for large commercial cleaning applications.",
                best_for="Medium to large facilities like warehouses, hospitals, schools, and retail stores requiring extended runtime and high productivity",
                not_for="Tight or congested areas where smaller machines like the T300 are more efficient",
                key_benefits="Large 32-gallon solution tank and 37-gallon recovery tank for longer cleaning cycles. Multiple cleaning paths (28–36 inches). High down pressure up to 300 lbs for aggressive cleaning. Battery runtime up to ~6.9 hours. Wide range of scrub head options including disk, cylindrical, and orbital.",
                common_uses="Cleaning large indoor hard floor areas such as concrete, tile, and sealed floors in warehouses, hospitals, and commercial facilities.",
                faq="Q: How much area can the T600 clean? A: Up to ~47,520 sq ft/hour depending on configuration. Q: How long does it run? A: Up to about 6.9 hours depending on battery setup.",
                comparison_notes="The T600 is significantly more powerful than the T300 with larger tanks, higher pressure, and longer runtime. It remains walk-behind but competes in productivity with smaller ride-on units.",
                slug="tennant-t600-walk-behind-scrubber"
            ),
            Machine(
                name="Advance Tennant CS7010 Sweeper Scrubber",
                price=20000.00,
                hours_used=Decimal("1229.00"),
                condition="Used - like New",
                description="Tennant Advance CS7010 lp powered sweeper scrubber with 1229 original hours use. Built September 2019. Kubota engine run on propane. Everything works as it should and all wear items are new or in good condition. Ready for delivery. Great machine at half what dealer would ask. Sweeps or scrubs separately or all together. Free delivery in Texas by me. OBO!! Tennant factory cat floor concrete powerboss sweeper scrubber",
                seo_title="Tennant CS7010 Sweeper Scrubber | Industrial Combination Cleaning Machine",
                seo_description="The Tennant CS7010 is an industrial sweeper-scrubber that combines sweeping and scrubbing in one pass. Built for large-scale environments with heavy debris and floor cleaning needs.",
                best_for="Large industrial environments like warehouses, factories, and distribution centers with both debris and floor grime",
                not_for="Small indoor spaces or facilities without heavy debris",
                key_benefits="Combines sweeping and scrubbing in a single pass to reduce labor. High-capacity hopper and tanks for long runtime. Available in LPG, diesel, and battery configurations. Designed for heavy-duty industrial cleaning.",
                common_uses="Cleaning factories, warehouses, parking structures, and large concrete environments with both debris and dirt buildup.",
                faq="Q: Can it sweep and scrub simultaneously? A: Yes. Q: What power types are available? A: LPG, diesel, and battery configurations.",
                comparison_notes="The CS7010 is a true industrial machine, far beyond the T16. It is designed for maximum efficiency in large-scale operations where both sweeping and scrubbing are required.",
                slug="tennant-cs7010-sweeper-scrubber"
            ),
            Machine(
                name="Tennant T16 Sweeper Scrubber",
                price=25000.00,
                hours_used=Decimal("48.00"),
                condition="Used - like New",
                description="2021 Tennant T16 with only 48 original hours use. Absolutely like new and works like it too. Just put new larger capacity US 125 batteries in it and installed manual battery fill system. This scrubber has the optional “pre sweep”. Machine can be operated as a sweeper, scrubber or both at the same time. Has lights, back up alarm and clean out hose on back of machine. Works perfectly and almost half price if you include the sweep system OBO free delivery in Texas. Powerboss advance nilfisk floor concrete factory cat sweeper scrubber",
                seo_title="Tennant T16 Ride-On Floor Scrubber | Industrial Cleaning Machine",
                seo_description="The Tennant T16 is a battery-powered ride-on scrubber with up to 89,100 sq ft/hour productivity, large-capacity tanks, and optional pre-sweep system for high-efficiency cleaning.",
                best_for="Large commercial and light industrial facilities like warehouses, distribution centers, and manufacturing spaces",
                not_for="Small facilities or tight layouts where maneuverability is critical",
                key_benefits="Ride-on design increases productivity and reduces operator fatigue. Large tank capacity (50–75 gallons). Optional pre-sweep system for debris removal. High cleaning coverage up to ~89,100 sq ft/hour. Battery-powered for indoor use.",
                common_uses="Cleaning large indoor spaces such as warehouses, logistics centers, and big-box retail floors.",
                faq="Q: Does the T16 sweep and scrub? A: Yes, with optional pre-sweep system. Q: How large is its tank? A: Up to 75 gallons with extended scrub system.",
                comparison_notes="The T16 bridges the gap between walk-behind scrubbers like the T600 and heavy industrial machines like the CS7010, offering ride-on efficiency without full industrial complexity.",
                slug="tennant-t16-ride-on-scrubber"
            )
        ]

        db.add_all(machines)
        await db.commit()
        print("🚜 Seeded machines")


async def undo_machines():
    async with AsyncSessionLocal() as db:
        await db.execute(text("DELETE FROM machines"))
        await db.commit()
        print("🗑️ Deleted all machines")

# Optional standalone runner
if __name__ == "__main__":
    asyncio.run(seed_machines())
