from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from .db.session import engine
from .db.base import Base
from .api.v1 import conversations, messages, memories, projects, growthEntry, settings, developer

app = FastAPI(title="Monday", version="0.1.0", description="Monday — AI companion backend")

# ── CORS ──────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────
app.include_router(conversations.router)
app.include_router(messages.router)
app.include_router(memories.router)
app.include_router(projects.router)
app.include_router(growthEntry.router)
app.include_router(settings.router)
app.include_router(developer.router)


@app.get("/health", tags=["system"])
def health():
    return {"status": "ok"}


# ── Dev: auto-create tables ───────────────────────────────────────
if os.getenv("MIGRATE_ON_STARTUP", "false").lower() in ("1", "true", "yes"):
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
