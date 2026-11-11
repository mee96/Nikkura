from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base

FOLDER_KINDS = ("custom", "favorites", "to_watch")

# Every user starts with these two folders, created together with the profile.
# The name is only a label: the app recognises them by their kind.
DEFAULT_FOLDERS: tuple[tuple[str, str], ...] = (
    ("favorites", "Favorites"),
    ("to_watch", "To watch"),
)


class Folder(Base):
    """A folder of a user's Kura (table `folder`, see migrations/001_initial.sql)."""

    __tablename__ = "folder"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_uid: Mapped[str] = mapped_column(
        String(128), ForeignKey("entity_user.firebase_uid", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    kind: Mapped[str] = mapped_column(
        Enum(*FOLDER_KINDS, name="folder_kind", native_enum=True),
        nullable=False,
        default="custom",
    )
    is_deleted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.current_timestamp()
    )

    @property
    def is_default(self) -> bool:
        """The folders every user starts with (`favorites`, `to_watch`) cannot be deleted."""
        return self.kind != "custom"
