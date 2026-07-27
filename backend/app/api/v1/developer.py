"""Developer / debug endpoints — only active when DEBUG=true."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import os

from backend.app.db.session import get_db, engine
from backend.app.db.base import Base
from backend.app.db import models

router = APIRouter(prefix="/api/v1/dev", tags=["developer"])

_DEBUG = os.getenv("DEBUG", "false").lower() in ("1", "true", "yes")


def _require_debug():
    if not _DEBUG:
        raise HTTPException(status_code=403, detail="Debug endpoints are disabled in production")


@router.get("/status", summary="DB and service status")
def dev_status(db: Session = Depends(get_db)):
    _require_debug()
    counts = {
        "conversations": db.query(models.Conversation).count(),
        "messages": db.query(models.Message).count(),
        "memories": db.query(models.Memory).count(),
        "projects": db.query(models.Project).count(),
        "growth_entries": db.query(models.GrowthEntry).count(),
    }
    return {"data": {"counts": counts}, "meta": None, "error": None}


@router.post("/reset", summary="Drop and recreate all tables (dev only)")
def dev_reset():
    _require_debug()
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    return {"data": {"reset": True}, "meta": None, "error": None}
