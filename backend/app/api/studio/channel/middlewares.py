from fastapi import APIRouter, Response, Depends, Path, Body, HTTPException
from app.models.channel import (
    Question, Channel,
    SectionOutline, UnitOutline, ActivityOutline, LessonOutline, QuizOutline, 
    Unit, Activity, Lesson, Section, PublishChannel, ChannelInfo
)
from beanie import PydanticObjectId


async def get_channel_content_outline_stats(
    channel_id: str,
    uid: str
):
    """
    Get channel content including both outline and content information.
    Retrieves all sections, units, activities, and their content (lessons and quizzes).
    This function can be executed concurrently.
    """
    try:
        # Verify channel exists and belongs to user
        channel = await Channel.find_one({
            "channel_id": channel_id,
            "user_id": PydanticObjectId(uid)
        })
        if not channel:
            raise HTTPException(status_code=404, detail="Channel not found")

        # Get all sections for this channel
        
        sections = await SectionOutline.find(
            {"channel_id": channel_id}
        ).sort("order").to_list()

        outline_content = []
        stats = {
            "section_count": 0,
            "unit_count": 0,
            "activity_count": 0,
            "lesson_count": 0,
            "quiz_count": 0,
            "question_count": 0,
            "total_lesson_quiz_count": 0
        }

        # Build complete structure with content
        for section in sections:
            stats["section_count"] += 1
            # Get section content
            section_content = await Section.find_one({"section_outline_id": str(section.id)})
            
            units = await UnitOutline.find(
                {"section_outline_id": str(section.id)}
            ).sort("order").to_list()

            section_units = []
            for unit in units:
                stats["unit_count"] += 1
                # Get unit content
                unit_content = await Unit.find_one({"unit_outline_id": str(unit.id)})
                
                activities = await ActivityOutline.find(
                    {"unit_outline_id": str(unit.id)}
                ).sort("order").to_list()

                unit_activities = []
                for activity in activities:
                    stats["activity_count"] += 1
                    # Get activity content
                    activity_content = await Activity.find_one({"activity_outline_id": str(activity.id)})
                    
                    # Get lessons with their content
                    lesson_outlines = await LessonOutline.find(
                        {"activity_outline_id": str(activity.id)}
                    ).sort("order").to_list()
                    print(lesson_outlines)

                    content = []
                    for lesson_outline in lesson_outlines:
                        stats["lesson_count"] += 1
                        stats["total_lesson_quiz_count"] += 1
                        # Get lesson content
                        lessons = await Lesson.find({"lesson_outline_id": str(lesson_outline.id)}).sort("order").to_list()
                        content.append({
                            "id": str(lesson_outline.id),
                            "name": lesson_outline.name,
                            "order": lesson_outline.order,
                            "count": lesson_outline.lesson_count,
                            "type": "lesson",
                            "content": [
                                {
                                "id": str(lesson.id),
                                "lesson_type": lesson.lesson_type,
                                "text": lesson.text,
                                "file_ids": lesson.file_ids,
                                "question_lesson": lesson.question_lesson,
                                "order": lesson.order,
                                "is_launched": lesson.is_launched,
                                "is_free": lesson.is_free
                                }
                                for lesson in lessons
                            ]
                        })
                        print("333333   ", content  )

                    # Get quizzes with their questions
                    quiz_outlines = await QuizOutline.find(
                        {"activity_outline_id": str(activity.id)}
                    ).sort("order").to_list()

                    for quiz_outline in quiz_outlines:
                        stats["quiz_count"] += 1
                        stats["total_lesson_quiz_count"] += 1
                        # Get quiz questions
                        questions = await Question.find(
                            {"quiz_outline_id": str(quiz_outline.id)}
                        ).sort("order").to_list()
                        stats["question_count"] += len(questions)

                        content.append({
                            "id": str(quiz_outline.id),
                            "name": quiz_outline.name,
                            "order": quiz_outline.order,
                            "count": quiz_outline.quiz_count,
                            "type": "quiz",
                            "is_launched": quiz_outline.is_launched,
                            "is_free": quiz_outline.is_free,
                            "content": [
                                {
                                    "id": str(q.id),
                                    "time_limit": q.time_limit,
                                    "points": q.points,
                                    "template": q.template,
                                    "generated_question": q.generated_question,
                                    "file_id": q.file_id,
                                    "check_function": q.check_function,
                                    "order": q.order,
                                    "is_accepted": q.is_accepted
                                }
                                for q in questions
                            ]
                        })
                    print(content)
                    # Sort content by order
                    content.sort(key=lambda x: x["order"])

                    unit_activities.append({
                        "id": str(activity.id),
                        "name": activity.name,
                        "order": activity.order,
                        "count": activity.lesson_quiz_count,
                        "content": content,
                        # Add activity content fields
                        "description": activity_content.description if activity_content else None,
                        "file_id": activity_content.file_id if activity_content else None,
                        "difficulty_level": activity_content.difficulty_level if activity_content else None,
                        "is_launched": activity_content.is_launched if activity_content else False
                    })

                section_units.append({
                    "id": str(unit.id),
                    "name": unit.name,
                    "order": unit.order,
                    "activities": unit_activities,
                    # Add unit content fields
                    "description": unit_content.description if unit_content else None,
                    "file_id": unit_content.file_id if unit_content else None
                })

            outline_content.append({
                "id": str(section.id),
                "name": section.name,
                "order": section.order,
                "units": section_units,
                # Add section content fields
                "description": section_content.description if section_content else None,
                "file_id": section_content.file_id if section_content else None
            })
        # print(3333333)
        publish_channel = await PublishChannel.find_one({"channel_id": channel_id})
        channel_link = publish_channel.channel_link if publish_channel else None
        channel_info = await ChannelInfo.find_one({"_id": PydanticObjectId(channel_id)})
        # print(44444, publish_channel)
        # print(55555, channel_id, channel_info)
        # Update the channel's outline field and stats
        channel.outline_content = {"sections": outline_content}
        channel.section_count = stats["section_count"]
        channel.unit_count = stats["unit_count"]
        channel.activity_count = stats["activity_count"]
        channel.lesson_count = stats["lesson_count"]
        channel.quiz_count = stats["quiz_count"]
        channel.question_count = stats["question_count"]
        channel.total_lesson_quiz_count = stats["total_lesson_quiz_count"]
        channel.published = publish_channel.published if publish_channel else False
        channel.channel_link = channel_link
        channel.primary_language = channel_info.primary_language 
        channel.target_language = channel_info.target_language
        channel.avatar_file_id = channel_info.avatar_file_id
        channel.cover_image_file_id = channel_info.cover_image_file_id
        await channel.save()
        return channel

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))