from pydantic import BaseModel, Field
from datetime import datetime
from beanie import Document, PydanticObjectId
from typing import Optional


class File(Document):
    """Gallery file model compatible with Space API"""
    name: str = Field(..., example="document.pdf")
    content_type: str = Field(..., example="application/pdf", alias="file_type")
    file_format: str = Field(..., example="pdf")
    size: int = Field(..., example=102400)
    creation_time: datetime = Field(default_factory=datetime.utcnow, example="2025-01-01T12:00:00", alias="created_at")
    owner: PydanticObjectId = Field(..., example="60b8d295f295a53b88f5owner")
    thumbnail: Optional[PydanticObjectId] = Field(None, example="60b8d295f295a53b88f5thumb")
    thumbnail_base64: Optional[str] = Field(None, description="Base64 encoded thumbnail data")
    gridfs_file_id: PydanticObjectId = Field(..., example="60b8d295f295a53b88f5file")
    directory_id: Optional[PydanticObjectId] = Field(None, example="60b8d295f295a53b88f5dir")

    class Settings:
        name = "gallery_files"


class Dir(Document):
    """Gallery directory model compatible with Space API"""
    name: str = Field(..., example="Documents")
    owner: PydanticObjectId = Field(..., example="60b8d295f295a53b88f5owner")
    parent_id: Optional[PydanticObjectId] = Field(None, example="60b8d295f295a53b88f5parent")
    created_at: datetime = Field(default_factory=datetime.utcnow, example="2025-01-01T12:00:00")

    class Settings:
        name = "gallery_directories" 