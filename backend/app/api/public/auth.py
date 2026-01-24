from fastapi import APIRouter, Response, HTTPException, Depends, status, Request, Query
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, RedirectResponse #to_rm
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from datetime import datetime, timedelta
from beanie import PydanticObjectId
from passlib.context import CryptContext
import random
import string
import httpx
import urllib.parse
from fastapi.responses import JSONResponse
from app.models import responses, FailResponse
from app.models.user import (
    User, UserProfile,  # Data models
    SignUpRequest, SignInRequest, GoogleAuthRequest,  # Request models
    VerifyEmailRequest, ResendVerificationRequest,  # New verification models
    RefreshTokenRequest, LogoutRequest,  # Request models
    AuthResponse, Token, UserResponse, AuthData,  # Response models
    Profile, Username_Or_Email, Password,  # Additional models
    AuthProvider, GoogleAuthRequest  # Enums
)
from app.messages import handle_exception
from app.messages.user import User_Error, User_Message
from app.utils.user import get_user_id
from app.utils.security import (
    get_password_hash, verify_password, create_tokens,
    verify_token, handle_failed_login, reset_failed_login,
    is_account_locked, create_access_token
)
from app.utils.email import send_verification_email, send_welcome_email
from app.settings import (
    GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI,
    GOOGLE_AUTH_URI, GOOGLE_TOKEN_URI, GOOGLE_USER_INFO_URI, GOOGLE_SCOPE
)
from typing import Union
import json


# Setup templates
templates = Jinja2Templates(directory="app/templates")

api = APIRouter()


def generate_verification_code() -> str:
    """Generate a 6-digit verification code."""
    return ''.join(random.choices(string.digits, k=6))


@api.post(
    '/sign-up/',
    response_model=Union[AuthResponse, FailResponse],
    responses={
        **responses['406'],  # Validation errors
        **responses['409']   # User exists
    }
)
async def sign_up(
    response: Response,
    payload: SignUpRequest
):
    """
    Register a new user with email and password.
    """
    try:
        # Check if user exists with same email and role
        if await User.find_one({
            "email": payload.email,
            "role": payload.role
        }):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User already exists"
            )

        # Generate verification code
        verification_code = generate_verification_code()
        code_expires = datetime.utcnow() + timedelta(hours=24)  # Code expires in 24 hours

        # Create user
        user = User(
            email=payload.email,
            first_name=payload.first_name,
            last_name=payload.last_name,
            role=payload.role,
            provider=AuthProvider.LOCAL,
            hashed_password=get_password_hash(payload.password),
            is_email_verified=False,
            verification_code=verification_code,
            verification_code_created_at=datetime.utcnow(),
            verification_code_expires_at=code_expires,
            created_at=datetime.utcnow()
        )
        await user.insert()

        # Send verification email
        await send_verification_email(user.email, verification_code)

        # Create empty token data for signup response
        token_data = Token(
            access_token="",  # Empty token for signup
            access_token_expires_at=datetime.utcnow(),  # Required field
            refresh_token="",  # Empty token for signup
            refresh_token_expires_at=datetime.utcnow(),  # Required field
            token_type="bearer"
        )

        return AuthResponse(
            success=True,
            message={
                "en": "Account created. Please check your email for verification code.",
                "fr": "Compte créé. Veuillez vérifier votre email pour le code de vérification."
            },
            data=AuthData(
                token=token_data,  # Use empty token data instead of None
                user=UserProfile.from_user(user)
            )
        )

    except Exception as e:
        if isinstance(e, HTTPException):
            print(f"HTTP status code: {e.status_code}")
        return await handle_exception(response, e)

