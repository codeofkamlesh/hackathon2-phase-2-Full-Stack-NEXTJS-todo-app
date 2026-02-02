# Tasks: Fix Neon DB Table Creation, User Signup, and Task Fetch Errors

## T-001: Setup Phase 2 Project Structure
**Category**: Setup
**Priority**: Critical
**Time Estimate**: 30 minutes
**Dependencies**: None
**Description**: Create necessary directory structure for Phase 2 backend fixes

**Acceptance Criteria**:
- [ ] Directory structure exists: /phases/phase2/backend/ and /phases/phase2/frontend/
- [ ] Backend virtual environment properly configured
- [ ] Environment variables file exists with proper placeholders

**Implementation Notes**:
- Verify directory structure exists for Phase 2
- Ensure backend virtual environment is active
- Prepare environment configuration

**Files to Create/Modify**:
- Directory structure setup

**Testing Instructions**:
- [ ] Verify directory structure exists
- [ ] Activate virtual environment and confirm it works
- [ ] Check environment variables file exists

**AI Agent Prompt Example**:
```bash
# Verify directory structure exists
mkdir -p /phases/phase2/backend/
mkdir -p /phases/phase2/frontend/lib/
```

---

## T-002: Fix Database Connection Initialization
**Category**: Core Development
**Priority**: Critical
**Time Estimate**: 1 hour
**Dependencies**: T-001
**Description**: Fix SQLModel metadata.create_all() call to properly create Neon DB tables

**Acceptance Criteria**:
- [ ] SQLModel.metadata.create_all(engine) called at application startup
- [ ] Tables (users and tasks) are created automatically when application starts
- [ ] Database connection uses proper psycopg2-binary driver with sslmode=require
- [ ] Tables are visible in Neon database dashboard

**Implementation Notes**:
- Modify db.py to ensure proper initialization
- Add error handling for database connection issues
- Verify tables are created on first run

**Files to Create/Modify**:
- /phases/phase2/backend/db.py

**Testing Instructions**:
- [ ] Start application and verify tables are created
- [ ] Check Neon database dashboard for created tables
- [ ] Verify no errors in startup logs

**AI Agent Prompt Example**:
```python
# In db.py, ensure this is called at startup:
SQLModel.metadata.create_all(engine)
```

---

## T-003: Implement User Registration Endpoint
**Category**: Core Development
**Priority**: Critical
**Time Estimate**: 1.5 hours
**Dependencies**: T-002
**Description**: Fix backend register endpoint to create users in "users" table with proper UUID and hashed passwords

**Acceptance Criteria**:
- [ ] POST /api/auth/signup creates user in "users" table
- [ ] User ID is properly generated as UUID
- [ ] Passwords are securely hashed using bcrypt
- [ ] Returns valid JWT token with user_id
- [ ] Proper validation for email format and password strength

**Implementation Notes**:
- Implement proper user creation in auth route
- Use bcrypt for password hashing
- Generate UUID for user_id
- Return JWT token with proper claims

**Files to Create/Modify**:
- /phases/phase2/backend/routes/auth.py

**Testing Instructions**:
- [ ] Send signup request and verify user is created in database
- [ ] Check password is properly hashed in database
- [ ] Verify JWT token is returned and valid
- [ ] Test validation with invalid inputs

**AI Agent Prompt Example**:
```python
# In auth.py, implement secure user creation:
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
user = User(id=str(uuid.uuid4()), email=email, password=hashed.decode(), ...)
```

---

## T-004: Implement JWT Token Generation and Validation
**Category**: Security
**Priority**: Critical
**Time Estimate**: 1.5 hours
**Dependencies**: T-003
**Description**: Ensure JWT tokens are properly generated with user_id and validated using shared BETTER_AUTH_SECRET

**Acceptance Criteria**:
- [ ] JWT tokens generated with user_id claim during signup/login
- [ ] Tokens validated using shared BETTER_AUTH_SECRET
- [ ] Proper token expiration (7 days default)
- [ ] Token verification endpoint works correctly

**Implementation Notes**:
- Use jwt.encode/decode with proper algorithm
- Store BETTER_AUTH_SECRET in environment
- Add token expiration handling

