"""Versioned SQL migrations for the `nikkura` schema.

Each change to the database is a numbered file in `backend/migrations/`
(`001_initial.sql`, `002_...sql`). `apply_pending` runs, in order, the files
that are not yet in the `schema_migrations` table and records each one after it
succeeds. Statements end with `;` at the end of a line; `--` starts a comment.

MySQL commits every `CREATE`/`ALTER` on its own, so a migration that fails
halfway cannot be rolled back: keep one change per file and write it so it can
be run again (`IF NOT EXISTS`, `IF EXISTS`).
"""

import logging
import re
from dataclasses import dataclass
from pathlib import Path

from sqlalchemy import (
    Column,
    DateTime,
    Engine,
    MetaData,
    String,
    Table,
    func,
    insert,
    select,
    text,
)

logger = logging.getLogger(__name__)

MIGRATIONS_DIR = Path(__file__).resolve().parents[2] / "migrations"
_FILE_NAME = re.compile(r"^(?P<version>\d{3})_(?P<name>[a-z0-9_]+)\.sql$")

_metadata = MetaData()
schema_migrations = Table(
    "schema_migrations",
    _metadata,
    Column("version", String(16), primary_key=True),
    Column("name", String(100), nullable=False),
    Column("applied_at", DateTime, nullable=False, server_default=func.current_timestamp()),
)


class MigrationError(RuntimeError):
    """A migration file is wrong or could not be applied."""


@dataclass(frozen=True)
class Migration:
    version: str
    name: str
    path: Path

    @property
    def label(self) -> str:
        return f"{self.version}_{self.name}"


def split_statements(sql: str) -> list[str]:
    """Split a SQL file into statements, without comments or blank lines."""
    lines = []
    for line in sql.splitlines():
        code = line.split("--", 1)[0].rstrip()
        if code.strip():
            lines.append(code)
    statements = []
    current: list[str] = []
    for line in lines:
        current.append(line)
        if line.endswith(";"):
            statement = "\n".join(current).strip()[:-1].strip()
            if statement:
                statements.append(statement)
            current = []
    rest = "\n".join(current).strip()
    if rest:
        statements.append(rest)
    return statements


def discover(directory: Path = MIGRATIONS_DIR) -> list[Migration]:
    """Return the migration files of a folder, sorted by number."""
    found: dict[str, Migration] = {}
    for path in sorted(directory.glob("*.sql")):
        match = _FILE_NAME.match(path.name)
        if not match:
            raise MigrationError(f"{path.name}: name it like 001_short_name.sql")
        version = match["version"]
        if version in found:
            raise MigrationError(
                f"Two migrations share the number {version}: {found[version].path.name}, "
                f"{path.name}"
            )
        found[version] = Migration(version=version, name=match["name"], path=path)
    return [found[version] for version in sorted(found)]


def applied_versions(engine: Engine) -> set[str]:
    """Versions already recorded in `schema_migrations` (creates the table if needed)."""
    _metadata.create_all(engine, tables=[schema_migrations])
    with engine.connect() as connection:
        return set(connection.execute(select(schema_migrations.c.version)).scalars())


def pending(found: list[Migration], applied: set[str]) -> list[Migration]:
    return [migration for migration in found if migration.version not in applied]


def apply_pending(
    engine: Engine, directory: Path = MIGRATIONS_DIR, *, dry_run: bool = False
) -> list[Migration]:
    """Apply the migrations that are not recorded yet, in order, and return them.

    With `dry_run` nothing is executed: it only returns what would be applied.
    """
    todo = pending(discover(directory), applied_versions(engine))
    if dry_run:
        return todo
    for migration in todo:
        statements = split_statements(migration.path.read_text(encoding="utf-8"))
        try:
            with engine.begin() as connection:
                for statement in statements:
                    connection.execute(text(statement))
                connection.execute(
                    insert(schema_migrations).values(version=migration.version, name=migration.name)
                )
        except Exception as exc:
            raise MigrationError(f"{migration.label} failed: {exc}") from exc
        logger.info("Applied migration %s", migration.label)
    return todo