@api.post(
    '/verify-email/',
    response_model=Union[AuthResponse, FailResponse],
    responses={
        **responses['400'],  # Bad request
        **responses['401'],  # Invalid code
        **responses['404']   # User not found
    }
)
async def verify_email(
    response: Response,
    payload: VerifyEmailRequest
):
    """
    Verify user's email using verification code and return authentication tokens.
    """
    try:
        print("\n=== Verify Email Debug ===")
        # Find user by email
        try:
            print(f"Looking for user with email: {payload.email,  payload.role}")
            user = await User.find_one({"email": payload.email, "role": payload.role})

            print(f"Found user: {user}")
        except Exception as e:
            print(f"Database error: {str(e)}")
            return FailResponse(
                success=False,
                data=None,
                message={
                    "en": "Database error occurred",
                    "fr": "Une erreur de base de données s'est produite"
                },
                error="Database error"
            )
        if not user:
            print("User not found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        if user.is_email_verified:
            print("Email already verified")
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, 
                detail="Email is already verified"
            )

        # Verify code
        if not user.verification_code or not user.verification_code_expires_at:
            print("No verification code found")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No verification code found. Please request a new one."
            )

        if datetime.utcnow() > user.verification_code_expires_at:
            print("Verification code expired")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Verification code has expired. Please request a new one."
            )

        if user.verification_code != payload.verification_code:
            print("Invalid verification code")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid verification code"
            )

        # Update verification status
        user.is_email_verified = True
        user.verification_code = None  # Clear verification code
        user.verification_code_expires_at = None
        print("Updating user verification status...")
        
        # Generate new tokens
        access_token, access_expires, refresh_token, refresh_expires = create_tokens(str(user.id))
        print("Generated new tokens")
        
        # Update user with tokens
        user.access_token = access_token
        user.access_token_expires_at = access_expires
        user.refresh_token = refresh_token
        user.refresh_token_expires_at = refresh_expires
        user.last_login = datetime.utcnow()
        
        await user.save()
        print("User verification status and tokens updated successfully")

        # Send welcome email
        await send_welcome_email(user.email, user.first_name)
        print("Welcome email sent")

        print("=== End Verify Email Debug ===\n")
        return AuthResponse(
            success=True,
            message={
                "en": "Email verified successfully. You are now signed in.",
                "fr": "Email vérifié avec succès. Vous êtes maintenant connecté."
            },
            data=AuthData(
                token=Token(
                access_token=access_token,
                    access_token_expires_at=access_expires,
                    refresh_token=refresh_token,
                    refresh_token_expires_at=refresh_expires,
                    token_type="bearer"
            ),
                user=UserProfile.from_user(user)
            )
        )
    except Exception as e:
        if isinstance(e, HTTPException):
            print(f"HTTP status code: {e.status_code}")
        return await handle_exception(response, e)

@api.post(
    '/resend-verification/',
    response_model=Union[AuthResponse, FailResponse],
    responses={
        **responses['400'],  # Bad request
        **responses['404'],  # User not found
        **responses['422']   # Validation error
    }
)

async def resend_verification(
    response: Response,
    payload: ResendVerificationRequest
):
    """
    Resend verification code to user's email.
    
    Raises:
        HTTPException: 
            - 404: User not found
            - 400: Invalid request data
            - 422: Validation error (handled by exception_handler)
    """
    try:
        print("\n=== Resend Verification Debug ===")
        # Find user by email
        user = await User.find_one({"email": payload.email, "role": payload.role})
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found. You need to sign up first"
            )

        verification_code = generate_verification_code()
        code_expires = datetime.utcnow() + timedelta(hours=24)

        user.verification_code = verification_code
        user.verification_code_created_at = datetime.utcnow()
        user.verification_code_expires_at = code_expires
        await user.save()

        await send_verification_email(user.email, verification_code)
        print("=== End Resend Verification Debug ===\n")
        return AuthResponse(
            success=True,
            message={
                "en": "Account created. Please check your email for verification code.",
                "fr": "Compte créé. Veuillez vérifier votre email pour le code de vérification."
            },
            data=AuthData(
                    token=Token(
                        access_token="",  # Empty token for signup
                        access_token_expires_at=datetime.utcnow(),  # Empty token for signup
                        refresh_token="",  # Empty token for signup
                        refresh_token_expires_at=datetime.utcnow(),  # Empty token for signup
                        token_type="bearer"
                    ),  # Use empty token data instead of None
                user=UserProfile.from_user(user)
            )
        )


    except Exception as e:
        if isinstance(e, HTTPException):
            print(f"HTTP status code: {e.status_code}")
        return await handle_exception(response, e)

