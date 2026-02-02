# [Task]: T-DB-MODELS
# [From]: Complete Database Schema

from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional
import uuid

class User(SQLModel, table=True):
    """User model for authentication"""
    __tablename__ = "users"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    name: str = Field(max_length=255)
    password: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    def __repr__(self):
        return f"<User {self.email}>"