from app.services.file_service import FileService
from app.database import get_gridfs


async def get_file_service() -> FileService:
    """Get FileService instance with GridFS bucket"""
    gridfs_bucket = await get_gridfs()
    return FileService(gridfs_bucket) 