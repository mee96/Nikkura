from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.routers.health import database_is_up


@pytest.fixture
def client() -> Iterator[TestClient]:
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def test_health_ok_when_database_is_up(client: TestClient) -> None:
    app.dependency_overrides[database_is_up] = lambda: True

    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "database": "up"}


def test_health_503_when_database_is_down(client: TestClient) -> None:
    app.dependency_overrides[database_is_up] = lambda: False

    response = client.get("/health")

    assert response.status_code == 503
    assert response.json() == {"status": "degraded", "database": "down"}


def test_cors_allows_the_local_frontend(client: TestClient) -> None:
    app.dependency_overrides[database_is_up] = lambda: True

    response = client.get("/health", headers={"Origin": "http://localhost:4200"})

    assert response.headers["access-control-allow-origin"] == "http://localhost:4200"


def test_cors_rejects_unknown_origins(client: TestClient) -> None:
    app.dependency_overrides[database_is_up] = lambda: True

    response = client.get("/health", headers={"Origin": "https://example.com"})

    assert "access-control-allow-origin" not in response.headers


def test_database_check_logs_the_reason(monkeypatch, caplog) -> None:
    from app.utils import db

    def broken_engine():
        raise RuntimeError("connection refused")

    monkeypatch.setattr(db, "get_engine", broken_engine)

    assert db.check_database() is False
    assert "Database check failed: RuntimeError: connection refused" in caplog.text