@api.post(
    '/sign-in/',
    response_model=Union[AuthResponse, FailResponse],
    responses={
        **responses['401'],  # Invalid credentials
        **responses['403']   # Unverified email
    }
)
async def sign_in(
    response: Response,
    payload: SignInRequest
):
    """
    Authenticate user with email/username and password.
    """
    try:
        # Find user
        user = await User.find_one({"email": payload.username_or_email, "role": payload.role})
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found. You need to sign up first"
            )
            
        # Verify password
        if not verify_password(payload.password, user.hashed_password):
            raise HTTPException(
                status_code=401,
                detail=FailResponse(
                    success=False,
                    message={
                        "en": "Invalid credentials",
                        "fr": "Identifiants invalides"
                    },
                    error="Invalid credentials",
                    data=None
                )
            )

        # Check email verification
        if not user.is_email_verified:
            raise HTTPException(
                status_code=403,
                detail=FailResponse(
                    success=False,
                    message={
                        "en": "Please verify your email first",
                        "fr": "Veuillez d'abord vérifier votre email"
                    },
                    error="Email not verified",
                    data=None
                )
            )

        # Generate new tokens
        access_token, access_expires, refresh_token, refresh_expires = create_tokens(str(user.id))
        
        # Update user with new tokens
        user.access_token = access_token
        user.access_token_expires_at = access_expires
        user.refresh_token = refresh_token
        user.refresh_token_expires_at = refresh_expires
        user.last_login = datetime.utcnow()
        await user.save()
        
        return AuthResponse(
            success=True,
            message=User_Message.LOGGED_IN.messages,
            data=AuthData(
                token=Token(
                access_token=access_token,
                    access_token_expires_at=access_expires,
                    refresh_token=refresh_token,
                    refresh_token_expires_at=refresh_expires,
                    token_type="bearer"
            ),
                user=UserProfile.from_user(user)
            )
        )

    except Exception as e:
        if isinstance(e, HTTPException):
            print(f"HTTP status code: {e.status_code}")
        return await handle_exception(response, e)


from datetime import datetime
import time
from typing import Optional
from fastapi import Body, Response
from google.oauth2 import id_token
from google.auth.transport import requests
from pydantic import BaseModel

from app.models.user import User, UserRole, UserProfile, AuthProvider
# from app.core.responses import AuthResponse, AuthData, Token, FailResponse, User_Message
# from app.core.security import create_tokens

# class GoogleAuthRequest(BaseModel):
#     client_id: str
#     credential: str

