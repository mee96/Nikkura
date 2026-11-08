"""Apply the pending SQL migrations: `python -m app.migrate` (from `backend/`).

`--dry-run` lists what would be applied without touching the database.
"""

import argparse
import logging
import sys

from app.utils.db import get_engine
from app.utils.migrations import MigrationError, apply_pending


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Apply the pending Nikkura SQL migrations.")
    parser.add_argument(
        "--dry-run", action="store_true", help="only list the migrations that would run"
    )
    args = parser.parse_args(argv)
    logging.basicConfig(level=logging.INFO, format="%(message)s")

    try:
        migrations = apply_pending(get_engine(), dry_run=args.dry_run)
    except MigrationError as exc:
        print(f"Migration stopped: {exc}", file=sys.stderr)
        return 1

    if not migrations:
        print("The database is up to date.")
    elif args.dry_run:
        print("Would apply: " + ", ".join(m.label for m in migrations))
    else:
        print("Applied: " + ", ".join(m.label for m in migrations))
    return 0


if __name__ == "__main__":
    sys.exit(main())
