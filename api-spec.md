# API specification — Monday (minimal OpenAPI surface)

This document defines the minimal OpenAPI surface for the Monday backend. It's intended as a clear, frontend-first contract for the initial implementation (doc-only).

Base URL: `/api/v1`

Auth: Bearer token (Authorization: Bearer <token>) — for now optional in dev; design to support per-user scoping.

Common response envelope

```json
{
  "data": ..., 
  "meta": { "page": 1, "page_size": 20, "total": 123 },
  "error": null
}
```

Error schema

```json
{ "error": { "code": "string", "message": "string", "details": null | { ... } } }
```

Pagination
- Query params: `?page=1&page_size=20`
- Responses include `meta` with `page`, `page_size`, `total`.

Models (Pydantic / TypeScript friendly)

- `Conversation`
  - `id: string`
  - `title: string`
  - `preview: string`
  - `updated_at: string (iso8601)`

- `Message`
  - `id: string`
  - `conversation_id: string`
  - `role: "monday" | "user"`
  - `content: string`
  - `created_at: string`

- `Memory`
  - `id: string`
  - `type: string` (Preferences|Facts|Projects|Ideas|Experiences)
  - `content: string`
  - `importance: float` (0.0-1.0)
  - `confidence: float` (0.0-1.0)
  - `created_at`, `updated_at`

- `Project`
  - `id`, `title`, `mission`, `status: "active"|"paused"|"completed"`, `priority`, `progress: 0-1`, `milestones: string[]`, `next_step`, `review_date`

- `GrowthEntry`
  - `id`, `date`, `observation`, `lesson`, `future_action`, `confidence`

Endpoints

1) Health
- GET `/health`
- Response 200: `{ status: "ok" }`

2) Conversations
- GET `/api/v1/conversations?page=&page_size=`
  - Query: pagination, optional `q` text filter
  - Response: `data: Conversation[]`, `meta`

- GET `/api/v1/conversations/{conversation_id}`
  - Response: `data: Conversation` plus optional `messages` (paginated)

- POST `/api/v1/conversations`
  - Body: `{ title?: string, initial_message?: string }`
  - Response: created `Conversation`

3) Messages
- GET `/api/v1/conversations/{conversation_id}/messages?page=&page_size=`
  - Response: `data: Message[]`, `meta`

- POST `/api/v1/conversations/{conversation_id}/messages`
  - Body: `{ role: "user" | "monday", content: string }`
  - Response: created `Message`

4) Memories
- GET `/api/v1/memories?page=&page_size=&type=&q=`
  - Response: `data: Memory[]`, `meta`

- GET `/api/v1/memories/{id}`

- POST `/api/v1/memories`
  - Body: `{ type, content, importance?, confidence? }`
  - Response: created `Memory`

- PATCH `/api/v1/memories/{id}` — partial update
- DELETE `/api/v1/memories/{id}`

5) Projects
- GET `/api/v1/projects?page=&page_size=&status=`
- POST `/api/v1/projects` — create
- GET `/api/v1/projects/{id}` — detail
- PATCH `/api/v1/projects/{id}` — update
- DELETE `/api/v1/projects/{id}` — archive/delete

6) Growth entries
- GET `/api/v1/growth?page=&page_size=&q=`
- POST `/api/v1/growth` — create

7) Settings / Developer
- GET `/api/v1/settings` — user settings (memory toggles, model prefs)
- PATCH `/api/v1/settings` — update preferences
- POST `/api/v1/developer/webhooks` — register webhook endpoints (future)

Search & filtering
- Endpoints support `q` text filters and simple filters per-field (e.g., `type=Preferences`, `status=active`).

Rate limiting & quotas (notes)
- Plan to apply per-user rate limits for model calls and memory extraction.

Streaming responses (notes)
- For future model streaming, endpoints such as `/api/v1/conversations/{id}/stream` should support SSE or WebSocket.

Examples

- GET `/api/v1/memories?page=1&page_size=10`

```json
{
  "data": [
    { "id": "m1", "type": "Preferences", "content": "Works best before 7am", "importance": 0.92, "confidence": 0.97, "created_at": "2024-01-12T08:00:00Z" }
  ],
  "meta": { "page": 1, "page_size": 10, "total": 1 },
  "error": null
}
```

Acceptances & next steps (doc-only)
- Create `backend/app/schemas.py` (Pydantic models) that follow these shapes.
- Produce `db-schema.md` mapping types to SQL types and indexes.
- Once approved, produce a minimal YAML OpenAPI file generated from these models.

---

Last updated: 2026-07-22
