from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base

ROLES = ("moe_magical", "haku_sama", "senpai")


class EntityUser(Base):
    """One profile per Firebase user (table `entity_user`, see migrations/001_initial.sql)."""

    __tablename__ = "entity_user"

    firebase_uid: Mapped[str] = mapped_column(String(128), primary_key=True)
    username: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    role: Mapped[str] = mapped_column(Enum(*ROLES, name="role", native_enum=True), nullable=False)
    # Left over from the first design: Nikkura asks nobody's age (3 Nov 2026).
    # The column stays in the table but the API never reads or writes it.
    is_adult: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.current_timestamp()
    )
