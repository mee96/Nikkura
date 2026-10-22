from app.core.config import CONTENT_RULES, ROLE_GENRES, Settings


def test_cors_origins_are_read_as_a_comma_separated_list() -> None:
    settings = Settings(cors_origins="https://nikkura.onrender.com, http://localhost:4200")

    assert settings.cors_origins == ["https://nikkura.onrender.com", "http://localhost:4200"]


def test_every_role_has_recommended_genres() -> None:
    assert set(ROLE_GENRES) == {"moe_magical", "haku_sama", "senpai"}
    assert all(ROLE_GENRES.values())


def test_hentai_is_excluded_even_for_adults() -> None:
    assert CONTENT_RULES["default"]["sfw"] is True
    assert "Hentai" in CONTENT_RULES["adult"]["genres_exclude"]


def test_empty_env_values_fall_back_to_defaults(monkeypatch) -> None:
    monkeypatch.setenv("DB_PORT", "")

    assert Settings().db_port == 3306
