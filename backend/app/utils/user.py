from fastapi import Header, HTTPException, status
from app.utils.security import verify_token
from app.models.user import User
from beanie import PydanticObjectId


async def get_admin_id(authorization: str = Header(None)) -> str:
    return ''


async def get_user_id(authorization: str = Header(None)) -> str:
    """
    Extract and validate user ID from authorization token.
    Returns user ID if token is valid, raises HTTPException otherwise.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No authorization token provided"
        )

    try:
        # Extract token from "Bearer <token>"
        print(f"Authorization header: {authorization}")
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication scheme"
            )

        # Verify token and get user ID
        token_data = verify_token(token, "access")
        user_id = token_data.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )

        # Verify user exists
        user = await User.get(PydanticObjectId(user_id))
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return user_id

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization token"
        )

