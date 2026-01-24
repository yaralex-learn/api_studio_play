from pydantic import BaseModel, Field

from fastapi import APIRouter, Depends, HTTPException

from app.utils.user import get_user_id


api = APIRouter()



"""
get profile
edit profile
"""