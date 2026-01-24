from fastapi import APIRouter, Depends, HTTPException, Path, Body
from typing import List, Dict, Optional
from datetime import datetime, timezone
from app.models.user import User
from app.models.channel import Channel, Section, Unit, Activity, Lesson, ChannelInfo, Tier, Coupon
from beanie import PydanticObjectId
from pydantic import BaseModel, Field
from app.utils.user import get_user_id
from app.models.play import PlayerProgress, progress, ProgressUpdateRequest, SubscribeChannelRequest
from app.models import Response_Model
from fastapi import status

api = APIRouter()



@api.get("/channels/{creator_id}/")
async def get_creator_channels(
    creator_id: str = Path(..., description="The ID of the creator"),
    player_id: str = Depends(get_user_id)

    ):
    """Fetch channels for a specific creator."""
    try:
        # Find all channels for this creator
        channels = await Channel.find({"user_id": PydanticObjectId(creator_id), "published": True}).to_list()
        print(channels)
        return Response_Model(
            success=True,
            data=channels,
            message={"en": "Channels fetched successfully."},
            error="OK"
        )
        
    except Exception as e:
        return Response_Model(
            success=False,
            data=None,
            message={"en": "Failed to fetch channels."},
            error=str(e)
        )


@api.get("/channels_tier_coupons/{creator_id}/")
async def get_channel_subscription_info(
    creator_id: str, 
    player_id: str = Depends(get_user_id)
):
    """
    For the creator returns all the channels' [channel info + sub tier + coupons].
    Position in subscription page.
    """
    # Find all channels for this creator
    channels = await Channel.find({"user_id": PydanticObjectId(creator_id), "published": True}).to_list()
    if not channels:
        return Response_Model(
            success=True,
            data=[],
            message={"en": "No published channels found for this creator."},
            error="OK"
        )
    result = []
    for channel in channels:
        channel_id = str(channel.id)
        # Fetch related info for each channel
        channel_info = await ChannelInfo.find_one({"channel_id": channel_id})
        tiers = await Tier.find({"channel_id": channel_id}).to_list()
        coupons = await Coupon.find({"channel_id": channel_id}).to_list()

        result.append({
            "channel": {
                "id": channel_id,
                "name": channel.name,
                "description": channel.description,
                "creator_id": creator_id
            },
            "channel_info": channel_info,
            "tiers": tiers,
            "coupons": coupons,
        })

    return Response_Model(
        success=True,
        data=result,
        message={"en": "Channels and subscription info fetched successfully."},
        error="OK"
    )


@api.get("/subscriptions/")
async def get_user_subscribed_channels(
    player_id: str = Depends(get_user_id)
):
    """
    Get all channels that a user has subscribed to.
    
    **Security:**
    - Requires user authentication
    - Returns only channels the user has active subscriptions to
    
    **Response:**
    - List of all subscribed channels with subscription details
    """
    try:
        # Find all PlayerProgress records for this user (subscriptions)
        user_subscriptions = await PlayerProgress.find(
            {"player_id": player_id}
        ).to_list()
        
        if not user_subscriptions:
            return Response_Model(
                success=True,
                data=[],
                message={"en": "No subscriptions found for this user."},
                error="OK"
            )
        
        # Extract channel_ids from subscriptions
        subscribed_channel_ids = [progress.channel_id for progress in user_subscriptions]
        
        # Find all channels that user has subscribed to
        subscribed_channels = await Channel.find({
            "channel_id": {"$in": subscribed_channel_ids},
            "published": True
        }).to_list()
        
        # Enhance channel data with subscription details
        result = []
        for channel in subscribed_channels:
            # Find the corresponding subscription for this channel
            subscription = next(
                (sub for sub in user_subscriptions if sub.channel_id == channel.channel_id),
                None
            )
            
            channel_data = {
                "channel_id": channel.channel_id,
                "name": channel.name,
                "description": channel.description,
                "avatar_file_id": channel.avatar_file_id,
                "cover_image_file_id": channel.cover_image_file_id,
                "section_count": channel.section_count,
                "lesson_count": channel.lesson_count,
                "quiz_count": channel.quiz_count,
                "enrolled_students": channel.enrolled_students,
                "subscription_details": {
                    "full_access": subscription.full_access if subscription else False,
                    "hearts_earned": subscription.hearts_earned if subscription else 0,
                    "subscribed_at": subscription.created_at if subscription else None
                }
            }
            result.append(channel_data)
        
        return Response_Model(
            success=True,
            data=result,
            message={"en": f"Found {len(result)} subscribed channels."},
            error="OK"
        )
        
    except Exception as e:
        return Response_Model(
            success=False,
            data=None,
            message={"en": "Failed to fetch subscribed channels."},
            error=str(e)
        )


