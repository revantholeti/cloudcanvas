from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.diagram import DiagramOut
from app.services import diagram_service

router = APIRouter(prefix="/public", tags=["public"])


@router.get("/diagrams/{token}", response_model=DiagramOut)
async def get_public_diagram(token: str, db: AsyncSession = Depends(get_db)):
    diagram = await diagram_service.get_diagram_by_token(db, token)
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found or not public")
    return diagram
