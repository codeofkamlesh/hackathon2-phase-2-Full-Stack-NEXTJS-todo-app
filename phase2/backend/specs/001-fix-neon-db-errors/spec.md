# Specification: Fix Neon DB Table Creation, User Signup, and Task Fetch Errors

## Overview

This specification addresses critical issues in the Todo Evolution Project's Phase II backend that prevent proper Neon PostgreSQL database integration. The issues include:
- Neon DB tables not being created despite terminal messages indicating success
- User signup failing to register users in the database
- JSON parsing errors on the frontend when handling API responses
- 401 Unauthorized errors on /api/tasks endpoints

## Business Context

The Todo Evolution Project is a full-stack web application that needs reliable Neon PostgreSQL database integration for production deployment. These issues prevent users from registering, logging in, and managing their tasks, which are core functionalities of the application.

## User Scenarios & Testing

### Scenario 1: New User Registration
**Actor**: New user
**Flow**:
1. User navigates to signup page
2. User enters valid email, password, and name
3. User clicks "Sign Up"
4. System validates input and creates user account
5. System returns JWT token and user ID
6. User is redirected to dashboard
**Expected Result**: User account is created in Neon database, token is valid, user can access dashboard

### Scenario 2: User Authentication
**Actor**: Existing user
**Flow**:
1. User navigates to login page
2. User enters valid credentials
3. User clicks "Login"
4. System validates credentials
5. System returns JWT token and user ID
6. User is redirected to dashboard
**Expected Result**: User is authenticated, receives valid JWT token, gains access to personalized task list

### Scenario 3: Task Management
**Actor**: Authenticated user
**Flow**:
1. User accesses dashboard
2. User retrieves task list via /api/tasks
3. User creates, updates, or deletes tasks
4. All operations are filtered by authenticated user ID
**Expected Result**: User can only see and modify their own tasks, all operations succeed without 401 errors

### Scenario 4: Error Handling
**Actor**: Any user
**Flow**:
1. User encounters network issues or invalid responses
2. Frontend properly handles JSON parsing
3. Frontend gracefully handles 401 Unauthorized errors
4. User is redirected to login when authentication expires
**Expected Result**: No JavaScript errors, smooth user experience, proper error recovery

## Functional Requirements

### FR-001: Database Initialization
**Requirement**: The system MUST automatically create all required database tables (users, tasks) when the application starts.
- **Test**: When the application starts, SQLModel.metadata.create_all(engine) is called with correct DATABASE_URL
- **Validation**: Both users and tasks tables exist in Neon database after first run
- **Constraints**: Must work with psycopg2-binary driver and sslmode=require

### FR-002: User Registration
**Requirement**: The system MUST create new user accounts in the "users" table when users register.
- **Test**: POST /api/auth/signup creates a new record in the users table with proper UUID, hashed password, and user details
- **Validation**: User can subsequently authenticate with provided credentials
- **Constraints**: Passwords must be securely hashed, user_id must be UUID format

### FR-003: JWT Token Generation
**Requirement**: The system MUST generate valid JWT tokens upon successful registration and login.
- **Test**: Registration and login endpoints return properly formatted JWT tokens
- **Validation**: Tokens can be decoded and verified by the backend
- **Constraints**: Token must contain user_id claim and use shared BETTER_AUTH_SECRET

### FR-004: Task Management API
**Requirement**: The system MUST provide full CRUD operations for tasks with proper user isolation.
- **Test**: All /api/{user_id}/tasks endpoints work correctly with authenticated user_id from JWT
- **Validation**: Users can only access their own tasks
- **Constraints**: All endpoints must validate user authentication and return valid JSON

### FR-005: Frontend API Integration
**Requirement**: The frontend MUST properly handle API responses without JSON parsing errors.
- **Test**: Frontend makes API calls with proper Authorization headers and handles responses safely
- **Validation**: No "JSON.parse unexpected character" errors occur
- **Constraints**: Use try/catch blocks for JSON parsing, handle 401 errors appropriately

### FR-006: Authentication Middleware
**Requirement**: The system MUST validate JWT tokens and filter requests by user_id.
- **Test**: All protected endpoints verify JWT tokens and ensure user_id matches the authenticated user
- **Validation**: Users cannot access other users' data
- **Constraints**: Must use shared BETTER_AUTH_SECRET for token verification

## Non-Functional Requirements

### NFR-001: Security
- Passwords must be hashed using bcrypt with appropriate salt
- JWT tokens must be properly signed and validated
- User data must be isolated by user_id

### NFR-002: Reliability
- Database connections must handle timeouts and reconnect properly
- Tables must be created automatically on first run
- API endpoints must return consistent JSON responses

### NFR-003: Performance
- API responses should be under 2 seconds
- Database queries should be optimized with proper indexing
- JWT validation should be efficient

## Key Entities

### User Entity
- user_id: UUID (primary key)
- email: String (unique, indexed)
- name: String
- password: String (hashed)
- created_at: DateTime

### Task Entity
- task_id: Integer (primary key, auto-increment)
- user_id: UUID (foreign key to users, indexed)
- title: String (max 200 chars)
- description: String (optional, max 1000 chars)
- completed: Boolean (indexed)
- created_at: DateTime
- updated_at: DateTime

## Success Criteria

### Quantitative Measures
- 100% of user registration requests result in database records
- 0% occurrence of JSON.parse errors in frontend console
- 0% occurrence of 401 Unauthorized errors for authenticated users
- 95% success rate for task CRUD operations
- Database tables automatically created on first run (100% success rate)

### Qualitative Measures
- Users can seamlessly register, login, and manage tasks
- Frontend handles all API responses without JavaScript errors
- Authentication system properly isolates user data
- API endpoints return consistent, valid JSON responses
- Application successfully connects to Neon PostgreSQL database

## Constraints & Dependencies

### Technical Constraints
- Implementation limited to Phase 2 backend files (db.py, main.py, routes/auth.py, routes/tasks.py)
- No changes to Phase 1 or other frontend files
- Must use existing BETTER_AUTH_SECRET for JWT
- Frontend API client limited to /phases/phase2/frontend/lib/api.ts

### Dependencies
- Neon PostgreSQL database access
- psycopg2-binary driver
- SQLModel for database operations
- JWT for authentication
- bcrypt for password hashing

## Assumptions

- Neon PostgreSQL database is accessible with provided credentials
- Environment variables (DATABASE_URL, BETTER_AUTH_SECRET) are properly configured
- Frontend is using a compatible version of the API client
- Network connectivity to Neon database is stable
- Users will provide valid input according to API specifications

## Known Risks

- Database connection failures due to network issues
- JWT token expiration during user sessions
- Potential race conditions during high concurrency
- Migration issues if database schema changes