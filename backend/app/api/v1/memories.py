from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.db import models
from backend.app.schemas import MemoryRead, MemoryCreate, MemoryUpdate
from backend.app.services.memoryEngine import retrieve_similar_memories

router = APIRouter(prefix="/api/v1/memories", tags=["memories"])


@router.get("/", summary="List memories")
def list_memories(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=200), type: Optional[str] = None, q: Optional[str] = None, db: Session = Depends(get_db)):
    # If a free-text query is provided, prefer semantic retrieval
    if q:
        scored = retrieve_similar_memories(db, q, limit=page_size)
        data = [{"memory": MemoryRead.from_orm(m), "score": float(score)} for m, score in scored]
        total = len(data)
        return {"data": data, "meta": {"page": page, "page_size": page_size, "total": total, "query": q}, "error": None}

    query = db.query(models.Memory).filter(models.Memory.archived == False)
    if type:
        query = query.filter(models.Memory.type == type)
    total = query.count()
    items = query.order_by(models.Memory.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    data = [MemoryRead.from_orm(m) for m in items]
    return {"data": data, "meta": {"page": page, "page_size": page_size, "total": total}, "error": None}



@router.get("/search", summary="Search memories (semantic)")
def search_memories(q: str = Query(..., min_length=1), limit: int = Query(5, ge=1, le=100), db: Session = Depends(get_db)):
    scored = retrieve_similar_memories(db, q, limit=limit)
    data = [{"memory": MemoryRead.from_orm(m), "score": float(score)} for m, score in scored]
    return {"data": data, "meta": {"q": q, "limit": limit, "total": len(data)}, "error": None}


@router.post("/", summary="Create memory")
def create_memory(payload: MemoryCreate, db: Session = Depends(get_db)):
    m = models.Memory(type=payload.type, content=payload.content, importance=payload.importance or 0.0, confidence=payload.confidence or 0.0)
    db.add(m)
    db.commit()
    db.refresh(m)
    return {"data": MemoryRead.from_orm(m), "meta": None, "error": None}


@router.get("/{memory_id}", summary="Get memory by id")
def get_memory(memory_id: str, db: Session = Depends(get_db)):
    m = db.get(models.Memory, memory_id)
    if not m or m.archived:
        raise HTTPException(status_code=404, detail="Memory not found")
    return {"data": MemoryRead.from_orm(m), "meta": None, "error": None}


@router.patch("/{memory_id}", summary="Update memory")
def update_memory(memory_id: str, payload: MemoryUpdate, db: Session = Depends(get_db)):
    m = db.get(models.Memory, memory_id)
    if not m or m.archived:
        raise HTTPException(status_code=404, detail="Memory not found")
    if payload.type is not None:
        m.type = payload.type
    if payload.content is not None:
        m.content = payload.content
    if payload.importance is not None:
        m.importance = payload.importance
    if payload.confidence is not None:
        m.confidence = payload.confidence
    db.add(m)
    db.commit()
    db.refresh(m)
    return {"data": MemoryRead.from_orm(m), "meta": None, "error": None}


@router.delete("/{memory_id}", summary="Archive memory")
def delete_memory(memory_id: str, db: Session = Depends(get_db)):
    m = db.get(models.Memory, memory_id)
    if not m:
        raise HTTPException(status_code=404, detail="Memory not found")
    # Soft delete
    m.archived = True
    db.add(m)
    db.commit()
    return {"data": None, "meta": None, "error": None}
