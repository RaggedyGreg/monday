"""Memory engine service — extraction, ingestion, and retrieval.

This is the authoritative memory module. The flat backend/app/memory_engine.py
is kept temporarily for compatibility but delegates here.
"""
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session

from backend.app.db import models
from backend.app.services.aiAdapter import get_adapter


def extract_memories_from_text(text: str) -> List[str]:
    """Split text into candidate memory fragments (sentence-level)."""
    if not text:
        return []
    parts = [p.strip() for p in text.replace("\n", " ").split(".")]
    return [p for p in parts if len(p) > 20]


def create_memory(
    db: Session,
    user_id: Optional[str],
    mtype: str,
    content: str,
    importance: float = 0.0,
    confidence: float = 0.0,
) -> models.Memory:
    mem = models.Memory(
        user_id=user_id,
        type=mtype,
        content=content[:4096],
        importance=importance,
        confidence=confidence,
    )
    db.add(mem)
    db.commit()
    db.refresh(mem)
    return mem


def ingest_text_as_memories(
    db: Session, user_id: Optional[str], text: str, mtype: str = "auto"
) -> List[models.Memory]:
    return [create_memory(db, user_id=user_id, mtype=mtype, content=p) for p in extract_memories_from_text(text)]


def _cosine(a: List[float], b: List[float]) -> float:
    la = sum(x * x for x in a) ** 0.5
    lb = sum(x * x for x in b) ** 0.5
    if la == 0 or lb == 0:
        return 0.0
    return sum(x * y for x, y in zip(a, b)) / (la * lb)


def retrieve_similar_memories(
    db: Session, query: str, limit: int = 5
) -> List[Tuple[models.Memory, float]]:
    adapter = get_adapter()
    qv = adapter.embed(query)
    candidates = db.query(models.Memory).filter(models.Memory.archived == False).limit(200).all()
    scored = [(c, _cosine(qv, adapter.embed(c.content))) for c in candidates]
    scored.sort(key=lambda x: x[1], reverse=True)
    return scored[:limit]
