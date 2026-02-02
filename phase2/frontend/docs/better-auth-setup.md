# Better Auth Database Setup Guide

This document explains the database configuration and setup for Better Auth with Neon PostgreSQL.

## Issues Fixed

### 1. Missing Database Tables
- **Problem**: "relation 'user' does not exist" error (Code: 42P01)
- **Solution**: Created all required Better Auth tables (users, sessions, accounts, verification_tokens)

### 2. SSL Security Warning
- **Problem**: Security warnings about SSL modes
- **Solution**: Updated connection string to use `sslmode=verify-full` for enhanced security

### 3. Connection Timeouts (ETIMEDOUT)
- **Problem**: Database connection timeouts in serverless environment
- **Solution**: Optimized connection pool settings for Neon DB

## Configuration Changes Made

### Environment Variables (.env.local)
- Updated DATABASE_URL to use `sslmode=verify-full` for security
- Example: `postgresql://username:password@host/database?sslmode=verify-full`

### Database Connection (lib/auth.ts)
- Increased max connections to 10 for better performance
- Added connection timeout of 10 seconds
- Enabled keep-alive and maxUses for memory leak prevention
- Configured proper SSL settings for Neon compatibility

### Scripts Created
1. `npm run db:init` - Check database connectivity and existing tables
2. `npm run db:create-tables` - Create all Better Auth tables if missing

## Database Schema

The following tables are now available:
- `users` - User account information
- `sessions` - User session management
- `accounts` - OAuth and account linking
- `verification_tokens` - Email verification tokens

## Usage

1. Make sure your `.env.local` contains the correct `DATABASE_URL`
2. Run `npm run db:create-tables` to ensure all tables exist
3. Start your application with `npm run dev`

The database is now properly configured for Better Auth with optimized settings for Neon PostgreSQL and serverless environments.