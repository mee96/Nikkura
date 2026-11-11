"""Folders of the Kura. Only the rules that protect the default folders live here for now."""

from sqlalchemy.orm import Session

from app.models import Folder


class DefaultFolderError(Exception):
    """Raised when someone tries to delete one of the folders every user starts with."""


def soft_delete_folder(db: Session, folder: Folder) -> None:
    """Mark a folder as deleted. The default folders (`favorites`, `to_watch`) are refused."""
    if folder.is_default:
        raise DefaultFolderError(f"The folder '{folder.kind}' cannot be deleted")
    folder.is_deleted = True
    db.commit()
