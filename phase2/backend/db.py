from sqlmodel import create_engine, Session, SQLModel
from sqlalchemy import text
from sqlalchemy.exc import DisconnectionError, OperationalError
from sqlalchemy.pool import QueuePool
import os
import time
from dotenv import load_dotenv

# Import Models explicitly so SQLModel knows about them before creating tables
from models.user import User
from models.task import Task

load_dotenv()

# Handling the URL: Remove quotes if present to avoid errors
DATABASE_URL = os.getenv("DATABASE_URL", "").replace("'", "").replace('"', "")

if not DATABASE_URL:
    raise ValueError("❌ DATABASE_URL environment variable not set in .env file")

print(f"✅ Database URL loaded: {DATABASE_URL[:20]}...***")

# Configure engine for Neon PostgreSQL
engine = create_engine(
    DATABASE_URL,
    echo=True,
    poolclass=QueuePool,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    pool_recycle=300,
    pool_reset_on_return='commit',
    connect_args={
        "sslmode": "require",
        "connect_timeout": 10,
    },
)

def create_db_and_tables():
    """Create all database tables"""
    try:
        print("🔄 Creating database tables...")
        SQLModel.metadata.create_all(engine)
        print("✅ Database tables created successfully!")

        # Verify tables
        with Session(engine) as session:
            result = session.exec(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
            tables = result.fetchall()
            print(f"✅ Tables in database: {tables}")

    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        # Don't raise here, let the app start even if check fails (for debugging)

def get_session():
    with Session(engine) as session:
        yield session

def test_connection():
    try:
        with Session(engine) as session:
            session.exec(text("SELECT 1"))
            return True
    except Exception as e:
        print(f"❌ DB Connection Error: {e}")
        return False