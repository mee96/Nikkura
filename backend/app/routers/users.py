from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.core.auth import CurrentUser, get_current_user
from app.models import EntityUser
from app.schemas.user import UserProfile, UserProfileCreate, UserProfileUpdate
from app.services import users
from app.utils.db import get_db

router = APIRouter(prefix="/users", tags=["users"])

DbSession = Annotated[Session, Depends(get_db)]
LoggedUser = Annotated[CurrentUser, Depends(get_current_user)]

_UNAUTHORIZED = {401: {"description": "Missing, invalid or expired token"}}
_NOT_FOUND = {404: {"description": "The user has no profile yet"}}


def _own_profile(db: Session, user: CurrentUser) -> EntityUser:
    profile = users.get_profile(db, user.uid)
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return profile


@router.get("/me", response_model=UserProfile, responses=_UNAUTHORIZED | _NOT_FOUND)
def read_my_profile(db: DbSession, user: LoggedUser) -> EntityUser:
    """The profile of the logged-in user."""
    return _own_profile(db, user)


@router.post(
    "/me",
    response_model=UserProfile,
    status_code=status.HTTP_201_CREATED,
    responses=_UNAUTHORIZED | {200: {"description": "The profile already existed"}},
)
def create_my_profile(
    data: UserProfileCreate, response: Response, db: DbSession, user: LoggedUser
) -> EntityUser:
    """Create the profile after signing up. The email comes from the token.

    Calling it again returns the existing profile unchanged (200).
    """
    profile, created = users.create_profile(db, user, data)
    if not created:
        response.status_code = status.HTTP_200_OK
    return profile


@router.patch("/me", response_model=UserProfile, responses=_UNAUTHORIZED | _NOT_FOUND)
def update_my_profile(data: UserProfileUpdate, db: DbSession, user: LoggedUser) -> EntityUser:
    """Change the username or the role."""
    return users.update_profile(db, _own_profile(db, user), data)
