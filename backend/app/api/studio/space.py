from fastapi import APIRouter, UploadFile, File, Path, Body, Depends, HTTPException, Form, Query
from fastapi.responses import StreamingResponse
from typing import Optional, List, Union, Literal
import io

from app.utils.user import get_user_id
from app.services.file_service import FileService
from app.services.dependencies import get_file_service
from app.models.gallery import File as GalleryFile, Dir as GalleryDir
from app.models.space import (
    DirectoryCreateRequest, FileMoveRequest, DirectoryUpdateRequest,
    Breadcrumb, FileResponse, DirResponse, SpaceResponse, SuccessResponse
)
from beanie import PydanticObjectId

api = APIRouter()

# Type aliases for better readability
SpaceFile = GalleryFile
SpaceDirectory = GalleryDir


# ~~~~~~~~~~ UTILITY FUNCTIONS ~~~~~~~~~~ #

def calculate_storage_stats(files_size: int, total_space_mb: int = 1024) -> dict:
    """Calculate storage statistics"""
    used_space_mb = round(files_size / (1024 * 1024), 2)
    free_space_mb = max(0, total_space_mb - used_space_mb)
    used_percentage = round((used_space_mb / total_space_mb) * 100, 2)
    
    return {
        "used_space_mb": int(used_space_mb),
        "free_space_mb": int(free_space_mb),
        "total_space_mb": total_space_mb,
        "used_space_percentage": int(used_percentage)
    }


def convert_file_to_response(file_doc: SpaceFile, include_thumbnail_data: bool = False) -> FileResponse:
    """Convert Space File document to FileResponse"""
    has_thumbnail = bool(file_doc.thumbnail_base64 or file_doc.thumbnail)
    
    file_response = FileResponse(
        id=str(file_doc.id),
        name=file_doc.name,
        content_type=file_doc.content_type or getattr(file_doc, 'file_type', 'application/octet-stream'),
        file_format=file_doc.name.split('.')[-1].lower() if '.' in file_doc.name else 'unknown',
        size=file_doc.size,
        created_at=file_doc.creation_time,
        owner=str(file_doc.owner),
        thumbnail=str(file_doc.thumbnail) if file_doc.thumbnail else None,
        gridfs_file_id=str(file_doc.gridfs_file_id),
        directory_id=str(file_doc.directory_id) if file_doc.directory_id else None,
        has_thumbnail=has_thumbnail,
        thumbnail_url=f"/studio/space/file/{str(file_doc.id)}/thumbnail/" if has_thumbnail else None,
        thumbnail_data=file_doc.thumbnail_base64 if include_thumbnail_data else None
    )
    
    return file_response


async def convert_file_to_response_with_thumbnail(
    file_doc: SpaceFile, 
    file_service: FileService,
    include_thumbnail_data: bool = False
) -> FileResponse:
    """Convert Space File document to FileResponse with enhanced thumbnail loading"""
    file_response = convert_file_to_response(file_doc, include_thumbnail_data)
    
    # If thumbnail data requested but not available, try to load it
    if include_thumbnail_data and not file_response.thumbnail_data:
        try:
            thumbnail_data = await file_service.get_file_thumbnail(str(file_doc.id), str(file_doc.owner))
            if thumbnail_data:
                # Convert binary data to base64
                import base64
                file_response.thumbnail_data = f"data:image/jpeg;base64,{base64.b64encode(thumbnail_data).decode('utf-8')}"
        except Exception as e:
            # Log error but don't fail the response
            print(f"Failed to load thumbnail data for file {file_doc.id}: {str(e)}")
    
    return file_response

