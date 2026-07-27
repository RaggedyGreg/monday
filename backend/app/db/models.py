from datetime import datetime
from uuid import uuid4
from sqlalchemy import Column, String, Text, Float, DateTime, Integer, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from .base import Base


def gen_uuid():
    return str(uuid4())


class User(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(120), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Conversation(Base):
    __tablename__ = "conversations"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    title = Column(String(255), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")


class Message(Base):
    __tablename__ = "messages"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    conversation_id = Column(String(36), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(32), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    conversation = relationship("Conversation", back_populates="messages")


class Memory(Base):
    __tablename__ = "memories"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    type = Column(String(64), nullable=False)
    content = Column(Text, nullable=False)
    importance = Column(Float, default=0.0)
    confidence = Column(Float, default=0.0)
    archived = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Project(Base):
    __tablename__ = "projects"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    title = Column(String(255), nullable=False)
    mission = Column(Text, nullable=True)
    status = Column(String(32), nullable=False, default="active")
    priority = Column(String(32), nullable=True)
    progress = Column(Float, default=0.0)
    milestones = Column(Text, nullable=True)  # JSON string or newline-delimited
    next_step = Column(Text, nullable=True)
    review_date = Column(String(32), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class GrowthEntry(Base):
    __tablename__ = "growth_entries"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    date = Column(String(32), nullable=True)
    observation = Column(Text, nullable=False)
    lesson = Column(Text, nullable=True)
    future_action = Column(Text, nullable=True)
    confidence = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)


class Setting(Base):
    __tablename__ = "settings"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    key = Column(String(128), nullable=False)
    value = Column(Text, nullable=True)
