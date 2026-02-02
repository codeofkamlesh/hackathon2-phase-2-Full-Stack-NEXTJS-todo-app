# Neon PostgreSQL Setup Guide

## Overview
This guide explains how to connect your Todo App backend to Neon PostgreSQL database.

## Prerequisites
- System with PostgreSQL client libraries
- Access to Neon PostgreSQL database

## Installation Steps

### 1. Install System Dependencies

#### For Ubuntu/Debian:
```bash
sudo apt-get update
sudo apt-get install -y postgresql-client-common postgresql-client libpq-dev python3-dev gcc
```

#### For CentOS/RHEL:
```bash
sudo yum install -y postgresql-devel python3-devel gcc
```

#### For macOS:
```bash
brew install libpq
export PATH=$PATH:/opt/homebrew/bin    # For Apple Silicon Macs
export PATH=$PATH:/usr/local/bin       # For Intel Macs
```

### 2. Install Python PostgreSQL Driver
```bash
cd /mnt/e/Q4 hackathones/Todo-app-with-ai/phase2/backend
source venv/bin/activate
pip install psycopg2-binary==2.9.9
```

### 3. Verify Connection
```bash
python test_db_connection.py
```

### 4. Start the Server
```bash
uvicorn main:app --reload --port 8000
```

## API Endpoints
Once connected to Neon PostgreSQL, all these endpoints will work:

- **Authentication:**
  - `POST /api/auth/signup` - Create new user account
  - `POST /api/auth/login` - Login existing user
  - `GET /api/auth/verify` - Verify JWT token

- **Tasks (per user):**
  - `GET /api/{user_id}/tasks` - Get all tasks for user
  - `POST /api/{user_id}/tasks` - Create new task
  - `GET /api/{user_id}/tasks/{task_id}` - Get specific task
  - `PUT /api/{user_id}/tasks/{task_id}` - Update task
  - `PATCH /api/{user_id}/tasks/{task_id}/complete` - Toggle task completion
  - `DELETE /api/{user_id}/tasks/{task_id}` - Delete task

## Troubleshooting

### Common Issues:
1. **pg_config not found**: Install PostgreSQL development libraries
2. **SSL connection failed**: Ensure sslmode=require in connection string
3. **Permission denied**: Check your Neon database credentials

### Testing:
Use the test script to verify the connection:
```bash
python test_db_connection.py
```

## Database Schema
The application automatically creates these tables:
- `users` - Stores user accounts
- `tasks` - Stores todo items linked to users

## Security
- All endpoints require JWT authentication
- User isolation: users can only access their own tasks
- Passwords are hashed using bcrypt
- SQL injection protected via parameterized queries

## Frontend Integration
The frontend is fully compatible with the Neon PostgreSQL backend and supports:
- User signup/login flow
- Task creation, editing, deletion
- Real-time task status updates
- Responsive design for all devices