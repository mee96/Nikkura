from collections.abc import Iterator
from typing import Annotated

import pytest
from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient

from app.core.auth import CurrentUser, get_current_user, get_token_verifier
from app.main import app as real_app
from app.routers.health import database_is_up
from app.services.firebase import AuthUnavailableError, InvalidTokenError


@pytest.fixture
def app() -> FastAPI:
    """A tiny app with one private route, to test the dependency on its own."""
    test_app = FastAPI()

    @test_app.get("/private")
    def private(user: Annotated[CurrentUser, Depends(get_current_user)]) -> dict:
        return {"uid": user.uid, "email": user.email, "email_verified": user.email_verified}

    return test_app


@pytest.fixture
def client(app: FastAPI) -> Iterator[TestClient]:
    with TestClient(app) as test_client:
        yield test_client


def verifier_returning(claims: dict):
    seen: list[str] = []

    def verify(token: str) -> dict:
        seen.append(token)
        return claims

    verify.seen = seen  # type: ignore[attr-defined]
    return verify


def verifier_raising(error: Exception):
    def verify(token: str) -> dict:
        raise error

    return verify


def test_missing_token_is_401(app: FastAPI, client: TestClient) -> None:
    app.dependency_overrides[get_token_verifier] = lambda: verifier_returning({"uid": "u1"})

    response = client.get("/private")

    assert response.status_code == 401
    assert response.headers["www-authenticate"] == "Bearer"
    assert response.json() == {"detail": "Missing bearer token"}


def test_another_authorization_scheme_is_401(app: FastAPI, client: TestClient) -> None:
    app.dependency_overrides[get_token_verifier] = lambda: verifier_returning({"uid": "u1"})

    response = client.get("/private", headers={"Authorization": "Basic dXNlcjpwYXNz"})

    assert response.status_code == 401


def test_invalid_token_is_401_without_saying_why(app: FastAPI, client: TestClient) -> None:
    error = InvalidTokenError("Token expired 3 minutes ago, aud is wrong")
    app.dependency_overrides[get_token_verifier] = lambda: verifier_raising(error)

    response = client.get("/private", headers={"Authorization": "Bearer bad.token"})

    assert response.status_code == 401
    assert response.headers["www-authenticate"] == "Bearer"
    assert response.json() == {"detail": "Invalid or expired token"}


def test_keys_that_cannot_be_fetched_are_503_not_401(app: FastAPI, client: TestClient) -> None:
    app.dependency_overrides[get_token_verifier] = lambda: verifier_raising(
        AuthUnavailableError("network down")
    )

    response = client.get("/private", headers={"Authorization": "Bearer any.token"})

    assert response.status_code == 503


def test_valid_token_gives_the_current_user(app: FastAPI, client: TestClient) -> None:
    verify = verifier_returning({"uid": "u1", "email": "a@b.com", "email_verified": True})
    app.dependency_overrides[get_token_verifier] = lambda: verify

    response = client.get("/private", headers={"Authorization": "Bearer good.token"})

    assert response.status_code == 200
    assert response.json() == {"uid": "u1", "email": "a@b.com", "email_verified": True}
    assert verify.seen == ["good.token"]


def test_user_without_email_is_allowed(app: FastAPI, client: TestClient) -> None:
    app.dependency_overrides[get_token_verifier] = lambda: verifier_returning({"uid": "u1"})

    response = client.get("/private", headers={"Authorization": "Bearer good.token"})

    assert response.json() == {"uid": "u1", "email": None, "email_verified": False}


def test_the_user_id_can_come_from_the_sub_claim(app: FastAPI, client: TestClient) -> None:
    app.dependency_overrides[get_token_verifier] = lambda: verifier_returning({"sub": "u2"})

    response = client.get("/private", headers={"Authorization": "Bearer good.token"})

    assert response.json()["uid"] == "u2"


def test_claims_without_a_user_id_are_401(app: FastAPI, client: TestClient) -> None:
    app.dependency_overrides[get_token_verifier] = lambda: verifier_returning({"email": "a@b.com"})

    response = client.get("/private", headers={"Authorization": "Bearer good.token"})

    assert response.status_code == 401


def test_the_health_check_stays_public() -> None:
    real_app.dependency_overrides[database_is_up] = lambda: True
    try:
        with TestClient(real_app) as client:
            assert client.get("/health").status_code == 200
    finally:
        real_app.dependency_overrides.clear()
