# ☕ Monday

> **A companion for the difficult beginnings of meaningful work.**

Monday is a persistent AI companion designed to help people through the moments when starting feels hardest.

Sometimes that's Monday morning.

Sometimes it's an empty IDE.

Sometimes it's the first sentence of a book.

Sometimes it's launching a company.

Monday exists for those moments.

It doesn't replace your thinking.

It thinks beside you.

---

# Philosophy

Technology should reduce loneliness during creation.

Monday is not built to impress people with artificial intelligence.

It is built to become a trusted companion that remembers context, grows with its user, and makes difficult beginnings feel less overwhelming.

Every design decision, architectural choice, and feature should reinforce one simple idea:

> **Make today a little easier than yesterday.**

---

# Vision

Build the world's most trusted digital companion.

A companion that remembers.

Learns.

Reflects.

Encourages.

And quietly helps people make progress over years of meaningful work.

---

# Core Principles

* Calm over noise.
* Trust over hype.
* Continuity over transactions.
* Quality over speed.
* Humans first.
* Simplicity over complexity.
* Readability over cleverness.
* Documentation over tribal knowledge.

---

# MVP Goals

The first version of Monday focuses on six core capabilities:

* Persistent conversations
* Long-term memory
* Project management
* Goal tracking
* Reflection engine
* Personality engine

Everything else is secondary.

---

# Technology Stack

## Frontend

* React
* TypeScript
* Vite
* React Router
* TanStack Query
* Zustand
* Tailwind CSS
* shadcn/ui
* React Hook Form
* Zod
* Framer Motion

---

## Backend

* Python
* FastAPI
* SQLAlchemy
* Alembic
* Pydantic

---

## Database

* PostgreSQL

Future versions will support:

* pgvector
* Redis
* Object Storage

---

## AI

Monday is provider-agnostic.

The application should support multiple LLM providers behind a common abstraction layer.

Examples include:

* OpenAI
* Anthropic
* Local models
* Future providers

The AI provider should never be tightly coupled to the application's architecture.

---

# Project Structure

```text
monday/

├── backend/
├── frontend/
├── database/
├── docker/
├── docs/
├── scripts/
├── .github/
├── .vscode/
├── README.md
├── MONDAY.md
└── docker-compose.yml
```

---

# Architecture

```text
User

↓

Frontend

↓

API

↓

Application Layer

↓

Memory Engine

↓

Goal Engine

↓

Reflection Engine

↓

Personality Engine

↓

LLM Provider

↓

Database
```

The model itself is replaceable.

The architecture is the product.

---

# Engineering Philosophy

Monday is designed to be maintainable for years.

We optimize for:

* Clear code
* Small modules
* Explicit architecture
* Strong typing
* Comprehensive documentation
* Automated testing
* Clean interfaces

Every feature should be understandable by a new contributor without requiring tribal knowledge.

---

# Development Principles

Before implementing a feature:

1. Define the problem.
2. Write the user story.
3. Design the experience.
4. Define the API.
5. Implement.
6. Test.
7. Document.

Documentation is part of the feature.

---

# Development Environment

The project is designed to be developed using:

* Visual Studio Code
* GitHub Copilot
* Docker Compose
* Dev Containers

The repository includes project documentation and Copilot guidance to ensure consistent code generation across the entire codebase.

---

# Documentation

The `/docs` directory contains the project's complete documentation.

Recommended reading order:

1. `MANIFEST.md`
2. `MONDAY.md`
3. Product Requirements
4. Architecture
5. Engineering Standards
6. API Documentation
7. RFCs

---

# Contributing

Every contribution should align with Monday's philosophy.

Ask yourself:

* Does this make the product calmer?
* Does this reduce cognitive load?
* Does this help the user make progress?
* Does this preserve trust?
* Would this still feel right in five years?

If the answer is "no," reconsider the implementation.

---

# Long-Term Roadmap

* Companion
* Developer Companion
* Voice Companion
* Tool-Using Agent
* Multi-Agent Collaboration
* Open Platform

Each stage should strengthen Monday's identity as a trusted companion rather than simply adding more features.

---

# License

This project is currently under active development.

License information will be added before the first public release.

---

# Final Thought

People shouldn't think:

> "I'm going to use an AI."

They should think:

> **"I'm going to open Monday."**
