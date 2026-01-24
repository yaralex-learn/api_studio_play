from fastapi import APIRouter, Response, Depends, Path, Body, HTTPException
from typing import List, Dict, Any
from app.utils.user import get_user_id
from app.models.channel import (
    ChannelInfoRequest, ChannelInfoResponse,
    PublishChannelRequest, PublishChannelResponse, PublishChannel,
    TierRequest, TierResponse,
    FreeAccessRequest, FreeAccessResponse,
    CouponRequest, CouponResponse,
    ChannelInfo, Tier, Channel,
    SectionOutline, UnitOutline, ActivityOutline,
    FreeAccess, Section, Unit,
    Activity, LessonOutline, Lesson,
    QuizOutline, Question, Coupon
)
from beanie import PydanticObjectId
from app.api.studio.channel.middlewares import get_channel_content_outline_stats

api = APIRouter()

# -----------------
# SETTINGS APIs
# -----------------

## Channel Info

@api.post('/', response_model=ChannelInfoResponse)
async def create_channel(
    payload: ChannelInfoRequest,
    uid: str = Depends(get_user_id)
) -> ChannelInfoResponse:
    """
    Create a new channel and channel info.
    """
    # Create channel info
    channel_info = ChannelInfo(
        user_id=uid,
        **payload.model_dump()
    )
    await channel_info.insert()

    # Create basic channel with name and description
    channel = Channel(
        name=payload.name,
        description=payload.description,
        # user_id is required in Channel model to track ownership and permissions
        user_id=PydanticObjectId(uid),
        channel_id=str(channel_info.id),
        # Copy additional fields from channel_info
        primary_language=payload.primary_language,
        target_language=payload.target_language,
        avatar_file_id=payload.avatar_file_id,
        cover_image_file_id=payload.cover_image_file_id,
        # Default publishing values
        published=False,
        channel_link=None
    )
    await channel.insert()

    # Create publish channel record with default values
    publish_channel = PublishChannel(
        user_id=uid,
        channel_id=str(channel_info.id),
        published=False,
        channel_link=None
    )
    await publish_channel.insert()
    print (111111)
    await get_channel_content_outline_stats(str(channel_info.id), uid)
    print(2222222)
    # The field_validator will automatically convert ObjectId to string
    return ChannelInfoResponse(**channel_info.model_dump())

