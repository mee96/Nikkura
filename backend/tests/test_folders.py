from collections.abc import Iterator

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.models import DEFAULT_FOLDERS, Base, EntityUser, Folder
from app.services.folders import DefaultFolderError, soft_delete_folder


@pytest.fixture
def db() -> Iterator[Session]:
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(engine)
    with sessionmaker(bind=engine)() as session:
        session.add(EntityUser(firebase_uid="uid-alice", username="Alice", role="senpai"))
        session.commit()
        yield session


def make_folder(db: Session, kind: str, name: str) -> Folder:
    folder = Folder(user_uid="uid-alice", name=name, kind=kind)
    db.add(folder)
    db.commit()
    return folder


def test_the_default_folders_are_favorites_and_to_watch() -> None:
    assert [kind for kind, _ in DEFAULT_FOLDERS] == ["favorites", "to_watch"]


def test_a_new_folder_is_custom_and_not_deleted(db: Session) -> None:
    folder = Folder(user_uid="uid-alice", name="Mecha")
    db.add(folder)
    db.commit()

    assert folder.kind == "custom"
    assert folder.is_deleted is False
    assert folder.is_default is False


def test_a_custom_folder_can_be_deleted(db: Session) -> None:
    folder = make_folder(db, "custom", "Mecha")

    soft_delete_folder(db, folder)

    assert folder.is_deleted is True


@pytest.mark.parametrize(("kind", "name"), DEFAULT_FOLDERS)
def test_a_default_folder_cannot_be_deleted(db: Session, kind: str, name: str) -> None:
    folder = make_folder(db, kind, name)

    with pytest.raises(DefaultFolderError):
        soft_delete_folder(db, folder)

    db.refresh(folder)
    assert folder.is_deleted is False
