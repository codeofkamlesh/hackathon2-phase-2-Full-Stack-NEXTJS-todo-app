from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from pydantic import BaseModel, EmailStr
from typing import Optional
import jwt
import os
from datetime import datetime, timedelta
import bcrypt
import uuid
from db import get_session
from models.user import User
from utils.jwt_utils import create_access_token
from utils.security import verify_password, validate_password_strength

router = APIRouter(tags=["Authentication"])

SECRET_KEY = os.getenv("BETTER_AUTH_SECRET")
if not SECRET_KEY:
    raise ValueError("❌ BETTER_AUTH_SECRET not set in environment")


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    name: str

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "password123",
                "name": "John Doe"
            }
        }


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    token: str
    user: dict  # Contains user_id, email, name
    message: str


@router.post("/api/auth/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(data: SignupRequest, session: Session = Depends(get_session)):
    """
    Create new user account
    """
    print(f"📝 Signup request for: {data.email}")

    try:
        # Validate password strength
        is_valid, error_msg = validate_password_strength(data.password)
        if not is_valid:
            print(f"❌ Password validation failed: {error_msg}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Password requirements not met: {error_msg}"
            )

        # Check if user already exists
        existing_user = session.exec(select(User).where(User.email == data.email)).first()
        if existing_user:
            print(f"❌ User {data.email} already exists")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Hash password
        password_bytes = data.password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password_bytes, salt)

        # Create new user
        new_user = User(
            id=str(uuid.uuid4()),
            email=data.email,
            name=data.name,
            password=hashed_password.decode('utf-8')
        )

        session.add(new_user)
        session.commit()
        session.refresh(new_user)

        print(f"✅ User created: {new_user.id}")

        # Generate JWT token
        token = create_access_token(data={"user_id": new_user.id, "email": new_user.email})

        response_data = {
            "token": token,
            "user": {
                "id": new_user.id,
                "email": new_user.email,
                "name": new_user.name
            },
            "message": "Account created successfully"
        }

        print(f"📤 Sending signup response: {response_data}")
        return response_data

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Signup error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Signup failed: {str(e)}"
        )


@router.post("/api/auth/login", response_model=AuthResponse)
async def login(data: LoginRequest, session: Session = Depends(get_session)):
    """
    Login existing user
    """
    print(f"🔐 Login request for: {data.email}")

    try:
        # Find user by email
        user = session.exec(select(User).where(User.email == data.email)).first()

        if not user:
            print(f"❌ User {data.email} not found")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # Verify password
        if not verify_password(data.password, user.password):
            print(f"❌ Invalid password for {data.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        print(f"✅ Login successful: {user.id}")

        # Generate JWT token
        token = create_access_token(data={"user_id": user.id, "email": user.email})

        response_data = {
            "token": token,
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name
            },
            "message": "Login successful"
        }

        print(f"📤 Sending login response: {response_data}")
        return response_data

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )


# Security scheme for token verification
security = HTTPBearer()


@router.get("/api/auth/verify")
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token"""
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])

        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token: missing user_id")

        return {"valid": True, "user_id": user_id}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")