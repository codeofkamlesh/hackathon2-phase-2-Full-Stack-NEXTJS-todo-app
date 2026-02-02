# Specification: Fix Neon DB Persistence and Table Creation for Todo Evolution Project

## 1. Overview

### Purpose
This specification addresses critical issues in the Todo Evolution Project Phase II where Neon PostgreSQL database is not persisting user/task data and tables are not being created despite frontend operations working correctly. The backend needs proper database initialization, commit logic, and table creation to ensure data persistence.

### Business Context
The Todo Evolution Project is a full-stack application that relies on Neon PostgreSQL for data persistence. Without proper database persistence, users lose their data between sessions, making the application unusable for its core purpose. This fix is critical for the application's viability.

## 2. Problem Statement

### Current Issues
- Neon DB tables not being created despite terminal messages indicating success
- User and task data not persisting between application restarts
- Data operations appear to work but are lost when session ends (transient in-memory storage)
- Frontend operations work but data doesn't persist to Neon database
- Missing proper commit logic after database operations

### Impact
- Users cannot maintain accounts between sessions
- Tasks created by users are lost when application restarts
- Authentication becomes unreliable as user data disappears
- Application unusable for actual task management

## 3. User Scenarios & Testing

### Scenario 1: User Registration Persistence
**Actor**: New user
**Precondition**: Application is running with Neon DB connection
**Flow**:
1. User visits signup page and submits registration
2. Backend creates user record in "users" table with proper commit
3. User record persists in Neon DB after application restart
4. User can log in with same credentials after restart
**Success Criteria**: User record remains in Neon DB after restart

### Scenario 2: Task Data Persistence
**Actor**: Authenticated user
**Precondition**: User is logged in and has valid session
**Flow**:
1. User creates a new task via frontend
2. Backend inserts task into "tasks" table with proper commit
3. Task persists in Neon DB after application restart
4. Task remains accessible to user after restart
**Success Criteria**: Task remains in Neon DB after restart

### Scenario 3: CRUD Operations Persistence
**Actor**: Authenticated user
**Precondition**: User has existing tasks in database
**Flow**:
1. User updates, completes, or deletes tasks
2. Backend commits all changes to Neon DB
3. Changes persist after application restart
4. Refresh shows same data as before restart
**Success Criteria**: All CRUD changes remain in Neon DB after restart

## 4. Functional Requirements

### FR-001: Database Initialization
**Requirement**: The system MUST automatically create all required database tables on application startup.
- **Test**: When application starts, SQLModel.metadata.create_all(engine) is called with correct DATABASE_URL
- **Validation**: Both "users" and "tasks" tables exist in Neon database after first run
- **Constraints**: Must work with psycopg2-binary driver and sslmode=require
- **Dependencies**: Proper DATABASE_URL configuration with Neon connection string

### FR-002: User Registration Persistence
**Requirement**: The system MUST persist user registrations to Neon database with proper commit.
- **Test**: POST /api/auth/signup creates user record in "users" table with commit(session.commit())
- **Validation**: User record exists in Neon DB and persists after application restart
- **Constraints**: User ID must be UUID, password must be bcrypt-hashed, proper timestamps
- **Dependencies**: Database initialization and connection

### FR-003: Task Management Persistence
**Requirement**: The system MUST persist all task operations (create, update, delete) to Neon database.
- **Test**: All task CRUD operations commit changes to "tasks" table with proper user_id filtering
- **Validation**: Tasks persist in Neon DB after application restart and user isolation maintained
- **Constraints**: All operations must commit to DB, not in-memory storage
- **Dependencies**: User authentication and database connection

### FR-004: Commit Logic Implementation
**Requirement**: The system MUST properly commit all database operations to ensure persistence.
- **Test**: Every database insert/update/delete operation calls session.commit() or equivalent
- **Validation**: No transient in-memory storage, all operations reflected in Neon DB
- **Constraints**: Operations must be atomic and durable
- **Dependencies**: Session management and transaction handling

