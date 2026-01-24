from fastapi import APIRouter, Response, Depends, Path, Body, HTTPException, Query
from typing import List, Optional
from app.utils.user import get_user_id
from app.models.channel import (
    SectionRequest, SectionResponse,
    SectionOutlineRequest, SectionOutlineResponse, SectionOutline,
    UnitRequest, UnitResponse, Unit,
    UnitOutlineRequest, UnitOutlineResponse, UnitOutline,
    ActivityRequest, ActivityResponse,
    LessonRequest, LessonResponse, Lesson,
    QuestionRequest, QuestionResponse, Question,
    ChannelInfo, Section,
    ActivityOutlineRequest, ActivityOutlineResponse, ActivityOutline,
    Activity,
    LessonOutlineRequest, LessonOutlineResponse, LessonOutline,
    QuizOutlineRequest, QuizOutlineResponse, QuizOutline,
)
from beanie import PydanticObjectId
import asyncio
from app.api.studio.channel.middlewares import get_channel_content_outline_stats

api = APIRouter()


# -----------------
# SECTION OUTLINE APIs
# -----------------

@api.post('/{channel_id}/sections/outline/{order}/', response_model=SectionOutlineResponse)
async def create_section_outline(
    channel_id: str = Path(..., description="The ID of the channel"),
    order: int = Path(..., description="The order of the section"),
    payload: SectionOutlineRequest = Body(...),
    uid: str = Depends(get_user_id)
):
    """
    Create a new section outline with the provided payload and order.
    Validates channel existence.
    Returns the created section outline with its ID.
    """
    try:
        # Verify channel exists
        channel = await ChannelInfo.find_one({
            "_id": PydanticObjectId(channel_id)
        })
        if not channel:
            raise HTTPException(status_code=404, detail="Channel not found")

        # Create the new section outline
        section_outline = SectionOutline(
            channel_id=channel_id,
            name=payload.name,
            order=order
        )
        await section_outline.insert()
        await get_channel_content_outline_stats(channel_id, uid)
        return SectionOutlineResponse(**section_outline.model_dump())

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api.put('/{channel_id}/sections/outline/{section_outline_id}/', response_model=SectionOutlineResponse)
async def update_section_outline(
    channel_id: str = Path(..., description="The ID of the channel"),
    section_outline_id: str = Path(..., description="The ID of the section outline"),
    payload: SectionOutlineRequest = Body(...),
    uid: str = Depends(get_user_id)
):
    """
    Update a section outline.
    Validates channel existence and section outline existence.
    """
    print("################")
    try:
        # Verify channel exists
        channel = await ChannelInfo.find_one({
            "_id": PydanticObjectId(channel_id)
        })
        if not channel:
            raise HTTPException(status_code=404, detail="Channel not found")
        # Find and update the section outline
        section_outline = await SectionOutline.find_one({
            "_id": PydanticObjectId(section_outline_id),
            "channel_id": channel_id
        })
        if not section_outline:
            raise HTTPException(status_code=404, detail="Section outline not found")

        # Update section outline fields
        section_outline.name = payload.name
        section_outline.order = payload.order

        await section_outline.save()
        await get_channel_content_outline_stats(channel_id, uid)
        return SectionOutlineResponse(**section_outline.model_dump())

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api.delete('/{channel_id}/sections/outline/{section_outline_id}/')
async def delete_section_outline(
    channel_id: str = Path(..., description="The ID of the channel"),
    section_outline_id: str = Path(..., description="The ID of the section outline"),
    uid: str = Depends(get_user_id)
):
    """
    Delete a section outline.
    Validates channel existence and section outline existence.
    """
    try:
        # Verify channel exists
        channel = await ChannelInfo.find_one({
            "_id": PydanticObjectId(channel_id)
        })
        if not channel:
            raise HTTPException(status_code=404, detail="Channel not found")

        # Find and delete the section outline
        section_outline = await SectionOutline.find_one({
            "_id": PydanticObjectId(section_outline_id),
            "channel_id": channel_id
        })
        if not section_outline:
            raise HTTPException(status_code=404, detail="Section outline not found")

        # Delete associated section content if it exists
        section_content = await Section.find_one({
            "section_outline_id": section_outline_id
        })
        if section_content:
            await section_content.delete()

        await section_outline.delete()
        await get_channel_content_outline_stats(channel_id, uid)
        return {"message": "Section outline deleted successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -----------------
# SECTION APIs
# -----------------
@api.post('/{channel_id}/sections/', response_model=SectionResponse)
async def create_section(
    channel_id: str = Path(..., description="The ID of the channel"),
    section_id: Optional[str] = Query(None, description="Optional: The ID of the section to update"),
    payload: SectionRequest = Body(...),
    uid: str = Depends(get_user_id)
):
    """
    Create or update a section based on section_id.
    If section_id is provided, updates existing section.
    If no section_id, creates new section.
    Verifies channel ownership and section existence.
    """
    try:
        # Verify channel exists and belongs to user
        channel = await ChannelInfo.find_one({
            "_id": PydanticObjectId(channel_id),
        })
        if not channel:
            raise HTTPException(status_code=404, detail="Channel not found")

        if section_id:
            # Update existing section
            section = await Section.find_one({
                "_id": PydanticObjectId(section_id)
            })
            if not section:
                raise HTTPException(status_code=404, detail="Section not found")

            # Update section fields
            section.name = payload.name
            section.description = payload.description
            section.file_id = payload.file_id

            await section.save()
            await get_channel_content_outline_stats(channel_id, uid)
            return SectionResponse(**section.model_dump())
        else:
            # Create the new section
            section = Section(
                section_outline_id=payload.section_outline_id,
                name=payload.name,
                description=payload.description,
                file_id=payload.file_id,
            )
            await section.insert()
            await get_channel_content_outline_stats(channel_id, uid)
            return SectionResponse(**section.model_dump())

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -----------------
# UNIT Outline APIs
# -----------------
@api.post('/{channel_id}/units/outline/{order}/', response_model=UnitOutlineResponse)
async def create_unit_outline(
    channel_id: str = Path(..., description="The ID of the channel"),
    order: int = Path(..., description="The order of the unit"),
    payload: UnitOutlineRequest = Body(...),
    uid: str = Depends(get_user_id)
):
    """
    Create a new unit outline with the provided payload and order.
    Validates channel existence.
    Returns the created unit outline with its ID.
    """
    try:
        # Verify channel exists
        channel = await ChannelInfo.find_one({
            "_id": PydanticObjectId(channel_id)
        })
        if not channel:
            raise HTTPException(status_code=404, detail="Channel not found")

        # Create the new unit outline
        unit_outline = UnitOutline(
            channel_id=channel_id,
            section_outline_id=payload.section_outline_id,
            name=payload.name,
            order=order
        )
        await unit_outline.insert()
        await get_channel_content_outline_stats(channel_id, uid)
        return UnitOutlineResponse(**unit_outline.model_dump())

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api.put('/{channel_id}/units/outline/{unit_outline_id}/', response_model=UnitOutlineResponse)
async def update_unit_outline(
    channel_id: str = Path(..., description="The ID of the channel"),
    unit_outline_id: str = Path(..., description="The ID of the unit outline"),
    payload: UnitOutlineRequest = Body(...),
    uid: str = Depends(get_user_id)
):
    """
    Update a unit outline.
    Validates channel existence and unit outline existence.
    Returns the updated unit outline with its ID.
    """
    try:
        # Verify channel exists
        channel = await ChannelInfo.find_one({
            "_id": PydanticObjectId(channel_id)
        })
        if not channel:
            raise HTTPException(status_code=404, detail="Channel not found")

        print("################" , payload, unit_outline_id, channel_id)
        # Find and update the unit outline
        unit_outline = await UnitOutline.find_one({
            "_id": PydanticObjectId(unit_outline_id)
        })
        if not unit_outline:
            raise HTTPException(status_code=404, detail="Unit outline not found")

        # Update unit outline fields
        unit_outline.name = payload.name
        unit_outline.order = payload.order

        await unit_outline.save()
        await get_channel_content_outline_stats(channel_id, uid)
        return UnitOutlineResponse(**unit_outline.model_dump())

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api.delete('/{channel_id}/units/outline/{unit_outline_id}/')
async def delete_unit_outline(
    channel_id: str = Path(..., description="The ID of the channel"),
    unit_outline_id: str = Path(..., description="The ID of the unit outline"),
    uid: str = Depends(get_user_id)
):
    """
    Delete a unit outline.
    Validates channel existence and unit outline existence.
    """
    try:
        # Verify channel exists
        channel = await ChannelInfo.find_one({
            "_id": PydanticObjectId(channel_id)
        })
        if not channel:
            raise HTTPException(status_code=404, detail="Channel not found")

        # Find and delete the unit outline
        unit_outline = await UnitOutline.find_one({
            "_id": PydanticObjectId(unit_outline_id)
        })
        if not unit_outline:
            raise HTTPException(status_code=404, detail="Unit outline not found")

        # Delete associated unit content if it exists
        unit_content = await Unit.find_one({
            "unit_outline_id": unit_outline_id
        })
        if unit_content:
            await unit_content.delete()

        await unit_outline.delete()
        await get_channel_content_outline_stats(channel_id, uid)
        return {"message": "Unit outline deleted successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -----------------
# UNIT Content APIs
# -----------------
@api.post('/{channel_id}/units/', response_model=UnitResponse)
async def create_unit(
    channel_id: str = Path(..., description="The ID of the channel"),
    unit_id: Optional[str] = Query(None, description="Optional: The ID of the unit to update"),
    payload: UnitRequest = Body(...),
    uid: str = Depends(get_user_id)
):
    """
    Create or update a unit based on unit_id.
    If unit_id is provided, updates existing unit.
    If no unit_id, creates new unit.
    Validates channel existence and unit name uniqueness.
    """
    try:
        # Verify channel exists and belongs to user
        channel = await ChannelInfo.find_one({
            "_id": PydanticObjectId(channel_id),
        })
        if not channel:
            raise HTTPException(status_code=404, detail="Channel not found")

        if unit_id:
            # Update existing unit
            unit = await Unit.find_one({
                "_id": PydanticObjectId(unit_id)
            })
            if not unit:
                raise HTTPException(status_code=404, detail="Unit not found")

            # Update unit fields
            unit.name = payload.name
            unit.description = payload.description
            unit.file_id = payload.file_id

            await unit.save()
            await get_channel_content_outline_stats(channel_id, uid)
            return UnitResponse(**unit.model_dump())
        else:
            # Create new unit
            # Check if a unit with the same name already exists in this section
            existing_unit = await Unit.find_one({
                "unit_outline_id": payload.unit_outline_id,
                "name": payload.name
            })
            if existing_unit:
                raise HTTPException(status_code=400, detail="A unit with this name already exists in this section")

            # Create the new unit
            new_unit = Unit(
                unit_outline_id=payload.unit_outline_id,
                name=payload.name,
                description=payload.description,
                file_id=payload.file_id
            )
            await new_unit.insert()
            await get_channel_content_outline_stats(channel_id, uid)
            return UnitResponse(**new_unit.model_dump())

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -----------------
# ACTIVITY Outline APIs
# -----------------


@api.post('/{channel_id}/activities/outline/{order}/', response_model=ActivityOutlineResponse)
async def create_activity_outline(
    channel_id: str = Path(..., description="The ID of the channel"),
    order: int = Path(..., description="The order of the activity"),
    payload: ActivityOutlineRequest = Body(...),
    uid: str = Depends(get_user_id)
):
    """
    Create a new activity outline with the provided payload and order.
    Validates channel existence.
    Returns the created activity outline with its ID.
    """
    try:
        # Verify channel exists
        channel = await ChannelInfo.find_one({
            "_id": PydanticObjectId(channel_id)
        })
        if not channel:
            raise HTTPException(status_code=404, detail="Channel not found")
        # Create the new activity outline
        activity_outline = ActivityOutline(
            unit_outline_id=payload.unit_outline_id,
            name=payload.name,
            order=order,
            lesson_quiz_count=0,  # Initialize count to 0
            percentage=0  # Initialize percentage to 0
        )
        await activity_outline.insert()
        await get_channel_content_outline_stats(channel_id, uid)
        return ActivityOutlineResponse(**activity_outline.model_dump())

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api.put('/{channel_id}/activities/outline/{activity_outline_id}/', response_model=ActivityOutlineResponse)
async def update_activity_outline(
    channel_id: str = Path(..., description="The ID of the channel"),
    activity_outline_id: str = Path(..., description="The ID of the activity outline"),
    payload: ActivityOutlineRequest = Body(...),
    uid: str = Depends(get_user_id)
):
    """
    Update an activity outline.
    Validates channel existence and activity outline existence.
    Returns the updated activity outline with its ID.
    """
    try:
        # Verify channel exists
        channel = await ChannelInfo.find_one({
            "_id": PydanticObjectId(channel_id)
        })
        if not channel:
            raise HTTPException(status_code=404, detail="Channel not found")

        # Find and update the activity outline
        activity_outline = await ActivityOutline.find_one({
            "_id": PydanticObjectId(activity_outline_id)
        })
        if not activity_outline:
            raise HTTPException(status_code=404, detail="Activity outline not found")

        # Update activity outline fields
        activity_outline.name = payload.name
        activity_outline.order = payload.order
        # Preserve existing count and percentage values
        activity_outline.lesson_quiz_count = activity_outline.lesson_quiz_count
        activity_outline.percentage = activity_outline.percentage

        await activity_outline.save()
        await get_channel_content_outline_stats(channel_id, uid)
        return ActivityOutlineResponse(**activity_outline.model_dump())

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api.delete('/{channel_id}/activities/outline/{activity_outline_id}/')
async def delete_activity_outline(
    channel_id: str = Path(..., description="The ID of the channel"),
    activity_outline_id: str = Path(..., description="The ID of the activity outline"),
    uid: str = Depends(get_user_id)
):
    """
    Delete an activity outline.
    Validates channel existence and activity outline existence.
    """
    try:
        # Verify channel exists
        channel = await ChannelInfo.find_one({
            "_id": PydanticObjectId(channel_id)
        })
        if not channel:
            raise HTTPException(status_code=404, detail="Channel not found")

        # Find and delete the activity outline
        activity_outline = await ActivityOutline.find_one({
            "_id": PydanticObjectId(activity_outline_id)
        })
        if not activity_outline:
            raise HTTPException(status_code=404, detail="Activity outline not found")

        # Delete associated activity content if it exists
        activity_content = await Activity.find_one({
            "activity_outline_id": activity_outline_id
        })
        if activity_content:
            await activity_content.delete()

        await activity_outline.delete()
        await get_channel_content_outline_stats(channel_id, uid)
        return {"message": "Activity outline deleted successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -----------------
# ACTIVITY Content APIs
# -----------------    
@api.post('/{channel_id}/activities/', response_model=ActivityResponse)
async def create_activity(
    channel_id: str = Path(..., description="The ID of the channel"),
    activity_id: Optional[str] = Query(None, description="Optional: The ID of the activity to update"),
    payload: ActivityRequest = Body(...),
    uid: str = Depends(get_user_id)
):
    """
    Create or update an activity based on activity_id.
    If activity_id is provided, updates existing activity.
    If no activity_id, creates new activity.
    Validates channel existence and activity outline existence.
    Returns the created or updated activity with its ID.
    """
    try:
        # Verify channel exists and belongs to user
        channel = await ChannelInfo.find_one({
            "_id": PydanticObjectId(channel_id),
        })
        if not channel:
            raise HTTPException(status_code=404, detail="Channel not found")

        if activity_id:
            # Update existing activity
            activity = await Activity.find_one({
                "_id": PydanticObjectId(activity_id)
            })
            if not activity:
                raise HTTPException(status_code=404, detail="Activity not found")

            # Update activity fields
            activity.description = payload.description
            activity.file_id = payload.file_id
            activity.difficulty_level = payload.difficulty_level
            activity.is_launched = payload.is_launched

            await activity.save()
            await get_channel_content_outline_stats(channel_id, uid)
            return ActivityResponse(**activity.model_dump())
        else:
            # Create new activity
            new_activity = Activity(
                activity_outline_id=payload.activity_outline_id,
                description=payload.description,
                file_id=payload.file_id,
                difficulty_level=payload.difficulty_level,
                is_launched=payload.is_launched
            )
            await new_activity.insert()
            await get_channel_content_outline_stats(channel_id, uid)
            return ActivityResponse(**new_activity.model_dump())

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -----------------
# LESSON Outline APIs
# -----------------
@api.post('/{channel_id}/lessons/outline/{order}/', response_model=LessonOutlineResponse)
async def create_lesson_outline(
    channel_id: str = Path(..., description="The ID of the channel"),
    order: int = Path(..., description="The order of the lesson"),
    payload: LessonOutlineRequest = Body(...),
    uid: str = Depends(get_user_id)
):
    """
    Create a new lesson outline with the provided payload and order.
    Validates channel existence.
    Returns the created lesson outline with its ID.
    """
    try:
        # Verify channel exists
        channel = await ChannelInfo.find_one({
            "_id": PydanticObjectId(channel_id)
        })
        if not channel:
            raise HTTPException(status_code=404, detail="Channel not found")

        # Create the new lesson outline
        lesson_outline = LessonOutline(
            activity_outline_id=payload.activity_outline_id,
            name=payload.name,
            order=order,
            lesson_count=0,  # Initialize count to 0
        )
        await lesson_outline.insert()
        await get_channel_content_outline_stats(channel_id, uid)
        return LessonOutlineResponse(**lesson_outline.model_dump())

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api.put('/{channel_id}/lessons/outline/{lesson_outline_id}/', response_model=LessonOutlineResponse)
async def update_lesson_outline(
    channel_id: str = Path(..., description="The ID of the channel"),
    lesson_outline_id: str = Path(..., description="The ID of the lesson outline"),
    payload: LessonOutlineRequest = Body(...),
    uid: str = Depends(get_user_id)
):
    """
    Update a lesson outline.
    Validates channel existence and lesson outline existence.
    Returns the updated lesson outline with its ID.
    """
    try:
        # Verify channel exists
        channel = await ChannelInfo.find_one({
            "_id": PydanticObjectId(channel_id)
        })
        if not channel:
            raise HTTPException(status_code=404, detail="Channel not found")

        # Find and update the lesson outline
        lesson_outline = await LessonOutline.find_one({
            "_id": PydanticObjectId(lesson_outline_id)
        })
        if not lesson_outline:
            raise HTTPException(status_code=404, detail="Lesson outline not found")

        # Update lesson outline fields
        lesson_outline.name = payload.name
        lesson_outline.order = payload.order

        await lesson_outline.save()
        await get_channel_content_outline_stats(channel_id, uid)
        return LessonOutlineResponse(**lesson_outline.model_dump())

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api.delete('/{channel_id}/lessons/outline/{lesson_outline_id}/')
async def delete_lesson_outline(
    channel_id: str = Path(..., description="The ID of the channel"),
    lesson_outline_id: str = Path(..., description="The ID of the lesson outline"),
    uid: str = Depends(get_user_id)
):
    """
    Delete a lesson outline.
    Validates channel existence and lesson outline existence.
    """
    try:
        # Verify channel exists
        channel = await ChannelInfo.find_one({
            "_id": PydanticObjectId(channel_id)
        })
        if not channel:
            raise HTTPException(status_code=404, detail="Channel not found")

        # Find and delete the lesson outline
        lesson_outline = await LessonOutline.find_one({
            "_id": PydanticObjectId(lesson_outline_id)
        })
        if not lesson_outline:
            raise HTTPException(status_code=404, detail="Lesson outline not found")

        lesson_contents = await Lesson.find({"lesson_outline_id": lesson_outline_id}).to_list()
        if lesson_contents:
            for lesson in lesson_contents:
                await lesson.delete()

        await lesson_outline.delete()
        await get_channel_content_outline_stats(channel_id, uid)
        return {"message": "Lesson outline deleted successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -----------------
# LESSON Content APIs
# -----------------

@api.post('/{channel_id}/lessons/', response_model=List[LessonResponse])
async def create_lesson(
    channel_id: str = Path(..., description="The ID of the channel"),
    lesson_id: Optional[str] = Query(None, description="Optional: The ID of the lesson to update"),
    payload: List[LessonRequest] = Body(...),
    uid: str = Depends(get_user_id)
):
    """
    Create or update multiple lessons based on lesson_id.
    If lesson_id is provided, updates existing lesson.
    If no lesson_id, creates new lessons.
    Validates channel existence and lesson outline existence.
    Updates lesson counts in both LessonOutline and ActivityOutline.
    Returns the created or updated lessons with their IDs.
    """
    try:
        # Verify channel exists and belongs to user
        channel = await ChannelInfo.find_one({
            "_id": PydanticObjectId(channel_id),
        })
        if not channel:
            raise HTTPException(status_code=404, detail="Channel not found")

        if lesson_id:
            # Update existing lesson
            lesson = await Lesson.find_one({
                "_id": PydanticObjectId(lesson_id)
            })
            if not lesson:
                raise HTTPException(status_code=404, detail="Lesson not found")

            # Update lesson fields
            lesson.lesson_type = payload[0].lesson_type
            lesson.text = payload[0].text
            lesson.file_ids = payload[0].file_ids
            lesson.question_lesson = payload[0].question_lesson
            lesson.order = payload[0].order
            lesson.is_launched = payload[0].is_launched
            lesson.is_free = payload[0].is_free

            await lesson.save()
            print('calling await get_channel_content_outline_stats')
            await get_channel_content_outline_stats(channel_id, uid)
            return [LessonResponse(**lesson.model_dump())]
        else:
            # Create new lessons
            # Verify lesson outline exists from first lesson's data
            lesson_outline = await LessonOutline.find_one({
                "_id": PydanticObjectId(payload[0].lesson_outline_id)
            })
            if not lesson_outline:
                raise HTTPException(status_code=404, detail="Lesson outline not found")

            # Create the new lessons
            created_lessons = []
            for lesson_data in payload:
                lesson = Lesson(
                    lesson_outline_id=lesson_data.lesson_outline_id,
                    lesson_type=lesson_data.lesson_type,
                    text=lesson_data.text,
                    file_ids=lesson_data.file_ids,
                    question_lesson=lesson_data.question_lesson,
                    order=lesson_data.order,
                    is_launched=lesson_data.is_launched,
                    is_free=lesson_data.is_free
                )
                await lesson.insert()
                created_lessons.append(LessonResponse(**lesson.model_dump()))

            # Update lesson count in lesson outline
            lesson_outline.lesson_count = len(payload)
            await lesson_outline.save()

            await get_channel_content_outline_stats(channel_id, uid)
            return created_lessons

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api.delete('/{channel_id}/lessons/{lesson_id}/')
async def delete_lesson(
    channel_id: str = Path(..., description="The ID of the channel"),
    lesson_id: str = Path(..., description="The ID of the lesson"),
    uid: str = Depends(get_user_id)
):
    """
    Delete a lesson content.
    Validates channel existence and lesson existence.
    """
    try:
        # Verify channel exists
        channel = await ChannelInfo.find_one({
            "_id": PydanticObjectId(channel_id)
        })
        if not channel:
            raise HTTPException(status_code=404, detail="Channel not found")

        # Find and delete the lesson
        lesson = await Lesson.find_one({
            "_id": PydanticObjectId(lesson_id)
        })
        if not lesson:
            raise HTTPException(status_code=404, detail="Lesson not found")

        await lesson.delete()
        await get_channel_content_outline_stats(channel_id, uid)
        return {"message": "Lesson deleted successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -----------------
# QUIZ Outline APIs
# -----------------
@api.post('/{channel_id}/quizzes/outline/{order}/', response_model=QuizOutlineResponse)
async def create_quiz_outline(
    channel_id: str = Path(..., description="The ID of the channel"),
    order: int = Path(..., description="The order of the quiz"),
    payload: QuizOutlineRequest = Body(...),
    uid: str = Depends(get_user_id)
):
    """
    Create a new quiz outline with the provided payload and order.
    Validates channel existence.
    Returns the created quiz outline with its ID.
    """
    try:
        # Verify channel exists
        channel = await ChannelInfo.find_one({
            "_id": PydanticObjectId(channel_id)
        })
        if not channel:
            raise HTTPException(status_code=404, detail="Channel not found")

        # Create the new quiz outline
        quiz_outline = QuizOutline(
            activity_outline_id=payload.activity_outline_id,
            name=payload.name,
            order=order,
            is_launched=payload.is_launched,
            is_free=payload.is_free,
            quiz_count=payload.quiz_count
        )
        await quiz_outline.insert()
        await get_channel_content_outline_stats(channel_id, uid)
        return QuizOutlineResponse(**quiz_outline.model_dump())

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api.put('/{channel_id}/quizzes/outline/{quiz_outline_id}/', response_model=QuizOutlineResponse)
async def update_quiz_outline(
    channel_id: str = Path(..., description="The ID of the channel"),
    quiz_outline_id: str = Path(..., description="The ID of the quiz outline"),
    payload: QuizOutlineRequest = Body(...),
    uid: str = Depends(get_user_id)
):
    """
    Update a quiz outline.
    Validates channel existence and quiz outline existence.
    Returns the updated quiz outline with its ID.
    """
    try:
        # Verify channel exists
        channel = await ChannelInfo.find_one({
            "_id": PydanticObjectId(channel_id)
        })
        if not channel:
            raise HTTPException(status_code=404, detail="Channel not found")

        # Find and update the quiz outline
        quiz_outline = await QuizOutline.find_one({
            "_id": PydanticObjectId(quiz_outline_id)
        })
        if not quiz_outline:
            raise HTTPException(status_code=404, detail="Quiz outline not found")

        # Update quiz outline fields
        quiz_outline.name = payload.name
        quiz_outline.order = payload.order
        quiz_outline.is_launched = payload.is_launched
        quiz_outline.is_free = payload.is_free
        quiz_outline.quiz_count = payload.quiz_count

        await quiz_outline.save()
        await get_channel_content_outline_stats(channel_id, uid)
        return QuizOutlineResponse(**quiz_outline.model_dump())

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api.delete('/{channel_id}/quizzes/outline/{quiz_outline_id}/')
async def delete_quiz_outline(
    channel_id: str = Path(..., description="The ID of the channel"),
    quiz_outline_id: str = Path(..., description="The ID of the quiz outline"),
    uid: str = Depends(get_user_id)
):
    """
    Delete a quiz outline.
    Validates channel existence and quiz outline existence.
    """
    try:
        # Verify channel exists
        channel = await ChannelInfo.find_one({
            "_id": PydanticObjectId(channel_id)
        })
        if not channel:
            raise HTTPException(status_code=404, detail="Channel not found")

        # Find and delete the quiz outline
        quiz_outline = await QuizOutline.find_one({
            "_id": PydanticObjectId(quiz_outline_id)
        })
        if not quiz_outline:
            raise HTTPException(status_code=404, detail="Quiz outline not found")

        await quiz_outline.delete()

        quiz_contents = await Question.find({"quiz_outline_id": quiz_outline_id}).to_list()
        if quiz_contents:
            for quiz in quiz_contents:
                await quiz.delete()

        await get_channel_content_outline_stats(channel_id, uid)
        return {"message": "Quiz outline deleted successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -----------------
# QUESTION APIs
# -----------------

@api.post('/{channel_id}/questions/', response_model=List[QuestionResponse])
async def create_question(
    channel_id: str = Path(..., description="The ID of the channel"),
    quiz_id: Optional[str] = Query(None, description="Optional: The ID of the quiz to update"),
    payload: List[QuestionRequest] = Body(...),
    uid: str = Depends(get_user_id)
):
    """
    Create or update multiple questions based on quiz_id.
    If quiz_id is provided, updates existing quiz.
    If no quiz_id, creates new questions.
    Validates channel existence and quiz outline existence.
    Updates question counts in both QuizOutline and ActivityOutline.
    Returns the created or updated questions with their IDs.
    """
    try:
        # Verify channel exists and belongs to user
        channel = await ChannelInfo.find_one({
            "_id": PydanticObjectId(channel_id),
        })
        if not channel:
            raise HTTPException(status_code=404, detail="Channel not found")

        if quiz_id:
            # Update existing quiz
            quiz = await Question.find_one({
                "_id": PydanticObjectId(quiz_id)
            })
            if not quiz:
                raise HTTPException(status_code=404, detail="Quiz not found")

            # Update quiz fields
            quiz.time_limit = payload[0].time_limit
            quiz.points = payload[0].points
            quiz.template = payload[0].template
            quiz.generated_question = payload[0].generated_question
            quiz.file_id = payload[0].file_id
            quiz.check_function = payload[0].check_function
            quiz.order = payload[0].order
            quiz.is_accepted = payload[0].is_accepted

            await quiz.save()
            await get_channel_content_outline_stats(channel_id, uid)
            return [QuestionResponse(**quiz.model_dump())]
        else:
            # Create new questions
            # Verify quiz outline exists from first question's data
            quiz_outline = await QuizOutline.find_one({
                "_id": PydanticObjectId(payload[0].quiz_outline_id)
            })
            if not quiz_outline:
                raise HTTPException(status_code=404, detail="Quiz outline not found")

            # Create the new questions
            created_questions = []
            for question_data in payload:
                question = Question(
                    quiz_outline_id=question_data.quiz_outline_id,
                    time_limit=question_data.time_limit,
                    points=question_data.points,
                    template=question_data.template,
                    generated_question=question_data.generated_question,
                    file_id=question_data.file_id,
                    check_function=question_data.check_function,
                    order=question_data.order,
                    is_accepted=question_data.is_accepted
                )
                await question.insert()
                created_questions.append(QuestionResponse(**question.model_dump()))

            # Update question count in quiz outline
            quiz_outline.quiz_count = len(payload)
            await quiz_outline.save()

            await get_channel_content_outline_stats(channel_id, uid)
            return created_questions

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api.delete('/{channel_id}/questions/{question_id}/')
async def delete_question(
    channel_id: str = Path(..., description="The ID of the channel"),
    question_id: str = Path(..., description="The ID of the question"),
    uid: str = Depends(get_user_id)
):
    """
    Delete a question content.
    Validates channel existence and question existence.
    """
    try:
        # Verify channel exists
        channel = await ChannelInfo.find_one({
            "_id": PydanticObjectId(channel_id)
        })
        if not channel:
            raise HTTPException(status_code=404, detail="Channel not found")

        # Find and delete the question
        question = await Question.find_one({
            "_id": PydanticObjectId(question_id)
        })
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")

        await question.delete()
        await get_channel_content_outline_stats(channel_id, uid)
        return {"message": "Question deleted successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

