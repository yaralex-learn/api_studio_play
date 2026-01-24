from fastapi import APIRouter, Path, Depends, HTTPException
from fastapi.responses import StreamingResponse
import io

from app.utils.user import get_user_id
from app.services.file_service import FileService
from app.services.dependencies import get_file_service
from app.models.gallery import File as GalleryFile
from app.models.user import User
from app.models.channel import Channel
from app.models.play import PlayerProgress
from beanie import PydanticObjectId

api = APIRouter()


async def verify_subscription_access(file_id: str, user_id: str) -> tuple[GalleryFile, bool]:
    """Verify user has subscription access to file"""
    # Get user and verify exists
    user = await User.find_one({"_id": PydanticObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=403, detail="User not found")
    
    # Get file and verify it exists
    file_doc = await GalleryFile.find_one({"_id": PydanticObjectId(file_id)})
    if not file_doc:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Get channel and verify subscription  
    channel = await Channel.find_one({"user_id": PydanticObjectId(file_doc.owner)})
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    
    # Check if user has PlayerProgress (which indicates subscription)
    player_progress = await PlayerProgress.find_one({
        "player_id": str(user_id),
        "channel_id": str(channel.channel_id)
    })
    
    if not player_progress:
        raise HTTPException(status_code=403, detail="Access denied - subscription required")
    
    return file_doc, True


@api.get("/file/{file_id}/")
async def download_file(
    file_id: str = Path(..., description="The ID of the file to download"),
    uid: str = Depends(get_user_id),
    file_service: FileService = Depends(get_file_service)
):
    """
    Download a file from a subscribed channel.
    
    **Security:**
    - Requires valid subscription to channel that owns the file
    - Validates user subscription status
    
    **Request:**
    - Path parameter file_id
    
    **Response:**
    - Streaming file download
    """
    try:
        print(f"🎯 Testing with file ID: {file_id}")
        # Verify subscription access
        file_doc, _ = await verify_subscription_access(file_id, uid)
        
        # Get file content from GridFS
        grid_out = await file_service.fs.open_download_stream(file_doc.gridfs_file_id)
        file_content = await grid_out.read()
        
        # Create streaming response
        return StreamingResponse(
            io.BytesIO(file_content),
            media_type=file_doc.content_type or "application/octet-stream",
            headers={
                "Content-Disposition": f'attachment; filename="{file_doc.name}"',
                "Content-Length": str(len(file_content))
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File download failed: {str(e)}")


@api.get("/file/{file_id}/thumbnail/")
async def get_file_thumbnail(
    file_id: str = Path(..., description="The ID of the file to get thumbnail for"),
    uid: str = Depends(get_user_id),
    file_service: FileService = Depends(get_file_service)
):
    """
    Get thumbnail for a file from a subscribed channel.
    
    **Security:**
    - Requires valid subscription to channel that owns the file
    - Validates user subscription status
    
    **Request:**
    - Path parameter file_id
    
    **Response:**
    - Thumbnail image (JPEG)
    """
    try:
        # Verify subscription access
        file_doc, _ = await verify_subscription_access(file_id, uid)
        
        # Get thumbnail data
        thumbnail_data = await file_service.get_file_thumbnail(file_id, str(file_doc.owner))
        if not thumbnail_data:
            raise HTTPException(status_code=404, detail="Thumbnail not found")
        
        # Return thumbnail as streaming response
        return StreamingResponse(
            io.BytesIO(thumbnail_data),
            media_type="image/jpeg",
            headers={"Cache-Control": "public, max-age=3600"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Thumbnail retrieval failed: {str(e)}") 