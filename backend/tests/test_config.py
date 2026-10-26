from app.core.config import EXCLUDED_GENRES, ROLE_GENRES, Settings


def test_cors_origins_are_read_as_a_comma_separated_list() -> None:
    settings = Settings(cors_origins="https://nikkura.onrender.com, http://localhost:4200")

    assert settings.cors_origins == ["https://nikkura.onrender.com", "http://localhost:4200"]


def test_every_role_has_recommended_genres() -> None:
    assert set(ROLE_GENRES) == {"moe_magical", "haku_sama", "senpai"}
    assert all(ROLE_GENRES.values())


def test_explicit_genres_are_excluded_for_everyone() -> None:
    assert set(EXCLUDED_GENRES) == {"Hentai", "Erotica", "Ecchi"}


def test_no_role_is_recommended_an_excluded_genre() -> None:
    recommended = {genre for genres in ROLE_GENRES.values() for genre in genres}

    assert recommended.isdisjoint(EXCLUDED_GENRES)


def test_empty_env_values_fall_back_to_defaults(monkeypatch) -> None:
    monkeypatch.setenv("DB_PORT", "")

    assert Settings().db_port == 3306
