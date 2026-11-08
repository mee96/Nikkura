"""Verification of Firebase ID tokens with the Firebase Admin SDK."""

import json
from functools import lru_cache

import firebase_admin
from firebase_admin import auth, credentials
from google.auth.credentials import AnonymousCredentials

from app.core.config import get_settings

APP_NAME = "nikkura"


class InvalidTokenError(Exception):
    """The token is missing a valid signature, is expired, revoked or for another project."""


class AuthUnavailableError(Exception):
    """Google's public keys could not be fetched, so no token can be checked right now."""


@lru_cache
def get_firebase_app() -> firebase_admin.App:
    """Create the Firebase app on first use, so importing the API never needs Firebase."""
    settings = get_settings()
    if not settings.firebase_project_id:
        raise RuntimeError("FIREBASE_PROJECT_ID is not set")
    credential = (
        credentials.Certificate(json.loads(settings.firebase_credentials_json))
        if settings.firebase_credentials_json
        else AnonymousCredentials()
    )
    return firebase_admin.initialize_app(
        credential, options={"projectId": settings.firebase_project_id}, name=APP_NAME
    )


def verify_id_token(token: str) -> dict:
    """Return the claims of a valid Firebase ID token.

    Raises InvalidTokenError for any token that must be rejected and
    AuthUnavailableError when the check could not be done.
    """
    try:
        return auth.verify_id_token(token, app=get_firebase_app())
    except auth.CertificateFetchError as exc:
        raise AuthUnavailableError(str(exc)) from exc
    except (ValueError, auth.InvalidIdTokenError, auth.UserDisabledError) as exc:
        # InvalidIdTokenError also covers expired and revoked tokens (its subclasses).
        raise InvalidTokenError(str(exc)) from exc
