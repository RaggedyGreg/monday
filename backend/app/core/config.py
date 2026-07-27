"""Application configuration loaded from environment variables."""
import os
from dataclasses import dataclass, field


@dataclass
class Settings:
    app_name: str = "Monday"
    debug: bool = field(default_factory=lambda: os.getenv("DEBUG", "false").lower() in ("1", "true", "yes"))
    database_url: str = field(default_factory=lambda: os.getenv("DATABASE_URL", "sqlite:///./dev.db"))
    ai_provider: str = field(default_factory=lambda: os.getenv("AI_PROVIDER", "mock"))
    ai_api_key: str = field(default_factory=lambda: os.getenv("AI_API_KEY", ""))
    ai_model: str = field(default_factory=lambda: os.getenv("AI_MODEL", "claude-sonnet-4-6"))
    migrate_on_startup: bool = field(default_factory=lambda: os.getenv("MIGRATE_ON_STARTUP", "false").lower() in ("1", "true", "yes"))


settings = Settings()