@api.post('/{channel_id}/duplicate/', response_model=ChannelInfoResponse)
async def duplicate_channel(
    channel_id: str,
    user_id: str = Depends(get_user_id)
) -> ChannelInfoResponse:
    """
    Duplicate an existing channel with all its content, structure, and settings.
    Creates a complete copy including outline structure, content, and settings.
    """
    # Verify source channel exists and belongs to user
    source_channel_info = await ChannelInfo.find_one({
        "_id": PydanticObjectId(channel_id)
    })
    if not source_channel_info:
        raise HTTPException(status_code=404, detail="Source channel not found")
    
    source_channel = await Channel.find_one({
        "channel_id": channel_id,
        "user_id": PydanticObjectId(user_id)
    })
    if not source_channel:
        raise HTTPException(status_code=404, detail="Source channel not found or access denied")

    # Create new channel info with modified name
    new_channel_info = ChannelInfo(
        user_id=user_id,
        name=f"Copy of {source_channel_info.name}",
        description=source_channel_info.description,
        primary_language=source_channel_info.primary_language,
        target_language=source_channel_info.target_language,
        avatar_file_id=source_channel_info.avatar_file_id,
        cover_image_file_id=source_channel_info.cover_image_file_id
    )
    await new_channel_info.insert()
    new_channel_id = str(new_channel_info.id)

    # Create new channel record
    new_channel = Channel(
        name=new_channel_info.name,
        description=new_channel_info.description,
        user_id=PydanticObjectId(user_id),
        channel_id=new_channel_id,
        outline_content={"sections": []},  # Will be populated during duplication
        section_count=source_channel.section_count,
        unit_count=source_channel.unit_count,
        activity_count=source_channel.activity_count,
        lesson_count=source_channel.lesson_count,
        quiz_count=source_channel.quiz_count,
        question_count=source_channel.question_count,
        total_lesson_quiz_count=source_channel.total_lesson_quiz_count,
        primary_language=source_channel_info.primary_language,
        target_language=source_channel_info.target_language,
        avatar_file_id=source_channel_info.avatar_file_id,
        cover_image_file_id=source_channel_info.cover_image_file_id,
        published=False,  # New duplicate starts unpublished
        channel_link=None
    )
    await new_channel.insert()

    # Create new publish channel record (default to unpublished)
    new_publish_channel = PublishChannel(
        user_id=user_id,
        channel_id=new_channel_id,
        published=False,
        channel_link=None
    )
    await new_publish_channel.insert()

    # Duplicate outline structure and content
    outline_content = source_channel.outline_content.get("sections", [])
    new_outline_content = []
    
    for section in outline_content:
        # Create new section outline
        source_section_outline = await SectionOutline.find_one({"_id": PydanticObjectId(section["id"])})
        if source_section_outline:
            new_section_outline = SectionOutline(
                channel_id=new_channel_id,
                name=source_section_outline.name,
                order=source_section_outline.order
            )
            await new_section_outline.insert()
            new_section_id = str(new_section_outline.id)
            
            # Create new section content
            source_section_content = await Section.find_one({"section_outline_id": section["id"]})
            if source_section_content:
                new_section_content = Section(
                    section_outline_id=new_section_id,
                    description=source_section_content.description,
                    url=source_section_content.url
                )
                await new_section_content.insert()
            
            # Duplicate units
            new_units = []
            for unit in section.get("units", []):
                source_unit_outline = await UnitOutline.find_one({"_id": PydanticObjectId(unit["id"])})
                if source_unit_outline:
                    new_unit_outline = UnitOutline(
                        section_outline_id=new_section_id,
                        name=source_unit_outline.name,
                        order=source_unit_outline.order
                    )
                    await new_unit_outline.insert()
                    new_unit_id = str(new_unit_outline.id)
                    
                    # Create new unit content
                    source_unit_content = await Unit.find_one({"unit_outline_id": unit["id"]})
                    if source_unit_content:
                        new_unit_content = Unit(
                            unit_outline_id=new_unit_id,
                            description=source_unit_content.description,
                            url=source_unit_content.url
                        )
                        await new_unit_content.insert()
                    
                    # Duplicate activities
                    new_activities = []
                    for activity in unit.get("activities", []):
                        source_activity_outline = await ActivityOutline.find_one({"_id": PydanticObjectId(activity["id"])})
                        if source_activity_outline:
                            new_activity_outline = ActivityOutline(
                                unit_outline_id=new_unit_id,
                                name=source_activity_outline.name,
                                order=source_activity_outline.order,
                                count=source_activity_outline.lesson_quiz_count,
                                percentage=source_activity_outline.percentage
                            )
                            await new_activity_outline.insert()
                            new_activity_id = str(new_activity_outline.id)
                            
                            # Create new activity content
                            source_activity_content = await Activity.find_one({"activity_outline_id": activity["id"]})
                            if source_activity_content:
                                new_activity_content = Activity(
                                    activity_outline_id=new_activity_id,
                                    description=source_activity_content.description,
                                    url=source_activity_content.url,
                                    difficulty_level=source_activity_content.difficulty_level,
                                    is_launched=source_activity_content.is_launched
                                )
                                await new_activity_content.insert()
                            
                            # Duplicate lessons and quizzes
                            new_content = []
                            for content in activity.get("content", []):
                                if content.get("type") == "lesson":
                                    # Duplicate lesson
                                    source_lesson_outline = await LessonOutline.find_one({"_id": PydanticObjectId(content["id"])})
                                    if source_lesson_outline:
                                        new_lesson_outline = LessonOutline(
                                            activity_outline_id=new_activity_id,
                                            name=source_lesson_outline.name,
                                            order=source_lesson_outline.order,
                                            count=source_lesson_outline.lesson_count
                                        )
                                        await new_lesson_outline.insert()
                                        new_lesson_outline_id = str(new_lesson_outline.id)
                                        
                                        # Create lesson content
                                        source_lesson = await Lesson.find_one({"lesson_outline_id": content["id"]})
                                        if source_lesson:
                                            new_lesson = Lesson(
                                                lesson_outline_id=new_lesson_outline_id,
                                                lesson_type=source_lesson.lesson_type,
                                                text=source_lesson.text,
                                                file_ids=source_lesson.file_ids,
                                                question_lesson=source_lesson.question_lesson,
                                                order=source_lesson.order,
                                                is_launched=source_lesson.is_launched,
                                                is_free=source_lesson.is_free
                                            )
                                            await new_lesson.insert()
                                        
                                        new_content.append({
                                            "id": new_lesson_outline_id,
                                            "name": content["name"],
                                            "order": content["order"],
                                            "count": content["count"],
                                            "type": "lesson"
                                        })
                                
                                elif content.get("type") == "quiz":
                                    # Duplicate quiz
                                    source_quiz_outline = await QuizOutline.find_one({"_id": PydanticObjectId(content["id"])})
                                    if source_quiz_outline:
                                        new_quiz_outline = QuizOutline(
                                            activity_outline_id=new_activity_id,
                                            name=source_quiz_outline.name,
                                            order=source_quiz_outline.order,
                                            count=source_quiz_outline.quiz_count,
                                            is_launched=source_quiz_outline.is_launched,
                                            is_free=source_quiz_outline.is_free
                                        )
                                        await new_quiz_outline.insert()
                                        new_quiz_outline_id = str(new_quiz_outline.id)
                                        
                                        # Duplicate quiz questions
                                        source_questions = await Question.find({"quiz_outline_id": content["id"]}).to_list()
                                        for source_question in source_questions:
                                            new_question = Question(
                                                quiz_outline_id=new_quiz_outline_id,
                                                time_limit=source_question.time_limit,
                                                points=source_question.points,
                                                template=source_question.template,
                                                generated_question=source_question.generated_question,
                                                url=source_question.url,
                                                check_function=source_question.check_function,
                                                order=source_question.order,
                                                is_accepted=source_question.is_accepted
                                            )
                                            await new_question.insert()
                                        
                                        new_content.append({
                                            "id": new_quiz_outline_id,
                                            "name": content["name"],
                                            "order": content["order"],
                                            "count": content["count"],
                                            "type": "quiz"
                                        })
                            
                            new_activities.append({
                                "id": new_activity_id,
                                "name": activity["name"],
                                "order": activity["order"],
                                "content": new_content
                            })
                    
                    new_units.append({
                        "id": new_unit_id,
                        "name": unit["name"],
                        "order": unit["order"],
                        "activities": new_activities
                    })
            
            new_outline_content.append({
                "id": new_section_id,
                "name": section["name"],
                "order": section["order"],
                "units": new_units
            })
    
    # Update new channel with duplicated outline content
    new_channel.outline_content = {"sections": new_outline_content}
    await new_channel.save()

    # Duplicate settings
    # Duplicate FreeAccess settings
    source_free_access = await FreeAccess.find_one({"channel_id": channel_id})
    if source_free_access:
        new_free_access = FreeAccess(
            channel_id=new_channel_id,
            percentage=source_free_access.percentage,
            precentage_outline=source_free_access.precentage_outline,
            free_activities=source_free_access.free_activities
        )
        await new_free_access.insert()

    # Duplicate Tiers
    source_tiers = await Tier.find({"channel_id": channel_id}).to_list()
    for source_tier in source_tiers:
        new_tier = Tier(
            channel_id=new_channel_id,
            name=source_tier.name,
            price=source_tier.price,
            capacity=source_tier.capacity,
            billing_cycle=source_tier.billing_cycle,
            features=source_tier.features
        )
        await new_tier.insert()

    # Duplicate Coupons
    source_coupons = await Coupon.find({"channel_id": channel_id}).to_list()
    for source_coupon in source_coupons:
        new_coupon = Coupon(
            channel_id=new_channel_id,
            code=f"COPY_{source_coupon.code}",  # Prefix to avoid conflicts
            discount_type=source_coupon.discount_type,
            discount_value=source_coupon.discount_value,
            max_uses=source_coupon.max_uses,
            expires_at=source_coupon.expires_at,
            is_active=source_coupon.is_active
        )
        await new_coupon.insert()

    return ChannelInfoResponse(**new_channel_info.model_dump())

