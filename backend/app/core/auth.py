"""The current user of a request, from the Firebase ID token in `Authorization: Bearer`."""

import logging
from collections.abc import Callable
from dataclasses import dataclass
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.services.firebase import AuthUnavailableError, InvalidTokenError, verify_id_token

logger = logging.getLogger(__name__)

# `auto_error=False` so that a missing header is answered with 401 (FastAPI's default is 403).
bearer_scheme = HTTPBearer(auto_error=False)


@dataclass(frozen=True)
class CurrentUser:
    """Who is calling. `uid` is the Firebase user id: the key of every row of user data."""

    uid: str
    email: str | None = None
    email_verified: bool = False


def get_token_verifier() -> Callable[[str], dict]:
    """Dependency that gives the function that checks tokens (tests replace it)."""
    return verify_id_token


def _unauthorized(detail: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    verify: Annotated[Callable[[str], dict], Depends(get_token_verifier)],
) -> CurrentUser:
    """Return the logged-in user, or answer 401 when the token is missing or not valid."""
    if credentials is None:
        raise _unauthorized("Missing bearer token")
    try:
        claims = verify(credentials.credentials)
    except InvalidTokenError as exc:
        # The reason is logged, never sent back: it tells an attacker what to fix.
        logger.info("Rejected ID token: %s", exc)
        raise _unauthorized("Invalid or expired token") from exc
    except AuthUnavailableError as exc:
        logger.warning("Could not verify an ID token: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication is unavailable right now",
        ) from exc
    uid = claims.get("uid") or claims.get("sub")
    if not uid:
        raise _unauthorized("Invalid or expired token")
    return CurrentUser(
        uid=uid,
        email=claims.get("email"),
        email_verified=bool(claims.get("email_verified", False)),
    )
