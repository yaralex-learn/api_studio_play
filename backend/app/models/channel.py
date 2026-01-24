from pydantic import BaseModel, Field, field_serializer, field_validator
from datetime import datetime
from typing import Dict, List, Optional, Any, Union, Literal
from beanie import Document, PydanticObjectId
from bson import ObjectId


# -----------------
# CHANNEL STATS_CONTENT
# -----------------
class ChannelFields(BaseModel):
    user_id: PydanticObjectId = Field(..., example="60b8d295f295a53b88f5a7c9")# This field is filled by setting info when creating a channel
    name: str = Field(..., example="Python Programming") # This field is filled by setting info when creating a channel
    channel_id: str = Field(..., example="681f14bf72b568b13257f8e8") # This field is filled by setting info when creating a channel
    description: str = Field(..., example="Learn Python from basics to advanced") # This field is filled by setting info when creating a channel
    section_count: int = Field(default=0, example=5)
    unit_count: int = Field(default=0, example=15)
    activity_count: int = Field(default=0, example=30)
    lesson_count: int = Field(default=0, example=45)
    quiz_count: int = Field(default=0, example=20)
    question_count: int = Field(default=0, example=60)
    total_lesson_quiz_count: int = Field(default=0, example=65)
    enrolled_students: int = Field(default=0, example=150)
    primary_language: Optional[str] = Field(None, example="en")
    target_language: Optional[str] = Field(None, example="es")
    avatar_file_id: Optional[str] = Field(None, example="661f14bf72b568b13257f8e8")
    cover_image_file_id: Optional[str] = Field(None, example="661f14bf72b568b13257f8e9")
    published: Optional[bool] = Field(default=False, example=True)
    channel_link: Optional[str] = Field(None, example="https://example.com/channel")
    last_updated: datetime = Field(default_factory=datetime.utcnow, example="2025-04-27T12:00:00")
    outline_content: Dict[str, Any] = Field(default_factory=dict, example={
        "sections": [
            {
                "id": "681f14bf72b568b13257f8e9",
                "name": "Introduction",
                "order": 1,
                "units": [
                    {
                        "id": "681f14bf72b568b13257f8eb",
                        "name": "Getting Started",
                        "order": 1,
                        "activities": [
                            {
                                "id": "681f14bf72b568b13257f8ed",
                                "name": "First Steps",
                                "order": 1,
                                "count": 1,
                                "content": [
                                    {
                                        "id": "681f14bf72b568b13257f8ef",
                                        "name": "Hello World",
                                        "order": 1,
                                        "count": 1,
                                        "type": "lesson",
                                        "content": {
                                            "id": "681f14bf72b568b13257f8f0",
                                            "lesson_type": "text",
                                            "text": "print('Hello, World!')",
                                            "urls": [
                                                "https://example.com/lesson1"
                                            ],
                                            "question_lesson": 'null',
                                            "order": 1,
                                            "is_launched": 'true',
                                            "is_free": 'true'
                                        }
                                    },
                                    {
                                        "id": "681f14bf72b568b13257f8f1",
                                        "name": "Quiz 1",
                                        "order": 2,
                                        "count": 1,
                                        "type": "quiz",
                                        "is_launched": 'true',
                                        "is_free": 'false',
                                        "content": [
                                            {
                                                "id": "681f14bf72b568b13257f8f2",
                                                "time_limit": 30,
                                                "points": 10,
                                                "template": {
                                                    "type": "multiple_choice",
                                                    "question": "What does print('Hello, World!') do?",
                                                    "options": [
                                                        "Prints text",
                                                        "Saves file"
                                                    ]
                                                },
                                                "generated_question": 'null',
                                                "url": [
                                                    "https://example.com/q1.jpg"
                                                ],
                                                "check_function": "def check_answer(ans): return ans == 'Prints text'",
                                                "order": 1,
                                                "is_accepted": 'true'
                                            }
                                        ]
                                    }
                                ],
                                "description": "First steps in Python.",
                                "url": "https://example.com/activity1.jpg",
                                "difficulty_level": 1,
                                "is_launched": 'true'
                            }
                        ],
                        "description": "Getting started with Python.",
                        "url": "https://example.com/unit1.jpg"
                    }
                ],
                "description": "Intro section.",
                "url": "https://example.com/section1.jpg"
            }
        ]
    })

    # outline: Optional[Dict[str, Any]] = Field(default_factory=dict, example={
    #     "sections": [
    #         {
    #             "id": "section1",
    #             "name": "Introduction",
    #             "order": 1,
    #             "units": [
    #                 {
    #                     "id": "unit1",
    #                     "name": "Getting Started",
    #                     "activities": []
    #                 }
    #             ]
    #         }
    #     ]
    # })
