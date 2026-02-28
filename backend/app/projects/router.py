from fastapi import APIRouter, HTTPException, Depends, status
from bson import ObjectId
from datetime import datetime
from app.database import get_db
from app.auth.utils import get_current_admin
from app.projects.models import ProjectCreate, ProjectUpdate, ProjectOut

router = APIRouter(prefix="/projects", tags=["Projects"])


def serialize_project(p: dict) -> dict:
    return {
        "id": str(p["_id"]),
        "title": p["title"],
        "description": p["description"],
        "tech_stack": p.get("tech_stack", []),
        "github_url": p.get("github_url"),
        "live_url": p.get("live_url"),
        "image_url": p.get("image_url"),
        "featured": p.get("featured", False),
        "order": p.get("order", 0),
        "created_at": p.get("created_at", datetime.utcnow()),
    }


@router.get("", response_model=list[ProjectOut])
async def list_projects():
    db = get_db()
    cursor = db.projects.find().sort("order", 1)
    projects = []
    async for p in cursor:
        projects.append(serialize_project(p))
    return projects


@router.post("", response_model=ProjectOut, status_code=201)
async def create_project(payload: ProjectCreate, _=Depends(get_current_admin)):
    db = get_db()
    doc = payload.model_dump()
    doc["created_at"] = datetime.utcnow()
    result = await db.projects.insert_one(doc)
    created = await db.projects.find_one({"_id": result.inserted_id})
    return serialize_project(created)


@router.put("/{project_id}", response_model=ProjectOut)
async def update_project(project_id: str, payload: ProjectUpdate, _=Depends(get_current_admin)):
    db = get_db()
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid project ID")
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await db.projects.update_one({"_id": ObjectId(project_id)}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    updated = await db.projects.find_one({"_id": ObjectId(project_id)})
    return serialize_project(updated)


@router.delete("/{project_id}", status_code=204)
async def delete_project(project_id: str, _=Depends(get_current_admin)):
    db = get_db()
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid project ID")
    result = await db.projects.delete_one({"_id": ObjectId(project_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
