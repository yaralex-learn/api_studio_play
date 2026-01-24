from pydantic import BaseModel, Field
from datetime import datetime
from beanie import Document, PydanticObjectId
from typing import List, Optional, Union, Literal, TYPE_CHECKING

if TYPE_CHECKING:
    from typing import ForwardRef


# ~~~~~~~~~~ DATABASE MODELS ~~~~~~~~~~ #

class File(Document):
    """File document model for MongoDB"""
    name: str = Field(..., example="document.pdf")
    content_type: str = Field(..., example="application/pdf")
    file_format: str = Field(..., example="pdf")
    size: int = Field(..., example=102400)
    created_at: datetime = Field(default_factory=datetime.utcnow, example="2025-01-01T12:00:00")
    owner: PydanticObjectId = Field(..., example="60b8d295f295a53b88f5owner")
    thumbnail: Optional[PydanticObjectId] = Field(None, example="60b8d295f295a53b88f5thumb")
    thumbnail_base64: Optional[str] = Field(None, description="Base64 encoded thumbnail data")
    gridfs_file_id: PydanticObjectId = Field(..., example="60b8d295f295a53b88f5file")
    directory_id: Optional[PydanticObjectId] = Field(None, example="60b8d295f295a53b88f5dir")

    class Settings:
        name = "space_files"


class Directory(Document):
    """Directory document model for MongoDB"""
    name: str = Field(..., example="Documents")
    owner: PydanticObjectId = Field(..., example="60b8d295f295a53b88f5owner")
    parent_id: Optional[PydanticObjectId] = Field(None, example="60b8d295f295a53b88f5parent")
    created_at: datetime = Field(default_factory=datetime.utcnow, example="2025-01-01T12:00:00")

    class Settings:
        name = "space_directories"


# ~~~~~~~~~~ REQUEST MODELS ~~~~~~~~~~ #

class DirectoryCreateRequest(BaseModel):
    """Request model for creating a directory"""
    parent_id: Optional[str] = Field(None, example="60b8d295f295a53b88f5parent")
    name: str = Field(..., example="New Folder")


class FileMoveRequest(BaseModel):
    """Request model for moving a file"""
    parent_id: Optional[str] = Field(None, example="60b8d295f295a53b88f5parent")


class DirectoryUpdateRequest(BaseModel):
    """Request model for updating a directory"""
    name: str = Field(..., example="Updated Folder Name")


# ~~~~~~~~~~ RESPONSE MODELS ~~~~~~~~~~ #

class Breadcrumb(BaseModel):
    """Breadcrumb item for navigation"""
    id: str = Field(..., example="60b8d295f295a53b88f5dir")
    name: str = Field(..., example="Documents")


class FileResponse(BaseModel):
    """Response model for file data"""
    id: str = Field(..., example="60b8d295f295a53b88f5file")
    name: str = Field(..., example="document.pdf")
    content_type: str = Field(..., example="application/pdf")
    file_format: str = Field(..., example="pdf")
    size: int = Field(..., example=102400)
    created_at: datetime = Field(..., example="2025-01-01T12:00:00")
    owner: str = Field(..., example="60b8d295f295a53b88f5owner")
    thumbnail: Optional[str] = Field(None, example="60b8d295f295a53b88f5thumb")
    gridfs_file_id: str = Field(..., example="60b8d295f295a53b88f5file")
    directory_id: Optional[str] = Field(None, example="60b8d295f295a53b88f5dir")
    
    # Thumbnail related fields
    has_thumbnail: bool = Field(False, description="Whether file has a thumbnail")
    thumbnail_url: Optional[str] = Field(None, description="URL to get thumbnail")
    thumbnail_data: Optional[str] = Field(None, description="Base64 encoded thumbnail data (optional)")


class DirResponse(BaseModel):
    """Enhanced response model for directory data with optional contents"""
    id: str = Field(..., example="60b8d295f295a53b88f5dir")
    name: str = Field(..., example="Documents")
    owner: str = Field(..., example="60b8d295f295a53b88f5owner")
    parent_id: Optional[str] = Field(None, example="60b8d295f295a53b88f5parent")
    created_at: datetime = Field(..., example="2025-01-01T12:00:00")
    
    # Directory contents (optional)
    contents: Optional[List[Union[FileResponse, "DirResponse"]]] = Field(
        None, 
        description="Directory contents (files and subdirectories). None if not loaded."
    )
    
    # Content statistics
    files_count: int = Field(0, description="Number of files in directory")
    directories_count: int = Field(0, description="Number of subdirectories")
    total_size: int = Field(0, description="Total size of all files in bytes")
    
    # Breadcrumb path
    breadcrumb: Optional[List[Breadcrumb]] = Field(
        None, 
        description="Breadcrumb path from root to current directory"
    )


class SpaceResponse(BaseModel):
    """Response model for space information with content"""
    used_space_mb: int = Field(..., example=84)
    free_space_mb: int = Field(..., example=940)
    total_space_mb: int = Field(..., example=1024)
    used_space_percentage: int = Field(..., example=8)
    content: List[Union[FileResponse, DirResponse]] = Field(
        default_factory=list,
        example=[
            {
                "id": "60b8d295f295a53b88f5file",
                "name": "document.pdf",
                "content_type": "application/pdf",
                "file_format": "pdf",
                "size": 102400,
                "created_at": "2025-01-01T12:00:00",
                "owner": "60b8d295f295a53b88f5owner",
                "thumbnail": None,
                "gridfs_file_id": "60b8d295f295a53b88f5file",
                "directory_id": None
            }
        ]
    )


# ~~~~~~~~~~ SUCCESS RESPONSE MODELS ~~~~~~~~~~ #

class SuccessResponse(BaseModel):
    """Generic success response"""
    success: bool = Field(True, example=True)
    message: Optional[str] = Field(None, example="Operation completed successfully")
    data: Optional[dict] = Field(None, example={})


# Forward reference resolution
DirResponse.model_rebuild() 