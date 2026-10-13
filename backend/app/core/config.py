"""Settings read from environment variables, plus the app-wide content rules."""

from functools import lru_cache
from typing import Annotated, Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

Role = Literal["moe_magical", "haku_sama", "senpai"]


class Settings(BaseSettings):
    # Empty values in .env (like `DB_PORT=`) fall back to the defaults below.
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", env_ignore_empty=True, extra="ignore"
    )

    environment: Literal["local", "production"] = "local"

    db_host: str = "localhost"
    db_port: int = 3306
    db_name: str = "nikkura"
    db_user: str = ""
    db_password: str = ""
    # Path to the CA certificate of the MySQL server. Aiven requires SSL, so in
    # production this points to the ca.pem downloaded from the Aiven console.
    db_ssl_ca: str = ""

    # Comma-separated list of frontend origins allowed to call the API.
    cors_origins: Annotated[list[str], NoDecode] = Field(
        default_factory=lambda: ["http://localhost:4200"]
    )

    @field_validator("cors_origins", mode="before")
    @classmethod
    def split_origins(cls, value: object) -> object:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()


# Genres, themes and demographics recommended to each role, by Jikan name.
# They are resolved to Jikan ids at runtime (see issue #9), never hard-coded.
ROLE_GENRES: dict[Role, list[str]] = {
    "moe_magical": ["Shoujo", "Mahou Shoujo", "Romance"],
    "haku_sama": ["Shoujo", "Isekai"],
    "senpai": ["Seinen", "Slice of Life"],
}

# Extra genres for a role when the user has confirmed they are 18 or older.
ROLE_GENRES_ADULT: dict[Role, list[str]] = {
    "senpai": ["Ecchi"],
}

# Content rules for every Jikan query. Hentai is never shown, not even to adults,
# and nothing above the R rating (17+) is listed.
CONTENT_RULES = {
    "default": {"sfw": True},
    "adult": {"sfw": False, "genres_exclude": ["Hentai"], "max_rating": "r"},
}
