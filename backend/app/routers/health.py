from typing import Annotated

from fastapi import APIRouter, Depends, Response, status

from app.schemas.health import HealthResponse
from app.utils.db import check_database

router = APIRouter(tags=["health"])


def database_is_up() -> bool:
    return check_database()


@router.get(
    "/health",
    response_model=HealthResponse,
    responses={503: {"model": HealthResponse, "description": "The database is not reachable"}},
)
def health(response: Response, db_up: Annotated[bool, Depends(database_is_up)]) -> HealthResponse:
    """Liveness check used by Render and the keep-alive pings."""
    if not db_up:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return HealthResponse(status="degraded", database="down")
    return HealthResponse(status="ok", database="up")
