from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# PostgreSQL database URL
DATABASE_URL = "postgresql://postgres:shafique2606@localhost:5432/talentos"

# Database engine
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)

# Database session
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for SQLAlchemy models
Base = declarative_base()


# FastAPI database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()