async def convert_dir_to_response(
    dir_doc: SpaceDirectory, 
    file_service: FileService,
    load_contents: bool = True,
    max_depth: int = 5,
    current_depth: int = 0
) -> DirResponse:
    """Convert Space Directory document to DirResponse with full tree structure"""
    try:
        # Always get accurate directory statistics (lightweight query)
        files_count, directories_count, total_size = await file_service.get_directory_stats(
            str(dir_doc.id), 
            str(dir_doc.owner)
        )
        
        contents = None
        if load_contents and current_depth < max_depth:
            # Load actual files and subdirectories
            files, subdirs = await file_service.list_user_files(
                str(dir_doc.owner), 
                str(dir_doc.id)
            )
            
            # Convert files to response format
            file_responses = [convert_file_to_response(f) for f in files]
            
            # Recursively convert subdirectories with full contents
            dir_responses = []
            for subdir in subdirs:
                subdir_resp = await convert_dir_to_response(
                    subdir, 
                    file_service, 
                    load_contents=True,               # Always load contents
                    max_depth=max_depth,
                    current_depth=current_depth + 1   # Increment depth
                )
                dir_responses.append(subdir_resp)
            
            # Combine files and directories
            contents = file_responses + dir_responses
        
        return DirResponse(
            id=str(dir_doc.id),
            name=dir_doc.name,
            owner=str(dir_doc.owner),
            parent_id=str(dir_doc.parent_id) if dir_doc.parent_id else None,
            created_at=dir_doc.created_at,
            contents=contents,  # Will be actual array or None (if max depth exceeded)
            files_count=files_count,
            directories_count=directories_count,
            total_size=total_size,
            breadcrumb=None
        )
    except Exception as e:
        # Fallback to zero stats if there's an error
        return DirResponse(
            id=str(dir_doc.id),
            name=dir_doc.name,
            owner=str(dir_doc.owner),
            parent_id=str(dir_doc.parent_id) if dir_doc.parent_id else None,
            created_at=dir_doc.created_at,
            contents=None,
            files_count=0,
            directories_count=0,
            total_size=0,
            breadcrumb=None
        )

async def convert_dir_to_response_with_contents(
    dir_doc: SpaceDirectory, 
    file_service: FileService,
    include_contents: bool = False,
    include_breadcrumb: bool = False,
    include_thumbnail_data: bool = False
) -> DirResponse:
    """Convert Space Directory document to DirResponse with optional contents"""
    
    # Basic directory info
    dir_response = DirResponse(
        id=str(dir_doc.id),
        name=dir_doc.name,
        owner=str(dir_doc.owner),
        parent_id=str(dir_doc.parent_id) if dir_doc.parent_id else None,
        created_at=dir_doc.created_at
    )
    
    if include_contents:
        # Get directory contents
        files, subdirs = await file_service.list_user_files(
            str(dir_doc.owner), 
            str(dir_doc.id)
        )
        
        # Convert files to response format with optional thumbnail data
        if include_thumbnail_data:
            # Load thumbnail data for files (slower but complete)
            file_responses = []
            for f in files:
                file_resp = await convert_file_to_response_with_thumbnail(
                    f, file_service, include_thumbnail_data=True
                )
                file_responses.append(file_resp)
        else:
            # Just include thumbnail URLs (faster)
            file_responses = [convert_file_to_response(f) for f in files]
        
        # Subdirectories without contents (prevent recursive loading)
        dir_responses = []
        for d in subdirs:
            dir_resp = await convert_dir_to_response(
                d, 
                file_service, 
                load_contents=False,
                max_depth=5,
                current_depth=0
            )
            dir_responses.append(dir_resp)
        
        # Combine contents
        dir_response.contents = file_responses + dir_responses
        dir_response.files_count = len(files)
        dir_response.directories_count = len(subdirs)
        dir_response.total_size = sum(f.size for f in files)
    
    if include_breadcrumb:
        # Get breadcrumb path
        breadcrumb_path = await file_service.get_directory_path(
            str(dir_doc.id), 
            str(dir_doc.owner)
        )
        dir_response.breadcrumb = [
            Breadcrumb(id=item["id"], name=item["name"]) 
            for item in breadcrumb_path
        ]
    
    return dir_response


# ~~~~~~~~~~ ENDPOINTS ~~~~~~~~~~ #

