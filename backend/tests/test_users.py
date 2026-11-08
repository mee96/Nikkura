from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.auth import CurrentUser, get_current_user
from app.main import app
from app.models import Base, EntityUser
from app.utils.db import get_db

ALICE = CurrentUser(uid="uid-alice", email="alice@example.com", email_verified=True)
BOB = CurrentUser(uid="uid-bob", email=None)


@pytest.fixture
def session_factory() -> sessionmaker[Session]:
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(engine)
    return sessionmaker(bind=engine)


@pytest.fixture
def client(session_factory: sessionmaker[Session]) -> Iterator[TestClient]:
    def override_db() -> Iterator[Session]:
        session = session_factory()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = override_db
    app.dependency_overrides[get_current_user] = lambda: ALICE
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def log_in_as(user: CurrentUser) -> None:
    app.dependency_overrides[get_current_user] = lambda: user


def test_get_without_a_profile_is_404(client: TestClient) -> None:
    response = client.get("/users/me")

    assert response.status_code == 404
    assert response.json() == {"detail": "Profile not found"}


def test_post_creates_the_profile_with_the_email_of_the_token(client: TestClient) -> None:
    response = client.post("/users/me", json={"username": "  Alice  ", "role": "moe_magical"})

    assert response.status_code == 201
    body = response.json()
    assert body["uid"] == "uid-alice"
    assert body["username"] == "Alice"
    assert body["email"] == "alice@example.com"
    assert body["role"] == "moe_magical"
    assert "created_at" in body
    assert "is_adult" not in body

    assert client.get("/users/me").json() == body


def test_post_twice_keeps_one_profile_and_returns_it(
    client: TestClient, session_factory: sessionmaker[Session]
) -> None:
    first = client.post("/users/me", json={"username": "Alice", "role": "moe_magical"})
    again = client.post("/users/me", json={"username": "Other", "role": "senpai"})

    assert again.status_code == 200
    assert again.json() == first.json()
    with session_factory() as session:
        assert len(session.scalars(select(EntityUser)).all()) == 1


@pytest.mark.parametrize("role", ["moe", "visitor", "MOE_MAGICAL", ""])
def test_unknown_role_is_422(client: TestClient, role: str) -> None:
    response = client.post("/users/me", json={"username": "Alice", "role": role})

    assert response.status_code == 422


@pytest.mark.parametrize("username", ["", "   ", "x" * 51])
def test_username_must_have_1_to_50_characters(client: TestClient, username: str) -> None:
    response = client.post("/users/me", json={"username": username, "role": "senpai"})

    assert response.status_code == 422


def test_age_is_not_accepted(client: TestClient) -> None:
    response = client.post(
        "/users/me", json={"username": "Alice", "role": "senpai", "is_adult": True}
    )

    assert response.status_code == 422


def test_patch_changes_the_role(client: TestClient) -> None:
    client.post("/users/me", json={"username": "Alice", "role": "moe_magical"})

    response = client.patch("/users/me", json={"role": "haku_sama"})

    assert response.status_code == 200
    assert response.json()["role"] == "haku_sama"
    assert response.json()["username"] == "Alice"
    assert client.get("/users/me").json()["role"] == "haku_sama"


def test_patch_changes_the_username(client: TestClient) -> None:
    client.post("/users/me", json={"username": "Alice", "role": "moe_magical"})

    response = client.patch("/users/me", json={"username": "Alicia"})

    assert response.json()["username"] == "Alicia"
    assert response.json()["role"] == "moe_magical"


def test_patch_with_nothing_to_change_is_422(client: TestClient) -> None:
    client.post("/users/me", json={"username": "Alice", "role": "moe_magical"})

    assert client.patch("/users/me", json={}).status_code == 422
    assert client.patch("/users/me", json={"role": None}).status_code == 422


def test_patch_without_a_profile_is_404(client: TestClient) -> None:
    assert client.patch("/users/me", json={"role": "senpai"}).status_code == 404


def test_each_user_only_sees_their_own_profile(client: TestClient) -> None:
    client.post("/users/me", json={"username": "Alice", "role": "moe_magical"})

    log_in_as(BOB)
    assert client.get("/users/me").status_code == 404
    created = client.post("/users/me", json={"username": "Bob", "role": "senpai"})
    assert created.status_code == 201
    assert created.json()["email"] is None

    log_in_as(ALICE)
    assert client.get("/users/me").json()["username"] == "Alice"


def test_routes_need_a_token() -> None:
    app.dependency_overrides.clear()
    with TestClient(app) as test_client:
        assert test_client.get("/users/me").status_code == 401
        assert test_client.post("/users/me", json={}).status_code == 401
        assert test_client.patch("/users/me", json={}).status_code == 401