### FR-005: Data Consistency
**Requirement**: The system MUST maintain data consistency across application restarts.
- **Test**: Refreshing browser shows same data that was previously created/modified
- **Validation**: Data exists in Neon DB and is not lost during restarts
- **Constraints**: Proper refresh/refresh operations after commits
- **Dependencies**: Proper session and connection handling

## 5. Non-Functional Requirements

### NFR-001: Reliability
- All database operations must be committed to persistent storage
- Application must handle database connection interruptions gracefully
- Proper error handling when commits fail
- Data integrity must be maintained during concurrent operations

### NFR-002: Performance
- Database operations should complete within 2 seconds
- Connection pooling must be implemented for scalability
- Proper indexing for efficient queries
- Efficient transaction management

### NFR-003: Security
- Passwords must be securely hashed with bcrypt
- JWT tokens must be properly validated with shared secret
- User data must be isolated by user_id
- All database inputs must be validated to prevent injection

## 6. Key Entities

### User Entity
- id: UUID (Primary Key, auto-generated)
- email: String (Unique, indexed, valid email format)
- password: String (bcrypt-hashed with salt)
- is_active: Boolean (default: true)
- created_at: DateTime (auto-generated)
- updated_at: DateTime (auto-generated)

### Task Entity
- id: Integer (Primary Key, auto-incrementing)
- user_id: UUID (Foreign Key to User, indexed)
- title: String (max 200 characters, required)
- description: String (max 1000 characters, optional)
- completed: Boolean (default: false, indexed)
- priority: String (enum: low, medium, high, default: medium)
- due_date: DateTime (optional)
- recurring: String (optional, enum: daily, weekly, monthly, none)
- created_at: DateTime (auto-generated)
- updated_at: DateTime (auto-generated)

## 7. Success Criteria

### Quantitative Measures
- 100% of user registration requests result in persistent database records
- 100% of task CRUD operations persist to Neon database
- 0% data loss during application restarts
- 95% success rate for database operations with proper commits
- Database tables automatically created on first run (100% success rate)

### Qualitative Measures
- Users can register and retain accounts between sessions
- Tasks created by users persist across application restarts
- All CRUD operations maintain data integrity
- Authentication system maintains persistent user state
- Application behaves reliably with Neon PostgreSQL as primary data store

## 8. Constraints & Dependencies

### Technical Constraints
- Implementation limited to Phase 2 backend files (db.py, main.py, routes/auth.py, routes/tasks.py)
- No changes to Phase 1 or frontend files
- Must use existing BETTER_AUTH_SECRET for JWT
- Database operations must use proper commit/rollback patterns
- Must work with Neon PostgreSQL's connection requirements

### Dependencies
- Neon PostgreSQL database access with proper credentials
- psycopg2-binary driver for PostgreSQL connectivity
- SQLModel for database operations
- JWT for authentication
- bcrypt for password hashing

## 9. Assumptions

- Neon PostgreSQL database is accessible with provided connection parameters
- Environment variables (DATABASE_URL, BETTER_AUTH_SECRET) are properly configured
- Frontend will continue to function unchanged but with persistent backend
- Network connectivity to Neon database is stable during operations
- Users will provide valid input according to API specifications

## 10. Known Risks

### Risk 1: Database Connection Issues
- **Impact**: All data operations fail if connection drops
- **Mitigation**: Implement proper connection pooling and retry logic
- **Blast Radius**: Entire application data layer affected

### Risk 2: Transaction Failures
- **Impact**: Partial data changes could corrupt consistency
- **Mitigation**: Use proper transaction management with rollback on failure
- **Blast Radius**: Individual user data could be affected

### Risk 3: Data Loss During Migration
- **Impact**: Existing data could be lost during schema updates
- **Mitigation**: Backup data before schema changes
- **Blast Radius**: All user data could be affected