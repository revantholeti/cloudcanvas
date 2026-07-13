from __future__ import annotations
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List
import secrets
from app.models.diagram import Diagram, DiagramVersion
from app.schemas.diagram import DiagramCreate, DiagramUpdate


async def create_diagram(db: AsyncSession, owner_id: str, data: DiagramCreate) -> Diagram:
    diagram = Diagram(owner_id=owner_id, **data.model_dump())
    db.add(diagram)
    await db.commit()
    await db.refresh(diagram)
    return diagram


async def get_user_diagrams(db: AsyncSession, owner_id: str) -> List[Diagram]:
    result = await db.execute(select(Diagram).where(Diagram.owner_id == owner_id))
    return result.scalars().all()


async def get_diagram(db: AsyncSession, diagram_id: str, owner_id: str) -> Optional[Diagram]:
    result = await db.execute(
        select(Diagram).where(Diagram.id == diagram_id, Diagram.owner_id == owner_id)
    )
    return result.scalar_one_or_none()


async def update_diagram(db: AsyncSession, diagram: Diagram, data: DiagramUpdate) -> Diagram:
    if data.graph_data is not None:
        version = DiagramVersion(diagram_id=diagram.id, graph_data=diagram.graph_data)
        db.add(version)
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(diagram, field, value)
    await db.commit()
    await db.refresh(diagram)
    return diagram


async def delete_diagram(db: AsyncSession, diagram: Diagram) -> None:
    await db.delete(diagram)
    await db.commit()


async def generate_share_token(db: AsyncSession, diagram: Diagram) -> Diagram:
    diagram.share_token = secrets.token_urlsafe(16)
    diagram.is_public = True
    await db.commit()
    await db.refresh(diagram)
    return diagram


async def get_diagram_by_token(db: AsyncSession, token: str) -> Optional[Diagram]:
    result = await db.execute(
        select(Diagram).where(Diagram.share_token == token, Diagram.is_public == True)
    )
    return result.scalar_one_or_none()


async def duplicate_diagram(db: AsyncSession, owner_id: str, diagram: Diagram) -> Diagram:
    copy = Diagram(
        owner_id=owner_id,
        title=f"{diagram.title} (copy)",
        description=diagram.description,
        csp=diagram.csp,
        graph_data=diagram.graph_data,
    )
    db.add(copy)
    await db.commit()
    await db.refresh(copy)
    return copy


async def list_versions(db: AsyncSession, diagram_id: str) -> List[DiagramVersion]:
    result = await db.execute(
        select(DiagramVersion)
        .where(DiagramVersion.diagram_id == diagram_id)
        .order_by(DiagramVersion.created_at.desc())
    )
    return result.scalars().all()


async def restore_version(db: AsyncSession, diagram: Diagram, version: DiagramVersion) -> Diagram:
    snapshot = DiagramVersion(diagram_id=diagram.id, graph_data=diagram.graph_data)
    db.add(snapshot)
    diagram.graph_data = version.graph_data
    await db.commit()
    await db.refresh(diagram)
    return diagram