@api.post("/google-token", response_model=AuthResponse)
async def verify_google_login(
    response: Response,
    google_auth: GoogleAuthRequest = Body(...),
    role: UserRole = Body(UserRole.PLAYER)
) -> AuthResponse:
    """Verify Google ID token and create/login user."""
    print("\n=== Starting Google Token Verification ===")
    print(f"Received role: {role}")
    try:
        # Verify the Google ID token using provided client ID and credential
        print(f"Verifying token with client_id: {google_auth.client_id}")
        try:
            info = id_token.verify_oauth2_token(
                google_auth.credential,
                requests.Request(),
                audience=google_auth.client_id
            )
            print("Token verification successful")
            print(f"Token info: {info}")
            
            # Verify token is not expired
            if info['exp'] < time.time():
                print("Token has expired")
                raise ValueError('Token has expired')
                
        except ValueError as e:
            print(f"Token verification failed: {str(e)}")
            raise HTTPException(
                status_code=401,
                detail=FailResponse(
                    success=False,
                    message={
                        "en": "Invalid Google token",
                        "fr": "Jeton Google invalide"
                    },
                    error=str(e),
                    data=None
                )
            )

        # Extract user info from token
        email = info['email']
        google_id = info['sub']
        print(f"Extracted email: {email}, google_id: {google_id}")
        
        # Check if user exists
        print("Checking if user exists...")
        user = await User.find_one({"$or": [
            {"email": email},
            {"google_id": google_id}
        ]})

        if not user:
            print("Creating new user...")
            # Create new user
            user = User(
                email=email,
                google_id=google_id,
                provider=AuthProvider.GOOGLE,
                first_name=info.get('given_name'),
                last_name=info.get('family_name'),
                avatar_url=info.get('picture'),
                role=role,
                is_email_verified=info.get('email_verified', False)
            )
            await user.save()
            print(f"New user created with id: {user.id}")
        else:
            print(f"Existing user found with id: {user.id}")
        
        # Generate new tokens
        print("Generating new tokens...")
        access_token, access_expires, refresh_token, refresh_expires = create_tokens(str(user.id))
        
        # Update user with new tokens
        print("Updating user with new tokens...")
        user.access_token = access_token
        user.access_token_expires_at = access_expires
        user.refresh_token = refresh_token
        user.refresh_token_expires_at = refresh_expires
        user.last_login = datetime.utcnow()
        await user.save()
        print("User updated successfully")

        print("=== Google Token Verification Complete ===\n")
        return AuthResponse(
            success=True,
            message=User_Message.LOGGED_IN.messages,
            data=AuthData(
                token=Token(
                access_token=access_token,
                    access_token_expires_at=access_expires,
                    refresh_token=refresh_token,
                    refresh_token_expires_at=refresh_expires,
                    token_type="bearer"
            ),
                user=UserProfile.from_user(user)
            )
        )

    except Exception as e:
        print(f"Error occurred: {str(e)}")
        if isinstance(e, HTTPException):
            print(f"HTTP status code: {e.status_code}")
        return await handle_exception(response, e)

# Request model for Google authentication





# @api.get("/login", response_class=HTMLResponse)
# async def login(request: Request):
#     """Render the login page with Google auth button."""
#     return templates.TemplateResponse("login.html", {"request": request})

# @api.get("/google")
# async def google_icon(role: str = Query(..., description="User role (player, creator, or admin)")):
#     """Redirect to Google's OAuth server with role parameter."""
#     if role not in ["player", "creator", "admin"]:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Invalid role. Must be one of: player, creator, admin"
#         )

#     params = {
#         "client_id": GOOGLE_CLIENT_ID,
#         "redirect_uri": GOOGLE_REDIRECT_URI,
#         "response_type": "code",
#         "scope": GOOGLE_SCOPE,
#         "access_type": "offline",
#         "prompt": "consent",
#         "state": role  # Pass role in state parameter
#     }
#     auth_url = GOOGLE_AUTH_URI + "?" + urllib.parse.urlencode(params)
#     print(f"Redirecting to Google auth URL: {auth_url} , params: {params}")
#     return RedirectResponse(auth_url)

# @api.get("/callback", response_class=HTMLResponse)
# async def auth_callback(
#     request: Request,
#     code: str,
#     state: str = Query(..., description="Role passed from login page")
# ):
#     """Handle Google OAuth callback with role."""
#     try:
#         print("\n=== Starting Google Auth Callback ===")
#         print(f"Received code: {code[:10]}...")  # Print first 10 chars of code for security
#         print(f"Received role (state): {state}")
        
#         # Validate role
#         if state not in ["player", "creator", "admin"]:
#             raise HTTPException(
#                 status_code=status.HTTP_400_BAD_REQUEST,
#                 detail="Invalid role in state parameter"
#             )

#         async with httpx.AsyncClient() as client:
#             # Exchange code for token
#             token_data = {
#                 "code": code,
#                 "client_id": GOOGLE_CLIENT_ID,
#                 "client_secret": GOOGLE_CLIENT_SECRET,
#                 "redirect_uri": GOOGLE_REDIRECT_URI,
#                 "grant_type": "authorization_code"
#             }
#             print("Exchanging code for token...")
#             token_resp = await client.post(GOOGLE_TOKEN_URI, data=token_data)
#             token_resp.raise_for_status()
#             tokens = token_resp.json()

