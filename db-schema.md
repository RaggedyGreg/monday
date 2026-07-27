# Database schema (Postgres) — Monday

This document maps the core application models to Postgres DDL, recommended indexes, and migration notes. It's intended to guide Alembic migrations and local seeds.

Notes:
- Prefer `UUID` for primary keys where possible (`uuid_generate_v4()`), but keep compatibility with existing SQLAlchemy string(36) PKs if you prefer. If using `UUID`, enable the extension: `CREATE EXTENSION IF NOT EXISTS "pgcrypto";` or `uuid-ossp` depending on your environment.
- Use expression `GIN` indexes on `to_tsvector('english', content)` for full-text search on long text fields (memories, messages, projects.milestones if used as text).

ERD (high level)

User 1 - * Conversation 1 - * Message
User 1 - * Memory
User 1 - * Project 1 - * Milestones (embedded)
Conversation 1 - * GrowthEntry (optional relation via message or project)

Core tables and DDL

-- Users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

-- Conversations
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at);
```

-- Messages
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX idx_messages_conversation_id_created_at ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_content_fts ON messages USING gin (to_tsvector('english', content));
```

-- Memories
```sql
CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  importance FLOAT DEFAULT 0.0,
  confidence FLOAT DEFAULT 0.0,
  archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- Full-text search index for memories
CREATE INDEX idx_memories_content_fts ON memories USING gin (to_tsvector('english', content));
CREATE INDEX idx_memories_user_id ON memories(user_id);
CREATE INDEX idx_memories_type ON memories(type);
```

-- Projects
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  mission TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  priority TEXT,
  progress FLOAT DEFAULT 0.0,
  milestones JSONB, -- prefer JSONB for structured milestones
  next_step TEXT,
  review_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_title_fts ON projects USING gin (to_tsvector('english', title || ' ' || coalesce(mission, '')));
```

-- Growth entries
```sql
CREATE TABLE growth_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE,
  observation TEXT NOT NULL,
  lesson TEXT,
  future_action TEXT,
  confidence FLOAT DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX idx_growth_entries_created_at ON growth_entries(created_at DESC);
```

-- Settings (key/value per-user)
```sql
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB,
  UNIQUE(user_id, key)
);
CREATE INDEX idx_settings_user_id ON settings(user_id);
```

Recommended migration & alembic notes

1. Enable required extensions in an early migration (pgcrypto or uuid-ossp):

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

2. Use Alembic's `autogenerate` by importing `backend.app.db.base:Base` in `alembic/env.py` and set `target_metadata = Base.metadata`.

3. Create an initial migration after models are in place:

```bash
cd backend
alembic revision --autogenerate -m "initial"
alembic upgrade head
```

4. For FTS indexes (expression indexes), if Alembic `autogenerate` doesn't pick them up, include them manually in a migration using `op.execute("CREATE INDEX ...")`.

Seeding local dev data

- Place seed JSON under `backend/seeds/` and add a script `backend/scripts/seed_db.py` that reads the JSON and inserts rows via SQLAlchemy session.
- Seed a test user, a few memories, one conversation with messages, and a sample project.

Backups & operation notes

- Use `pg_dump` for logical backups. For larger deployments, consider physical backups (pg_basebackup) or managed backups.
- Add simple retention policy and scheduled backup plan in the ops docs.

---

Last updated: 2026-07-27
