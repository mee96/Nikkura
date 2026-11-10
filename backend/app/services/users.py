"""Profiles of the registered users: one row of `entity_user` per Firebase uid."""

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.auth import CurrentUser
from app.models import EntityUser
from app.schemas.user import UserProfileCreate, UserProfileUpdate


def get_profile(db: Session, uid: str) -> EntityUser | None:
    return db.get(EntityUser, uid)


def create_profile(
    db: Session, user: CurrentUser, data: UserProfileCreate
) -> tuple[EntityUser, bool]:
    """Create the profile of `user`, or return the one that already exists.

    Returns the profile and whether it was created now. Repeating the request
    (a retry after signing up) never makes a second profile or changes the first.
    """
    existing = get_profile(db, user.uid)
    if existing is not None:
        return existing, False
    profile = EntityUser(
        firebase_uid=user.uid, username=data.username, email=user.email, role=data.role
    )
    db.add(profile)
    try:
        db.commit()
    except IntegrityError:
        # Two requests at the same time: the other one created it first.
        db.rollback()
        existing = get_profile(db, user.uid)
        if existing is None:
            raise
        return existing, False
    db.refresh(profile)
    return profile, True


def update_profile(db: Session, profile: EntityUser, data: UserProfileUpdate) -> EntityUser:
    if data.username is not None:
        profile.username = data.username
    if data.role is not None:
        profile.role = data.role
    db.commit()
    db.refresh(profile)
    return profile
