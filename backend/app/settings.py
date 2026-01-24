import os
from datetime import timedelta
from typing import Dict, Any
from os import getenv

# Google OAuth Settings
GOOGLE_CLIENT_ID = "940538258951-mepajb01hrgf29h74ppv62k0bkub3qnf.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET = "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"
GOOGLE_REDIRECT_URI = "https://api.yaralex.com/public/auth/callback"
#GOOGLE_REDIRECT_URI = "http://localhost:8080/public/auth/callback"
GOOGLE_AUTH_URI = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URI = "https://oauth2.googleapis.com/token"
GOOGLE_USER_INFO_URI = "https://www.googleapis.com/oauth2/v2/userinfo"
GOOGLE_SCOPE = "openid email profile"

SECRET_KEY = 'e132075bcc8c48809bb20b9bda648e16'
MAX_SESSION_COUNT = 5
HASHING_COST = 12 if getenv('ENV') == 'production' else 6
LANGUAGES = 'en'.split()
MONGO_URI = getenv('MONGO_URI', default='mongodb://127.0.0.1:27017/yaralex')



#######################################################################################



# MongoDB Settings
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "y2")

# JWT Settings
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "e132075bcc8c48809bb20b9bda648e16")  # Using same secret key as SECRET_KEY above
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = int(os.getenv("ACCESS_TOKEN_EXPIRE_HOURS", "10"))  # 1 hour
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "30"))  # 30 days
# Security Settings
MAX_LOGIN_ATTEMPTS = int(os.getenv("MAX_LOGIN_ATTEMPTS", "5"))
ACCOUNT_LOCKOUT_MINUTES = int(os.getenv("ACCOUNT_LOCKOUT_MINUTES", "30"))
PASSWORD_MIN_LENGTH = int(os.getenv("PASSWORD_MIN_LENGTH", "8"))
PASSWORD_MAX_LENGTH = int(os.getenv("PASSWORD_MAX_LENGTH", "32"))

# Email Settings
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "yaralex.co@gmail.com")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "avsq dgru rgwp izwq")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", "yaralex.co@gmail.com")
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "YaraLex")

# Frontend URL (for email links)
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# API Settings
API_V1_PREFIX = "/api/v1"
API_TITLE = "Y2 API"
API_DESCRIPTION = "Y2 Learning Platform API"
API_VERSION = "1.0.0"

# CORS Settings
CORS_ORIGINS = [
    "http://localhost:3000",  # React development server
    "http://localhost:8000",  # FastAPI development server
    # Add your production frontend URL here
]

# Rate Limiting
RATE_LIMIT_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))

# Environment
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
DEBUG = ENVIRONMENT == "development"

# Logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO" if not DEBUG else "DEBUG")

# Cache Settings
CACHE_TTL = int(os.getenv("CACHE_TTL", "300"))  # 5 minutes

# File Upload Settings
MAX_UPLOAD_SIZE = int(os.getenv("MAX_UPLOAD_SIZE", "5242880"))  # 5MB
ALLOWED_UPLOAD_EXTENSIONS = {
    "image": [".jpg", ".jpeg", ".png", ".gif"],
    "document": [".pdf", ".doc", ".docx"],
    "video": [".mp4", ".webm"],
    "audio": [".mp3", ".wav"]
}

# Feature Flags
FEATURES: Dict[str, bool] = {
    "email_verification": True,
    "google_auth": True,
    "password_reset": True,
    "rate_limiting": True,
    "file_uploads": True,
    "caching": True
}

# Response Messages
RESPONSE_MESSAGES = {
    "en": {
        "account_created": "Account created successfully. Please verify your email.",
        "email_verified": "Email verified successfully.",
        "login_success": "Logged in successfully.",
        "logout_success": "Logged out successfully.",
        "token_refreshed": "Token refreshed successfully.",
        "password_reset_sent": "Password reset instructions sent to your email.",
        "password_reset_success": "Password reset successfully.",
        "account_locked": "Account is locked. Please try again later.",
        "invalid_credentials": "Invalid credentials.",
        "email_not_verified": "Please verify your email first.",
        "token_expired": "Token has expired.",
        "token_invalid": "Invalid token.",
        "rate_limit_exceeded": "Too many requests. Please try again later."
    },
    "fr": {
        "account_created": "Compte créé avec succès. Veuillez vérifier votre email.",
        "email_verified": "Email vérifié avec succès.",
        "login_success": "Connexion réussie.",
        "logout_success": "Déconnexion réussie.",
        "token_refreshed": "Token actualisé avec succès.",
        "password_reset_sent": "Instructions de réinitialisation du mot de passe envoyées à votre email.",
        "password_reset_success": "Mot de passe réinitialisé avec succès.",
        "account_locked": "Compte verrouillé. Veuillez réessayer plus tard.",
        "invalid_credentials": "Identifiants invalides.",
        "email_not_verified": "Veuillez d'abord vérifier votre email.",
        "token_expired": "Le token a expiré.",
        "token_invalid": "Token invalide.",
        "rate_limit_exceeded": "Trop de requêtes. Veuillez réessayer plus tard."
    }
}

class IMAGE:
    full_size = 1280
    full_quality = 90
    thumbnail_size = 360
    thumbnail_quality = 70
    is_public = False


class AVATAR(IMAGE):
    full_size = 800
    thumbnail_size = 120
    is_public = True



################################################################################################
from os import getenv

# SECRET_KEY = 'e132075bcc8c48809bb20b9bda648e16'
# GOOGLE_CLIENT_ID = ''
MAX_SESSION_COUNT = 5
HASHING_COST = 12 if getenv('ENV') == 'production' else 6
LANGUAGES = 'en'.split()
MONGO_URI = getenv('MONGO_URI', default='mongodb://127.0.0.1:27017/yaralex')


class IMAGE:
    full_size = 1280
    full_quality = 90
    thumbnail_size = 360
    thumbnail_quality = 70
    is_public = False


class AVATAR(IMAGE):
    full_size = 800
    thumbnail_size = 120
    is_public = True


# Base directory for the application
import pathlib
BASE_DIR = pathlib.Path(__file__).parent.parent.absolute()

class THUMBNAIL:
    """Thumbnail generation settings"""
    
    STATIC_PATH = os.path.join(BASE_DIR, "app", "static", "thumbnails")
    
    class IMAGE:
        WIDTH = 200
        HEIGHT = 200
        QUALITY = 85
        
    class VIDEO:
        WIDTH = 200
        HEIGHT = 200
        QUALITY = 80
        SAMPLE_POSITIONS = [0.1, 0.25, 0.5, 0.75]
        
    class DOCUMENT:
        WIDTH = 200
        HEIGHT = 200
        QUALITY = 85
        
    class AUDIO:
        WIDTH = 200
        HEIGHT = 200
        QUALITY = 85
    
    # Supported file types for thumbnail generation
    IMAGE_TYPES = {
        'jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp', 'svg', 'ico'
    }
    
    VIDEO_TYPES = {
        'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v', '3gp'
    }
    
    DOCUMENT_TYPES = {
        'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'
    }
    
    AUDIO_TYPES = {
        'mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a'
    }
    
    ARCHIVE_TYPES = {
        'zip', 'rar', '7z', 'tar', 'gz'
    }

