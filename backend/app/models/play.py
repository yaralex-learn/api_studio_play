from typing import List, Dict, Optional, Any
from datetime import datetime
from pydantic import BaseModel, Field
from beanie import Document, PydanticObjectId




class progress(BaseModel):
    id: str
    completed: bool = False
    is_free: bool = False

class SubscribeChannelRequest(BaseModel):
    """Request model for subscribing to a channel."""
    full_access: bool = Field(..., description="Whether to grant full access or limited access to the channel", example=True)

class ProgressUpdateRequest(BaseModel):
    """Request model for updating player progress on specific content."""
    content_id: str = Field(..., description="ID of the lesson/quiz being completed", example="681f14bf72b568b13257f8ef")
    progress_level: Dict[str, Any] = Field(
        default_factory=dict, 
        description="Complete progress structure with sections, units, activities and content completion status",
        example={
            "sections": [
                {
                    "id": "681f14bf72b568b13257f8e9",
                    "name": "Introduction",
                    "completed": True,
                    "units": [
                        {
                            "id": "681f14bf72b568b13257f8eb", 
                            "name": "Getting Started",
                            "completed": True,
                            "activities": [
                                {
                                    "id": "681f14bf72b568b13257f8ed",
                                    "name": "First Steps",
                                    "completed": True,
                                    "content": [
                                        {
                                            "id": "681f14bf72b568b13257f8ef",
                                            "name": "Hello World",
                                            "completed": True,
                                            "type": "lesson"
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    )
    hearts_earned: int = Field(default=1, description="Hearts earned for completing this content", example=5)

class PlayerProgress(Document):
    player_id: str = Field(...)
    channel_id: str = Field(...)
    # creator_id: PydanticObjectId = Field(...)
    full_access: bool = Field(..., description="True if user has full access, False if limited access")
    needs_review: Optional[List[str]] = Field(default_factory=list)
    hearts_earned: int = 0
    content: Optional[Dict] = None # content might needs to be reordered based on user performance
    progress_level: Dict[str, Any] = Field(default_factory=dict, example={
        "sections": [
            {
                "id": "681f14bf72b568b13257f8e9",
                "name": "Introduction",
                "completed": True,
                "units": [
                    {
                        "id": "681f14bf72b568b13257f8eb", 
                        "name": "Getting Started",
                        "completed": True,
                        "activities": [
                            {
                                "id": "681f14bf72b568b13257f8ed",
                                "name": "First Steps",
                                "completed": True,
                                "content": [
                                    {
                                        "id": "681f14bf72b568b13257f8ef",
                                        "name": "Hello World",
                                        "completed": True,
                                        "type": "lesson"
                                    },
                                    {
                                        "id": "681f14bf72b568b13257f8f1",
                                        "name": "Quiz 1", 
                                        "completed": False,
                                        "type": "quiz"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    })
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    class Settings:
        name = "user_progress"
