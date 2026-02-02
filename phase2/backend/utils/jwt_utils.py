import jwt
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import os

# Get secret key from environment
SECRET_KEY = os.getenv("BETTER_AUTH_SECRET")
if not SECRET_KEY:
    raise ValueError("❌ BETTER_AUTH_SECRET not set in environment")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a new JWT access token
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt


def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verify a JWT token and return the payload if valid
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        # Token has expired
        return None
    except jwt.InvalidTokenError:
        # Token is invalid
        return None


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decode a JWT token without verifying expiration
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM], options={"verify_exp": False})
        return payload
    except jwt.InvalidTokenError:
        # Token is invalid
        return None


def is_token_expired(token: str) -> bool:
    """
    Check if a JWT token is expired
    """
    payload = verify_token(token)
    if payload is None:
        return True

    try:
        exp_timestamp = payload.get("exp")
        if exp_timestamp:
            return datetime.fromtimestamp(exp_timestamp) < datetime.utcnow()
    except Exception:
        pass

    return True


def get_user_id_from_token(token: str) -> Optional[str]:
    """
    Extract user_id from JWT token
    """
    payload = verify_token(token)
    if payload:
        return payload.get("user_id")
    return None


def get_email_from_token(token: str) -> Optional[str]:
    """
    Extract email from JWT token
    """
    payload = verify_token(token)
    if payload:
        return payload.get("email")
    return None


def refresh_access_token(token: str) -> Optional[str]:
    """
    Refresh an access token (create a new one with the same user data)
    """
    payload = verify_token(token)
    if not payload:
        return None

    # Remove expiration from the payload to create a new token
    user_id = payload.get("user_id")
    email = payload.get("email")

    if not user_id:
        return None

    # Create a new token with updated expiration
    new_data = {"user_id": user_id}
    if email:
        new_data["email"] = email

    return create_access_token(new_data)


def create_user_token(user_id: str, email: str = None) -> str:
    """
    Create a token specifically for a user
    """
    data = {"user_id": user_id}
    if email:
        data["email"] = email

    return create_access_token(data)