**Files to Create/Modify**:
- /phases/phase2/backend/routes/auth.py
- /phases/phase2/backend/middleware/auth_middleware.py

**Testing Instructions**:
- [ ] Generate token during signup/login
- [ ] Verify token can be decoded with shared secret
- [ ] Test token expiration handling
- [ ] Validate token verification endpoint

**AI Agent Prompt Example**:
```python
# Generate JWT token with user_id claim:
token = jwt.encode({"user_id": user.id, "exp": datetime.utcnow() + timedelta(days=7)}, SECRET_KEY, algorithm="HS256")
```

---

## T-005: Fix Task Management API Endpoints
**Category**: Core Development
**Priority**: Critical
**Time Estimate**: 2 hours
**Dependencies**: T-004
**Description**: Fix /api/tasks endpoints to use authenticated user_id from JWT and return valid JSON

**Acceptance Criteria**:
- [ ] GET /api/{user_id}/tasks uses authenticated user_id from JWT
- [ ] All task endpoints return valid JSON arrays/objects
- [ ] User isolation: users only see their own tasks
- [ ] Proper error handling with appropriate HTTP status codes

**Implementation Notes**:
- Add JWT validation middleware
- Filter tasks by authenticated user_id
- Handle empty results properly
- Return consistent JSON responses

**Files to Create/Modify**:
- /phases/phase2/backend/routes/tasks.py
- /phases/phase2/backend/middleware/auth_middleware.py

**Testing Instructions**:
- [ ] Verify user isolation works correctly
- [ ] Test endpoints return valid JSON
- [ ] Check error handling for invalid requests
- [ ] Validate 401 responses for unauthenticated requests

**AI Agent Prompt Example**:
```python
# In tasks.py, implement user isolation:
@router.get("/{user_id}/tasks")
async def get_tasks(user_id: str, token: str = Depends(get_current_user)):
    # Verify token user_id matches URL user_id
    if token_user_id != user_id:
        raise HTTPException(status_code=403, detail="Access forbidden")
```

---

## T-006: Fix Frontend API Client for JSON Parsing
**Category**: Frontend Integration
**Priority**: Critical
**Time Estimate**: 1 hour
**Dependencies**: T-005
**Description**: Fix frontend API client to properly handle JSON responses and prevent parsing errors

**Acceptance Criteria**:
- [ ] Frontend lib/api.ts handles API responses safely
- [ ] No "JSON.parse unexpected character" errors occur
- [ ] Proper error handling with try/catch blocks
- [ ] API calls include proper Authorization headers

**Implementation Notes**:
- Add try/catch blocks around JSON parsing
- Verify Authorization header is included in requests
- Handle different response types appropriately

**Files to Create/Modify**:
- /phases/phase2/frontend/lib/api.ts

**Testing Instructions**:
- [ ] Make API calls and verify no parsing errors
- [ ] Check Authorization header is sent with requests
- [ ] Test error handling for malformed responses
- [ ] Verify successful responses are parsed correctly

**AI Agent Prompt Example**:
```typescript
// In api.ts, implement safe JSON parsing:
try {
  const data = await response.json();
  return data;
} catch (error) {
  console.error('JSON parsing error:', error);
  throw new Error('Invalid response format');
}
```

---

## T-007: Fix 401 Unauthorized Error Handling
**Category**: Frontend Integration
**Priority**: Critical
**Time Estimate**: 1 hour
**Dependencies**: T-006
**Description**: Handle 401 errors properly and redirect users to login when authentication expires

**Acceptance Criteria**:
- [ ] Frontend detects 401 Unauthorized responses
- [ ] Users are redirected to login page when authentication expires
- [ ] JWT tokens are properly attached to all API calls
- [ ] Token is persisted in localStorage

**Implementation Notes**:
- Intercept 401 responses in API client
- Redirect to login page when needed
- Include Authorization: Bearer {token} header in requests

**Files to Create/Modify**:
- /phases/phase2/frontend/lib/api.ts

**Testing Instructions**:
- [ ] Simulate 401 response and verify redirect
- [ ] Check Authorization header is sent with requests
- [ ] Verify token is stored and retrieved from localStorage
- [ ] Test redirect flow manually