#             access_token = tokens.get("access_token")
#             if not access_token:
#                 print("Failed to get access token from response")
#                 raise HTTPException(
#                     status_code=status.HTTP_400_BAD_REQUEST,
#                     detail="Failed to obtain access token"
#                 )

#             print("Successfully obtained access token")

#             # Get user info from Google
#             headers = {"Authorization": f"Bearer {access_token}"}
#             print("Fetching user info from Google...")
#             user_resp = await client.get(GOOGLE_USER_INFO_URI, headers=headers)
#             user_resp.raise_for_status()
#             user_info = user_resp.json()
#             print(f"Received user info for email: {user_info.get('email')}")

#             # Find or create user with role
#             user = await User.find_one({"$or": [
#                 {"email": user_info["email"]},
#                 {"google_id": user_info["id"]}
#             ]})

#             if not user:
#                 print("Creating new user...")
#                 # Generate username from email
#                 username = user_info["email"].split('@')[0]
#                 base_username = username
#                 counter = 1
                
#                 while await User.find_one({"username": username}):
#                     username = f"{base_username}{counter}"
#                     counter += 1
                    
#                 # Create new user with selected role
#                 user = User(
#                     email=user_info["email"],
#                     username=username,
#                     first_name=user_info.get("given_name", ""),
#                     last_name=user_info.get("family_name", ""),
#                     avatar_url=user_info.get("picture"),
#                     role=state,  # Use role from state parameter
#                     provider=AuthProvider.GOOGLE,
#                     google_id=user_info["id"],
#                     is_email_verified=True,
#                     is_active=True,
#                     created_at=datetime.utcnow()
#                 )
#                 await user.insert()
#                 print(f"New user created with username: {username} and role: {state}")
#                 await send_welcome_email(user.email, user.username)
#             else:
#                 print("Updating existing user...")
#                 # Update existing user's Google info and role
#                 user.google_id = user_info["id"]
#                 user.avatar_url = user_info.get("picture")
#                 user.role = state  # Update role
#                 user.last_login = datetime.utcnow()
#                 await user.save()
#                 print(f"Updated user role to: {state}")

#             # Generate tokens
#             print("Generating authentication tokens...")
#             access_token, access_expires, refresh_token, refresh_expires = create_tokens(str(user.id))
#             user.access_token = access_token
#             user.access_token_expires_at = access_expires
#             user.refresh_token = refresh_token
#             user.refresh_token_expires_at = refresh_expires
#             await user.save()
#             print("Tokens generated and saved successfully")

            

#             # Return welcome page with user info
#             print("Rendering welcome page...")
#             # return RedirectResponse(f"https://studio.yaralex.com/login?atoken={access_token}&atoken_expires_at={access_expires}&rtoken={refresh_token}&rtoken_expires_at={refresh_expires}")
#             # response = RedirectResponse("https://studio.yaralex.com")
#             # response.set_cookie("access_token", access_token, httponly=True, secure=True, samesite="Lax")
#             # response.set_cookie("refresh_token", refresh_token, httponly=True, secure=True, samesite="Lax")
#             # response.set_cookie("access_expires", access_expires, httponly=True, secure=True, samesite="Lax")
#             # response.set_cookie("refresh_expires", refresh_expires, httponly=True, secure=True, samesite="Lax")
#             # return response
            
#             response = RedirectResponse("https://studio.yaralex.com" if state == 'creator' else "https://play.yaralex.com")

#             response.set_cookie(
#                 key="token", #access_token
#                 value=access_token,
#                 httponly=True,
#                 secure=True,
#                 samesite="None",         # 🔑 Allow cross-site cookie usage
#                 domain=".yaralex.com"    # 🔑 Share across api. and studio.
#             )

#             response.set_cookie(
#                 key="refresh_token",
#                 value=refresh_token,
#                 httponly=True,
#                 secure=True,
#                 samesite="None",
#                 domain=".yaralex.com"
#             )

#             response.set_cookie(
#                 key="access_expires",
#                 value=access_expires,
#                 httponly=True,
#                 secure=True,
#                 samesite="None",
#                 domain=".yaralex.com"
#             )

