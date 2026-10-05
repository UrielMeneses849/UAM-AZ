import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy.pool import NullPool


load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./portal_academico.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine_options = {
    "connect_args": connect_args,
    "future": True,
    "pool_pre_ping": True,
}

if not DATABASE_URL.startswith("sqlite") and os.getenv("DATABASE_POOL_MODE", "").lower() == "null":
    engine_options["poolclass"] = NullPool

engine = create_engine(DATABASE_URL, **engine_options)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    from app.models import entities  # noqa: F401

    Base.metadata.create_all(bind=engine)
