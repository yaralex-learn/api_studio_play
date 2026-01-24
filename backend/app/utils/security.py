from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, Tuple
from jose import jwt, JWTError
from passlib.context import CryptContext
import secrets
import string

from app.settings import (
    JWT_SECRET_KEY,
    JWT_ALGORITHM,
    MAX_LOGIN_ATTEMPTS,
    ACCOUNT_LOCKOUT_MINUTES,
    ACCESS_TOKEN_EXPIRE_HOURS,
    REFRESH_TOKEN_EXPIRE_DAYS
)

# Token expiration settings
# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: Dict[str, Any]) -> Tuple[str, datetime]:
    """Create a JWT access token with expiration."""
    print("\n=== Creating Access Token ===")
    to_encode = data.copy()
    current_time = datetime.now(timezone.utc)  # Use timezone-aware datetime
    expire_time = current_time + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    
    print(f"Current UTC time: {current_time}")
    print(f"Current timestamp: {current_time.timestamp()}")
    print(f"Expiration time: {expire_time}")
    print(f"Expiration timestamp: {expire_time.timestamp()}")
    
    # Create payload with timezone-aware timestamps
    to_encode.update({
        "exp": int(expire_time.timestamp()),  # Convert to integer timestamp
        "iat": int(current_time.timestamp()),  # Add issued-at time
        "type": "access"
    })
    print(f"Token payload before encoding: {to_encode}")
    
    token = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    print("=== End Creating Access Token ===\n")
    return token, expire_time

def create_refresh_token(data: Dict[str, Any]) -> Tuple[str, datetime]:
    """Create a JWT refresh token with expiration."""
    to_encode = data.copy()
    current_time = datetime.now(timezone.utc)  # Use timezone-aware datetime
    expire_time = current_time + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    
    # Create payload with timezone-aware timestamps
    to_encode.update({
        "exp": int(expire_time.timestamp()),  # Convert to integer timestamp
        "iat": int(current_time.timestamp()),  # Add issued-at time
        "type": "refresh"
    })
    
    token = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return token, expire_time

def verify_token(token: str, token_type: str = "access") -> Dict[str, Any]:
    """Verify a JWT token and return its payload."""
    print("\n=== Token Verification Debug ===")
    print(f"Verifying {token_type} token")
    print(f"Token: {token[:20]}...")  # Show first 20 chars for security
    
    current_time = datetime.now(timezone.utc)  # Use timezone-aware datetime
    print(f"Current UTC time: {current_time}")
    print(f"Current timestamp: {current_time.timestamp()}")
    
    try:
        # Decode with leeway for small time differences
        payload = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM],
            options={
                "verify_exp": True,
                "leeway": 10,  # 10 seconds leeway
                "verify_iat": True
            }
        )
        print("Token decoded successfully")
        print(f"Payload: {payload}")
        
        exp_timestamp = payload.get("exp")
        if exp_timestamp:
            exp_datetime = datetime.fromtimestamp(exp_timestamp, timezone.utc)
            print(f"Token expiration timestamp: {exp_timestamp}")
            print(f"Token expiration datetime: {exp_datetime}")
            print(f"Time until expiration: {exp_datetime - current_time}")
            print(f"Has expired: {current_time > exp_datetime}")
        
        if payload.get("type") != token_type:
            print(f"Token type mismatch: got {payload.get('type')}, expected {token_type}")
            raise ValueError(f"Invalid token type. Expected {token_type}")
            
        # Check expiration
        if exp_timestamp and current_time.timestamp() > exp_timestamp:
            print("Token has expired")
            print(f"Current time: {current_time.timestamp()}")
            print(f"Expiration time: {exp_timestamp}")
            print(f"Time difference: {current_time.timestamp() - exp_timestamp} seconds")
            raise ValueError("Token has expired")
            
        print("Token verified successfully")
        print("=== End Token Verification ===\n")
        return payload

    except jwt.ExpiredSignatureError as e:
        print(f"JWT ExpiredSignatureError: {str(e)}")
        print(f"Current time: {current_time.timestamp()}")
        if "exp" in payload:
            print(f"Token expiration: {payload['exp']}")
            print(f"Time difference: {current_time.timestamp() - payload['exp']} seconds")
        raise ValueError("Token has expired")
    except jwt.JWTError as e:
        print(f"JWT Error: {str(e)}")
        raise ValueError("Invalid token")
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        raise

def generate_secure_token(length: int = 32) -> str:
    """Generate a secure random token."""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def create_tokens(user_id: str) -> Tuple[str, datetime, str, datetime]:
    """Create access and refresh tokens for a user with expiration times."""
    token_data = {"sub": str(user_id)}
    access_token, access_expires = create_access_token(token_data)
    refresh_token, refresh_expires = create_refresh_token(token_data)
    return access_token, access_expires, refresh_token, refresh_expires

def is_token_expired(expires_at: datetime) -> bool:
    """Check if a token is expired."""
    return datetime.utcnow() > expires_at

def refresh_token(token: str, token_type: str) -> Tuple[str, datetime]:
    """Refresh either access or refresh token."""
    try:
        # Verify the token first
        payload = verify_token(token, token_type)
        user_id = payload.get("sub")
        
        if not user_id:
            raise ValueError("Invalid token payload")
            
        # Create new token of the same type
        if token_type == "access":
            return create_access_token({"sub": user_id})
        else:
            return create_refresh_token({"sub": user_id})
            
    except Exception as e:
        raise ValueError(f"Failed to refresh token: {str(e)}")

def handle_failed_login(user: Any) -> None:
    """Handle failed login attempt and account lockout."""
    user.failed_login_attempts += 1
    if user.failed_login_attempts >= MAX_LOGIN_ATTEMPTS:
        user.locked_until = datetime.utcnow() + timedelta(minutes=ACCOUNT_LOCKOUT_MINUTES)
    user.save()

def reset_failed_login(user: Any) -> None:
    """Reset failed login attempts after successful login."""
    user.failed_login_attempts = 0
    user.locked_until = None
    user.last_login = datetime.utcnow()
    user.save()

def is_account_locked(user: Any) -> bool:
    """Check if account is locked."""
    if not user.locked_until:
        return False
    if datetime.utcnow() > user.locked_until:
        user.locked_until = None
        user.failed_login_attempts = 0
        user.save()
        return False
    return True

def validate_password_strength(password: str) -> bool:
    """Validate password strength."""
    # At least 8 characters
    if len(password) < 8:
        return False
        
    # At least one uppercase letter
    if not any(c.isupper() for c in password):
        return False
        
    # At least one lowercase letter
    if not any(c.islower() for c in password):
        return False
        
    # At least one digit
    if not any(c.isdigit() for c in password):
        return False
        
    # At least one special character
    special_chars = set('!@#$%^&*()_+-=[]{}|;:,.<>?')
    if not any(c in special_chars for c in password):
        return False
        
    return True

def sanitize_email(email: str) -> str:
    """Sanitize email address."""
    return email.lower().strip()

def sanitize_username(username: str) -> str:
    """Sanitize username."""
    return username.lower().strip()

def generate_password_reset_token() -> str:
    """Generate a secure password reset token."""
    return generate_secure_token(64)  # Longer token for password reset

def generate_email_verification_token() -> str:
    """Generate a secure email verification token."""
    return generate_secure_token(32)

def hash_token(token: str) -> str:
    """Hash a token for storage."""
    return get_password_hash(token)

def verify_token_hash(token: str, hashed_token: str) -> bool:
    """Verify a token against its hash."""
    return verify_password(token, hashed_token) 