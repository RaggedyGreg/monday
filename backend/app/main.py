from fastapi import FastAPI, APIRouter
from pydantic import BaseModel
from typing import List

app = FastAPI(title="Monday Backend", version="0.1.0")


class Conversation(BaseModel):
    id: str
    title: str
    preview: str
    date: str


class Memory(BaseModel):
    id: str
    type: str
    content: str
    importance: float
    confidence: float


router = APIRouter(prefix="/api/v1")

SAMPLE_CONVERSATIONS = [
    {"id": "c1", "title": "Typography scale & mobile display", "preview": "Fluid type scales using CSS clamp()", "date": "2024-03-20"},
]

SAMPLE_MEMORIES = [
    {"id": "m1", "type": "Preferences", "content": "Works best before 7am", "importance": 0.92, "confidence": 0.97},
]


@router.get("/conversations", response_model=List[Conversation])
def list_conversations():
    return SAMPLE_CONVERSATIONS


@router.get("/memories", response_model=List[Memory])
def list_memories():
    return SAMPLE_MEMORIES


@router.get("/health")
def health():
    return {"status": "ok"}


app.include_router(router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
