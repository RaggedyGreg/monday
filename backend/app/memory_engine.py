"""Compatibility shim — delegates to backend.app.services.memoryEngine.

New code should import from backend.app.services.memoryEngine directly.
"""
from backend.app.services.memoryEngine import (  # noqa: F401
    extract_memories_from_text,
    create_memory,
    ingest_text_as_memories,
    retrieve_similar_memories,
)