@api.post("/subscribe/{channel_id}/")
async def subscribe_to_channel(
    channel_id: str,
    payload: SubscribeChannelRequest,
    player_id: str = Depends(get_user_id)
):
    """
    When a user subscribes to a channel through the link or through subscription page.
    - Create PlayerProgress record for this player/channel pair (subscription + progress tracking)
    - Instantiate PlayerProgress for this channel/user
    - Fill progress with ids, count, is_free, completed (no content, just status)
    """
    

    # Check if user exists
    user = await User.find_one(
        {"_id": PydanticObjectId(player_id), "role": "player"}
        )
    if not user:
        return Response_Model(
            success=False,
            data=None,
            message={"en": "Player not found"},
            error="NOT_FOUND"
        )
    
    # Check if channel exists
    channel = await Channel.find_one({"channel_id": channel_id})
    if not channel:
        return Response_Model(
            success=False,
            data=None,
            message={"en": "Channel not found!"},
            error="NOT_FOUND"
        )
    
    # Check if already subscribed
    existing_subscription = await PlayerProgress.find_one({
        "player_id": str(player_id),
        "channel_id": str(channel_id)
    })
    if existing_subscription:
        # Update existing subscription
        existing_subscription.full_access = payload.full_access
        existing_subscription.updated_at = datetime.now(timezone.utc)
        await existing_subscription.save()
        subscription = existing_subscription
    else:
        # Build progress_level from channel.outline_content (matching the expected structure)
        outline = channel.outline_content.get("sections", [])
        
        # Create progress_level structure that matches the expected format
        progress_sections = []
        for section in outline:
            progress_units = []
            for unit in section.get("units", []):
                progress_activities = []
                for activity in unit.get("activities", []):
                    progress_content = []
                    for content in activity.get("content", []):
                        progress_content.append({
                            "id": content["id"],
                            "name": content.get("name", ""),
                            "completed": False,
                            "type": content.get("type", "lesson")
                        })
                    progress_activities.append({
                        "id": activity["id"],
                        "name": activity.get("name", ""),
                        "completed": False,
                        "content": progress_content
                    })
                progress_units.append({
                    "id": unit["id"], 
                    "name": unit.get("name", ""),
                    "completed": False,
                    "activities": progress_activities
                })
            progress_sections.append({
                "id": section["id"],
                "name": section.get("name", ""),
                "completed": False, 
                "units": progress_units
            })
        

        # Create new PlayerProgress (this serves as both subscription and progress tracking)
        subscription = PlayerProgress(
            player_id=str(user.id),           # Convert ObjectId to string
            channel_id=str(channel_id),       # Convert ObjectId to string  
            full_access=payload.full_access,
            hearts_earned=0,
            content=channel.outline_content,
            progress_level={"sections": progress_sections},  # Proper dict structure
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        await subscription.insert()
    return Response_Model(
        success=True,
        data={
            "subscription": {
                "subscription_id": str(subscription.id),
                "player_id": str(subscription.player_id),
                "channel_id": str(subscription.channel_id),
                "full_access": subscription.full_access,
                "created_at": subscription.created_at
            },
            "progress_id": str(subscription.id)
        },
        message={"en": "User subscribed to channel successfully."},
        error="OK"
    )


@api.get("/content_progress/{channel_id}/")
async def get_user_content_progress(
    channel_id: str, 
    player_id: str = Depends(get_user_id)
):
    """Fetch the PlayerProgress document for the user and channel."""
    print(channel_id, player_id)
    user_progress = await PlayerProgress.find_one({
        "player_id": str(player_id),
        "channel_id": str(channel_id)
    })
    if not user_progress:
        return Response_Model(
            success=False,
            data=None,
            message={"en": "User progress not found"},
            error="NOT_FOUND"
        )
    return Response_Model(
        success=True,
        data=user_progress,
        message={"en": "User progress fetched successfully."},
        error="OK"
    )


@api.post("/content_progress/{channel_id}/")
async def update_user_progress(
    channel_id: str,
    payload: ProgressUpdateRequest,
    player_id: str = Depends(get_user_id)
):
    """Update specific fields of a PlayerProgress for a given channel."""
    user_progress = await PlayerProgress.find_one({
        "player_id": str(player_id),
        "channel_id": str(channel_id)
    })
    if not user_progress:
        return Response_Model(
            success=False,
            data=None,
            message={"en": "User progress not found"},
            error="NOT_FOUND"
        )
    user_progress.progress_level = payload.progress_level
    user_progress.updated_at = datetime.now(timezone.utc)
    user_progress.hearts_earned = payload.hearts_earned
    await user_progress.save()
    return Response_Model(
        success=True,
        data=user_progress,
        message={"en": "User progress updated successfully."},
        error="OK"
    )