# class ChannelRequest(ChannelFields):
#     pass

class Channel(Document, ChannelFields):
    id: PydanticObjectId = Field(default_factory=PydanticObjectId, alias="_id")

    class Settings:
        name = "channels"

# class ChannelResponse(ChannelFields):
#     id: str = Field(..., example="channel_123")

#     class Config:
#         orm_mode = True
#         json_encoders = {
#             ObjectId: str,
#             PydanticObjectId: str
#         }

    
# class ChannelInfoFields(BaseModel):
#     name: str = Field(..., example="Channel Name")
#     description: Optional[str] = Field("", example="Channel Description")
#     primary_language: Optional[str] = Field(..., example="en")
#     target_language: Optional[str] = Field(None, example="es")
#     avatar_file_id: Optional[str] = Field(None, example="661f14bf72b568b13257f8e8")
#     cover_image_file_id: Optional[str] = Field(None, example="661f14bf72b568b13257f8e9")

# class PublishChannelResponse(ChannelFields):
#     channel_id: str = Field(..., example="channel_123")
#     published: Optional[bool] = Field(default=False, example=True)
#     channel_link: Optional[str] = Field(None, example="https://example.com/channel")

#     @field_validator('channel_id', mode='before')
#     def validate_channel_id(cls, value: Any) -> str:
#         """Convert ObjectId or PydanticObjectId to string"""
#         if isinstance(value, (ObjectId, PydanticObjectId)):
#             return str(value)
#         return str(value)

#     class Config:
#         orm_mode = True
#         json_encoders = {
#             ObjectId: str,
#             PydanticObjectId: str
#         }



# -----------------
# SECTION Outline
# -----------------
class SectionOutlineFields(BaseModel):
    channel_id: str = Field(..., example="60b8d295f295a53b88f5a7c9")
    name: str = Field(..., example="Introduction")
    order: int = Field(..., example=1, description="Order of the section within the channel")

class SectionOutlineRequest(SectionOutlineFields):
    pass

class SectionOutline(Document, SectionOutlineFields):
    id: PydanticObjectId = Field(default_factory=PydanticObjectId, alias="_id")

    class Settings:
        name = "section_outlines"

class SectionOutlineResponse(SectionOutlineFields):
    id: str = Field(..., example="60b8d295f295a53b88f5sec123")

    @field_validator('id', mode='before')
    def validate_id(cls, value: Any) -> str:
        """Convert ObjectId or PydanticObjectId to string"""
        if isinstance(value, (ObjectId, PydanticObjectId)):
            return str(value)
        return str(value)

    class Config:
        orm_mode = True
        json_encoders = {
            ObjectId: str,
            PydanticObjectId: str
        }

# -----------------
# SECTION Content
# -----------------
class SectionFields(BaseModel):
    section_outline_id: str = Field(..., example="60b8d295f295a53b88f5sec123")
    name: str = Field(..., example="Introduction")
    description: str = Field(..., example="This section covers the basics.")
    file_id: Optional[str] = Field(default=None, example="661f14bf72b568b13257f8e8")

class SectionRequest(SectionFields):
    pass

class Section(Document, SectionFields):
    id: PydanticObjectId = Field(default_factory=PydanticObjectId, alias="_id")

    class Settings:
        name = "sections"

class SectionResponse(SectionFields):
    id: str = Field(..., example="60b8d295f295a53b88f5sec123")

    @field_validator('id', mode='before')
    def validate_id(cls, value: Any) -> str:
        """Convert ObjectId or PydanticObjectId to string"""
        if isinstance(value, (ObjectId, PydanticObjectId)):
            return str(value)
        return str(value)

    class Config:
        orm_mode = True
        json_encoders = {
            ObjectId: str,
            PydanticObjectId: str
        }


# -----------------
# UNIT Outline
# -----------------
class UnitOutlineFields(BaseModel):
    # channel_id: str = Field(..., example="60b8d295f295a53b88f5a7c9")
    section_outline_id: str = Field(..., example="60b8d295f295a53b88f5sec123")
    name: str = Field(..., example="Unit 1")
    order: int = Field(..., example=1, description="Order of the unit within its section")

