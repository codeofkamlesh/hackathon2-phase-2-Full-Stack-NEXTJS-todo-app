# Deployment Auditor Skill

## Purpose
A checklist/script to ensure proper deployment configuration with no localhost/127.0.0.1 hardcoded values and proper environment variable usage.

## Audit Checklist

### 1. Environment Variables
- [ ] Verify `NEXT_PUBLIC_API_URL` is used instead of hardcoded backend URLs
- [ ] Check that `DATABASE_URL` points to production database (NeonDB)
- [ ] Confirm `COHERE_API_KEY` is set via environment variable
- [ ] Ensure `BETTER_AUTH_URL` and `BETTER_AUTH_SECRET` are properly configured
- [ ] Validate all sensitive information is stored in environment variables

### 2. Frontend URL Configuration
- [ ] Search for hardcoded `localhost` in frontend code
- [ ] Search for hardcoded `127.0.0.1` in frontend code
- [ ] Search for hardcoded `http://localhost` in any files
- [ ] Verify all API calls use `process.env.NEXT_PUBLIC_API_URL`
- [ ] Check that authentication URLs are properly configured

### 3. Backend CORS Configuration
- [ ] Verify CORS origins in backend only include production URLs
- [ ] Check that development origins are conditional or separated
- [ ] Ensure no wildcard (`"*"`) CORS configuration in production

### 4. Search Commands for Auditing
```bash
# Find any localhost references
grep -r "localhost" . --exclude-dir=.git --exclude-dir=node_modules

# Find any 127.0.0.1 references
grep -r "127.0.0.1" . --exclude-dir=.git --exclude-dir=node_modules

# Find any hardcoded backend URLs
grep -r "http://" . --exclude-dir=.git --exclude-dir=node_modules | grep -v "NEXT_PUBLIC_API_URL"

# Find any hardcoded https URLs that might be dev endpoints
grep -r "https://" . --exclude-dir=.git --exclude-dir=node_modules | grep -v "NEXT_PUBLIC_API_URL"
```

### 5. Verification Steps
- [ ] Test API connectivity using the configured `NEXT_PUBLIC_API_URL`
- [ ] Verify authentication flow works with production URLs
- [ ] Check that all frontend components can communicate with backend
- [ ] Validate that chat functionality works with production backend
- [ ] Confirm database connections work with production settings

### 6. Production Readiness Checklist
- [ ] Remove all development-only configuration
- [ ] Verify SSL certificates and HTTPS requirements
- [ ] Confirm monitoring and logging are properly configured
- [ ] Ensure error handling is appropriate for production
- [ ] Validate backup and recovery procedures