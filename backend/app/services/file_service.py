from motor.motor_asyncio import AsyncIOMotorGridFSBucket
from fastapi import UploadFile, HTTPException
from typing import List, Optional, Tuple, Dict, Any
from beanie import PydanticObjectId
import io
import os
from datetime import datetime

# Import both Space and Gallery models for compatibility
from app.models.space import File as SpaceFile, Directory as SpaceDirectory
try:
    from app.models.gallery import File as GalleryFile, Dir as GalleryDir
except ImportError:
    # Fallback if gallery models don't exist
    GalleryFile = SpaceFile
    GalleryDir = SpaceDirectory


class FileService:
    """Enhanced file service for Space API with thumbnail support"""
    
    def __init__(self, gridfs_bucket: AsyncIOMotorGridFSBucket):
        self.fs = gridfs_bucket
        
    async def upload_file(
        self, 
        file: UploadFile, 
        owner_id: str, 
        directory_id: Optional[str] = None
    ) -> GalleryFile:
        """Upload a file with automatic thumbnail generation"""
        try:
            # Read file content
            file_content = await file.read()
            file_size = len(file_content)
            
            # Upload to GridFS
            grid_file_id = await self.fs.upload_from_stream(
                file.filename,
                io.BytesIO(file_content),
                metadata={
                    "content_type": file.content_type,
                    "owner": owner_id,
                    "upload_date": datetime.utcnow()
                }
            )
            
            # Create file document
            file_doc = GalleryFile(
                name=file.filename,
                content_type=file.content_type or "application/octet-stream",
                file_format=file.filename.split('.')[-1].lower() if '.' in file.filename else 'unknown',
                size=file_size,
                owner=PydanticObjectId(owner_id),
                gridfs_file_id=grid_file_id,
                directory_id=PydanticObjectId(directory_id) if directory_id else None,
                creation_time=datetime.utcnow()
            )
            
            # Save file document
            await file_doc.insert()
            
            # Generate thumbnail asynchronously (don't wait for it)
            try:
                await self.generate_thumbnail(file_doc, file_content)
            except Exception as e:
                # Log thumbnail generation error but don't fail upload
                print(f"Thumbnail generation failed for {file.filename}: {str(e)}")
            
            return file_doc
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")
    
    async def get_file(self, file_id: str, owner_id: str) -> Tuple[GalleryFile, Any]:
        """Get file metadata and GridFS stream"""
        # Find file document
        file_doc = await GalleryFile.find_one({
            "_id": PydanticObjectId(file_id),
            "owner": PydanticObjectId(owner_id)
        })
        
        if not file_doc:
            raise HTTPException(status_code=404, detail="File not found")
        
        # Get GridFS stream
        try:
            grid_out = await self.fs.open_download_stream(file_doc.gridfs_file_id)
            return file_doc, grid_out
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"File retrieval failed: {str(e)}")
    
    async def delete_file(self, file_id: str, owner_id: str) -> bool:
        """Delete a file and its GridFS data"""
        # Find file document
        file_doc = await GalleryFile.find_one({
            "_id": PydanticObjectId(file_id),
            "owner": PydanticObjectId(owner_id)
        })
        
        if not file_doc:
            raise HTTPException(status_code=404, detail="File not found")
        
        try:
            # Delete from GridFS
            await self.fs.delete(file_doc.gridfs_file_id)
            
            # Delete thumbnail if exists
            if file_doc.thumbnail:
                try:
                    await self.fs.delete(file_doc.thumbnail)
                except Exception:
                    pass  # Ignore thumbnail deletion errors
            
            # Delete file document
            await file_doc.delete()
            
            return True
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"File deletion failed: {str(e)}")
    
    async def move_file(
        self, 
        file_id: str, 
        owner_id: str, 
        target_directory_id: Optional[str]
    ) -> GalleryFile:
        """Move a file to a different directory"""
        # Find file document
        file_doc = await GalleryFile.find_one({
            "_id": PydanticObjectId(file_id),
            "owner": PydanticObjectId(owner_id)
        })
        
        if not file_doc:
            raise HTTPException(status_code=404, detail="File not found")
        
        # Verify target directory exists if provided
        if target_directory_id:
            target_dir = await GalleryDir.find_one({
                "_id": PydanticObjectId(target_directory_id),
                "owner": PydanticObjectId(owner_id)
            })
            if not target_dir:
                raise HTTPException(status_code=404, detail="Target directory not found")
        
        # Update directory_id
        file_doc.directory_id = PydanticObjectId(target_directory_id) if target_directory_id else None
        await file_doc.save()
        
        return file_doc
    
    async def list_user_files(
        self, 
        owner_id: str, 
        directory_id: Optional[str] = None
    ) -> Tuple[List[GalleryFile], List[GalleryDir]]:
        """List files and directories for a user in a specific directory"""
        try:
            # Convert directory_id to proper query format
            dir_filter = {}
            if directory_id:
                dir_filter["directory_id"] = PydanticObjectId(directory_id)
            else:
                dir_filter["directory_id"] = None
            
            # Get files in directory
            files = await GalleryFile.find({
                "owner": PydanticObjectId(owner_id),
                **dir_filter
            }).to_list()
            
            # Get subdirectories
            parent_filter = {}
            if directory_id:
                parent_filter["parent_id"] = PydanticObjectId(directory_id)
            else:
                parent_filter["parent_id"] = None
            
            directories = await GalleryDir.find({
                "owner": PydanticObjectId(owner_id),
                **parent_filter
            }).to_list()
            
            return files, directories
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"File listing failed: {str(e)}")
    
    async def create_directory(
        self, 
        name: str, 
        owner_id: str, 
        parent_id: Optional[str] = None
    ) -> GalleryDir:
        """Create a new directory"""
        try:
            # Verify parent directory exists if provided
            if parent_id:
                parent_dir = await GalleryDir.find_one({
                    "_id": PydanticObjectId(parent_id),
                    "owner": PydanticObjectId(owner_id)
                })
                if not parent_dir:
                    raise HTTPException(status_code=404, detail="Parent directory not found")
            
            # Create directory
            directory = GalleryDir(
                name=name,
                owner=PydanticObjectId(owner_id),
                parent_id=PydanticObjectId(parent_id) if parent_id else None,
                created_at=datetime.utcnow()
            )
            
            await directory.insert()
            return directory
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Directory creation failed: {str(e)}")
    
    async def update_directory(
        self, 
        dir_id: str, 
        owner_id: str, 
        name: str
    ) -> GalleryDir:
        """Update directory name"""
        directory = await GalleryDir.find_one({
            "_id": PydanticObjectId(dir_id),
            "owner": PydanticObjectId(owner_id)
        })
        
        if not directory:
            raise HTTPException(status_code=404, detail="Directory not found")
        
        directory.name = name
        await directory.save()
        
        return directory
    
    async def delete_directory(
        self, 
        dir_id: str, 
        owner_id: str, 
        recursive: bool = False
    ) -> bool:
        """Delete a directory and optionally its contents"""
        directory = await GalleryDir.find_one({
            "_id": PydanticObjectId(dir_id),
            "owner": PydanticObjectId(owner_id)
        })
        
        if not directory:
            raise HTTPException(status_code=404, detail="Directory not found")
        
        if recursive:
            # Delete all files in directory
            files = await GalleryFile.find({
                "directory_id": PydanticObjectId(dir_id),
                "owner": PydanticObjectId(owner_id)
            }).to_list()
            
            for file_doc in files:
                await self.delete_file(str(file_doc.id), owner_id)
            
            # Recursively delete subdirectories
            subdirs = await GalleryDir.find({
                "parent_id": PydanticObjectId(dir_id),
                "owner": PydanticObjectId(owner_id)
            }).to_list()
            
            for subdir in subdirs:
                await self.delete_directory(str(subdir.id), owner_id, recursive=True)
        
        # Delete directory
        await directory.delete()
        return True
    
    async def get_directory_stats(
        self, 
        dir_id: str, 
        owner_id: str
    ) -> Tuple[int, int, int]:
        """Get directory statistics: (files_count, directories_count, total_size)"""
        try:
            # Count files in directory
            files_count = await GalleryFile.count({
                "directory_id": PydanticObjectId(dir_id),
                "owner": PydanticObjectId(owner_id)
            })
            
            # Count subdirectories
            directories_count = await GalleryDir.count({
                "parent_id": PydanticObjectId(dir_id),
                "owner": PydanticObjectId(owner_id)
            })
            
            # Calculate total size
            files = await GalleryFile.find({
                "directory_id": PydanticObjectId(dir_id),
                "owner": PydanticObjectId(owner_id)
            }).to_list()
            
            total_size = sum(f.size for f in files)
            
            return files_count, directories_count, total_size
            
        except Exception:
            return 0, 0, 0
    
    async def get_directory_path(
        self, 
        dir_id: str, 
        owner_id: str
    ) -> List[Dict[str, str]]:
        """Get breadcrumb path to directory"""
        path = []
        current_id = dir_id
        
        while current_id:
            directory = await GalleryDir.find_one({
                "_id": PydanticObjectId(current_id),
                "owner": PydanticObjectId(owner_id)
            })
            
            if not directory:
                break
                
            path.insert(0, {
                "id": str(directory.id),
                "name": directory.name
            })
            
            current_id = str(directory.parent_id) if directory.parent_id else None
        
        return path
    
    async def generate_thumbnail(self, file_doc: GalleryFile, file_content: bytes) -> Optional[str]:
        """Generate thumbnail for a file"""
        try:
            # Import thumbnail service
            from app.services.thumbnail_service import ThumbnailService
            
            thumbnail_service = ThumbnailService(self.fs)
            thumbnail_data = await thumbnail_service.generate_thumbnail(
                file_content, 
                file_doc.file_format,
                file_doc.content_type
            )
            
            if thumbnail_data:
                # Save thumbnail as base64
                import base64
                file_doc.thumbnail_base64 = f"data:image/jpeg;base64,{base64.b64encode(thumbnail_data).decode('utf-8')}"
                await file_doc.save()
                return file_doc.thumbnail_base64
                
        except Exception as e:
            print(f"Thumbnail generation failed: {str(e)}")
            
        return None
    
    async def get_file_thumbnail(self, file_id: str, owner_id: str) -> Optional[bytes]:
        """Get thumbnail data for a file"""
        file_doc = await GalleryFile.find_one({
            "_id": PydanticObjectId(file_id),
            "owner": PydanticObjectId(owner_id)
        })
        
        if not file_doc:
            return None
        
        # Check for base64 thumbnail first
        if file_doc.thumbnail_base64:
            try:
                import base64
                # Extract base64 data after the comma
                if ',' in file_doc.thumbnail_base64:
                    base64_data = file_doc.thumbnail_base64.split(',')[1]
                else:
                    base64_data = file_doc.thumbnail_base64
                return base64.b64decode(base64_data)
            except Exception:
                pass
        
        # Check for GridFS thumbnail
        if file_doc.thumbnail:
            try:
                grid_out = await self.fs.open_download_stream(file_doc.thumbnail)
                return await grid_out.read()
            except Exception:
                pass
        
        return None 