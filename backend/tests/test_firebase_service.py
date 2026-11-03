import contextlib

import firebase_admin
import pytest
from firebase_admin import auth

from app.core.config import get_settings
from app.services import firebase


@pytest.fixture(autouse=True)
def fresh_state(monkeypatch):
    """Every test starts without cached settings or Firebase app."""

    def forget_app() -> None:
        firebase.get_firebase_app.cache_clear()
        # ValueError: the test never created the app.
        with contextlib.suppress(ValueError):
            firebase_admin.delete_app(firebase_admin.get_app(firebase.APP_NAME))

    monkeypatch.delenv("FIREBASE_CREDENTIALS_JSON", raising=False)
    monkeypatch.setenv("FIREBASE_PROJECT_ID", "nikkura-test")
    get_settings.cache_clear()
    forget_app()
    yield
    get_settings.cache_clear()
    forget_app()


def test_a_valid_token_gives_its_claims(monkeypatch) -> None:
    monkeypatch.setattr(auth, "verify_id_token", lambda token, app=None: {"uid": "u1"})

    assert firebase.verify_id_token("good.token") == {"uid": "u1"}


@pytest.mark.parametrize(
    "error",
    [
        auth.InvalidIdTokenError("bad signature"),
        auth.ExpiredIdTokenError("expired", cause=None),
        auth.RevokedIdTokenError("revoked"),
        auth.UserDisabledError("disabled"),
        ValueError("empty token"),
    ],
)
def test_tokens_that_must_be_rejected_raise_invalid_token(monkeypatch, error) -> None:
    def fail(token, app=None):
        raise error

    monkeypatch.setattr(auth, "verify_id_token", fail)

    with pytest.raises(firebase.InvalidTokenError):
        firebase.verify_id_token("bad.token")


def test_missing_public_keys_raise_auth_unavailable(monkeypatch) -> None:
    def fail(token, app=None):
        raise auth.CertificateFetchError("no network", cause=None)

    monkeypatch.setattr(auth, "verify_id_token", fail)

    with pytest.raises(firebase.AuthUnavailableError):
        firebase.verify_id_token("any.token")


def test_a_garbage_token_is_rejected_by_the_real_sdk() -> None:
    with pytest.raises(firebase.InvalidTokenError):
        firebase.verify_id_token("not.a.token")


def test_the_app_is_created_once_with_the_project_id_and_no_secret() -> None:
    app = firebase.get_firebase_app()

    assert app.project_id == "nikkura-test"
    assert firebase.get_firebase_app() is app


def test_the_service_account_is_used_when_given(monkeypatch) -> None:
    created: list[dict] = []
    monkeypatch.setenv("FIREBASE_CREDENTIALS_JSON", '{"type": "service_account"}')
    monkeypatch.setattr(
        firebase.credentials, "Certificate", lambda info: created.append(info) or object()
    )
    monkeypatch.setattr(firebase.firebase_admin, "initialize_app", lambda *a, **k: (a, k))
    get_settings.cache_clear()

    firebase.get_firebase_app()

    assert created == [{"type": "service_account"}]


def test_a_missing_project_id_is_a_clear_error(monkeypatch) -> None:
    monkeypatch.setenv("FIREBASE_PROJECT_ID", "")
    get_settings.cache_clear()

    with pytest.raises(RuntimeError, match="FIREBASE_PROJECT_ID"):
        firebase.get_firebase_app()
