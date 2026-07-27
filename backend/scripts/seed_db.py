"""Seed the database with sample data for local development.

Run: python backend/scripts/seed_db.py
"""
from backend.app.db.session import SessionLocal, engine
from backend.app.db.base import Base
from backend.app.db import models


def seed():
    # Create tables if not present (dev convenience)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Create a sample user
        user = models.User(name="Alex")
        db.add(user)
        db.commit()
        db.refresh(user)

        # Sample memories
        samples = [
            {"type": "Preferences", "content": "Works best before 7am, in quiet, with minimal context-switching", "importance": 0.92, "confidence": 0.97},
            {"type": "Facts", "content": "Product designer at a Series B B2B analytics startup in San Francisco", "importance": 0.88, "confidence": 0.99},
        ]
        for s in samples:
            m = models.Memory(user_id=user.id, type=s["type"], content=s["content"], importance=s["importance"], confidence=s["confidence"])
            db.add(m)

        # Sample conversation
        conv = models.Conversation(title="Typography scale & mobile display")
        db.add(conv)
        db.commit()
        db.refresh(conv)

        msgs = [
            {"role": "monday", "content": "Good morning, Alex. You've been working on the typography scale three sessions in a row."},
            {"role": "user", "content": "Morning. Yes, let's get back to mobile display."},
        ]
        for msg in msgs:
            mm = models.Message(conversation_id=conv.id, role=msg["role"], content=msg["content"])
            db.add(mm)

        # Sample project
        proj = models.Project(title="Design system v1.0", mission="Build a comprehensive design system for the analytics platform", status="active", priority="high", progress=0.62)
        db.add(proj)

        db.commit()
        print("Seed data inserted.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
