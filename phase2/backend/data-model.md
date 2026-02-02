# Data Model: Todo App Phase II - Neon DB Integration

## Overview
This document defines the data models for the Todo App Phase II with proper Neon PostgreSQL integration, focusing on persistent data storage with proper commit handling.

## Entity Relationships

```
Users (1) -----(*) Tasks
```

- Each user can have multiple tasks
- Each task belongs to a single user
- User isolation ensures tasks are only accessible by their owner with proper commit validation

## User Entity

### Schema Definition
| Field | Type | Constraints | Commit Validation | Description |
|-------|------|-------------|-------------------|-------------|
| id | UUID (String) | Primary Key, Unique, Not Null | Required | Universally unique identifier for the user with persistent storage |
| email | String (255) | Unique, Index, Not Null | Required | User's email address for login with commit validation |
| name | String (255) | Not Null | Required | User's display name with persistent storage |
| password | String (255) | Not Null | Required | Hashed password using bcrypt with commit validation |
| created_at | DateTime | Not Null, Default: now() | Required | Timestamp when user was created with commit confirmation |

### Relationships
- **One-to-Many**: A user can have multiple tasks with proper commit validation
- **Foreign Key**: Tasks table references Users.id via user_id with commit validation

### Validation Rules
- Email must be a valid email format with commit validation
- Name must be 1-255 characters with commit validation
- Password must be minimum 8 characters (handled by bcrypt) with commit validation
- Email uniqueness enforced at database level with commit validation

### Indexes
- Primary Key: id with commit validation
- Unique Constraint: email with commit validation
- Additional Index: email (for login performance) with commit validation

## Task Entity

### Schema Definition
| Field | Type | Constraints | Commit Validation | Description |
|-------|------|-------------|-------------------|-------------|
| id | Integer | Primary Key, Auto-increment, Not Null | Required | Unique identifier for the task with persistent storage |
| user_id | UUID (String) | Foreign Key, Index, Not Null | Required | Reference to the owning user with commit validation |
| title | String (200) | Not Null, Min Length: 1 | Required | Task title with persistent storage |
| description | String (1000) | Nullable | Required | Optional task description with commit validation |
| completed | Boolean | Not Null, Default: false, Index | Required | Completion status with persistent storage |
| created_at | DateTime | Not Null, Default: now() | Required | Timestamp when task was created with commit validation |
| updated_at | DateTime | Not Null, Default: now() | Required | Timestamp when task was last updated with commit validation |

### Relationships
- **Many-to-One**: Multiple tasks can belong to one user with commit validation
- **Foreign Key**: References Users.id via user_id with proper commit validation

### Validation Rules
- Title must be 1-200 characters with commit validation
- Description, if provided, must be 1-1000 characters with commit validation
- user_id must reference an existing user with commit validation
- completed defaults to false with persistent storage

### Indexes
- Primary Key: id with commit validation
- Foreign Key Index: user_id (for user-specific queries) with commit validation
- Index: completed (for filtering completed/incompleted tasks) with commit validation

## Security Considerations

### User Data Protection
- Passwords are stored as bcrypt hashes with commit validation, never as plain text
- User emails are unique identifiers with proper commit validation
- Personal information is minimal and necessary for application function with commit validation

### Task Data Isolation
- Tasks are accessed through user_id foreign key with commit validation
- All task operations require authentication and user_id verification with commit validation
- No cross-user access to tasks is possible through the API with proper commit validation

## Database Constraints

### Referential Integrity
- FOREIGN KEY constraint on Tasks.user_id REFERENCES Users.id with commit validation
- CASCADE DELETE not enabled to prevent accidental user deletion with commit validation
- All foreign key references are validated at database level with commit validation

### Uniqueness Constraints
- Users.email: Ensures unique user accounts with commit validation
- No additional unique constraints needed for Tasks with commit validation

### Check Constraints
- Tasks.title: Length check (1-200 characters) with commit validation
- Tasks.description: Length check (0-1000 characters) with commit validation

## API Integration Points

### Authentication Context
- User.id is used as the primary identifier in JWT tokens with commit validation
- All task operations are filtered by user_id with proper commit validation
- User email is included in JWT for identification with commit validation

### Task Operations
- GET /api/{user_id}/tasks: Filters by user_id with commit validation
- POST /api/{user_id}/tasks: Creates task with user_id and commit validation
- PUT/PATCH/DELETE: Validates user_id matches token user_id with commit validation

## Commit Validation Requirements

### Session Management
- All database operations must include session.commit() calls with validation
- Transaction boundaries must be properly defined with commit validation
- Rollback procedures must be implemented for failed operations with commit validation
- Connection handling must ensure proper commit/rollback with validation

### Data Persistence
- User records must persist to database with session.commit() validation
- Task records must persist to database with proper commit validation
- Authentication tokens must be tied to persistent user records with validation
- All CRUD operations must result in committed database changes with validation

## Performance Considerations

### Indexing Strategy
- Users.email: Critical for login performance with commit validation
- Tasks.user_id: Essential for user-specific queries with commit validation
- Tasks.completed: Useful for filtering completed tasks with commit validation

### Query Optimization
- All user-specific queries utilize the user_id index with commit validation
- Authentication lookups use the email index with proper commit validation
- Completed task filtering benefits from the completed index with commit validation

## Migration Considerations

### Schema Evolution
- Current schema supports the defined functionality with commit validation
- Future enhancements could include additional fields with proper commit validation:
  - Categories or tags for tasks with commit validation
  - Due dates and reminders with commit validation
  - Priority levels with commit validation
  - Sharing capabilities (with additional security considerations) with commit validation

### Data Migration
- No existing data migration needed for Phase II implementation with commit validation
- Future schema changes should follow proper migration procedures with commit validation
- Backward compatibility to be maintained for API endpoints with commit validation

## Validation Requirements

### Input Validation
- All API inputs must match the defined schema constraints with commit validation
- Email validation using standard email format checks with commit validation
- Password strength validation (minimum 8 characters) with commit validation
- Title/description length validation with commit validation

### Database Validation
- All constraints enforced at database level with commit validation
- Application-level validation mirrors database constraints with commit validation
- Error handling for constraint violations with proper commit validation

## Neon PostgreSQL Specific Considerations

### Connection Parameters
- Use sslmode=require for secure connections to Neon PostgreSQL with commit validation
- Implement connection pooling for optimal performance with commit validation
- Set appropriate timeouts for reliable operations with commit validation
- Handle connection interruptions gracefully with commit validation

### Transaction Handling
- Ensure all database operations are properly committed to Neon DB with validation
- Implement retry logic for transient connection failures with commit validation
- Use proper transaction boundaries to maintain data consistency with validation
- Monitor connection usage and performance with commit validation

This data model provides the foundation for a secure, scalable Todo application with proper Neon PostgreSQL integration and reliable data persistence through proper commit validation.