class UnitOutlineRequest(UnitOutlineFields):
    pass

class UnitOutline(Document, UnitOutlineFields):
    id: PydanticObjectId = Field(default_factory=PydanticObjectId, alias="_id")

    class Settings:
        name = "unit_outlines"

class UnitOutlineResponse(UnitOutlineFields):
    id: str = Field(..., example="60b8d295f295a53b88f5unit123")

    @field_validator('id', mode='before')
    def validate_id(cls, value: Any) -> str:
        """Convert ObjectId or PydanticObjectId to string"""
        if isinstance(value, (ObjectId, PydanticObjectId)):
            return str(value)
        return str(value)

    class Config:
        orm_mode = True
        json_encoders = {
            ObjectId: str,
            PydanticObjectId: str
        }

# -----------------
# UNIT Content
# -----------------
class UnitFields(BaseModel):
    unit_outline_id: str = Field(..., example="60b8d295f295a53b88f5unit123")
    name: str = Field(..., example="Unit 1")
    description: str = Field(..., example="Unit about JavaScript basics.")
    file_id: str = Field(..., example="661f14bf72b568b13257f8e9")

class UnitRequest(UnitFields):
    pass

class Unit(Document, UnitFields):
    id: PydanticObjectId = Field(default_factory=PydanticObjectId, alias="_id")

    class Settings:
        name = "units"

class UnitResponse(UnitFields):
    id: str = Field(..., example="unit_123")

    @field_validator('id', mode='before')
    def validate_id(cls, value: Any) -> str:
        """Convert ObjectId or PydanticObjectId to string"""
        if isinstance(value, (ObjectId, PydanticObjectId)):
            return str(value)
        return str(value)

    class Config:
        orm_mode = True
        json_encoders = {
            ObjectId: str,
            PydanticObjectId: str
        }

# -----------------
# ACTIVITY Outline
# -----------------
class ActivityOutlineFields(BaseModel):
    # channel_id: str = Field(..., example="60b8d295f295a53b88f5a7c9")
    # section_outline_id: str = Field(..., example="60b8d295f295a53b88f5sec123")
    unit_outline_id: str = Field(..., example="60b8d295f295a53b88f5unit123")
    name: str = Field(..., example="Activity 1")
    order: int = Field(..., example=1, description="Order of the activity within its unit")
    lesson_quiz_count: Optional[int] = Field(default=0, example=1, description="Count of the lesson and quiz till this activity outline")
    percentage: Optional[int] = Field(default=0, example=0, description="Percentage of lessons and quizzes till this activity")

class ActivityOutlineRequest(ActivityOutlineFields):
    pass

class ActivityOutline(Document, ActivityOutlineFields):
    id: PydanticObjectId = Field(default_factory=PydanticObjectId, alias="_id")

    class Settings:
        name = "activity_outlines"

class ActivityOutlineResponse(ActivityOutlineFields):
    id: str = Field(..., example="60b8d295f295a53b88f5activity123")

    @field_validator('id', mode='before')
    def validate_id(cls, value: Any) -> str:
        """Convert ObjectId or PydanticObjectId to string"""
        if isinstance(value, (ObjectId, PydanticObjectId)):
            return str(value)
        return str(value)

    class Config:
        orm_mode = True
        json_encoders = {
            ObjectId: str,
            PydanticObjectId: str
        }

# -----------------
# ACTIVITY Content
# -----------------

class ActivityFields(BaseModel):
    # channel_id: str = Field(..., example="60b8d295f295a53b88f5a7c9")
    # section_id: str = Field(..., example="80b8d295f295a53b88f5a7c9")
    # unit_id: str = Field(..., example="90b8d295f295a53b88f5a7c9")
    activity_outline_id: str = Field(..., example="60b8d295f295a53b88f5activity123")
    description: str = Field(..., example="Description of activity.")
    file_id: str = Field(..., example="661f14bf72b568b13257f8ea")
    difficulty_level: int = Field(..., example=3)
    is_launched: Optional[bool] = Field(default=False, example=True)

class ActivityRequest(ActivityFields):
    pass

class Activity(Document, ActivityFields):
    id: PydanticObjectId = Field(default_factory=PydanticObjectId, alias="_id")

    class Settings:
        name = "activities"