#             response.set_cookie(
#                 key="refresh_expires",
#                 value=refresh_expires,
#                 httponly=True,
#                 secure=True,
#                 samesite="None",
#                 domain=".yaralex.com"
#             )

#             # Set user cookie with user data
#             user_data = {
#                 "id": str(user.id),
#                 "email": user.email,
#                 "username": user.username,
#                 "first_name": user.first_name,
#                 "last_name": user.last_name,
#                 "role": user.role,
#                 "avatar_url": user.avatar_url
#             }
#             response.set_cookie(
#                 key="user",
#                 value=json.dumps(user_data),
#                 httponly=True,
#                 secure=True,
#                 samesite="None",
#                 domain=".yaralex.com"
#             )

#             # Set remember_me cookie
#             response.set_cookie(
                
#                 key="remember-me",
#                 value="true",
#                 httponly=True,
#                 secure=True,
#                 samesite="None",
#                 domain=".yaralex.com"
#             )

#             return response
#             # return templates.TemplateResponse(
#             #     "welcome.html",
#             #     {
#             #         "request": request,
#             #         "user": {
#             #             "name": f"{user.first_name} {user.last_name}",
#             #             "email": user.email,
#             #             "picture": user.avatar_url,
#             #             "given_name": user.first_name,
#             #             "family_name": user.last_name
#             #         }
#             #     }
#             # )

#     except Exception as e:
#         print(f"\n=== Google Auth Callback Error ===")
#         print(f"Error type: {type(e)}")
#         print(f"Error message: {str(e)}")
#         print(f"Error location: {e.__traceback__.tb_frame.f_code.co_filename}:{e.__traceback__.tb_lineno}")
#         print("=== End Google Auth Callback Error ===\n")
#         return await handle_exception(request, e)





