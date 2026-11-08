from app.core.config import EXCLUDED_GENRES, MATURE_GENRES, ROLE_GENRES, Settings


def test_cors_origins_are_read_as_a_comma_separated_list() -> None:
    settings = Settings(cors_origins="https://nikkura.onrender.com, http://localhost:4200")

    assert settings.cors_origins == ["https://nikkura.onrender.com", "http://localhost:4200"]


def test_every_role_has_recommended_genres() -> None:
    assert set(ROLE_GENRES) == {"moe_magical", "haku_sama", "senpai"}
    assert all(ROLE_GENRES.values())


def test_only_hentai_is_excluded_for_everyone() -> None:
    assert EXCLUDED_GENRES == ("Hentai",)


def test_ecchi_and_erotica_are_shown_with_a_mature_mark() -> None:
    assert MATURE_GENRES == ("Ecchi", "Erotica")
    assert set(MATURE_GENRES).isdisjoint(EXCLUDED_GENRES)


def test_no_role_is_recommended_an_excluded_genre() -> None:
    recommended = {genre for genres in ROLE_GENRES.values() for genre in genres}

    assert recommended.isdisjoint(EXCLUDED_GENRES)


def test_empty_env_values_fall_back_to_defaults(monkeypatch) -> None:
    monkeypatch.setenv("DB_PORT", "")

    assert Settings().db_port == 3306


def test_firebase_settings_default_to_empty_so_importing_the_app_needs_nothing() -> None:
    settings = Settings()

    assert settings.firebase_project_id == ""
    assert settings.firebase_credentials_json == ""
