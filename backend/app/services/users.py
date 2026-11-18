"""Profiles of the registered users: one row of `entity_user` per Firebase uid."""

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.auth import CurrentUser
from app.models import DEFAULT_FOLDERS, EntityUser, Folder
from app.schemas.user import UserProfileCreate, UserProfileUpdate


def get_profile(db: Session, uid: str) -> EntityUser | None:
    return db.get(EntityUser, uid)


def create_profile(
    db: Session, user: CurrentUser, data: UserProfileCreate
) -> tuple[EntityUser, bool]:
    """Create the profile of `user` with its default folders, or return the one that exists.

    The profile and the two default folders (`favorites`, `to_watch`) are saved in the same
    transaction: a profile never exists without them. Returns the profile and whether it was
    created now. Repeating the request (a retry after signing up) never makes a second
    profile or a second pair of folders, and changes nothing.
    """
    existing = get_profile(db, user.uid)
    if existing is not None:
        return existing, False
    profile = EntityUser(
        firebase_uid=user.uid, username=data.username, email=user.email, role=data.role
    )
    try:
        db.add(profile)
        db.flush()  # the profile row first: the folders point at it
        db.add_all(
            Folder(user_uid=user.uid, name=name, kind=kind) for kind, name in DEFAULT_FOLDERS
        )
        db.commit()
    except IntegrityError:
        # Two requests at the same time: the other one created it first, folders included.
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