**AI Agent Prompt Example**:
```typescript
// In api.ts, handle 401 responses:
if (response.status === 401) {
  localStorage.removeItem('token');
  window.location.href = '/login';
  return;
}
```

---

## T-008: Implement User Isolation in Backend
**Category**: Security
**Priority**: High
**Time Estimate**: 1 hour
**Dependencies**: T-005
**Description**: Ensure backend properly filters requests by user_id to prevent unauthorized access

**Acceptance Criteria**:
- [ ] All task endpoints verify user_id matches authenticated user
- [ ] Users cannot access other users' data
- [ ] Proper error responses for unauthorized access attempts
- [ ] JWT validation occurs before data access

**Implementation Notes**:
- Add user_id validation in all task endpoints
- Verify JWT token user_id matches request user_id
- Return 403 Forbidden for unauthorized access

**Files to Create/Modify**:
- /phases/phase2/backend/routes/tasks.py

**Testing Instructions**:
- [ ] Attempt to access another user's tasks with valid token
- [ ] Verify 403 Forbidden response is returned
- [ ] Confirm legitimate access still works
- [ ] Test with multiple users if possible

**AI Agent Prompt Example**:
```python
# In tasks.py, verify user_id matches token:
def verify_user_access(token_user_id: str, request_user_id: str):
    if token_user_id != request_user_id:
        raise HTTPException(status_code=403, detail="Access forbidden")
```

---

## T-009: Integrate Backend and Frontend
**Category**: Integration
**Priority**: High
**Time Estimate**: 1.5 hours
**Dependencies**: T-007, T-008
**Description**: Ensure complete integration between fixed backend and frontend

**Acceptance Criteria**:
- [ ] Signup flow works end-to-end (creates user, returns token, redirects)
- [ ] Login flow works end-to-end (authenticates, returns token, redirects)
- [ ] Task operations work end-to-end (create, read, update, delete)
- [ ] All API calls use proper authentication headers

**Implementation Notes**:
- Test complete user flows
- Verify token flow between frontend and backend
- Check all error handling paths

**Files to Create/Modify**:
- /phases/phase2/frontend/lib/api.ts
- /phases/phase2/backend/routes/auth.py
- /phases/phase2/backend/routes/tasks.py

**Testing Instructions**:
- [ ] Complete signup flow and verify user in database
- [ ] Complete login flow and verify token usage
- [ ] Perform all task operations and verify data consistency
- [ ] Test error scenarios and verify proper handling

**AI Agent Prompt Example**:
```bash
# Test complete flow:
# 1. Signup user
# 2. Verify user created in database
# 3. Use returned token for task operations
# 4. Verify user isolation works
```

---

## T-010: End-to-End Testing and Validation
**Category**: Testing
**Priority**: Critical
**Time Estimate**: 2 hours
**Dependencies**: T-009
**Description**: Comprehensive testing to verify all fixes work correctly with Neon PostgreSQL

**Acceptance Criteria**:
- [ ] Signup creates user in Neon database successfully
- [ ] Login succeeds and returns valid JWT token
- [ ] Tasks fetch/add/update/delete work without errors
- [ ] JSON responses are valid with no parsing errors
- [ ] No 401/500 errors occur during normal operation
- [ ] Tables are visible in Neon database dashboard
- [ ] User isolation is enforced correctly

**Implementation Notes**:
- Test complete user journey
- Verify database integration
- Check all edge cases
- Validate error handling

**Files to Create/Modify**:
- Test scripts for validation

**Testing Instructions**:
- [ ] Perform complete signup/login/task workflow
- [ ] Verify database records exist in Neon
- [ ] Check all API endpoints return valid JSON
- [ ] Test error conditions and verify graceful handling
- [ ] Validate user isolation with multiple accounts if possible

**AI Agent Prompt Example**:
```bash
# Complete end-to-end test:
# 1. Create new user via signup
# 2. Verify user exists in Neon database
# 3. Login with credentials
# 4. Create, read, update, delete tasks
# 5. Verify all operations work correctly
# 6. Check Neon dashboard for data
```

---