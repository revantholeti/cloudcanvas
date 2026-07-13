from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.diagram import DiagramVersion
from app.models.user import User
from app.schemas.diagram import DiagramCreate, DiagramUpdate, DiagramOut, DiagramVersionOut
from app.services import diagram_service
from app.dependencies import get_current_user

router = APIRouter(prefix="/diagrams", tags=["diagrams"])


@router.post("", response_model=DiagramOut)
async def create_diagram(
    data: DiagramCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await diagram_service.create_diagram(db, current_user.id, data)


@router.get("", response_model=list[DiagramOut])
async def list_diagrams(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await diagram_service.get_user_diagrams(db, current_user.id)


@router.get("/{diagram_id}", response_model=DiagramOut)
async def get_diagram(
    diagram_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    diagram = await diagram_service.get_diagram(db, diagram_id, current_user.id)
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")
    return diagram


@router.put("/{diagram_id}", response_model=DiagramOut)
async def update_diagram(
    diagram_id: str,
    data: DiagramUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    diagram = await diagram_service.get_diagram(db, diagram_id, current_user.id)
    if not diagram:
        raise HTTPException(status_mode=404, detail="Diagram not found")
    return await diagram_service.update_diagram(db, diagram, data)


@router.delete("/{diagram_id}")
async def delete_diagram(
    diagram_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    diagram = await diagram_service.get_diagram(db, diagram_id, current_user.id)
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")
    await diagram_service.delete_diagram(db, diagram)
    return {"message": "Diagram deleted"}


@router.post("/{diagram_id}/share", response_model=DiagramOut)
async def share_diagram(
    diagram_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    diagram = await diagram_service.get_diagram(db, diagram_id, current_user.id)
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")
    return await diagram_service.generate_share_token(db, diagram)


@router.post("/{diagram_id}/duplicate", response_model=DiagramOut)
async def duplicate_diagram(
    diagram_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    diagram = await diagram_service.get_diagram(db, diagram_id, current_user.id)
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")
    return await diagram_service.duplicate_diagram(db, current_user.id, diagram)


@router.get("/{diagram_id}/versions", response_model=list[DiagramVersionOut])
async def list_versions(
    diagram_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    diagram = await diagram_service.get_diagram(db, diagram_id, current_user.id)
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")
    return await diagram_service.list_versions(db, diagram_id)


@router.post("/{diagram_id}/versions/{version_id}/restore", response_model=DiagramOut)
async def restore_version(
    diagram_id: str,
    version_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    diagram = await diagram_service.get_diagram(db, diagram_id, current_user.id)
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")
    result = await db.execute(
        select(DiagramVersion).where(
            DiagramVersion.id == version_id,
            DiagramVersion.diagram_id == diagram_id,
        )
    )
    version = result.scalar_one_or_none()
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    return await diagram_service.restore_version(db, diagram, version)
