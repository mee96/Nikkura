from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base of the ORM models. The real tables are created by the SQL migrations."""