@api.patch('/{channel_id}/publish/', response_model=PublishChannelResponse)
async def publish_channel(
    channel_id: str,
    payload: PublishChannelRequest,
    uid: str = Depends(get_user_id)
) -> PublishChannelResponse:
    """
    Publish or unpublish a channel by updating the 'published' field and channel_link.
    """
    # Verify channel exists and belongs to user
    channel_info = await ChannelInfo.find_one({
        "_id": PydanticObjectId(channel_id)
    })
    if not channel_info:
        raise HTTPException(status_code=404, detail="Channel not found")
    print(11111111, channel_info)
    # Find or create publish channel record
    publish_channel = await PublishChannel.find_one({
        "channel_id": channel_id
    })
    print(22222222, publish_channel)
    if not publish_channel:
        # Create new publish channel record if doesn't exist
        publish_channel = PublishChannel(
            user_id=uid,
            channel_id=channel_id,
            published=payload.published,
            channel_link=payload.channel_link
        )
        await publish_channel.insert()
    else:
        print(666666)
        # Update existing publish channel record
        update_data = payload.model_dump(exclude_unset=True)
        await publish_channel.update({"$set": update_data})
        publish_channel = await PublishChannel.find_one({"channel_id": channel_id})

    await get_channel_content_outline_stats(channel_id, uid)

    return PublishChannelResponse(**publish_channel.model_dump())

