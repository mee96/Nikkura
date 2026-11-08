from datetime import datetime
from typing import Annotated, Self

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, model_validator

from app.core.config import Role

Username = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=50)]


class UserProfileCreate(BaseModel):
    """Body of `POST /users/me`, sent right after signing up in Firebase."""

    model_config = ConfigDict(extra="forbid")

    username: Username
    role: Role


class UserProfileUpdate(BaseModel):
    """Body of `PATCH /users/me`: send only what changes."""

    model_config = ConfigDict(extra="forbid")

    username: Username | None = None
    role: Role | None = None

    @model_validator(mode="after")
    def something_to_change(self) -> Self:
        if self.username is None and self.role is None:
            raise ValueError("Send a username or a role to change")
        return self


class UserProfile(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    uid: str = Field(validation_alias="firebase_uid")
    username: str
    email: str | None
    role: Role
    created_at: datetime
