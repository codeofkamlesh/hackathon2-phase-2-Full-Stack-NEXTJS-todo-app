from sqlmodel import SQLModel, Field
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import ARRAY

# Define priority enum
class PriorityEnum(str, Enum):
    high = "high"
    medium = "medium"
    low = "low"

# User Model (Updated for camelCase DB Columns)
class User(SQLModel, table=True):
    __tablename__ = "user"

    id: str = Field(primary_key=True)
    name: Optional[str] = Field(default=None)
    email: str = Field(unique=True, index=True)

    # Map Python 'snake_case' to DB 'camelCase'
    email_verified: bool = Field(default=False, sa_column=Column("emailVerified", Boolean, default=False))
    image: Optional[str] = Field(default=None)

    created_at: datetime = Field(default_factory=datetime.utcnow, sa_column=Column("createdAt", DateTime))
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column=Column("updatedAt", DateTime))

# Task Model
class Task(SQLModel, table=True):
    __tablename__ = "task"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="user.id", index=True)
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False)
    priority: Optional[PriorityEnum] = Field(default=PriorityEnum.medium)

    tags: Optional[List[str]] = Field(default=None, sa_column=Column(ARRAY(String)))

    due_date: Optional[datetime] = Field(default=None)
    recurring_interval: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# API Models (No changes needed here)
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Optional[PriorityEnum] = PriorityEnum.medium
    tags: Optional[List[str]] = []
    due_date: Optional[datetime] = None
    recurring_interval: Optional[str] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[PriorityEnum] = None
    tags: Optional[List[str]] = None
    due_date: Optional[datetime] = None
    recurring_interval: Optional[str] = None

class TaskResponse(TaskBase):
    id: int
    user_id: str
    completed: bool
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_orm(cls, task: Task) -> 'TaskResponse':
        return cls(
            id=task.id,
            user_id=task.user_id,
            title=task.title,
            description=task.description,
            completed=task.completed,
            priority=task.priority,
            tags=task.tags or [],
            due_date=task.due_date,
            recurring_interval=task.recurring_interval,
            created_at=task.created_at,
            updated_at=task.updated_at
        )

class TaskListResponse(BaseModel):
    tasks: List[TaskResponse]