@api.get('/{channel_id}/publish/', response_model=PublishChannelResponse)
async def get_publish_channel(
    channel_id: str,
    user_id: str = Depends(get_user_id)
) -> PublishChannelResponse:
    """
    Get publish channel information (published status and channel link).
    """
    # Verify channel exists
    channel_info = await ChannelInfo.find_one({
        "_id": PydanticObjectId(channel_id)
    })
    
    if not channel_info:
        raise HTTPException(status_code=404, detail="Channel not found")
    
    # Find publish channel record
    publish_channel = await PublishChannel.find_one({
        "channel_id": channel_id
    })
    
    if not publish_channel:
        # Create default publish channel record if doesn't exist
        publish_channel = PublishChannel(
            user_id=user_id,
            channel_id=channel_id,
            published=False,
            channel_link=None
        )
        await publish_channel.insert()

    return PublishChannelResponse(**publish_channel.model_dump())

@api.put('/{channel_id}/info/', response_model=ChannelInfoResponse) 
async def update_channel_info(
    channel_id: str,
    payload: ChannelInfoRequest,
    user_id: str = Depends(get_user_id)
) -> ChannelInfoResponse:
    """
    Update an existing channel.
    """
    channel = await ChannelInfo.find_one({
            "_id": PydanticObjectId(channel_id),
            "user_id": user_id
        })
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
        
    update_data = payload.dict(exclude_unset=True)
    await channel.update({"$set": update_data})
    
    return await ChannelInfo.get(channel_id)


