from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import sys
import os
# Add the parent directory to the Python path so we can import app settings
# sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.settings import MONGO_URI

# List of all collections in the database
COLLECTIONS = [
    "users",                    # User accounts and profiles
    "channels",                 # Channel information
    "section_outlines",         # Section outlines
    "sections",                 # Sections
    "unit_outlines",           # Unit outlines
    "units",                   # Units
    "activity_outlines",       # Activity outlines
    "activities",              # Activities
    "lesson_outlines",         # Lesson outlines
    "lessons",                 # Lessons
    "quiz_outlines",           # Quiz outlines
    "questions",               # Questions
    "channel_settings",        # Channel settings
    "user_progress",           # User progress tracking
    "file_items",              # File items
    "files",                   # Files
    "dirs",                    # Directories
    "errors"                   # Error logs
]

async def drop_collections():
    """Drop all collections from the database."""
    try:
        # Connect to MongoDB
        client = AsyncIOMotorClient(MONGO_URI)
        db = client.get_database()
        
        # Get list of existing collections
        existing_collections = await db.list_collection_names()
        
        # Drop each collection if it exists
        for collection in COLLECTIONS:
            if collection in existing_collections:
                print(f"Dropping collection: {collection}")
                await db[collection].drop()
                print(f"✓ Dropped {collection}")
            else:
                print(f"Collection not found: {collection}")
        
        print("\nDatabase cleanup completed successfully!")
        
    except Exception as e:
        print(f"Error during database cleanup: {str(e)}")
        sys.exit(1)
    finally:
        client.close()

if __name__ == "__main__":
    # Confirm before proceeding
    print("WARNING: This script will drop ALL collections from the database!")
    print("This action cannot be undone.")
    response = input("Are you sure you want to continue? (yes/no): ")
    
    if response.lower() == "yes":
        asyncio.run(drop_collections())
    else:
        print("Operation cancelled.")
        sys.exit(0) 