import asyncio
from app.database import engine, Base
import app.models.user
import app.models.diagram

async def main():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Tables created successfully.")

asyncio.run(main())