@api.delete('/{channel_id}/info/')
async def delete_channel(
    channel_id: str,
    user_id: str = Depends(get_user_id)
):
    """
    Delete a channel and all related content and outline structure.
    """
    # Find channel info and verify ownership
    channel_info = await ChannelInfo.find_one({
        "_id": PydanticObjectId(channel_id),
        "user_id": user_id
    })
    
    if not channel_info:
        raise HTTPException(status_code=404, detail="Channel not found")

    # Find associated channel to get outline
    channel = await Channel.find_one({"channel_id": channel_id})
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")

    # Get outline structure
    outline = channel.outline_content.get("sections", [])
    
    # Delete all outline and content based on outline structure
    for section in outline:
        section_id = section.get("id")
        if section_id:
            await SectionOutline.find_one({"_id": PydanticObjectId(section_id)}).delete()
            await Section.find_one({"section_outline_id": section_id}).delete()
            
        for unit in section.get("units", []):
            unit_id = unit.get("id")
            if unit_id:
                await UnitOutline.find_one({"_id": PydanticObjectId(unit_id)}).delete()
                await Unit.find_one({"unit_outline_id": unit_id}).delete()
                
            for activity in unit.get("activities", []):
                activity_id = activity.get("id") 
                if activity_id:
                    await ActivityOutline.find_one({"_id": PydanticObjectId(activity_id)}).delete()
                    await Activity.find_one({"activity_outline_id": activity_id}).delete()
                
                for content in activity.get("content", []):
                    content_id = content.get("id")
                    if content_id:
                        # Delete lesson/quiz outline and content based on type
                        if "lesson" in content_id:
                            await LessonOutline.find_one({"_id": PydanticObjectId(content_id)}).delete()
                            await Lesson.find_one({"lesson_outline_id": content_id}).delete()
                        elif "quiz" in content_id:
                            await QuizOutline.find_one({"_id": PydanticObjectId(content_id)}).delete()
                            # Delete associated questions
                            await Question.find_many({"quiz_outline_id": content_id}).delete()

    # Delete the publish channel record
    publish_channel = await PublishChannel.find_one({"channel_id": channel_id})
    if publish_channel:
        await publish_channel.delete()

    # Delete the channel info and channel documents
    await channel_info.delete()
    await channel.delete()

    return {"message": "Channel and all related content deleted successfully"}

### Instead of this endpoint use get channel by id endpoint


# @api.get('/{channel_id}/info/', response_model=ChannelInfoResponse)
# async def get_channel_info(
#     channel_id: str,
#     user_id: str = Depends(get_user_id)
# ) -> ChannelInfoResponse:
#     """
#     Get channel info by ID.
#     """
#     channel = await ChannelInfo.find_one({
#             "_id": PydanticObjectId(channel_id)
#         })
#     if not channel:
#         raise HTTPException(status_code=404, detail="Channel not found")
#     return ChannelInfoResponse(**channel.dict())


## Subscription Tiers

@api.post('/{channel_id}/tier/', response_model=TierResponse)
async def create_tier(
    channel_id: str,
    payload: TierRequest,
    user_id: str = Depends(get_user_id)
) -> TierResponse:
    """
    Create a subscription tier.
    """
    print(f"Creating tier for channel: {channel_id}")
    # Verify channel exists and belongs to user
    channel = await ChannelInfo.find_one({
            "_id": PydanticObjectId(channel_id),
            "user_id": user_id
        })
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")

    # Create new tier
    tier = Tier(
        channel_id=channel_id,
        name=payload.name,
        price=payload.price,
        capacity=payload.capacity,
        billing_cycle=payload.billing_cycle,
        features=payload.features
    )
    await tier.insert()
    return TierResponse(**tier.model_dump())

@api.get('/{channel_id}/tier/', response_model=List[TierResponse])
async def get_all_tiers(
    channel_id: str,
    user_id: str = Depends(get_user_id)
) -> List[TierResponse]:
    """
    Get all tiers for a channel.
    """
    # Verify channel exists and belongs to user
    channel = await ChannelInfo.find_one({
            "_id": PydanticObjectId(channel_id),
            "user_id": user_id
        })
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")

    # Get all tiers for the channel
    tiers = await Tier.find({"channel_id": channel_id}).to_list()
    return [TierResponse(**tier.model_dump()) for tier in tiers]

