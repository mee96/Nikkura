"""MySQL connection to the `nikkura` schema (Aiven in production, SSL required)."""

import logging
from collections.abc import Iterator
from functools import lru_cache

from sqlalchemy import URL, Engine, create_engine, text
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings

logger = logging.getLogger(__name__)


@lru_cache
def get_engine() -> Engine:
    """Create the engine on first use, so importing the app never needs a database."""
    settings = get_settings()
    url = URL.create(
        "mysql+pymysql",
        username=settings.db_user,
        password=settings.db_password,
        host=settings.db_host,
        port=settings.db_port,
        database=settings.db_name,
        query={"charset": "utf8mb4"},
    )
    connect_args = {"ssl": {"ca": settings.db_ssl_ca}} if settings.db_ssl_ca else {}
    # pool_pre_ping avoids errors after Aiven closes idle connections.
    return create_engine(url, connect_args=connect_args, pool_pre_ping=True, pool_recycle=280)


def get_db() -> Iterator[Session]:
    """FastAPI dependency: one session per request, always closed."""
    session = sessionmaker(bind=get_engine())()
    try:
        yield session
    finally:
        session.close()


def check_database() -> bool:
    """Return True when the database answers a trivial query."""
    try:
        with get_engine().connect() as connection:
            connection.execute(text("SELECT 1"))
        return True
    except Exception as exc:
        # Log the reason (never the password) so a failing /health is easy to debug.
        logger.warning("Database check failed: %s: %s", type(exc).__name__, exc)
        return False
