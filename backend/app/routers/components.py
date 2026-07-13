from fastapi import APIRouter, HTTPException
from pathlib import Path
import json

router = APIRouter(prefix="/components", tags=["components"])

_data_path = Path(__file__).parent.parent / "data" / "components.json"

@router.get("/{csp}")
async def get_components(csp: str):
    if not _data_path.exists():
        raise HTTPException(status_code=503, detail="Component registry not generated yet")
    with open(_data_path) as f:
        data = json.load(f)
    if csp == "multi":
        all_comps = []
        for comps in data.values():
            all_comps.extend(comps)
        return all_comps
    if csp not in data:
        raise HTTPException(status_code=404, detail=f"Unknown CSP: {csp}")
    return data[csp]

@router.get("")
async def get_all_components():
    if not _data_path.exists():
        raise HTTPException(status_code=503, detail="Component registry not generated yet")
    with open(_data_path) as f:
        return json.load(f)
