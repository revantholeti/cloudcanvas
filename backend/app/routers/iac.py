from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User
from app.schemas.diagram import IaCGenerateRequest, IaCGenerateResponse
from app.services import diagram_service, iac_service
from app.dependencies import get_current_user

router = APIRouter(prefix="/iac", tags=["iac"])


@router.post("/generate", response_model=IaCGenerateResponse)
async def generate_iac(
    request: IaCGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    diagram = await diagram_service.get_diagram(db, request.diagram_id, current_user.id)
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")
    if not diagram.graph_data.get("nodes"):
        raise HTTPException(status_code=400, detail="Diagram has no components")

    files = await iac_service.generate_iac(diagram, request.format, request.provider)
    combined = "\n\n".join(f"# {name}\n{content}" for name, content in files.items())
    return IaCGenerateResponse(format=request.format, content=combined, files=files)