class ActivityResponse(ActivityFields):
    id: str = Field(..., example="activity_123")

    @field_validator('id', mode='before')
    def validate_id(cls, value: Any) -> str:
        """Convert ObjectId or PydanticObjectId to string"""
        if isinstance(value, (ObjectId, PydanticObjectId)):
            return str(value)
        return str(value)

    class Config:
        orm_mode = True
        json_encoders = {
            ObjectId: str,
            PydanticObjectId: str
        }

# -----------------
# LESSON Outline
# -----------------
class LessonOutlineFields(BaseModel):
    # channel_id: str = Field(..., example="60b8d295f295a53b88f5a7c9")
    # section_outline_id: str = Field(..., example="60b8d295f295a53b88f5sec123")
    # unit_outline_id: str = Field(..., example="60b8d295f295a53b88f5unit123")
    activity_outline_id: str = Field(..., example="60b8d295f295a53b88f5activity123")
    name: str = Field(..., example="Lesson 1")
    order: int = Field(..., example=1, description="Order of the lesson within its activity")
    lesson_count: Optional[int] = Field(default=0, example=1, description="Count of the lesson within this lesson outline")

class LessonOutlineRequest(LessonOutlineFields):
    pass

class LessonOutline(Document, LessonOutlineFields):
    id: PydanticObjectId = Field(default_factory=PydanticObjectId, alias="_id")

    class Settings:
        name = "lesson_outlines"

class LessonOutlineResponse(LessonOutlineFields):
    id: str = Field(..., example="60b8d295f295a53b88f5lesson123")

    @field_validator('id', mode='before')
    def validate_id(cls, value: Any) -> str:
        """Convert ObjectId or PydanticObjectId to string"""
        if isinstance(value, (ObjectId, PydanticObjectId)):
            return str(value)
        return str(value)

    class Config:
        orm_mode = True
        json_encoders = {
            ObjectId: str,
            PydanticObjectId: str
        }

# -----------------
# LESSON Content
# -----------------

class LessonFields(BaseModel):
    lesson_outline_id: str = Field(..., example="60b8d295f295a53b88f5lesson123")
    lesson_type: str = Field(..., example="text")
    text: Optional[str] = Field(None, example="This is the lesson content.")
    file_ids: Optional[List[str]] = Field(None, example=["https://example.com/lesson-content1", "https://example.com/lesson-content2"])
    question_lesson: Optional[Dict[str, str]] = Field(None, example={
        "question": "What is the capital of France?",
        "options": ["Paris", "London", "Berlin", "Madrid"]
    })
    order: int = Field(..., example=1, description="Order of the lesson template within Lesson")
    is_launched: Optional[bool] = Field(default=False, example=True)
    is_free: Optional[bool] = Field(default=False, example=False)

class LessonRequest(LessonFields):
    pass

class Lesson(Document, LessonFields):
    id: PydanticObjectId = Field(default_factory=PydanticObjectId, alias="_id")

    class Settings:
        name = "lessons"

class LessonResponse(LessonFields):
    id: str = Field(..., example="lesson_123")

    @field_validator('id', mode='before')
    def validate_id(cls, value: Any) -> str:
        """Convert ObjectId or PydanticObjectId to string"""
        if isinstance(value, (ObjectId, PydanticObjectId)):
            return str(value)
        return str(value)

    class Config:
        orm_mode = True
        json_encoders = {
            ObjectId: str,
            PydanticObjectId: str
        }

# -----------------
# Quiz Outline
# -----------------

class QuizOutlineFields(BaseModel):
    # channel_id: str = Field(..., example="90b8d295f295a53b88f5a7c9")
    # section_outline_id: str = Field(..., example="60b8d295f295a53b88f5sec123")
    # unit_outline_id: str = Field(..., example="60b8d295f295a53b88f5unit123")
    activity_outline_id: str = Field(..., example="60b8d295f295a53b88f5activity123")
    name: str = Field(..., example="Quiz 1")
    order: int = Field(..., example=1, description="Order of the quiz within its activity")
    is_launched: Optional[bool] = Field(default=False, example=True)
    is_free: Optional[bool] = Field(default=False, example=False)
    quiz_count: int = Field(..., example=1, description="Count of the quiz within this quiz outline")


class QuizOutlineRequest(QuizOutlineFields):
    pass

