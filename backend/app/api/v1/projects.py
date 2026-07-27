from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.db import models
from backend.app.schemas import ProjectCreate, ProjectUpdate, ProjectRead

router = APIRouter(prefix="/api/v1/projects", tags=["projects"])


@router.get("/", summary="List projects")
def list_projects(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=200), status: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(models.Project)
    if status:
        q = q.filter(models.Project.status == status)
    total = q.count()
    items = q.order_by(models.Project.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return {"data": [ProjectRead.model_validate(p) for p in items], "meta": {"page": page, "page_size": page_size, "total": total}, "error": None}


@router.post("/", summary="Create project")
def create_project(payload: ProjectCreate, db: Session = Depends(get_db)):
    p = models.Project(**payload.model_dump())
    db.add(p)
    db.commit()
    db.refresh(p)
    return {"data": ProjectRead.model_validate(p), "meta": None, "error": None}


@router.get("/{project_id}", summary="Get project")
def get_project(project_id: str, db: Session = Depends(get_db)):
    p = db.get(models.Project, project_id)
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"data": ProjectRead.model_validate(p), "meta": None, "error": None}


@router.patch("/{project_id}", summary="Update project")
def update_project(project_id: str, payload: ProjectUpdate, db: Session = Depends(get_db)):
    p = db.get(models.Project, project_id)
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(p, field, value)
    db.commit()
    db.refresh(p)
    return {"data": ProjectRead.model_validate(p), "meta": None, "error": None}


@router.delete("/{project_id}", summary="Delete project")
def delete_project(project_id: str, db: Session = Depends(get_db)):
    p = db.get(models.Project, project_id)
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(p)
    db.commit()
    return {"data": None, "meta": None, "error": None}
