from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict


class DiagramCreate(BaseModel):
    title: str = "Untitled Diagram"
    description: Optional[str] = None
    csp: str = "aws"
    graph_data: dict = {"nodes": [], "edges": []}


class DiagramUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    csp: Optional[str] = None
    graph_data: Optional[dict] = None
    is_public: Optional[bool] = None


class DiagramOut(BaseModel):
    id: str
    title: str
    description: Optional[str]
    csp: str
    graph_data: dict
    is_public: bool
    share_token: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = {"from_attributes": True}


class DiagramVersionOut(BaseModel):
    id: str
    diagram_id: str
    created_at: datetime
    model_config = {"from_attributes": True}


class IaCGenerateRequest(BaseModel):
    diagram_id: str
    format: str = "terraform"
    provider: str = "anthropic"  # "anthropic" or "gemini"


class IaCGenerateResponse(BaseModel):
    format: str
    content: str
    files: Dict[str, str]