class QuizOutline(Document, QuizOutlineFields):
    id: PydanticObjectId = Field(default_factory=PydanticObjectId, alias="_id")

    class Settings:
        name = "quiz_outlines"

class QuizOutlineResponse(QuizOutlineFields):
    id: str = Field(..., example="quiz_123")

    @field_validator('id', mode='before')
    def validate_id(cls, value: Any) -> str:
        """Convert ObjectId or PydanticObjectId to string"""
        if isinstance(value, (ObjectId, PydanticObjectId)):
            return str(value)
        return str(value)

    class Config:
        orm_mode = True
        json_encoders = {
            ObjectId: str,
            PydanticObjectId: str
        }


# -----------------
# QUESTION/Quiz Content
# -----------------
class QuestionFields(BaseModel):
    # section_id: str = Field(..., example="90b8d295f295a53b88f5a7c9")
    # unit_id: str = Field(..., example="90b8d295f295a53b88f5a7c9")
    # activity_id: str = Field(..., example="90b8d295f295a53b88f5a7c9")
    # quiz_id: str = Field(..., example="quiz_123")
    # text: str = Field(..., example="<p>What is 2+2?</p>")
    # channel_id: str = Field(..., example="90b8d295f295a53b88f5a7c9")
    quiz_outline_id: str = Field(..., example="60b8d295f295a53b88f5sec123")
    time_limit: Optional[int] = Field(None, example=30, description="Time limit in minutes")
    points: Optional[int] = Field(None, example=10, description="Points for the question")
    template: Dict[str, Any] = Field(..., example={
        "type": "multiple_choice", 
        "question": "What is 2+2?",
        "options": ["A", "B", "C", "D"]})
    generated_question: Optional[Dict[str, Any]] = Field(None, example={
        "type": "multiple_choice", 
        "question": "What is 2+2?",
        "options": ["A", "B", "C", "D"],
        "answer": "A"})
    file_id: Optional[str] = Field(None, example="661f14bf72b568b13257f8eb")
    check_function: Optional[str] = Field(None, example="def check_answer(ans): return ans == 4")
    order: Optional[int] = Field(None, example=1)
    is_accepted: Optional[bool] = Field(None, example=True)

class QuestionRequest(QuestionFields):
    pass

class Question(Document, QuestionFields):
    id: PydanticObjectId = Field(default_factory=PydanticObjectId, alias="_id")

    class Settings:
        name = "questions"

class QuestionResponse(QuestionFields):
    id: str = Field(..., example="question_123")

    @field_validator('id', mode='before')
    def validate_id(cls, value: Any) -> str:
        """Convert ObjectId or PydanticObjectId to string"""
        if isinstance(value, (ObjectId, PydanticObjectId)):
            return str(value)
        return str(value)

    class Config:
        orm_mode = True
        json_encoders = {
            ObjectId: str,
            PydanticObjectId: str
        }

# -----------------
# SETTING 
# INFO
# -----------------

class ChannelInfoFields(BaseModel):
    user_id: str = Field(..., example="60b8d295f295a53b88f5a7c9")
    name: str = Field(..., example="Channel Name")
    description: Optional[str] = Field("", example="Channel Description")
    primary_language: Optional[str] = Field(..., example="en")
    target_language: Optional[str] = Field(None, example="es")
    avatar_file_id: Optional[str] = Field(None, example="661f14bf72b568b13257f8e8")
    cover_image_file_id: Optional[str] = Field(None, example="661f14bf72b568b13257f8e9")

class ChannelInfoRequest(BaseModel):
    # user_id is provided by authentication dependency, not request body
    name: str = Field(..., example="Channel Name")
    description: Optional[str] = Field("", example="Channel Description")
    primary_language: Optional[str] = Field(..., example="en")
    target_language: Optional[str] = Field(None, example="es")
    avatar_file_id: Optional[str] = Field(None, example="661f14bf72b568b13257f8e8")
    cover_image_file_id: Optional[str] = Field(None, example="661f14bf72b568b13257f8e9")

class ChannelInfo(Document, ChannelInfoFields):
    id: PydanticObjectId = Field(default_factory=PydanticObjectId, alias="_id")

class ChannelInfoResponse(ChannelInfoFields):
    id: str = Field(..., example="channel_123")

    @field_validator('id', mode='before')
    def validate_id(cls, value: Any) -> str:
        """Convert ObjectId or PydanticObjectId to string"""
        if isinstance(value, (ObjectId, PydanticObjectId)):
            return str(value)
        return str(value)

