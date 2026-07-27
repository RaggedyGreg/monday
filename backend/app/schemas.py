from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime

# ── Conversations ─────────────────────────────────────────────────

class ConversationCreate(BaseModel):
    title: Optional[str] = None


class ConversationUpdate(BaseModel):
    title: Optional[str] = None


class ConversationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: Optional[str] = None
    updated_at: datetime


# ── Messages ──────────────────────────────────────────────────────

class MessageCreate(BaseModel):
    role: str
    content: str


class MessageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    conversation_id: str
    role: str
    content: str
    created_at: datetime


# ── Memories ──────────────────────────────────────────────────────

class MemoryCreate(BaseModel):
    type: str
    content: str
    importance: Optional[float] = 0.0
    confidence: Optional[float] = 0.0


class MemoryUpdate(BaseModel):
    type: Optional[str] = None
    content: Optional[str] = None
    importance: Optional[float] = None
    confidence: Optional[float] = None


class MemoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    type: str
    content: str
    importance: float
    confidence: float
    archived: bool
    created_at: datetime
    updated_at: datetime


# ── Projects ──────────────────────────────────────────────────────

class ProjectCreate(BaseModel):
    title: str
    mission: Optional[str] = None
    status: Optional[str] = "active"
    priority: Optional[str] = None
    progress: Optional[float] = 0.0
    milestones: Optional[str] = None
    next_step: Optional[str] = None
    review_date: Optional[str] = None


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    mission: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    progress: Optional[float] = None
    milestones: Optional[str] = None
    next_step: Optional[str] = None
    review_date: Optional[str] = None


class ProjectRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    mission: Optional[str] = None
    status: str
    priority: Optional[str] = None
    progress: float
    milestones: Optional[str] = None
    next_step: Optional[str] = None
    review_date: Optional[str] = None
    created_at: datetime


# ── Growth Entries ────────────────────────────────────────────────

class GrowthEntryCreate(BaseModel):
    observation: str
    date: Optional[str] = None
    lesson: Optional[str] = None
    future_action: Optional[str] = None
    confidence: Optional[float] = 0.0


class GrowthEntryUpdate(BaseModel):
    observation: Optional[str] = None
    date: Optional[str] = None
    lesson: Optional[str] = None
    future_action: Optional[str] = None
    confidence: Optional[float] = None


class GrowthEntryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    date: Optional[str] = None
    observation: str
    lesson: Optional[str] = None
    future_action: Optional[str] = None
    confidence: float
    created_at: datetime


# ── Settings ──────────────────────────────────────────────────────

class SettingRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[str] = None
    key: str
    value: Optional[str] = None


class SettingUpsert(BaseModel):
    key: str
    value: Optional[str] = None
    user_id: Optional[str] = None
