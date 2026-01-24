from pydantic import BaseModel, field_validator, Field
from typing import Optional, List, Dict
from datetime import datetime
from re import compile

from beanie import Document
from pymongo import IndexModel, ASCENDING
from pymongo import MongoClient
from pydantic import BaseModel, field_validator, Field, EmailStr, ConfigDict
from typing import Optional, List, Dict, Literal, Union, Any
from datetime import datetime
from re import compile
from enum import Enum

from beanie import Document, PydanticObjectId
from pymongo import IndexModel, ASCENDING
from pymongo import MongoClient

from app.messages.user import User_Error
# from app.messages import user as User_Error
import app.settings as settings


SYNC_DB = MongoClient(settings.MONGO_URI).get_database()
USERNAME_REGEX = r'^(?!.*__)(?!_)(?![0-9])[a-zA-Z0-9_]{4,16}(?<!_)$'
PASSWORD_REGEX = r'''^[A-Za-z\d@$!%*?&_\-+=#^(){}[\]<>.,;:'"`~]{6,20}$'''
# PASSWORD_REGEX = r'''^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&_\-+=#^(){}[\]<>.,;:'"`~])[A-Za-z\d@$!%*?&_\-+=#^(){}[\]<>.,;:'"`~]{6,20}$'''
EMAIL_REGEX = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'


# Enums
class UserRole(str, Enum):
    ADMIN = "admin"
    CREATOR = "creator"
    PLAYER = "player"

class AuthProvider(str, Enum):
    LOCAL = "local"
    GOOGLE = "google"

# class AccessType(str, Enum):
#     FULL = "full_access"
#     LIMITED = "limited_access"


# ~~~~~~~~~~ DATABASE MODELS ~~~~~~~~~~ # 

class UserProfile(BaseModel):
    """User profile information."""
    id: Optional[str] = Field(None, example="60b8d295f295a53b88f5a7c9")  # Added for responses
    email: EmailStr = Field(..., example="user@example.com")
    first_name: Optional[str] = Field(None, example="John")
    last_name: Optional[str] = Field(None, example="Doe")
    bio: Optional[str] = Field(None, example="Short bio about the user.")
    avatar_url: Optional[str] = Field(None, example="https://example.com/avatar.png")
    role: UserRole = Field(default=UserRole.PLAYER)
    provider: AuthProvider = Field(default=AuthProvider.LOCAL)
    is_email_verified: bool = Field(default=False)
    # subscribed_channels: Optional[Dict[str, AccessType]] = Field(
    #     default=None,
    #     example={"ch1": AccessType.FULL, "ch2": AccessType.LIMITED}
    # )

    @classmethod
    def from_user(cls, user: 'User') -> 'UserProfile':
        """Create UserProfile from User instance."""
        return cls(
            id=str(user.id),
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            bio=user.bio,
            avatar_url=user.avatar_url,
            role=user.role,
            provider=user.provider,
            is_email_verified=user.is_email_verified,
            # subscribed_channels=user.subscribed_channels
        )

class UserAuth(BaseModel):
    """Authentication related information."""
    hashed_password: Optional[str] = None
    google_id: Optional[str] = Field(None, exclude=True)  # Exclude from serialization for local users
    
    # Token storage
    access_token: Optional[str] = None
    access_token_expires_at: Optional[datetime] = None
    refresh_token: Optional[str] = None
    refresh_token_expires_at: Optional[datetime] = None
    
    # Verification
    verification_code: Optional[str] = None
    verification_code_created_at: Optional[datetime] = None
    verification_code_expires_at: Optional[datetime] = None
    
    # Account tracking
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    # failed_login_attempts: int = Field(default=0)
    locked_until: Optional[datetime] = None

class User(Document, UserProfile, UserAuth):
    """Complete user model combining profile and auth information."""
    
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    class Settings:
        name = "users"
        indexes = [
            # Compound unique index on email + role (allows same email with different roles)
            IndexModel([("email", ASCENDING), ("role", ASCENDING)], unique=True),
            # Only create unique index for google_id when provider is GOOGLE
            IndexModel(
                [("google_id", ASCENDING)],
                unique=True,
                partialFilterExpression={"provider": AuthProvider.GOOGLE}
            )
        ]

    def __init__(self, **data):
        # For local users, remove google_id entirely
        if data.get('provider') == AuthProvider.LOCAL:
            data.pop('google_id', None)
        super().__init__(**data)

    def get_profile(self) -> Dict[str, Any]:
        """Get user profile information."""
        return {
            'id': str(self.id),
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'bio': self.bio,
            'avatar_url': self.avatar_url,
            'role': self.role,
            'is_email_verified': self.is_email_verified,
            # 'subscribed_channels': self.subscribed_channels
        }

    def get_details(self):
        return {
            'id': str(self.id),
            'role': self.role,
        }


# ~~~~~~~~~~ REQUEST MODELS ~~~~~~~~~~ # 

