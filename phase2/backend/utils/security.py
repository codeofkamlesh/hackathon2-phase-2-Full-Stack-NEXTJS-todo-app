import bcrypt
from typing import Tuple
import os
import re

def hash_password(password: str) -> str:
    """
    Hash a password with bcrypt
    """
    # Convert password string to bytes
    password_bytes = password.encode('utf-8')

    # Generate salt and hash the password
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)

    # Return the hashed password as a string
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plaintext password against its hash
    """
    # Convert passwords to bytes
    password_bytes = plain_password.encode('utf-8')
    stored_password = hashed_password.encode('utf-8')

    # Verify the password
    return bcrypt.checkpw(password_bytes, stored_password)

def validate_password_strength(password: str) -> Tuple[bool, str]:
    """
    Validate password strength requirements
    Returns (is_valid, error_message)
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"

    if not any(c.isupper() for c in password):
        return False, "Password must contain at least one uppercase letter"

    if not any(c.islower() for c in password):
        return False, "Password must contain at least one lowercase letter"

    if not any(c.isdigit() for c in password):
        return False, "Password must contain at least one digit"

    if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
        return False, "Password must contain at least one special character"

    return True, ""

def sanitize_input(input_str: str) -> str:
    """
    Sanitize user input to prevent injection attacks
    """
    if not input_str:
        return input_str

    # Remove potentially dangerous characters
    sanitized = re.sub(r'[<>"\'&]', '', input_str)
    return sanitized.strip()

def validate_email_format(email: str) -> bool:
    """
    Validate email format using regex
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None