@api.post(
    '/refresh-token/',
    response_model=Union[AuthResponse, FailResponse],
    responses={
        **responses['401']   # Invalid refresh token
    }
)
async def refresh_token(
    response: Response,
    payload: RefreshTokenRequest
):
    """
    Refresh access token using refresh token.
    If refresh token is valid (not expired), generates a new access token.
    """
    try:
        print("\n=== Refresh Token Debug ===")
        print(f"Received refresh token: {payload.refresh_token[:20]}...")

        # Get user by refresh token
        user = await User.find_one({"refresh_token": payload.refresh_token})
        if not user:
            print("No user found with this refresh token")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )

        print(f"Found user: {user.id}")

        try:
            token_data = verify_token(payload.refresh_token, "refresh")
            print("Refresh token verified successfully")
        except ValueError as e:
            print(f"Refresh token verification failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )

        # Generate new access token
        access_token, access_expires = create_access_token({"sub": str(user.id)})
        print(f"Generated new access token, expires at: {access_expires}")

        # Update user with new access token
        user.access_token = access_token
        user.access_token_expires_at = access_expires
        await user.save()
        print("Updated user with new access token")

        # Prepare response
        token_data = Token(
            access_token=access_token,
            access_token_expires_at=access_expires,
            refresh_token=user.refresh_token,  # Keep existing refresh token
            refresh_token_expires_at=user.refresh_token_expires_at,
            token_type="bearer"
        )

        print("=== End Refresh Token Debug ===\n")
            
        return AuthResponse(
                success=True,
            message={"en": "Access token refreshed successfully", "fr": "Token d'accès actualisé avec succès"},
            data=AuthData(
                token=token_data,
                user=UserProfile.from_user(user)
            )
        )

    except Exception as e:
        print(f"\n=== Refresh Token Error ===")
        print(f"Error type: {type(e)}")
        print(f"Error message: {str(e)}")
        print("=== End Refresh Token Error ===\n")
        return await handle_exception(response, e)

@api.post(
    '/logout/',
    response_model=Union[AuthResponse, FailResponse],
    responses={
        **responses['401'],  # Invalid/expired token
        **responses['404']   # User not found
    }
)
async def logout(
    response: Response,
    user_id: str = Depends(get_user_id)
):
    """
    Logout user and invalidate all tokens with validation.
    """
    try:
        print("\n=== Logout Debug ===")

        # Get user with token validation
        user = await User.get(PydanticObjectId(user_id))
        if not user:
            print("User not found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        print(f"Found user: {user.id}")
        
        # Invalidate all tokens
        user.access_token = None
        user.access_token_expires_at = None
        user.refresh_token = None
        user.refresh_token_expires_at = None
        await user.save()
        print("All tokens invalidated")

        print("=== End Logout Debug ===\n")
        return AuthResponse(
            success=True,
            message={"en": "Logged out successfully", "fr": "Déconnexion réussie"},
            data=None
        )

    except Exception as e:
        print(f"\n=== Logout Error ===")
        print(f"Error type: {type(e)}")
        print(f"Error message: {str(e)}")
        print("=== End Logout Error ===\n")
        return await handle_exception(response, e)


@api.post(
    '/send-password-reset_code/',
    response_model=Union[AuthResponse, FailResponse],
    responses={
        **responses['404']   # User not found
    }
)
async def send_password_reset_code(
    response: Response,
    payload: Username_Or_Email
):
    """
    Send password reset verification code to user's email.
    """
    try:
        print("\n=== Send Password Reset Debug ===")
        print(f"Looking for user with: {payload.username_or_email}")

        # Find user
        user = await User.find_one({
            "$and": [
                {"role": payload.role},
                {"$or": [
                    #{"username": payload.username_or_email}, # TODO: should be removed since we're not using username anymore
                    {"email": payload.username_or_email}
                ]}
            ]
        })
        
        if not user:
            print("User not found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
            
        print(f"Found user: {user.id}")
        # Generate reset code
        reset_code = generate_verification_code()
        code_expires = datetime.utcnow() + timedelta(hours=1)  # minutes=2
        await send_verification_email(user.email, reset_code)
        
        print(f"Reset code: {reset_code}")
        # Store reset code
        user.verification_code = reset_code
        user.verification_code_created_at = datetime.utcnow()
        user.verification_code_expires_at = code_expires
        await user.save()
        print("Reset code generated and stored")

        # TODO: Send reset code email
        # await send_password_reset_email(user.email, reset_code)
        print("Reset code email would be sent here")

        print("=== End Send Password Reset Debug ===\n")
        return AuthResponse(
            success=True,
            message={
                "en": "Password reset verification code sent to your email",
                "fr": "Code de vérification de réinitialisation envoyé à votre email"
            },
            data=None
        )

    except Exception as e:
        print(f"\n=== Send Password Reset Error ===")
        print(f"Error type: {type(e)}")
        print(f"Error message: {str(e)}")
        print("=== End Send Password Reset Error ===\n")
        return await handle_exception(response, e)

@api.post(
    '/update-password/',
    response_model=Union[AuthResponse, FailResponse],
    responses={
        **responses['400'],  # Invalid code or expired code
        **responses['404']   # User not found
    }
)
async def update_password(
    response: Response,
    payload: Password  # This model should contain username_or_email, verification_code, and new_password
):
    """
    Update user's password using verification code.
    """
    try:
        print("\n=== Update Password Debug ===")
        print(f"Looking for user with: {payload.username_or_email}")

        # Find user
        user = await User.find_one({
            "$and": [
                {"role": payload.role},
                {"$or": [
                    #{"username": payload.username_or_email},# TODO: should be removed since we're not using username anymore
                    {"email": payload.username_or_email}
                ]}
            ]
        })
        
        if not user:
            print("User not found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
            
        print(f"Found user: {user.id}")
        print(f"Verification code expires at: {user.verification_code_expires_at}")

        # Verify reset code
        if not user.verification_code or not user.verification_code_expires_at:
            print("No reset code found")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No reset code found. Please request a new one."
            )

        if datetime.utcnow() > user.verification_code_expires_at:
            print("Reset code has expired")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Reset code has expired. Please request a new one."
            )

        if user.verification_code != payload.verification_code:
            print("Invalid reset code")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid reset code"
            )

        # Update password and clear verification code
        user.hashed_password = get_password_hash(payload.password)
        user.verification_code = None
        user.verification_code_expires_at = None
        user.verification_code_created_at = None
        await user.save()
        print("Password updated and verification code cleared")
        access_token, access_expires, refresh_token, refresh_expires = create_tokens(str(user.id))
        
        user.access_token = access_token
        user.access_token_expires_at = access_expires
        user.refresh_token = refresh_token
        user.refresh_token_expires_at = refresh_expires
        user.last_login = datetime.utcnow()
        await user.save()
        
        print("=== End Update Password Debug ===\n")
        return AuthResponse(
            success=True,
            message={
                "en": "Password updated successfully. Please sign in with your new password.",
                "fr": "Mot de passe mis à jour avec succès. Veuillez vous connecter avec votre nouveau mot de passe."
            },
            data=AuthData(
                token=Token(
                access_token=access_token,
                    access_token_expires_at=access_expires,
                    refresh_token=refresh_token,
                    refresh_token_expires_at=refresh_expires,
                    token_type="bearer"
            ),
                user=UserProfile.from_user(user)
            )
        )
    

    except Exception as e:
        print(f"\n=== Update Password Error ===")
        print(f"Error type: {type(e)}")
        print(f"Error message: {str(e)}")
        print("=== End Update Password Error ===\n")
        return await handle_exception(response, e)
    

@api.get(
    '/me/',
    response_model=Union[AuthResponse, FailResponse],
    responses={
        **responses['401'],  # Invalid/expired token
        **responses['404']   # User not found
    }
)
async def get_current_user(
    response: Response,
    user_id: str = Depends(get_user_id),
):
    """
    Get current user profile with token validation.
    """
    try:
        print("\n=== Get User Profile Debug ===")
        print(f"User ID: {user_id}")
        user = await User.get(PydanticObjectId(user_id))
        if not user:
            print("User not found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        print(f"User >>: {user}")
        return AuthResponse(
            success=True,
            message={"en": "User profile retrieved", "fr": "Profil utilisateur récupéré"},
            data=AuthData(
                user=UserProfile.from_user(user),
                token=Token(
                    access_token=user.access_token,
                    access_token_expires_at=user.access_token_expires_at,
                    refresh_token="",
                    refresh_token_expires_at=datetime.utcnow(),
                    token_type="bearer"
                )
            )
        )

    except Exception as e:
        print(f"\n=== Get User Profile Error ===")
        print(f"Error type: {type(e)}")
        print(f"Error message: {str(e)}")
        print("=== End Get User Profile Error ===\n")
        return await handle_exception(response, e)

@api.patch(
    '/me/',
    response_model=Union[AuthResponse, FailResponse],
    responses={
        **responses['401'],  # Invalid/expired token
        **responses['404'],  # User not found
        **responses['422']   # Validation error
    }
)
async def update_current_user(
    response: Response,
    user_update: UserProfile,
    user_id: str = Depends(get_user_id),
):
    """
    Update current user profile with token validation.
    """
    print(f"Incoming payload: {user_update.dict()}")  
    try:
        print("\n=== Update User Profile Debug ===")
        # Get user with token validation
        user = await User.get(PydanticObjectId(user_id))
        if not user:
            print("User not found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        print(f"Found user: {user.id}")
        
        # Update user fields
        update_data = user_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        
        # Save changes
        await user.save()
        print("User profile updated")
        print("=== End Update User Profile Debug ===\n")
        
        return AuthResponse(
            success=True,
            message={"en": "Profile updated successfully", "fr": "Profil mis à jour avec succès"},
            data=AuthData(
                user=UserProfile.from_user(user),
                token=Token(
                    access_token=user.access_token,
                    access_token_expires_at=user.access_token_expires_at,
                    refresh_token="",
                    refresh_token_expires_at=datetime.utcnow(),
                    token_type="bearer"
                )
            )
        )

    except Exception as e:
        print(f"\n=== Update User Profile Error ===")
        print(f"Error type: {type(e)}")
        print(f"Error message: {str(e)}")
        print("=== End Update User Profile Error ===\n")
        return await handle_exception(response, e)


