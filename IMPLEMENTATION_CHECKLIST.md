# Monday — Implementation Checklist

This checklist is ordered by priority (Critical → Important → Optional → Above & Beyond) to align the repository with the expectations laid out in `README.md` and `MONDAY.md`. Use this file as an updatable source of truth. Mark items with `- [x]` when complete.

## Critical (must-have to match README / MONDAY.md)

- [ ] Backend service (FastAPI)
  - Minimal OpenAPI endpoints: `/health`, `/api/v1/conversations`, `/api/v1/messages`, `/api/v1/memories`, `/api/v1/projects`, `/api/v1/growth`, `/api/v1/settings`.
  - Server scaffold in `backend/app/` with typed Pydantic models.

  Detailed tasks:
  - [ ] Draft OpenAPI spec (YAML/JSON) describing routes, payloads, and response shapes. (AC: spec includes request/response for conversations, messages, memories.)
  - [ ] Produce `api-spec.md` documenting each endpoint and example payloads. (AC: one example per endpoint.)
  - [ ] Define DTOs (Pydantic models) mapped to TypeScript interfaces used by frontend. (AC: model file references in docs.)
  - [ ] Define error contract and pagination conventions. (AC: `error` and `meta` examples included.)

- [ ] PostgreSQL database + Alembic migrations
  - Core schemas: `users`, `conversations`, `messages`, `memories`, `projects`, `growth_entries`, `settings`.
  - Tasks:
    - [ ] Draft DB schema diagram and DDL statements (`db-schema.md`). (AC: ERD + CREATE TABLE examples.)
    - [ ] Create Alembic migration plan and initial migration file. (AC: migration creates core tables.)
    - [ ] Add seed data fixtures for local dev. (AC: `seeds/` JSON or SQL with sample user + memories.)
  - `docker-compose.yml` integration and environment-driven `DATABASE_URL`.

- [ ] Memory Engine (persistence + retrieval)
  - Storage, importance scoring, basic retrieval API, endpoints to add/edit/delete memories.

- [ ] Provider-agnostic AI abstraction
  - Common interface (prompt/response, streaming optional).
  - At least one adapter: `mock` (dev) and placeholder `provider` adapter.
  - Secure API key handling (env vars, Developer settings UI).

- [ ] Frontend wiring to API
  - Replace in-file mocks in `src/` with real API calls using TanStack Query and a small state store (Zustand or React Context).
  - Keep UI behavior parity while switching from in-memory data to backend responses.

- [ ] Dev infra & run docs
  - `docker-compose` dev setup (frontend optional), README updates with run steps, and env var guidance.

- [ ] Tests & CI (basic)
  - Backend unit tests for API contract, simple integration test hitting `/health`.
  - GitHub Actions workflow for lint + test.

## Important (should implement next)

- [ ] Alembic initial migrations + seed data
- [ ] Local LLM mock server / deterministic responses for tests
- [ ] Background worker for memory consolidation (RQ/Celery/Prefect)
- [ ] Authentication basics (JWT or session) and per-user scoping for memories/projects
- [ ] Webhooks / export endpoints for integrations
- [ ] Frontend improvements: caching strategy, error states, loading UX
- [ ] Privacy controls in UI (local-only storage toggle)

## Optional / Nice-to-have (lower priority)

- [ ] pgvector + embeddings pipeline (vector index in Postgres)
- [ ] Redis for caching & rate-limiting
- [ ] Object storage for attachments (S3 compatible)
- [ ] Voice companion infra (speech-to-text + TTS)
- [ ] Multi-model routing and cost controls

## Above & Beyond (future / aspirational)

- [ ] On-prem LLM support and self-hosted model adapters
- [ ] Multi-agent orchestration (tool-using agents)
- [ ] Analytics dashboard and usage insights
- [ ] Automated backups and migration tooling
- [ ] Full E2E test coverage (Playwright/Cypress)

## Recommended immediate next steps

1. Draft the OpenAPI spec and `api-spec.md` (doc-only). Estimated 2–3 hours.
2. Draft DB schema and `db-schema.md` with DDL examples. Estimated 1–2 hours.
3. Create a step-by-step migration plan and seed specs (doc-only). Estimated 1 hour.
4. After docs are approved, wire a single frontend screen to a backend fixture endpoint as a validation step.

## Notes & conventions

- Keep business logic out of UI components; follow the Clean Architecture guidance in `MONDAY.md`.
- Avoid `any` in TypeScript; prefer explicit DTOs that mirror Pydantic models.
- Document every breaking change in `MONDAY.md` and add small migration instructions in `docs/`.

---

Last updated: 2026-07-22
