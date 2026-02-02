from fastapi import APIRouter, HTTPException, Depends, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import jwt
import os
import json
from db import get_session
from models.task import Task
from middleware.auth_middleware import get_current_user_id
from services.task_service import TaskService

router = APIRouter(prefix="/api/{user_id}/tasks", tags=["Tasks"])

SECRET_KEY = os.getenv("BETTER_AUTH_SECRET")


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Optional[str] = "medium"  # 'high', 'medium', 'low'
    tags: Optional[List[str]] = []
    due_date: Optional[str] = None  # ISO format string
    recurring: Optional[bool] = False
    recurrence_pattern: Optional[str] = None  # 'daily', 'weekly', 'monthly'


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[str] = None  # 'high', 'medium', 'low'
    tags: Optional[List[str]] = None
    due_date: Optional[str] = None  # ISO format string
    recurring: Optional[bool] = None
    recurrence_pattern: Optional[str] = None  # 'daily', 'weekly', 'monthly'


class TaskResponse(BaseModel):
    id: int
    user_id: str
    title: str
    description: Optional[str]
    completed: bool
    priority: str  # 'high', 'medium', 'low'
    tags: List[str]
    due_date: Optional[str]  # ISO format string
    recurring: bool
    recurrence_pattern: Optional[str]  # 'daily', 'weekly', 'monthly'
    created_at: str  # ISO format string
    updated_at: str  # ISO format string

    class Config:
        from_attributes = True


def verify_user_access(requested_user_id: str, authenticated_user_id: str):
    """Verify that the requested user matches the authenticated user"""
    if requested_user_id != authenticated_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You can only access your own tasks"
        )


def serialize_task(task: Task) -> TaskResponse:
    """Convert Task model to TaskResponse with proper serialization"""
    # Parse tags from JSON string if they exist
    tags_list = []
    if task.tags:
        try:
            tags_list = json.loads(task.tags)
        except json.JSONDecodeError:
            tags_list = []

    # Handle due_date serialization
    due_date_str = None
    if task.due_date:
        due_date_str = task.due_date.isoformat()

    return TaskResponse(
        id=task.id,
        user_id=task.user_id,
        title=task.title,
        description=task.description,
        completed=task.completed,
        priority=task.priority,
        tags=tags_list,
        due_date=due_date_str,
        recurring=task.recurring,
        recurrence_pattern=task.recurrence_pattern,
        created_at=task.created_at.isoformat(),
        updated_at=task.updated_at.isoformat()
    )


@router.get("", response_model=List[TaskResponse])
async def list_tasks(
    user_id: str,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session),
    priority: Optional[str] = Query(None, description="Filter by priority (high, medium, low)"),
    tag: Optional[str] = Query(None, description="Filter by specific tag"),
    due_before: Optional[str] = Query(None, description="Filter tasks with due date before specified date"),
    due_after: Optional[str] = Query(None, description="Filter tasks with due date after specified date"),
    completed: Optional[bool] = Query(None, description="Filter by completion status"),
    sort: Optional[str] = Query(None, description="Sort by field (due_date, priority, created_at, title)"),
    order: Optional[str] = Query(None, description="Sort order (asc, desc)")
):
    """Get all tasks for authenticated user with optional filtering and sorting"""
    verify_user_access(user_id, current_user_id)

    print(f"📋 Fetching tasks for user: {user_id} with filters: priority={priority}, tag={tag}, sort={sort}")

    tasks = TaskService.get_tasks_by_user(
        session=session,
        user_id=user_id,
        priority=priority,
        tag=tag,
        due_before=due_before,
        due_after=due_after,
        completed=completed,
        sort=sort,
        order=order
    )

    print(f"✅ Found {len(tasks)} tasks")
    return [serialize_task(task) for task in tasks]


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    user_id: str,
    task_data: TaskCreate,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """Create new task with enhanced fields"""
    verify_user_access(user_id, current_user_id)

    print(f"➕ Creating task for user {user_id}: {task_data.title}")

    from services.task_service import TaskCreateRequest

    # Convert to service request format
    service_request = TaskCreateRequest(
        title=task_data.title,
        description=task_data.description,
        priority=task_data.priority,
        tags=task_data.tags,
        due_date=task_data.due_date,
        recurring=task_data.recurring,
        recurrence_pattern=task_data.recurrence_pattern
    )

    new_task = TaskService.create_task(session, user_id, service_request)

    print(f"✅ Task created: {new_task.id}")
    return serialize_task(new_task)


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    user_id: str,
    task_id: int,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """Get single task"""
    verify_user_access(user_id, current_user_id)

    task = TaskService.get_task_by_id(session, task_id, user_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    return serialize_task(task)


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    user_id: str,
    task_id: int,
    task_data: TaskUpdate,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """Update task with enhanced fields"""
    verify_user_access(user_id, current_user_id)

    print(f"✏️ Updating task {task_id}")

    from services.task_service import TaskUpdateRequest

    # Convert to service request format
    service_request = TaskUpdateRequest(
        title=task_data.title,
        description=task_data.description,
        completed=task_data.completed,
        priority=task_data.priority,
        tags=task_data.tags,
        due_date=task_data.due_date,
        recurring=task_data.recurring,
        recurrence_pattern=task_data.recurrence_pattern
    )

    updated_task = TaskService.update_task(session, task_id, user_id, service_request)
    if not updated_task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    print(f"✅ Task updated: {task_id}")
    return serialize_task(updated_task)


@router.delete("/{task_id}")
async def delete_task(
    user_id: str,
    task_id: int,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """Delete task"""
    verify_user_access(user_id, current_user_id)

    print(f"🗑️ Deleting task {task_id}")

    success = TaskService.delete_task(session, task_id, user_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    print(f"✅ Task deleted: {task_id}")
    return {"message": "Task deleted successfully"}


@router.patch("/{task_id}/complete", response_model=TaskResponse)
async def toggle_complete(
    user_id: str,
    task_id: int,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """Toggle task completion"""
    verify_user_access(user_id, current_user_id)

    print(f"✔️ Toggling completion for task {task_id}")

    task = TaskService.toggle_task_completion(session, task_id, user_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    print(f"✅ Task {task_id} completed: {task.completed}")
    return serialize_task(task)