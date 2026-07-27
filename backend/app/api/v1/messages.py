from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.db import models
from backend.app.schemas import MessageCreate, MessageRead

router = APIRouter(prefix="/api/v1/conversations", tags=["messages"])


@router.get("/{conversation_id}/messages", summary="List messages in a conversation")
def list_messages(conversation_id: str, page: int = Query(1, ge=1), page_size: int = Query(50, ge=1, le=500), db: Session = Depends(get_db)):
    c = db.get(models.Conversation, conversation_id)
    if not c:
        raise HTTPException(status_code=404, detail="Conversation not found")
    q = db.query(models.Message).filter(models.Message.conversation_id == conversation_id)
    total = q.count()
    items = q.order_by(models.Message.created_at.asc()).offset((page - 1) * page_size).limit(page_size).all()
    return {"data": [MessageRead.model_validate(m) for m in items], "meta": {"page": page, "page_size": page_size, "total": total}, "error": None}


@router.post("/{conversation_id}/messages", summary="Add message to a conversation")
def add_message(conversation_id: str, payload: MessageCreate, db: Session = Depends(get_db)):
    c = db.get(models.Conversation, conversation_id)
    if not c:
        raise HTTPException(status_code=404, detail="Conversation not found")
    msg = models.Message(conversation_id=conversation_id, role=payload.role, content=payload.content)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return {"data": MessageRead.model_validate(msg), "meta": None, "error": None}


@router.delete("/{conversation_id}/messages/{message_id}", summary="Delete a message")
def delete_message(conversation_id: str, message_id: str, db: Session = Depends(get_db)):
    msg = db.query(models.Message).filter(models.Message.id == message_id, models.Message.conversation_id == conversation_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    db.delete(msg)
    db.commit()
    return {"data": None, "meta": None, "error": None}