@api.put('/{channel_id}/tier/{tier_id}/', response_model=TierResponse)
async def update_tier(
    channel_id: str,
    tier_id: str,
    payload: TierRequest,
    user_id: str = Depends(get_user_id)
) -> TierResponse:
    """
    Update a subscription tier.
    """
    # Verify channel exists and belongs to user
    # channel = await ChannelInfo.find_one({"_id": PydanticObjectId(channel_id), "user_id": user_id})
    # if not channel:
    #     raise HTTPException(status_code=404, detail="Channel not found")

    # Find and update tier
    tier = await Tier.find_one({"_id": PydanticObjectId(tier_id), "channel_id": channel_id})
    if not tier:
        raise HTTPException(status_code=404, detail="Tier not found")
    # Update tier fields
    update_data = payload.model_dump(exclude_unset=True)
    await tier.update({"$set": update_data})

    # Return updated tier by fetching it again to ensure we have the latest data
    updated_tier = await Tier.get(PydanticObjectId(tier_id))
    return TierResponse(**updated_tier.model_dump())


@api.delete('/{channel_id}/tier/{tier_id}/')
async def delete_tier(
    channel_id: str,
    tier_id: str,
    user_id: str = Depends(get_user_id)
):
    """
    Delete a subscription tier.
    """
    # Verify channel exists and belongs to user
    # channel = await ChannelInfo.find_one({"_id": PydanticObjectId(channel_id), "user_id": user_id})
    # if not channel:
    #     raise HTTPException(status_code=404, detail="Channel not found")

    # Find and delete tier
    tier = await Tier.find_one({"_id": PydanticObjectId(tier_id), "channel_id": channel_id})
    if not tier:
        raise HTTPException(status_code=404, detail="Tier not found")

    await tier.delete()
    return {"message": "Tier deleted successfully"}

##
# Free Access
##
@api.get('/{channel_id}/free-access/percentage/', response_model=FreeAccessResponse)
async def get_activity_percentage(
    channel_id: str,
    user_id: str = Depends(get_user_id)
):
    """
    Calculate activity percentages based on channel's outline_content and total_lesson_quiz_count.
    Updates activity outlines with counts and percentages, and updates FreeAccess percentage_outline.
    """
    try:
        # Verify channel exists and belongs to user
        channel = await Channel.find_one({
            "channel_id": channel_id,
        })
        if not channel:
            raise HTTPException(status_code=404, detail="Channel not found")
        # Get outline content from channel
        outline_content = channel.outline_content.get("sections", [])
        total_content = channel.total_lesson_quiz_count
        activity_percentages = {}
        current_count = 0
        # print('total_content', total_content)
        # Process each section, unit, and activity
        for section in outline_content:
            for unit in section.get("units", []):
                for activity in unit.get("activities", []):
                    # Calculate content count for this activity by iterating through content
                    content = activity.get("content", [])
                    activity_count = 0
                    for item in content:
                        if isinstance(item, dict):
                            activity_count += item.get("count", 1)
                        else:
                            activity_count += 1
                        
                    current_count += activity_count

                    # Calculate percentage based on position
                    percentage = int((current_count / total_content) * 100) if total_content > 0 else 0

                    # Update ActivityOutline with count and percentage
                    activity_outline = await ActivityOutline.find_one({"_id": PydanticObjectId(activity["id"])})
                    if activity_outline:
                        await activity_outline.update({
                            "$set": {
                                "count": activity_count,
                                "percentage": percentage
                            }
                        })

                    # Store in percentage outline
                    activity_percentages[str(activity["id"])] = {
                        "name": activity["name"],
                        "order": activity["order"],
                        "percentage": percentage,
                        "count": activity_count
                    }

        # Get or create FreeAccess document
        free_access = await FreeAccess.find_one({"channel_id": channel_id})
        if not free_access:
            free_access = FreeAccess(
                channel_id=channel_id,
                percentage=0,  # Default percentage
                precentage_outline=activity_percentages,
                free_activities=[]  # Default empty list
            )
        else:
            # Update only the percentage outline
            free_access.precentage_outline = activity_percentages

        await free_access.save()
        print(free_access)
        return FreeAccessResponse(**free_access.model_dump())

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@api.put('/{channel_id}/free-access/', response_model=FreeAccessResponse)
async def update_free_access(
    channel_id: str, 
    payload: FreeAccessRequest,
    user_id: str = Depends(get_user_id)
):
    """
    Update free access settings with percentage and free activities from client request.
    """
    try:
        # Verify channel exists and belongs to user
        channel = await Channel.find_one({
            "channel_id": channel_id,
            "user_id": PydanticObjectId(user_id)
        })
        if not channel:
            raise HTTPException(status_code=404, detail="Channel not found")

        # Get or create FreeAccess document
        free_access = await FreeAccess.find_one({"channel_id": channel_id})
        if not free_access:
            free_access = FreeAccess(
                channel_id=channel_id,
                percentage=payload.percentage,
                free_activities=payload.free_activities
            )
        else:
            # Update only percentage and free_activities
            free_access.percentage = payload.percentage
            free_access.free_activities = payload.free_activities

        await free_access.save()
        return FreeAccessResponse(**free_access.model_dump())

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@api.get('/{channel_id}/free-access/', response_model=FreeAccessResponse)
async def get_free_access(channel_id: str):
    """
    Get free access settings.
    """
    try:
        # Get FreeAccess document
        free_access = await FreeAccess.find_one({"channel_id": channel_id})
        if not free_access:
            # If no free access settings exist, create default
            free_access = FreeAccess(
                channel_id=channel_id,
                percentage=0,
                precentage_outline={},
                free_activities=[]
            )
            await free_access.save()

        return FreeAccessResponse(**free_access.model_dump())

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


