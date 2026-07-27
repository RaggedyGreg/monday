from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.db import models
from backend.app.schemas import SettingRead, SettingUpsert

router = APIRouter(prefix="/api/v1/settings", tags=["settings"])


@router.get("/", summary="List settings")
def list_settings(user_id: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(models.Setting)
    if user_id:
        q = q.filter(models.Setting.user_id == user_id)
    items = q.all()
    return {"data": [SettingRead.model_validate(s) for s in items], "meta": None, "error": None}


@router.put("/", summary="Upsert a setting")
def upsert_setting(payload: SettingUpsert, db: Session = Depends(get_db)):
    existing = db.query(models.Setting).filter(models.Setting.key == payload.key, models.Setting.user_id == payload.user_id).first()
    if existing:
        existing.value = payload.value
        db.commit()
        db.refresh(existing)
        return {"data": SettingRead.model_validate(existing), "meta": None, "error": None}
    s = models.Setting(key=payload.key, value=payload.value, user_id=payload.user_id)
    db.add(s)
    db.commit()
    db.refresh(s)
    return {"data": SettingRead.model_validate(s), "meta": None, "error": None}


@router.delete("/{setting_id}", summary="Delete a setting")
def delete_setting(setting_id: int, db: Session = Depends(get_db)):
    s = db.get(models.Setting, setting_id)
    if not s:
        raise HTTPException(status_code=404, detail="Setting not found")
    db.delete(s)
    db.commit()
    return {"data": None, "meta": None, "error": None}
