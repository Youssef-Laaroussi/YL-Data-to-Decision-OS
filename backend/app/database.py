from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.config import get_settings
import logging

logger = logging.getLogger(__name__)
settings = get_settings()


def _get_engine(db_url: str):
    engine_kwargs = {
        "echo": settings.DEBUG,
        "pool_pre_ping": True,
        "pool_size": 10,
        "max_overflow": 20,
    }
    return create_engine(db_url, **engine_kwargs)


engine = _get_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Base class for all database models."""
    pass


def get_db():
    """Dependency that provides a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables in PostgreSQL."""
    global engine, SessionLocal
    try:
        with engine.connect() as conn:
            pass
        Base.metadata.create_all(bind=engine)
        logger.info(f"PostgreSQL database initialized successfully ({settings.DATABASE_URL})")
    except Exception as e:
        logger.error(
            f"Failed to connect to PostgreSQL ({settings.DATABASE_URL}): {e}\n"
            "Ensure PostgreSQL is running and your .env contains valid credentials."
        )
        raise e