##
# Coupon
##

@api.post('/{channel_id}/coupon/', response_model=CouponResponse)
async def create_coupon(channel_id: str, payload: CouponRequest):
    """
    Create a new coupon.
    """
    try:
        # Verify channel exists
        channel = await ChannelInfo.find_one({
                "_id": PydanticObjectId(channel_id)
            })
        if not channel:
            raise HTTPException(status_code=404, detail="Channel not found")

        # Create new coupon
        coupon = Coupon(
            **payload.model_dump(),
        )
        await coupon.save()
        
        return CouponResponse(**coupon.model_dump())

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api.get('/{channel_id}/coupon/', response_model=List[CouponResponse])
async def get_coupons(channel_id: str):
    """
    Get all coupons for a channel.
    """
    try:
        # Get all coupons for channel
        coupons = await Coupon.find({"channel_id": channel_id}).to_list()
        return [CouponResponse(**coupon.model_dump()) for coupon in coupons]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api.put('/{channel_id}/coupon/{coupon_id}/', response_model=CouponResponse)
async def update_coupon(channel_id: str, coupon_id: str, payload: CouponRequest):
    """
    Update an existing coupon.
    """
    try:
        # Get existing coupon
        coupon = await Coupon.find_one({"_id": PydanticObjectId(coupon_id), "channel_id": channel_id})
        if not coupon:
            print("coupon not found")
            raise HTTPException(status_code=404, detail="Coupon not found")
        print(payload, "payload")
        update_data = payload.model_dump(exclude_unset=True)
        await coupon.update({"$set": update_data})

        # Return updated coupon by fetching it again to ensure we have the latest data
        updated_coupon = await Coupon.get(PydanticObjectId(coupon_id))
        return CouponResponse(**updated_coupon.model_dump())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api.delete('/{channel_id}/coupon/{coupon_id}/')
async def delete_coupon(channel_id: str, coupon_id: str):
    """
    Delete a coupon.
    """
    try:
        # Delete coupon
        result = await Coupon.find_one({"_id": PydanticObjectId(coupon_id), "channel_id": channel_id})
        if not result:
            raise HTTPException(status_code=404, detail="Coupon not found")
            
        await result.delete()
        return {"message": "Coupon deleted successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))