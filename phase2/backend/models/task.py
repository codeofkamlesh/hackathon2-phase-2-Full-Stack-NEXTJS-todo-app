# [Task]: T-DB-MODELS
# [From]: Complete Database Schema

from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional
import uuid

class Task(SQLModel, table=True):
    """Task model for todo items with enhanced features"""
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    title: str = Field(max_length=200, min_length=1)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False, index=True)
    priority: str = Field(default="medium", max_length=10)  # 'high', 'medium', 'low'
    tags: Optional[str] = Field(default=None)  # JSON string representation of tags array
    due_date: Optional[datetime] = Field(default=None)
    recurring: bool = Field(default=False)
    recurrence_pattern: Optional[str] = Field(default=None, max_length=10)  # 'daily', 'weekly', 'monthly'
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    def __repr__(self):
        return f"<Task {self.title}>"