# Backend Development Walkthrough — Monday

A step-by-step guide to build the FastAPI backend from scratch for the Monday project. This is documentation-only; follow these steps to implement the backend, database, and developer workflow.

Table of Contents
- Prerequisites
- Repository layout
- Environment & configuration
- Local development (Docker Compose)
- Local development (venv)
- Database: schema & migrations (Alembic)
- Pydantic and SQLAlchemy models
- API endpoints: implementation steps
- Memory engine design
- AI provider abstraction (design)
- Testing & CI
- Debugging and observability
- Acceptance criteria
- Next steps

Prerequisites
- macOS / Linux / Windows WSL
- Git
- Docker & Docker Compose
- Python 3.11+
- Node.js (for frontend build if testing together)

Repository layout (recommended)

```
monday/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── conversations.py
│   │   │       ├── messages.py
│   │   │       ├── memories.py
│   │   │       └── projects.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── security.py
│   │   ├── db/
│   │   │   ├── base.py
│   │   │   ├── models.py
│   │   │   └── session.py
│   │   ├── schemas.py
│   │   └── services/
│   │       ├── memory_engine.py
│   │       └── ai_adapter.py
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
├── frontend/
└── docs/
```

Environment & configuration
- Use a `.env` file for sensitive settings in development. Example `.env` (do NOT commit):

```env
DATABASE_URL=postgresql://monday:monday@db:5432/monday
SECRET_KEY=replace-me
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
```

- `backend/app/core/config.py` should read env vars and expose typed settings using Pydantic `BaseSettings`.

Local development (Docker Compose)

1. Build and start services:

```bash
docker compose up --build
```

2. Verify backend health:

```bash
curl http://localhost:8000/health
# Expected: {"status":"ok"}
```

Local development (venv)

1. Create venv and install dependencies:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

2. Run the app with reload (dev):

```bash
uvicorn backend.app.main:app --reload --port 8000
```

Database: schema & migrations (Alembic)

1. Initialize Alembic in `backend/`:

```bash
cd backend
alembic init alembic
```

2. Configure `alembic/env.py` to import `backend.app.db.base` and use `target_metadata`.

3. Create an initial migration (after defining models):

```bash
alembic revision --autogenerate -m "initial"
alembic upgrade head
```

4. Seed data: place JSON or SQL seed files under `backend/seeds/` and add a small script `backend/scripts/seed_db.py` to load them.

Pydantic and SQLAlchemy models

- Keep Pydantic schemas in `backend/app/schemas.py` (request/response DTOs).
- Keep SQLAlchemy models in `backend/app/db/models.py`.
- Mirror types between Pydantic and TypeScript interfaces on the frontend; keep a small sync checklist in `docs/types.md`.

API endpoints: implementation steps (per resource)

General pattern per endpoint file (e.g., `conversations.py`):

- Create router with prefix `/api/v1/conversations` and tags.
- Inject DB session dependency (fastapi Depends) and authenticated user stub.
- Implement handlers: list (GET), retrieve (GET /{id}), create (POST), update (PATCH), delete (DELETE).
- Use Pydantic schemas for body and response_model.

Example: Conversations

1. Define SQL model: `Conversation(id UUID pk, title text, updated_at timestamptz)`.
2. Add Pydantic schemas: `ConversationRead`, `ConversationCreate`.
3. Implement `GET /api/v1/conversations` with pagination: accept `page` and `page_size`; return envelope `{data, meta, error}`.
4. Implement `POST` to create conversation and optionally create initial message.

Messages

- Messages belong to conversations. Implement message append and retrieval endpoints. Consider streaming model responses via SSE for `monday` replies (future).

Memories (Memory Engine)

Design summary:

- Responsibilities: extract structured memories from messages, persist them, compute importance/confidence, support search and retrieval.
- Core service: `MemoryEngine` with methods `extract_from_message(message)`, `score(memory)`, `search(query, limit)`, `merge_similar()`.

Implementation steps:

1. Define DB table `memories` with fields: `id`, `user_id`, `type`, `content`, `importance`, `confidence`, `created_at`, `updated_at`.
2. Build extraction pipeline: simple heuristics + optional model call (provider adapter). For MVP, manual create or heuristic extractor.
3. Provide API: `POST /api/v1/memories`, `GET /api/v1/memories`, `PATCH`, `DELETE`.
4. Indexing: add full-text index on `content` (`GIN` + `to_tsvector`) for text search.

AI provider abstraction (design)

Goal: support multiple LLM providers behind a single interface.

Design:

- Define an adapter interface `class ModelAdapter(Protocol):` with `generate(prompt, max_tokens, temperature)` and `stream(prompt)`.
- Provide a `MockAdapter` for development that returns deterministic or scripted responses.
- Provide an `AnthropicAdapter` and `OpenAIAdapter` implementation later.
- Keep adapter config in settings and choose adapter at runtime.

Local LLM mock server (dev)

1. Implement a tiny HTTP server (FastAPI) or simple fixture endpoints that return canned model outputs.
2. Use the mock adapter to call `http://localhost:9000/mock/generate` during dev and tests.

Testing & CI

- Backend unit tests: `pytest` with `pytest-asyncio` for async endpoints.
- Use `testing.postgresql` or spin up a test Postgres in CI with Docker Compose.
- Run linting: `ruff`/`black` or `flake8` and `isort`.
- GitHub Actions: workflow for `push` and `pull_request` that installs deps, runs linter, runs tests, builds Docker image.

Debugging and observability

- Use structured logging (`structlog` or Python `logging`) and configure JSON output in production.
- Expose `/health` and `/metrics` endpoints (Prometheus) later.

Acceptance criteria (per major step)

- Backend scaffold: `GET /health` returns 200 and app starts in Docker Compose.
- API spec: `api-spec.md` exists and maps to implemented endpoints.
- Migrations: Alembic initial migration creates all core tables.
- Memory CRUD: can create, list, update, delete memories via API.
- Frontend integration: one frontend screen uses API to show live data (doc-only validation step).

Next steps (developer checklist)

1. Approve this guide.
2. Draft `db-schema.md` (I can draft it) mapping models to SQL DDL.
3. Implement a single resource end-to-end (memories recommended) using the steps above.

---

Last updated: 2026-07-22
