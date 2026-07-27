import pytest

from backend.app.db.base import Base
from backend.app.db.session import engine, SessionLocal
from backend.app import memory_engine
from backend.app.db import models


@pytest.fixture(scope="module")
def db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_extract_memories_from_text():
    text = "This is a short sentence. This is a longer sentence that should be extracted because it surpasses the minimal length threshold. Another long sentence for testing."
    parts = memory_engine.extract_memories_from_text(text)
    assert isinstance(parts, list)
    assert len(parts) >= 1


def test_retrieve_similar_memories(db):
    # seed
    m1 = models.Memory(type="fact", content="Alice works at Acme and likes pizza.")
    m2 = models.Memory(type="pref", content="Bob prefers remote work and morning meetings.")
    db.add_all([m1, m2])
    db.commit()

    results = memory_engine.retrieve_similar_memories(db, "likes pizza", limit=2)
    assert len(results) >= 1
    top_mem, top_score = results[0]
    assert top_score >= 0.0
    assert isinstance(top_mem, models.Memory)
