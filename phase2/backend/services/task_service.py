from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime
import json
from models.task import Task
from pydantic import BaseModel

class TaskCreateRequest(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "medium"  # 'high', 'medium', 'low'
    tags: List[str] = []
    due_date: Optional[str] = None  # ISO format string
    recurring: bool = False
    recurrence_pattern: Optional[str] = None  # 'daily', 'weekly', 'monthly'

class TaskUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[str] = None  # 'high', 'medium', 'low'
    tags: Optional[List[str]] = None
    due_date: Optional[str] = None  # ISO format string
    recurring: Optional[bool] = None
    recurrence_pattern: Optional[str] = None  # 'daily', 'weekly', 'monthly'

class TaskService:
    @staticmethod
    def create_task(session: Session, user_id: str, task_data: TaskCreateRequest) -> Task:
        """Create a new task with enhanced fields"""
        # Serialize tags to JSON string
        tags_json = json.dumps(task_data.tags) if task_data.tags else "[]"

        # Parse due_date if provided
        due_date_obj = None
        if task_data.due_date:
            try:
                due_date_obj = datetime.fromisoformat(task_data.due_date.replace('Z', '+00:00'))
            except ValueError:
                raise ValueError("Invalid due_date format. Use ISO 8601 format.")

        new_task = Task(
            user_id=user_id,
            title=task_data.title,
            description=task_data.description,
            completed=False,
            priority=task_data.priority,
            tags=tags_json,
            due_date=due_date_obj,
            recurring=task_data.recurring,
            recurrence_pattern=task_data.recurrence_pattern,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        session.add(new_task)
        session.commit()
        session.refresh(new_task)

        return new_task

    @staticmethod
    def get_task_by_id(session: Session, task_id: int, user_id: str) -> Optional[Task]:
        """Get a task by ID for a specific user"""
        statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        task = session.exec(statement).first()
        return task

    @staticmethod
    def get_tasks_by_user(
        session: Session,
        user_id: str,
        priority: Optional[str] = None,
        tag: Optional[str] = None,
        due_before: Optional[str] = None,
        due_after: Optional[str] = None,
        completed: Optional[bool] = None,
        sort: Optional[str] = None,
        order: Optional[str] = None
    ) -> List[Task]:
        """Get all tasks for a user with optional filtering and sorting"""
        statement = select(Task).where(Task.user_id == user_id)

        # Apply filters
        if priority:
            statement = statement.where(Task.priority == priority)

        if tag:
            # Filter by tag in the tags array - need to check if tag exists in JSON string
            statement = statement.where(Task.tags.like(f'%{tag}%'))

        if due_before:
            try:
                due_before_date = datetime.fromisoformat(due_before.replace('Z', '+00:00'))
                statement = statement.where(Task.due_date <= due_before_date)
            except ValueError:
                pass  # Invalid date format, skip filter

        if due_after:
            try:
                due_after_date = datetime.fromisoformat(due_after.replace('Z', '+00:00'))
                statement = statement.where(Task.due_date >= due_after_date)
            except ValueError:
                pass  # Invalid date format, skip filter

        if completed is not None:
            statement = statement.where(Task.completed == completed)

        # Apply sorting
        if sort == 'due_date':
            if order == 'asc':
                statement = statement.order_by(Task.due_date.asc())
            else:
                statement = statement.order_by(Task.due_date.desc())
        elif sort == 'priority':
            # Define priority order: high > medium > low
            from sqlalchemy import case
            priority_order = case(
                (Task.priority == 'high', 1),
                (Task.priority == 'medium', 2),
                (Task.priority == 'low', 3),
                else_=4
            )
            if order == 'asc':
                statement = statement.order_by(priority_order.asc())
            else:
                statement = statement.order_by(priority_order.desc())
        elif sort == 'created_at':
            if order == 'asc':
                statement = statement.order_by(Task.created_at.asc())
            else:
                statement = statement.order_by(Task.created_at.desc())
        elif sort == 'title':
            if order == 'asc':
                statement = statement.order_by(Task.title.asc())
            else:
                statement = statement.order_by(Task.title.desc())
        else:
            # Default sort by created_at descending
            statement = statement.order_by(Task.created_at.desc())

        tasks = session.exec(statement).all()
        return tasks

    @staticmethod
    def update_task(session: Session, task_id: int, user_id: str, task_data: TaskUpdateRequest) -> Optional[Task]:
        """Update an existing task with enhanced fields"""
        task = TaskService.get_task_by_id(session, task_id, user_id)
        if not task:
            return None

        # Update fields if provided
        if task_data.title is not None:
            task.title = task_data.title
        if task_data.description is not None:
            task.description = task_data.description
        if task_data.completed is not None:
            task.completed = task_data.completed
        if task_data.priority is not None:
            task.priority = task_data.priority
        if task_data.tags is not None:
            task.tags = json.dumps(task_data.tags) if task_data.tags else "[]"
        if task_data.due_date is not None:
            if task_data.due_date:
                try:
                    task.due_date = datetime.fromisoformat(task_data.due_date.replace('Z', '+00:00'))
                except ValueError:
                    raise ValueError("Invalid due_date format. Use ISO 8601 format.")
            else:
                task.due_date = None
        if task_data.recurring is not None:
            task.recurring = task_data.recurring
        if task_data.recurrence_pattern is not None:
            task.recurrence_pattern = task_data.recurrence_pattern

        task.updated_at = datetime.utcnow()

        session.add(task)
        session.commit()
        session.refresh(task)

        return task

    @staticmethod
    def delete_task(session: Session, task_id: int, user_id: str) -> bool:
        """Delete a task for a specific user"""
        task = TaskService.get_task_by_id(session, task_id, user_id)
        if not task:
            return False

        session.delete(task)
        session.commit()
        return True

    @staticmethod
    def toggle_task_completion(session: Session, task_id: int, user_id: str) -> Optional[Task]:
        """Toggle the completion status of a task"""
        task = TaskService.get_task_by_id(session, task_id, user_id)
        if not task:
            return None

        task.completed = not task.completed
        task.updated_at = datetime.utcnow()

        session.add(task)
        session.commit()
        session.refresh(task)

        return task

    @staticmethod
    def parse_tags_from_task(task: Task) -> List[str]:
        """Parse tags from JSON string to list"""
        if not task.tags:
            return []

        try:
            return json.loads(task.tags)
        except json.JSONDecodeError:
            return []