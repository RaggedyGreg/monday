from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.db import models
from backend.app.schemas import GrowthEntryCreate, GrowthEntryUpdate, GrowthEntryRead

router = APIRouter(prefix="/api/v1/growth", tags=["growth"])


@router.get("/", summary="List growth entries")
def list_growth_entries(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=200), db: Session = Depends(get_db)):
    total = db.query(models.GrowthEntry).count()
    items = db.query(models.GrowthEntry).order_by(models.GrowthEntry.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return {"data": [GrowthEntryRead.model_validate(e) for e in items], "meta": {"page": page, "page_size": page_size, "total": total}, "error": None}


@router.post("/", summary="Create growth entry")
def create_growth_entry(payload: GrowthEntryCreate, db: Session = Depends(get_db)):
    e = models.GrowthEntry(**payload.model_dump())
    db.add(e)
    db.commit()
    db.refresh(e)
    return {"data": GrowthEntryRead.model_validate(e), "meta": None, "error": None}


@router.get("/{entry_id}", summary="Get growth entry")
def get_growth_entry(entry_id: str, db: Session = Depends(get_db)):
    e = db.get(models.GrowthEntry, entry_id)
    if not e:
        raise HTTPException(status_code=404, detail="Entry not found")
    return {"data": GrowthEntryRead.model_validate(e), "meta": None, "error": None}


@router.patch("/{entry_id}", summary="Update growth entry")
def update_growth_entry(entry_id: str, payload: GrowthEntryUpdate, db: Session = Depends(get_db)):
    e = db.get(models.GrowthEntry, entry_id)
    if not e:
        raise HTTPException(status_code=404, detail="Entry not found")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(e, field, value)
    db.commit()
    db.refresh(e)
    return {"data": GrowthEntryRead.model_validate(e), "meta": None, "error": None}


@router.delete("/{entry_id}", summary="Delete growth entry")
def delete_growth_entry(entry_id: str, db: Session = Depends(get_db)):
    e = db.get(models.GrowthEntry, entry_id)
    if not e:
        raise HTTPException(status_code=404, detail="Entry not found")
    db.delete(e)
    db.commit()
    return {"data": None, "meta": None, "error": None}
