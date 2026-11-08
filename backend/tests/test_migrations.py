from pathlib import Path

import pytest
from sqlalchemy import create_engine, inspect, text

from app.utils.migrations import (
    MIGRATIONS_DIR,
    MigrationError,
    applied_versions,
    apply_pending,
    discover,
    pending,
    split_statements,
)


@pytest.fixture
def engine():
    return create_engine("sqlite://")


@pytest.fixture
def migrations_dir(tmp_path: Path) -> Path:
    (tmp_path / "001_first.sql").write_text(
        "-- first table\nCREATE TABLE a (id INTEGER PRIMARY KEY);\n", encoding="utf-8"
    )
    (tmp_path / "002_second.sql").write_text(
        "CREATE TABLE b (id INTEGER PRIMARY KEY);\n"
        "INSERT INTO b (id) VALUES (1);\n"
        "INSERT INTO b (id) VALUES (2);\n",
        encoding="utf-8",
    )
    (tmp_path / "README.txt").write_text("not a migration", encoding="utf-8")
    return tmp_path


def test_split_statements_ignores_comments_and_blank_lines() -> None:
    sql = """
    -- a comment
    CREATE TABLE a (
      id INT -- trailing note
    );

    INSERT INTO a VALUES (1);
    """

    statements = split_statements(sql)

    assert len(statements) == 2
    assert statements[0].startswith("CREATE TABLE a (")
    assert "trailing note" not in statements[0]
    assert statements[1] == "INSERT INTO a VALUES (1)"


def test_discover_finds_numbered_sql_files_in_order(migrations_dir: Path) -> None:
    found = discover(migrations_dir)

    assert [(m.version, m.name) for m in found] == [("001", "first"), ("002", "second")]


def test_discover_refuses_two_files_with_the_same_number(migrations_dir: Path) -> None:
    (migrations_dir / "002_other.sql").write_text("SELECT 1;", encoding="utf-8")

    with pytest.raises(MigrationError, match="002"):
        discover(migrations_dir)


def test_pending_skips_applied_versions(migrations_dir: Path) -> None:
    found = discover(migrations_dir)

    assert [m.version for m in pending(found, {"001"})] == ["002"]


def test_apply_pending_runs_everything_once_and_records_it(engine, migrations_dir: Path) -> None:
    applied = apply_pending(engine, migrations_dir)

    assert [m.version for m in applied] == ["001", "002"]
    assert applied_versions(engine) == {"001", "002"}
    tables = set(inspect(engine).get_table_names())
    assert {"a", "b", "schema_migrations"} <= tables
    with engine.connect() as connection:
        assert connection.execute(text("SELECT COUNT(*) FROM b")).scalar_one() == 2

    # A second run finds nothing to do and does not insert the rows again.
    assert apply_pending(engine, migrations_dir) == []
    with engine.connect() as connection:
        assert connection.execute(text("SELECT COUNT(*) FROM b")).scalar_one() == 2


def test_apply_pending_only_runs_new_files(engine, migrations_dir: Path) -> None:
    apply_pending(engine, migrations_dir)
    (migrations_dir / "003_third.sql").write_text(
        "CREATE TABLE c (id INTEGER PRIMARY KEY);", encoding="utf-8"
    )

    applied = apply_pending(engine, migrations_dir)

    assert [m.version for m in applied] == ["003"]
    assert applied_versions(engine) == {"001", "002", "003"}


def test_a_failing_migration_is_not_recorded_and_stops_the_run(
    engine, migrations_dir: Path
) -> None:
    (migrations_dir / "002_second.sql").write_text("CREATE TABLE broken (;", encoding="utf-8")
    (migrations_dir / "003_third.sql").write_text(
        "CREATE TABLE c (id INTEGER PRIMARY KEY);", encoding="utf-8"
    )

    with pytest.raises(MigrationError, match="002_second"):
        apply_pending(engine, migrations_dir)

    assert applied_versions(engine) == {"001"}
    assert "c" not in inspect(engine).get_table_names()


def test_dry_run_changes_nothing(engine, migrations_dir: Path) -> None:
    planned = apply_pending(engine, migrations_dir, dry_run=True)

    assert [m.version for m in planned] == ["001", "002"]
    assert "a" not in inspect(engine).get_table_names()


def test_initial_migration_creates_the_five_tables() -> None:
    initial = next(m for m in discover(MIGRATIONS_DIR) if m.version == "001")
    statements = split_statements(initial.path.read_text(encoding="utf-8"))

    created = [s.split("`")[1] for s in statements if s.startswith("CREATE TABLE")]
    assert created == ["entity_user", "folder", "folder_item", "rating", "comment"]
    # It must be safe on the database that already has these tables.
    assert all("IF NOT EXISTS" in s for s in statements if s.startswith("CREATE TABLE"))


def test_command_reports_what_it_applied(monkeypatch, capsys, engine, migrations_dir) -> None:
    import app.migrate as command

    monkeypatch.setattr(command, "get_engine", lambda: engine)
    monkeypatch.setattr(
        command,
        "apply_pending",
        lambda eng, dry_run=False: apply_pending(eng, migrations_dir, dry_run=dry_run),
    )

    assert command.main(["--dry-run"]) == 0
    assert "Would apply: 001_first, 002_second" in capsys.readouterr().out
    assert command.main([]) == 0
    assert "Applied: 001_first, 002_second" in capsys.readouterr().out
    assert command.main([]) == 0
    assert "up to date" in capsys.readouterr().out


def test_command_exits_with_1_when_a_migration_fails(
    monkeypatch, capsys, engine, migrations_dir
) -> None:
    import app.migrate as command

    (migrations_dir / "002_second.sql").write_text("CREATE TABLE broken (;", encoding="utf-8")
    monkeypatch.setattr(command, "get_engine", lambda: engine)
    monkeypatch.setattr(
        command, "apply_pending", lambda eng, dry_run=False: apply_pending(eng, migrations_dir)
    )

    assert command.main([]) == 1
    assert "002_second failed" in capsys.readouterr().err
