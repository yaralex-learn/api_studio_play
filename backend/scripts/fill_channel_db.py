import asyncio
from datetime import datetime
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from app.models.channel import (
    Channel, SectionOutline, Section, UnitOutline, Unit, ActivityOutline, Activity,
    LessonOutline, Lesson, QuizOutline, Question
)
from app.models.user import User
from app.settings import MONGO_URI

async def main_():
    # Connect to MongoDB
    client = AsyncIOMotorClient(MONGO_URI)
    await init_beanie(
        database=client.get_default_database(),
        document_models=[
            Channel, SectionOutline, Section, UnitOutline, Unit, ActivityOutline, Activity,
            LessonOutline, Lesson, QuizOutline, Question, User
        ]
    )

    # Create a user (if not exists)
    user = await User.find_one({"email": "demo@example.com"})
    if not user:
        user = User(
            email="demo@example.com",
            username="demo_user",
            first_name="Demo",
            last_name="User",
            bio="Demo user for channel population script.",
            hashed_password="hashedpassword",
            is_active=True,
            is_admin=False,
            created_at=datetime.utcnow()
        )
        await user.insert()

    # Create a channel
    channel = Channel(
        name="Python Basics",
        description="A channel for learning Python basics.",
        user_id=user.id,
        section_count=0,
        unit_count=0,
        lesson_count=0,
        quiz_count=0,
        total_lesson_quiz_count=0,
        enrolled_students=10,
        last_updated=datetime.utcnow(),
        outline_content={}
    )
    await channel.insert()

    # Create section outline and section
    section_outline = SectionOutline(
        channel_id=str(channel.id),
        name="Introduction",
        order=1
    )
    await section_outline.insert()

    section = Section(
        section_outline_id=str(section_outline.id),
        name="Introduction",
        description="Intro section.",
        url="https://example.com/section1.jpg",
        order=1
    )
    await section.insert()

    # Create unit outline and unit
    unit_outline = UnitOutline(
        section_outline_id=str(section_outline.id),
        name="Getting Started",
        order=1
    )
    await unit_outline.insert()

    unit = Unit(
        unit_outline_id=str(unit_outline.id),
        name="Getting Started",
        description="Getting started with Python.",
        url="https://example.com/unit1.jpg"
    )
    await unit.insert()

    # Create activity outline and activity
    activity_outline = ActivityOutline(
        unit_outline_id=str(unit_outline.id),
        name="First Steps",
        order=1,
        count=1,
        percentage=10
    )
    await activity_outline.insert()

    activity = Activity(
        activity_outline_id=str(activity_outline.id),
        description="First steps in Python.",
        url="https://example.com/activity1.jpg",
        difficulty_level=1,
        is_launched=True
    )
    await activity.insert()

    # Create lesson outline and lesson
    lesson_outline = LessonOutline(
        activity_outline_id=str(activity_outline.id),
        name="Hello World",
        order=1,
        count=1
    )
    await lesson_outline.insert()

    lesson = Lesson(
        lesson_outline_id=str(lesson_outline.id),
        lesson_type="text",
        text="print('Hello, World!')",
        urls=["https://example.com/lesson1"],
        question_lesson=None,
        order=1,
        is_launched=True,
        is_free=True
    )
    await lesson.insert()

    # Create quiz outline and quiz question
    quiz_outline = QuizOutline(
        activity_outline_id=str(activity_outline.id),
        name="Quiz 1",
        order=2,
        is_launched=True,
        is_free=False,
        count=1
    )
    await quiz_outline.insert()

    question = Question(
        quiz_outline_id=str(quiz_outline.id),
        time_limit=30,
        points=10,
        template={"type": "multiple_choice", "question": "What does print('Hello, World!') do?", "options": ["Prints text", "Saves file"]},
        generated_question=None,
        url=["https://example.com/q1.jpg"],
        check_function="def check_answer(ans): return ans == 'Prints text'",
        order=1,
        is_accepted=True
    )
    await question.insert()

    print("Sample channel data inserted.")

if __name__ == "__main__":
    asyncio.run(main_()) 