class SignUpRequest(BaseModel):
    """User registration request."""
    email: EmailStr = Field(..., example='john.doe@example.com')
    password: str = Field(..., example='ABab12*$')
    first_name: Optional[str] = Field(None, example='John')
    last_name: Optional[str] = Field(None, example='Doe')
    role: UserRole = Field(default=UserRole.PLAYER)

    def __init__(self, **data):
        print("\n=== SignUpRequest Initialization ===")
        print("Input data:", data)
        try:
            super().__init__(**data)
            print("SignUpRequest initialized successfully")
        except Exception as e:
            print("Error during SignUpRequest initialization:", str(e))
            raise
        print("=== End SignUpRequest Initialization ===\n")
    
    @field_validator('password')
    def validate_password(cls, value):
        print("\n=== Validating Password ===")
        print(f"Password length: {len(value)}")
        
        # Check regex pattern
        if not compile(PASSWORD_REGEX).match(value):
            print(f"Password validation failed: Does not match pattern {PASSWORD_REGEX}")
            print("Password must contain:")
            print("- At least one uppercase letter")
            print("- At least one lowercase letter")
            print("- At least one number")
            print("- At least one special character")
            print("- Length between 6 and 20 characters")
            raise ValueError(User_Error.WEAK_PASSWORD)
        
        print("Password validation passed")
        print("=== End Password Validation ===\n")
        return value
    
    @field_validator('email')
    def validate_email(cls, value):
        print("\n=== Validating Email ===")
        print(f"Input email: {value}")
        
        # Check regex pattern
        if not compile(EMAIL_REGEX).match(value):
            print(f"Email validation failed: Does not match pattern {EMAIL_REGEX}")
            raise ValueError(User_Error.INVALID_EMAIL_ADDRESS)
        
        # Check uniqueness
        # if SYNC_DB['users'].find_one({'email': value}):
        #     print(f"Email validation failed: '{value}' is already registered")
        #     raise ValueError(User_Error.ALREADY_REGISTERED)
        
        print("Email validation passed")
        print("=== End Email Validation ===\n")
        return value

class SignInRequest(BaseModel):
    """User login request."""
    username_or_email: str = Field(..., example='john_doe')
    password: str = Field(..., example='ABab12*$')
    role: UserRole = Field(..., example=UserRole.PLAYER)
    remember_me: bool = Field(default=False)

class GoogleAuthRequest(BaseModel):
    """Google authentication request."""
    token: str = Field(..., description="Google OAuth token")
    role: Optional[UserRole] = Field(default=UserRole.PLAYER)

class RefreshTokenRequest(BaseModel):
    """Token refresh request."""
    refresh_token: str = Field(..., description="Refresh token to get new access token")

    def __init__(self, **data):
        print("\n=== RefreshTokenRequest Initialization ===")
        print("Input data:", data)
        try:
            super().__init__(**data)
            print("RefreshTokenRequest initialized successfully")
        except Exception as e:
            print("Error during RefreshTokenRequest initialization:", str(e))
            raise
        print("=== End RefreshTokenRequest Initialization ===\n")

    @field_validator('refresh_token')
    def validate_refresh_token(cls, value):
        print("\n=== Validating Refresh Token ===")
        print(f"Refresh token length: {len(value)}")
        if not value or not isinstance(value, str):
            print("Refresh token validation failed: Token must be a non-empty string")
            raise ValueError("Refresh token must be a non-empty string")
        print("Refresh token validation passed")
        print("=== End Refresh Token Validation ===\n")
        return value

class LogoutRequest(BaseModel):
    """Logout request."""
    refresh_token: str = Field(..., description="Refresh token to invalidate")


class Google_Token(BaseModel):
    token: str
      

class Profile(BaseModel):
    first_name: Optional[str] = Field(default=None, example='John')
    last_name: Optional[str] = Field(default=None, example='Doe')
    bio: Optional[str] = Field(default=None, example="Short bio about the user.")


class Username_Or_Email(BaseModel):
    username_or_email: str = Field(..., example='john_doe')
    role: UserRole = Field(..., example=UserRole.PLAYER)


class Password(BaseModel):
    username_or_email: str = Field(..., example='john_doe')
    verification_code: str = Field(..., example='12345')
    password: str = Field(..., example='ABab12*$')
    role: UserRole = Field(..., example=UserRole.PLAYER)

    @field_validator('password')
    def validate_password(cls, value):
        if not compile(PASSWORD_REGEX).match(value):
            raise ValueError(User_Error.WEAK_PASSWORD)
        return value

# ~~~~~~~~~~ RESPONSE MODELS ~~~~~~~~~~ # 

class Token(BaseModel):
    """Authentication tokens."""
    access_token: str = Field(..., example='2e631be1e4e84cddb5ba4ce0c52add2f')
    access_token_expires_at: datetime = Field(..., example='2024-03-20T12:00:00Z')
    refresh_token: str = Field(..., example='refresh_token_here')
    refresh_token_expires_at: datetime = Field(..., example='2024-04-20T12:00:00Z')
    token_type: str = 'bearer'

class AuthData(BaseModel):
    """Combined token and user information."""
    token: Token
    user: UserProfile  # Changed from UserData to UserProfile

class AuthResponse(BaseModel):
    """Standard authentication response."""
    success: bool = True
    message: Dict[str, str] = Field(default={
        'en': 'Operation completed successfully.',
        'fr': 'Opération terminée avec succès.',
    })
    data: Optional[AuthData] = None
    error: str = ''

class UserResponse(BaseModel):
    success: bool = True
    message: Dict[str, str] = Field(default={
        'en': 'You have been logged in successfully.',
        'fr': 'Vous vous êtes connecté avec succès.',
    })
    data: AuthData
    error: str = ''

# Add new request models for verification
class VerifyEmailRequest(BaseModel):
    """Email verification request."""
    email: EmailStr = Field(..., example='user@example.com')
    verification_code: str = Field(..., example='123456')
    role: UserRole = Field(..., example=UserRole.PLAYER)

    @field_validator('verification_code')
    def validate_verification_code(cls, value):
        if not isinstance(value, str):
            print(f"Input type: {type(value)} in VerifyEmailRequest is wrong")
            raise ValueError("Verification code must be a string")
        return value

class ResendVerificationRequest(BaseModel):
    """Request to resend verification code."""
    email: EmailStr = Field(..., example='user@example.com')
    role: UserRole = Field(..., example=UserRole.PLAYER)

class GoogleAuthRequest(BaseModel):
    client_id: str
    credential: str