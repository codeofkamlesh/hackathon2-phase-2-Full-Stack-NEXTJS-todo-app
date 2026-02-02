# Quickstart Guide: Neon DB Persistence Fixes for Todo App Phase II

## Overview
This guide provides quick setup and implementation instructions for fixing Neon PostgreSQL integration issues in the Todo App Phase II, specifically addressing database table creation, user signup persistence, and task fetch errors.

## Prerequisites

### System Requirements
- Python 3.11+
- Node.js 18+ (for frontend)
- PostgreSQL client libraries (for psycopg2-binary)
- Git

### Environment Setup
```bash
# Navigate to the Phase II backend directory
cd /mnt/e/Q4 hackathones/Todo-app-with-ai/phase2/backend
```

## Backend Setup

### 1. Virtual Environment and Dependencies
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Environment Configuration
Ensure the `.env` file in the backend directory contains the correct configuration:

```env
DATABASE_URL=postgresql://neondb_owner:npg_E5vOzoNWpS2A@ep-holy-credit-a79uzqo7-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require
BETTER_AUTH_SECRET=C0vNMWMmIfiGLMiGvwKKDK7qlFyUl7gL
FRONTEND_URL=http://localhost:3001
```

### 3. Database Initialization with Commits
The application automatically creates tables on startup with proper commit validation. The key configuration is in db.py:

```python
# In db.py - this is already implemented:
from sqlmodel import create_engine, Session, SQLModel
from contextlib import contextmanager
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable not set")

# Create engine with proper configuration for Neon
engine = create_engine(
    DATABASE_URL,
    echo=True,  # Log SQL queries
    pool_pre_ping=True,  # Verify connections before use
    pool_size=5,  # Connection pool size
    max_overflow=10,  # Max overflow connections
    connect_args={
        "sslmode": "require",  # Required for Neon
        "connect_timeout": 10
    }
)

def create_db_and_tables():
    """Create all database tables with proper commit validation."""
    SQLModel.metadata.create_all(engine)
    print("✅ Database tables created successfully!")
```

## Frontend Setup

### 1. Install Dependencies
```bash
# Navigate to frontend directory
cd ../frontend  # From backend directory

# Install dependencies
npm install
```

### 2. Environment Configuration
Ensure `.env.local` in the frontend directory contains:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=C0vNMWMmIfiGLMiGvwKKDK7qlFyUl7gL
```

## Running the Applications

### 1. Start Backend Server
```bash
# From backend directory
cd /mnt/e/Q4 hackathones/Todo-app-with-ai/phase2/backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

### 2. Start Frontend Server
```bash
# From frontend directory
cd /mnt/e/Q4 hackathones/Todo-app-with-ai/phase2/frontend
npm run dev
```

## Key Endpoints

### Authentication Endpoints
- `POST /api/auth/signup` - Create new user account with proper commit
- `POST /api/auth/login` - Authenticate user with JWT token
- `GET /api/auth/verify` - Verify JWT token validity

### Task Management Endpoints
- `GET /api/{user_id}/tasks` - Get user's tasks with proper isolation
- `POST /api/{user_id}/tasks` - Create new task with user_id and commit
- `PUT /api/{user_id}/tasks/{task_id}` - Update specific task with commit
- `PATCH /api/{user_id}/tasks/{task_id}/complete` - Toggle completion with commit
- `DELETE /api/{user_id}/tasks/{task_id}` - Delete specific task with commit

## Implementation Steps

### Step 1: Verify Database Connection and Auto-creation
1. Start the backend server with `uvicorn main:app --reload --port 8000`
2. Look for startup messages confirming:
   - "✅ Database connection verified"
   - "✅ Database tables created successfully!"
   - "✅ Auth routes registered"
3. Check Neon DB dashboard to confirm tables exist

### Step 2: Test User Registration with Persistence
1. Make a signup request:
```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com", "password":"password123", "name":"Test User"}'
```
2. Verify response includes JWT token and user_id
3. Check Neon DB to confirm user record was created with commit validation

### Step 3: Test Task Operations with Commit Validation
1. Use the returned JWT token for task operations:
```bash
curl -X GET http://localhost:8000/api/{user_id}/tasks \
  -H "Authorization: Bearer {token}"
```
2. Verify tasks are properly filtered by user_id
3. Test CRUD operations and confirm persistence after server restart

### Step 4: Frontend Integration Testing
1. Access the frontend at http://localhost:3001
2. Test signup/login flows
3. Verify tasks can be created, updated, and deleted
4. Confirm no JSON parsing errors occur

## Troubleshooting

### Common Issues and Solutions

#### Issue: Database tables not created
**Symptoms**: Tables don't appear in Neon DB dashboard despite startup messages
**Solution**: Check that `SQLModel.metadata.create_all(engine)` is called in main.py startup event

#### Issue: 401 Unauthorized errors
**Symptoms**: API calls return 401 despite valid JWT tokens
**Solution**: Verify BETTER_AUTH_SECRET matches between frontend and backend, and Authorization header format is correct

#### Issue: JSON parsing errors
**Symptoms**: Frontend shows "JSON.parse unexpected character" errors
**Solution**: Ensure API endpoints return valid JSON responses and frontend lib/api.ts has proper try/catch blocks

#### Issue: User data not persisting
**Symptoms**: Users can't log in after server restart
**Solution**: Verify session.commit() is called after user creation in auth endpoints

### Debugging Steps
1. Check application logs for error messages
2. Verify environment variables are set correctly
3. Test database connection independently
4. Validate JWT token format and expiration
5. Confirm CORS settings allow frontend requests

## Testing the Fixes

### Backend Verification
1. Check that both users and tasks tables exist in Neon DB
2. Verify user registration creates records in the database with commits
3. Confirm JWT tokens are properly generated and validated
4. Test that task operations are properly filtered by user_id

### Frontend Verification
1. Verify signup form works without JSON parsing errors
2. Confirm login works and tokens are stored properly
3. Test task operations (create, update, delete) work end-to-end
4. Ensure 401 errors are properly handled with redirects

## Production Considerations

### For Production Deployment
- Use stronger authentication secrets
- Implement proper logging and monitoring
- Set up backup procedures for the database
- Configure appropriate SSL certificates
- Implement rate limiting for API endpoints

### Environment Variables for Production
```env
DATABASE_URL=your-production-neon-db-url
BETTER_AUTH_SECRET=your-production-secret
FRONTEND_URL=your-frontend-domain
LOG_LEVEL=INFO
```

## API Documentation
The application provides interactive API documentation at:
- `http://localhost:8000/docs` - Swagger UI
- `http://localhost:8000/redoc` - ReDoc

## Support
For additional support:
- Check the application logs for error details
- Verify all environment variables are correctly set
- Confirm database connectivity with Neon
- Review the API documentation for correct usage

This quickstart guide should help you get the Neon PostgreSQL integration working properly with persistent data storage and proper commit validation.