from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.config import settings

# Ensure asyncpg driver is used; strip sslmode param (asyncpg uses ssl= kwarg instead)
_db_url = settings.database_url.replace("postgresql://", "postgresql+asyncpg://", 1).replace("postgres://", "postgresql+asyncpg://", 1)
if "sslmode=" in _db_url:
    import re
    _db_url = re.sub(r'[?&]sslmode=[^&]*', '', _db_url).rstrip('?').rstrip('&')
engine = create_async_engine(_db_url, echo=False, connect_args={"ssl": "require"})
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session