# -----------------
# PUBLISH CHANNEL
# -----------------

class PublishChannelFields(BaseModel):
    user_id: str = Field(..., example="user_123")
    channel_id: str = Field(..., example="channel_123")
    published: Optional[bool] = Field(default=False, example=True)
    channel_link: Optional[str] = Field(None, example="https://example.com/channel")

class PublishChannelRequest(BaseModel):
    # user_id is provided by authentication dependency, not request body
    # channel_id is provided in URL path, not request body
    published: Optional[bool] = Field(default=False, example=True)
    channel_link: Optional[str] = Field(None, example="https://example.com/channel")

class PublishChannel(Document, PublishChannelFields):
    id: PydanticObjectId = Field(default_factory=PydanticObjectId, alias="_id")

    class Settings:
        name = "publish_channels"

class PublishChannelResponse(PublishChannelFields):
    id: str = Field(..., example="publish_channel_123")

    @field_validator('id', mode='before')
    def validate_id(cls, value: Any) -> str:
        """Convert ObjectId or PydanticObjectId to string"""
        if isinstance(value, (ObjectId, PydanticObjectId)):
            return str(value)
        return str(value)

# -----------------
# TIER
# -----------------

class TierFields(BaseModel):
    channel_id: str = Field(..., example="channel_123")
    name: str = Field(..., example="Premium Tier")
    price: float = Field(..., example=9.99)
    capacity: int = Field(..., example=100)
    billing_cycle: Literal["Monthly", "Quarterly", "Annually", "Lifetime"] = Field(..., example="Monthly")
    features: List[str] = Field(..., example=["Feature 1", "Feature 2"])

class TierRequest(TierFields):
    pass


class Tier(Document, TierFields):
    id: PydanticObjectId = Field(default_factory=PydanticObjectId, alias="_id")

class TierResponse(TierFields):
    id: str = Field(..., example="tier_123")

    @field_validator('id', mode='before')
    def validate_id(cls, value: Any) -> str:
        if isinstance(value, (ObjectId, PydanticObjectId)):
            return str(value)
        return value

    class Config:
        orm_mode = True

# -----------------
# FREE ACCESS
# -----------------

class FreeAccessFields(BaseModel):
    channel_id: str = Field(..., example="channel_123")
    percentage: int = Field(default=0, example=30)
    precentage_outline: Optional[Dict[str, Any]] = Field(..., example={
        "activity_id_1": {
            "name": "Introduction to Python",
            "order": 1,
            "percentage": 10,
            "count": 10 
        },
        "activity_id_2": {
            "name": "Basic Data Types", 
            "order": 2,
            "percentage": 20,
            "count": 20
        }
    })
    free_activities: Optional[List[str]] = Field(..., example=["activity_1_id", "activity_2_id"])

class FreeAccessRequest(FreeAccessFields):
    pass

class FreeAccess(Document, FreeAccessFields):
    id: PydanticObjectId = Field(default_factory=PydanticObjectId, alias="_id")

class FreeAccessResponse(FreeAccessFields):
    id: str = Field(..., example="free_access_123")

    @field_validator('id', mode='before')
    def validate_id(cls, value: Any) -> str:
        if isinstance(value, (ObjectId, PydanticObjectId)):
            return str(value)
        return value

    class Config:
        orm_mode = True

# -----------------
# COUPON
# -----------------

class CouponFields(BaseModel):
    channel_id: str = Field(..., example="channel_123")
    code: str = Field(..., example="WELCOME50")
    discount_type: Literal["Percentage", "fixed Amount"] = Field(..., example="Percentage")
    discount_value: int = Field(..., example=50)
    max_uses: int = Field(..., example=100)
    expires_at: datetime = Field(..., example="2025-12-31T23:59:59")
    is_active: bool = Field(..., example=True)

class CouponRequest(CouponFields):
    pass

class Coupon(Document, CouponFields):
    id: PydanticObjectId = Field(default_factory=PydanticObjectId, alias="_id")

class CouponResponse(CouponFields):
    id: str = Field(..., example="coupon_123")

    @field_validator('id', mode='before')
    def validate_id(cls, value: Any) -> str:
        if isinstance(value, (ObjectId, PydanticObjectId)):
            return str(value)
        return value

    class Config:
        orm_mode = True

