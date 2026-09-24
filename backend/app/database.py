from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.config import get_settings
import logging

logger = logging.getLogger(__name__)
settings = get_settings()


def _get_engine(db_url: str):
    connect_args = {}
    engine_kwargs = {"echo": settings.DEBUG}
    if "sqlite" in db_url:
        connect_args["check_same_thread"] = False
    else:
        engine_kwargs["pool_pre_ping"] = True
        engine_kwargs["pool_size"] = 10
        engine_kwargs["max_overflow"] = 20
    return create_engine(db_url, connect_args=connect_args, **engine_kwargs)


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
    """Create all tables with automatic fallback to SQLite if PostgreSQL is unreachable in dev."""
    global engine, SessionLocal
    try:
        with engine.connect() as conn:
            pass
        Base.metadata.create_all(bind=engine)
        logger.info(f"Database initialized successfully with {settings.DATABASE_URL}")
    except Exception as e:
        if "postgresql" in settings.DATABASE_URL:
            logger.warning(
                f"PostgreSQL connection failed ({e}). Falling back to local SQLite database."
            )
            fallback_url = "sqlite:///./datatodecision.db"
            engine = _get_engine(fallback_url)
            SessionLocal.configure(bind=engine)
            Base.metadata.create_all(bind=engine)
            logger.info("Local SQLite database initialized successfully.")
        else:
            raise e

