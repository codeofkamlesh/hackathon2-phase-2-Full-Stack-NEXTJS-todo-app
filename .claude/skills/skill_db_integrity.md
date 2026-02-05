# Database Integrity Skill

## Purpose
SQLModel queries to verify complex data integrity, particularly around recurring tasks and other important relationships in the Todo app database.

## Data Integrity Queries

### 1. Recurring Tasks Validation
```sql
-- Show all tasks where recurring=True but recurrencePattern is NULL or empty
SELECT id, user_id, title, recurring, recurrence_pattern
FROM task
WHERE recurring = true
AND (recurrence_pattern IS NULL OR recurrence_pattern = '');

-- Count tasks with recurring inconsistencies
SELECT COUNT(*) as inconsistent_recurring_tasks
FROM task
WHERE recurring = true
AND (recurrence_pattern IS NULL OR recurrence_pattern = '');
```

### 2. Task Completeness Validation
```sql
-- Find tasks with completed=True but with recurring intervals (potential conflict)
SELECT id, user_id, title, completed, recurring, recurrence_pattern
FROM task
WHERE completed = true
AND recurring = true;

-- Find tasks with invalid priority values
SELECT id, user_id, title, priority
FROM task
WHERE priority NOT IN ('high', 'medium', 'low', NULL);

-- Find tasks with future due dates but already completed
SELECT id, user_id, title, due_date, completed, created_at
FROM task
WHERE completed = true
AND due_date > CURRENT_TIMESTAMP;
```

### 3. User Relationship Validation
```sql
-- Find tasks without valid user references
SELECT t.id, t.user_id, t.title
FROM task t
LEFT JOIN user u ON t.user_id = u.id
WHERE u.id IS NULL;

-- Count tasks per user to identify potential anomalies
SELECT user_id, COUNT(*) as task_count
FROM task
GROUP BY user_id
HAVING COUNT(*) > 1000  -- Adjust threshold as needed
ORDER BY task_count DESC;
```

### 4. Conversation and Message Integrity
```sql
-- Find messages without valid conversation references
SELECT m.id, m.conversation_id, m.role, m.content
FROM messages m
LEFT JOIN conversations c ON m.conversation_id = c.id
WHERE c.id IS NULL;

-- Find conversations without any messages
SELECT c.id, c.user_id, c.title
FROM conversations c
LEFT JOIN messages m ON c.id = m.conversation_id
WHERE m.id IS NULL;

-- Check for messages with NULL content (which should be prevented by the backend sanitization)
SELECT id, conversation_id, role, content, created_at
FROM messages
WHERE content IS NULL;
```

### 5. Data Consistency Checks
```sql
-- Verify created_at vs updated_at consistency
SELECT id, user_id, title, created_at, updated_at
FROM task
WHERE created_at > updated_at;  -- updated_at should never be before created_at

-- Check for invalid date formats in due_date
SELECT id, user_id, title, due_date
FROM task
WHERE due_date IS NOT NULL
AND due_date < '2000-01-01';  -- Dates too far in past may be invalid

-- Validate user creation/update timestamps
SELECT id, name, email, created_at, updated_at
FROM user
WHERE created_at > updated_at;  -- updated_at should never be before created_at
```

### 6. Python SQLModel Validation Functions
```python
from sqlmodel import Session, select
from models import Task, User, Conversation, Message

def validate_recurring_tasks(session: Session):
    """Validate recurring task configurations"""
    invalid_tasks = session.exec(
        select(Task).where(
            (Task.recurring == True) &
            ((Task.recurrence_pattern.is_(None)) | (Task.recurrence_pattern == ""))
        )
    ).all()

    return invalid_tasks

def validate_orphaned_tasks(session: Session):
    """Find tasks without valid user references"""
    orphaned_tasks = session.exec(
        select(Task)
        .join(User, Task.user_id == User.id, isouter=True)
        .where(User.id.is_(None))
    ).all()

    return orphaned_tasks

def validate_messages_consistency(session: Session):
    """Validate message integrity"""
    orphaned_messages = session.exec(
        select(Message)
        .join(Conversation, Message.conversation_id == Conversation.id, isouter=True)
        .where(Conversation.id.is_(None))
    ).all()

    return orphaned_messages

def get_user_task_stats(session: Session):
    """Get user task statistics for anomaly detection"""
    result = session.exec(
        select(Task.user_id, func.count(Task.id).label('task_count'))
        .group_by(Task.user_id)
        .having(func.count(Task.id) > 1000)  # Adjust threshold as needed
        .order_by(desc(func.count(Task.id)))
    ).all()

    return result
```

### 7. Database Health Checks
```sql
-- Check total database size and growth
SELECT
    pg_size_pretty(pg_database_size(current_database())) as database_size,
    pg_size_pretty(sum(pg_relation_size(C.oid))::bigint) as total_table_size
FROM pg_class C
LEFT JOIN pg_namespace N ON (N.oid = C.relnamespace)
WHERE nspname NOT IN ('pg_catalog', 'information_schema')
AND C.relkind <> 'i'
AND nspname !~ '^pg_toast';

-- Monitor recent activities
SELECT id, user_id, title, created_at, updated_at
FROM task
ORDER BY created_at DESC
LIMIT 10;

-- Check for locked/long-running transactions
SELECT pid, usename, application_name, state, query_start, wait_event_type, wait_event
FROM pg_stat_activity
WHERE state = 'active'
OR state_change > NOW() - INTERVAL '5 minutes';
```

### 8. Scheduled Integrity Checks
Consider implementing these as automated jobs:
- Daily check for recurring tasks with missing patterns
- Weekly validation of user-task relationships
- Monthly cleanup of orphaned records
- Real-time validation in API endpoints