# -----------------
# PROMPT
# -----------------

class PromptFields(BaseModel):
    module_id: str = Field(..., example="sec_123")
    module_type: str = Field(..., example="section")
    description: str = Field(..., example="Prompt description text.")
    templates: Optional[List[Dict[str, Any]]] = Field(default_factory=list, example=[{
        "template_id": "456",
        "template": "multiple_choice",
        "subject": "Define past perfect tense?", 
        "options": ["have", "has", "had", "will have"],
        "time": 10,
        "point": 5,
        "count": 2}])

class PromptRequest(PromptFields):
    pass

# class Prompt(Document, PromptFields):
#     id: PydanticObjectId = Field(default_factory=PydanticObjectId, alias="_id")

#     class Settings:
#         name = "prompts"

class PromptResponse(PromptFields):
    id: str = Field(..., example="prompt_123")

    @field_validator('id', mode='before')
    def validate_id(cls, value: Any) -> str:
        if isinstance(value, (ObjectId, PydanticObjectId)):
            return str(value)
        return value

    class Config:
        orm_mode = True

# -----------------
# CHANNELS OUTLINE
# -----------------

class A_ActivityOutlineResponse(BaseModel):
    activity: ActivityOutlineResponse
    content: Union[LessonOutlineResponse, QuizOutlineResponse] = Field(default_factory=list)

class A_UnitOutlineResponse(BaseModel):
    unit: UnitOutlineResponse
    activities: List[ActivityOutlineResponse] = Field(default_factory=list)

class A_SectionOutlineResponse(BaseModel):
    section: SectionOutlineResponse
    units: List[UnitOutlineResponse] = Field(default_factory=list)

class ChannelOutlineResponse(BaseModel):
    channel_id: str = Field(..., example="channel_123")
    outline: List[SectionOutlineResponse] = Field(default_factory=list)

# class AllChannelsOutlineResponse(BaseModel):
#     channels: List[ChannelOutlineResponse] = Field(default_factory=list)


# -----------------
# CHANNELS CONTENT 
#  -----------------

class ActivityContentResponse(BaseModel):
    activity: ActivityResponse
    content: Union[LessonResponse, QuestionResponse] = Field(default_factory=list)

class UnitContentResponse(BaseModel):
    unit: UnitResponse
    activities: List[ActivityContentResponse] = Field(default_factory=list)

class SectionContentResponse(BaseModel):
    section: SectionResponse
    units: List[UnitContentResponse] = Field(default_factory=list)

class ChannelContentResponse(BaseModel):
    channel_id: str = Field(..., example="channel_123")
    title: str = Field(..., example="Channel Title Example")
    description: str = Field(..., example="This is a full channel response with ordered content.")
    outline: List[SectionContentResponse] = Field(default_factory=list)

class AllChannelsResponse(BaseModel):
    channels: List[ChannelContentResponse] = Field(default_factory=list)



# -----------------
# CHANNEL SETTINGS
# -----------------

class ChannelSettingsFields(BaseModel):
    channel_id: str = Field(..., example="60b8d295f295a53b88f5a7c9")
    is_public: bool = Field(default=False, example=True)
    allow_comments: bool = Field(default=True, example=True)
    allow_ratings: bool = Field(default=True, example=True)
    allow_sharing: bool = Field(default=True, example=True)
    notification_preferences: Dict[str, bool] = Field(
        default_factory=lambda: {
            "new_comment": True,
            "new_rating": True,
            "new_enrollment": True
        },
        example={"new_comment": True, "new_rating": True, "new_enrollment": True}
    )
    last_updated: datetime = Field(default_factory=datetime.utcnow, example="2025-04-27T12:00:00")

class ChannelSettingsRequest(ChannelSettingsFields):
    pass

class ChannelSettings(Document, ChannelSettingsFields):
    id: PydanticObjectId = Field(default_factory=PydanticObjectId, alias="_id")

    class Settings:
        name = "channel_settings"

class ChannelSettingsResponse(ChannelSettingsFields):
    id: str = Field(..., example="settings_123")

    @field_validator('id', mode='before')
    def validate_id(cls, value: Any) -> str:
        if isinstance(value, (ObjectId, PydanticObjectId)):
            return str(value)
        return value

    class Config:
        orm_mode = True