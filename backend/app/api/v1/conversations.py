from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.db import models
from backend.app.schemas import ConversationCreate, ConversationUpdate, ConversationRead, MessageRead

router = APIRouter(prefix="/api/v1/conversations", tags=["conversations"])


@router.get("/", summary="List conversations")
def list_conversations(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=200), db: Session = Depends(get_db)):
    total = db.query(models.Conversation).count()
    items = db.query(models.Conversation).order_by(models.Conversation.updated_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return {"data": [ConversationRead.model_validate(c) for c in items], "meta": {"page": page, "page_size": page_size, "total": total}, "error": None}


@router.post("/", summary="Create conversation")
def create_conversation(payload: ConversationCreate, db: Session = Depends(get_db)):
    c = models.Conversation(title=payload.title)
    db.add(c)
    db.commit()
    db.refresh(c)
    return {"data": ConversationRead.model_validate(c), "meta": None, "error": None}


@router.get("/{conversation_id}", summary="Get conversation")
def get_conversation(conversation_id: str, db: Session = Depends(get_db)):
    c = db.get(models.Conversation, conversation_id)
    if not c:
        raise HTTPException(status_code=404, detail="Conversation not found")
    messages = [MessageRead.model_validate(m) for m in c.messages]
    data = ConversationRead.model_validate(c).model_dump()
    data["messages"] = messages
    return {"data": data, "meta": None, "error": None}


@router.patch("/{conversation_id}", summary="Update conversation")
def update_conversation(conversation_id: str, payload: ConversationUpdate, db: Session = Depends(get_db)):
    c = db.get(models.Conversation, conversation_id)
    if not c:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if payload.title is not None:
        c.title = payload.title
    db.commit()
    db.refresh(c)
    return {"data": ConversationRead.model_validate(c), "meta": None, "error": None}


@router.delete("/{conversation_id}", summary="Delete conversation")
def delete_conversation(conversation_id: str, db: Session = Depends(get_db)):
    c = db.get(models.Conversation, conversation_id)
    if not c:
        raise HTTPException(status_code=404, detail="Conversation not found")
    db.delete(c)
    db.commit()
    return {"data": None, "meta": None, "error": None}
