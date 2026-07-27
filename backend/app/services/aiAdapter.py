"""Provider-agnostic AI adapter.

The application never calls an LLM directly — it always goes through this
interface. To add a new provider, subclass AIAdapter and register it in
get_adapter().
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Optional
import os


class AIAdapter(ABC):
    """Abstract base for all LLM providers."""

    @abstractmethod
    def chat(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """Send a list of {role, content} messages and return the assistant reply."""
        ...

    @abstractmethod
    def embed(self, text: str) -> List[float]:
        """Return a vector embedding for the given text."""
        ...


class MockAdapter(AIAdapter):
    """Deterministic mock used in tests and when no API key is configured."""

    _REPLIES = [
        "I'm holding that alongside everything I know about your work. Here's what stands out.",
        "There's something worth pausing on. Let me think through it carefully.",
        "Based on what you've shared, here's where I'd start. Let me know what resonates.",
        "I noticed you've come back to this a few times — that usually means it's significant.",
    ]

    def chat(self, messages: List[Dict[str, str]], **kwargs) -> str:
        # Return a reply that varies deterministically by message count
        idx = len(messages) % len(self._REPLIES)
        return self._REPLIES[idx]

    def embed(self, text: str) -> List[float]:
        # Deterministic lightweight embedding (same as memory_engine placeholder)
        vec = [float((ord(c) % 31) / 31.0) for c in text[:128]]
        dims = 16
        out = [0.0] * dims
        for i, v in enumerate(vec):
            out[i % dims] += v
        s = sum(abs(x) for x in out) or 1.0
        return [x / s for x in out]


def get_adapter(provider: Optional[str] = None) -> AIAdapter:
    """Factory — returns the adapter for the configured or requested provider."""
    provider = provider or os.getenv("AI_PROVIDER", "mock")
    if provider == "mock":
        return MockAdapter()
    # Future: add OpenAI, Anthropic, local adapters here
    raise ValueError(f"Unknown AI provider: {provider!r}. Supported: mock")
