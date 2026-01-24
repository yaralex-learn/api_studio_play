from fastapi import APIRouter, Response, Depends, Path, Body, HTTPException
from typing import List, Union
from app.utils.user import get_user_id
from app.models.channel import (
    ChannelInfo, Channel, PublishChannel
)
from beanie import PydanticObjectId
import asyncio
from app.api.studio.channel.middlewares import get_channel_content_outline_stats



api = APIRouter()

# -----------------
# CHANNEL APIs
# -----------------



@api.get('/all_my_channels/')
async def get_all_channels_basic_info(uid: str = Depends(get_user_id)):
    """
    Return all channels for the user, excluding outline_content.
    """
    try:
        
        channels = await Channel.find(
            {"user_id": PydanticObjectId(uid)}
        ).to_list()
        
        # Build response for each channel using Channel model fields directly
        result = []
        for channel in channels:
            result.append({
                # "id": str(channel.id),
                "name": channel.name,
                "channel_id": channel.channel_id,
                "description": channel.description,
                "section_count": channel.section_count,
                "unit_count": channel.unit_count,
                "activity_count": channel.activity_count,
                "lesson_count": channel.lesson_count,
                "quiz_count": channel.quiz_count,
                "question_count": channel.question_count,
                "enrolled_students": channel.enrolled_students,
                "last_updated": channel.last_updated,
                "published": channel.published,
                "channel_link": channel.channel_link,
                "primary_language": channel.primary_language,   
                "target_language": channel.target_language,
                "avatar_file_id": channel.avatar_file_id,
                "cover_image_file_id": channel.cover_image_file_id,
                # "outline_content": channel.outline_content if channel else None,
            })
        
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api.get('/{channel_id}/') # response_model=ChannelContentResponse
async def get_channel_by_id(
    channel_id: str = Path(..., description="The ID of the channel"),
    uid: str = Depends(get_user_id),
):
    """
    Get channel's outline_content by channel ID.
    """

    try:
        channel = await get_channel_content_outline_stats(channel_id, uid)

        return {
                "id": str(channel.id),
                "name": channel.name,
                "channel_id": channel.channel_id,
                "description": channel.description,
                "section_count": channel.section_count,
                "unit_count": channel.unit_count,
                "activity_count": channel.activity_count,
                "lesson_count": channel.lesson_count,
                "quiz_count": channel.quiz_count,
                "question_count": channel.question_count,
                "enrolled_students": channel.enrolled_students,
                "last_updated": channel.last_updated,
                "published": channel.published,
                "channel_link": channel.channel_link,
                "primary_language": channel.primary_language,
                "target_language": channel.target_language,
                "avatar_file_id": channel.avatar_file_id,
                "cover_image_file_id": channel.cover_image_file_id,
                "outline_content": channel.outline_content if channel else None
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -----------------
# PROMPT APIs
# -----------------
@api.post('/generate-questions/')
async def generate_questions(
    initial_prompt: str = Body(..., description="The concept/topic for question generation"),
    template_id: int = Body(..., description="Template ID to use for question generation"),
    difficulty: str = Body(default="intermediate", description="Difficulty level (easy, intermediate, hard)"),
    num_questions: int = Body(default=1, description="Number of questions to generate")
):
    """
    Generate questions using AI with specific templates.
    
    Args:
        initial_prompt: The topic/concept for question generation
        template_id: ID of the template to use
        name: Name/title for the question set
        difficulty: Difficulty level
        num_questions: Number of questions to generate
    
    Returns:
        List of generated questions
    """
    try:
        from app.api.studio.channel.prompt_preparation import generate_questions_with_template
        
        # Generate questions using the template-based function
        generated_questions = generate_questions_with_template(
            concept_prompt=initial_prompt,
            template_id=template_id,
            num_questions=num_questions,
            difficulty=difficulty
        )

        return {
            "success": True,
            "template_id": template_id,
            "difficulty": difficulty,
            "initial_prompt": initial_prompt,
            "num_questions": len(generated_questions),
            "questions": generated_questions
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api.post('/generate_prompt/')
async def revise_text(
    text: str = Body(..., description="The text to be revised"),
    module_type: str = Body(..., description="Module type: lesson, activity, unit, or section")
):
    """
    Revise text grammatically and contextually based on its intended use.
    
    Args:
        text: The original text to be revised
        module_type: Where the text will be used (lesson, activity, unit, section)
    
    Returns:
        Dict containing the original text and revised text
    """
    try:
        from app.api.studio.channel.prompt_preparation import generate_text_prompt
        
        # Validate module_type
        valid_modules = ["lesson", "activity", "unit", "section"]
        if module_type not in valid_modules:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid module_type. Must be one of: {valid_modules}"
            )
        
        # Revise the text contextually
        revised_text = generate_text_prompt(
            text=text,
            context_type=module_type
        )
        
        return {
            "success": True,
            "original_text": text,
            "module_type": module_type,
            "revised_text": revised_text
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
