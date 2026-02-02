from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import os
from typing import Dict, Any
import asyncio

# Initialize security scheme
security = HTTPBearer()

# Get secret key from environment
SECRET_KEY = os.getenv("BETTER_AUTH_SECRET")
if not SECRET_KEY:
    raise ValueError("❌ BETTER_AUTH_SECRET not set in environment")

async def verify_jwt_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """
    Verify JWT token and extract user information
    Returns decoded token payload with user_id and other claims
    """
    print(f"DEBUG: Auth Header: {credentials}")
    print(f"DEBUG: Decoding Token with Secret: {SECRET_KEY[:5]}...")

    try:
        # Decode the token
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=["HS256"])
        print(f"DEBUG: Token decoded successfully")

        # Extract user_id from token
        user_id = payload.get("user_id")
        if not user_id:
            print(f"DEBUG: Invalid token: missing user_id")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user_id"
            )

        print(f"DEBUG: Token valid for user_id: {user_id}")
        return {
            "user_id": user_id,
            "email": payload.get("email"),
            "exp": payload.get("exp")
        }

    except jwt.ExpiredSignatureError:
        print(f"DEBUG: Token verification failed - Signature has expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError as e:
        print(f"DEBUG: Token verification failed - Invalid token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    except Exception as e:
        print(f"DEBUG: Token verification failed with error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {str(e)}"
        )

def extract_user_id_from_token(token_data: Dict[str, Any]) -> str:
    """
    Extract user_id from verified token data
    """
    user_id = token_data.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID not found in token"
        )
    return user_id

# Convenience function to get user_id directly
async def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """
    Get current user's ID from JWT token
    This function can be used as a dependency to protect routes
    """
    token_data = await verify_jwt_token(credentials)
    return extract_user_id_from_token(token_data)