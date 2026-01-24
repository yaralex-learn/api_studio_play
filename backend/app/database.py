from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket

from app.settings import MONGO_URI

from app.models.user import User
from app.models.channel import (
    Channel, ChannelInfo, PublishChannel, Tier, FreeAccess, Coupon,
    SectionOutline, Section, UnitOutline, Unit,
    ActivityOutline, Activity, LessonOutline, Lesson,
    QuizOutline, Question
)
# Add Space and Gallery models
from app.models.space import File as SpaceFile, Directory as SpaceDirectory
from app.models.gallery import File as GalleryFile, Dir as GalleryDir
# Add Play models
from app.models.play import PlayerProgress


fs = None


# App models
MODELS = [User]
MODELS += [
    Channel, ChannelInfo, PublishChannel, Tier, FreeAccess, Coupon,
    SectionOutline, Section, UnitOutline, Unit,
    ActivityOutline, Activity, LessonOutline, Lesson,
    QuizOutline, Question
]
# Add Space and Gallery models to MODELS list
MODELS += [SpaceFile, SpaceDirectory, GalleryFile, GalleryDir]
# Add Play models to MODELS list  
MODELS += [PlayerProgress]


# Initialize the database
async def init_db():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client.get_database()
    await init_beanie(database=db, document_models=MODELS)
    fs = AsyncIOMotorGridFSBucket(db)
    return fs


async def get_gridfs():
    """Get GridFS bucket for file operations"""
    global fs
    if fs is None:
        await init_db()
    return fs