@api.get("/", response_model=SpaceResponse)
async def get_space(
    directory_id: Optional[str] = None,
    uid: str = Depends(get_user_id),
    file_service: FileService = Depends(get_file_service)
):
    """
    Get space information with files and directories.
    
    **Query Parameters:**
    - directory_id: Optional directory ID to list contents of (None for root)
    
    **Response:**
    - Space usage statistics and content list
    """
    try:
        # Get files and directories
        files, dirs = await file_service.list_user_files(uid, directory_id)
        
        # Calculate total size of all user files
        total_files, _ = await file_service.list_user_files(uid, None)
        total_size = sum(f.size for f in total_files)
        
        # Convert to response format
        file_responses = [convert_file_to_response(f) for f in files]
        
        # Convert directories to responses with full tree structure (max 5 levels)
        dir_responses = []
        for d in dirs:
            dir_resp = await convert_dir_to_response(
                d, 
                file_service, 
                load_contents=True,    # Always load full tree
                max_depth=5,          # Up to 5 levels deep
                current_depth=0       # Starting at root level
            )
            dir_responses.append(dir_resp)
        
        # Calculate storage stats
        storage_stats = calculate_storage_stats(total_size)
        
        # Combine files and directories
        content = file_responses + dir_responses
        
        return SpaceResponse(
            used_space_mb=storage_stats["used_space_mb"],
            free_space_mb=storage_stats["free_space_mb"],
            total_space_mb=storage_stats["total_space_mb"],
            used_space_percentage=storage_stats["used_space_percentage"],
            content=content
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@api.post("/file/", response_model=FileResponse)
async def upload_file(
    file: UploadFile = File(...),
    directory_id: Optional[str] = Form(None),
    uid: str = Depends(get_user_id),
    file_service: FileService = Depends(get_file_service)
):
    """
    Upload a file to the space.
    
    **Request:**
    - file: The file to upload (multipart/form-data)
    - directory_id: Optional directory ID to upload to (Form data)
    
    **Response:**
    - Uploaded file details
    """
    try:
        # Upload file using service
        uploaded_file = await file_service.upload_file(
            file=file,
            owner_id=uid,
            directory_id=directory_id
        )
        
        return convert_file_to_response(uploaded_file)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@api.post("/dir/", response_model=DirResponse)
async def create_directory(
    request: DirectoryCreateRequest = Body(...),
    uid: str = Depends(get_user_id),
    file_service: FileService = Depends(get_file_service)
):
    """
    Create a new directory.
    
    **Request:**
    - JSON body with name and optional parent_id
    
    **Response:**
    - Created directory details
    """
    try:
        new_dir = await file_service.create_directory(
            name=request.name,
            owner_id=uid,
            parent_id=request.parent_id
        )
        
        return await convert_dir_to_response(
            new_dir, 
            file_service, 
            load_contents=True,
            max_depth=5,
            current_depth=0
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Directory creation failed: {str(e)}")


@api.delete("/file/{file_id}/", response_model=SpaceResponse)
async def delete_file(
    file_id: str = Path(..., description="The ID of the file to delete"),
    uid: str = Depends(get_user_id),
    file_service: FileService = Depends(get_file_service)
):
    """
    Delete a file from the space.
    
    **Request:**
    - Path parameter file_id
    
    **Response:**
    - Updated space information
    """
    try:
        # Delete file
        await file_service.delete_file(file_id, uid)
        
        # Return updated space info
        return await get_space(None, uid, file_service)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File deletion failed: {str(e)}")


@api.put("/file/{file_id}/", response_model=SpaceResponse)
async def move_file(
    file_id: str = Path(..., description="The ID of the file to move"),
    request: FileMoveRequest = Body(...),
    uid: str = Depends(get_user_id),
    file_service: FileService = Depends(get_file_service)
):
    """
    Move a file to a different directory.
    
    **Request:**
    - Path parameter file_id
    - JSON body with parent_id
    
    **Response:**
    - Updated space information
    """
    try:
        # Move file
        await file_service.move_file(
            file_id=file_id,
            owner_id=uid,
            target_directory_id=request.parent_id
        )
        
        # Return updated space info
        return await get_space(None, uid, file_service)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File move failed: {str(e)}")


@api.delete("/dir/{dir_id}/", response_model=SpaceResponse)
async def delete_directory(
    dir_id: str = Path(..., description="The ID of the directory to delete"),
    uid: str = Depends(get_user_id),
    file_service: FileService = Depends(get_file_service)
):
    """
    Delete a directory and its contents.
    
    **Request:**
    - Path parameter dir_id
    
    **Response:**
    - Updated space information
    """
    try:
        # Delete directory recursively
        await file_service.delete_directory(
            dir_id=dir_id,
            owner_id=uid,
            recursive=True
        )
        
        # Return updated space info
        return await get_space(None, uid, file_service)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Directory deletion failed: {str(e)}")


@api.put("/dir/{dir_id}/", response_model=SpaceResponse)
async def update_directory(
    dir_id: str = Path(..., description="The ID of the directory to update"),
    request: DirectoryUpdateRequest = Body(...),
    uid: str = Depends(get_user_id),
    file_service: FileService = Depends(get_file_service)
):
    """
    Update directory name.
    
    **Request:**
    - Path parameter dir_id
    - JSON body with name
    
    **Response:**
    - Updated space information
    """
    try:
        # Update directory
        await file_service.update_directory(
            dir_id=dir_id,
            owner_id=uid,
            name=request.name
        )
        
        # Return updated space info
        return await get_space(None, uid, file_service)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Directory update failed: {str(e)}")


@api.get("/file/{file_id}/")
async def download_file(
    file_id: str = Path(..., description="The ID of the file to download"),
    uid: str = Depends(get_user_id),
    file_service: FileService = Depends(get_file_service)
):
    """
    Download a file from the space.
    
    **Request:**
    - Path parameter file_id
    
    **Response:**
    - Streaming file response
    """
    try:
        # Get file metadata and GridFS stream
        file_doc, grid_out = await file_service.get_file(file_id, uid)
        
        # Read file content
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
    Get thumbnail for a file.
    
    **Request:**
    - Path parameter file_id
    
    **Response:**
    - Thumbnail image (JPEG)
    """
    try:
        # Get thumbnail data
        thumbnail_data = await file_service.get_file_thumbnail(file_id, uid)
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


@api.post("/thumbnails/batch/")
async def get_thumbnails_batch(
    file_ids: list[str] = Body(..., description="List of file IDs to get thumbnails for"),
    format: Literal["url", "base64"] = Body("url", description="Response format: 'url' or 'base64'"),
    uid: str = Depends(get_user_id),
    file_service: FileService = Depends(get_file_service)
):
    """
    Get thumbnails for multiple files in batch.
    
    **Request:**
    - JSON body with file_ids array and format preference
    
    **Response:**
    - Array of thumbnail information
    """
    try:
        thumbnails = []
        
        for file_id in file_ids:
            try:
                # Get file document
                file_doc = await SpaceFile.find_one({
                    "_id": PydanticObjectId(file_id), 
                    "owner": PydanticObjectId(uid)
                })
                
                if not file_doc:
                    continue
                
                # Build thumbnail response
                thumbnail_info = {
                    "file_id": file_id,
                    "has_thumbnail": bool(file_doc.thumbnail_base64 or file_doc.thumbnail),
                    "thumbnail_url": f"/studio/space/file/{file_id}/thumbnail/" if (file_doc.thumbnail_base64 or file_doc.thumbnail) else None
                }
                
                # Include base64 data if requested
                if format == "base64" and file_doc.thumbnail_base64:
                    thumbnail_info["thumbnail_base64"] = file_doc.thumbnail_base64
                
                thumbnails.append(thumbnail_info)
                
            except Exception:
                # Skip invalid file IDs
                continue
        
        return {
            "thumbnails": thumbnails,
            "total_requested": len(file_ids),
            "total_found": len(thumbnails)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch thumbnail operation failed: {str(e)}")


@api.get("/dir/{dir_id}/", response_model=SpaceResponse)
async def get_directory(
    dir_id: str = Path(..., description="The ID of the directory to get"),
    uid: str = Depends(get_user_id),
    file_service: FileService = Depends(get_file_service)
):
    """
    Get directory contents.
    
    **Request:**
    - Path parameter dir_id
    
    **Response:**
    - Space information for the specified directory
    """
    try:
        # Return space info for specific directory
        return await get_space(dir_id, uid, file_service)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Directory retrieval failed: {str(e)}")


@api.get("/dir/{dir_id}/details/", response_model=DirResponse)
async def get_directory_details(
    dir_id: str = Path(..., description="The ID of the directory to get details for"),
    include_contents: bool = Query(False, description="Include directory contents"),
    include_breadcrumb: bool = Query(False, description="Include breadcrumb path"),
    include_thumbnail_data: bool = Query(False, description="Include base64 thumbnail data (slower)"),
    uid: str = Depends(get_user_id),
    file_service: FileService = Depends(get_file_service)
):
    """
    Get detailed directory information with optional contents and breadcrumb.
    
    **Query Parameters:**
    - include_contents: Whether to include directory contents
    - include_breadcrumb: Whether to include breadcrumb navigation
    - include_thumbnail_data: Whether to include base64 thumbnail data
    
    **Response:**
    - Detailed directory information
    """
    try:
        # Find directory
        dir_doc = await SpaceDirectory.find_one({
            "_id": PydanticObjectId(dir_id), 
            "owner": PydanticObjectId(uid)
        })
        
        if not dir_doc:
            raise HTTPException(status_code=404, detail="Directory not found")
        
        # Convert to response with optional features
        return await convert_dir_to_response_with_contents(
            dir_doc, 
            file_service,
            include_contents=include_contents,
            include_breadcrumb=include_breadcrumb,
            include_thumbnail_data=include_thumbnail_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Directory details retrieval failed: {str(e)}") 