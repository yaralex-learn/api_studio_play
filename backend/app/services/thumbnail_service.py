from motor.motor_asyncio import AsyncIOMotorGridFSBucket
from typing import Optional
import io
from datetime import datetime

# Try to import required libraries with fallbacks
try:
    from PIL import Image, ImageDraw, ImageFont
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False

try:
    import PyPDF2
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False

# Import settings
try:
    from app.settings import THUMBNAIL
except ImportError:
    # Fallback settings
    class THUMBNAIL:
        class IMAGE:
            WIDTH = 200
            HEIGHT = 200
            QUALITY = 85
        class VIDEO:
            WIDTH = 200
            HEIGHT = 200
            QUALITY = 80
        class DOCUMENT:
            WIDTH = 200
            HEIGHT = 200
            QUALITY = 85
        class AUDIO:
            WIDTH = 200
            HEIGHT = 200
            QUALITY = 85
        IMAGE_TYPES = {'jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp'}
        VIDEO_TYPES = {'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'}
        DOCUMENT_TYPES = {'pdf', 'doc', 'docx', 'txt'}
        AUDIO_TYPES = {'mp3', 'wav', 'flac', 'aac', 'ogg'}


class ThumbnailService:
    """Service for generating thumbnails for various file types"""
    
    def __init__(self, gridfs_bucket: AsyncIOMotorGridFSBucket):
        self.fs = gridfs_bucket
    
    async def generate_thumbnail(
        self, 
        file_content: bytes, 
        file_format: str, 
        content_type: str
    ) -> Optional[bytes]:
        """Generate thumbnail for a file based on its format"""
        file_format_lower = file_format.lower()
        
        try:
            if file_format_lower in THUMBNAIL.IMAGE_TYPES:
                return await self._generate_image_thumbnail(file_content)
            elif file_format_lower in THUMBNAIL.VIDEO_TYPES:
                return await self._generate_video_thumbnail(file_content)
            elif file_format_lower in THUMBNAIL.DOCUMENT_TYPES:
                return await self._generate_document_thumbnail(file_content, file_format_lower)
            elif file_format_lower in THUMBNAIL.AUDIO_TYPES:
                return await self._generate_audio_thumbnail()
            else:
                return await self._generate_default_thumbnail(file_format_lower)
                
        except Exception as e:
            print(f"Thumbnail generation error for {file_format}: {str(e)}")
            return await self._generate_default_thumbnail(file_format_lower)
    
    async def _generate_image_thumbnail(self, file_content: bytes) -> Optional[bytes]:
        """Generate thumbnail for image files"""
        if not PIL_AVAILABLE:
            return None
            
        try:
            # Open image
            image = Image.open(io.BytesIO(file_content))
            
            # Convert to RGB if necessary
            if image.mode in ('RGBA', 'LA', 'P'):
                # Create white background
                background = Image.new('RGB', image.size, (255, 255, 255))
                if image.mode == 'P':
                    image = image.convert('RGBA')
                background.paste(image, mask=image.split()[-1] if image.mode in ('RGBA', 'LA') else None)
                image = background
            elif image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Create thumbnail
            image.thumbnail(
                (THUMBNAIL.IMAGE.WIDTH, THUMBNAIL.IMAGE.HEIGHT), 
                Image.Resampling.LANCZOS
            )
            
            # Save as JPEG
            output = io.BytesIO()
            image.save(output, format='JPEG', quality=THUMBNAIL.IMAGE.QUALITY, optimize=True)
            return output.getvalue()
            
        except Exception as e:
            print(f"Image thumbnail generation failed: {str(e)}")
            return None
    
    async def _generate_video_thumbnail(self, file_content: bytes) -> Optional[bytes]:
        """Generate thumbnail for video files"""
        if not CV2_AVAILABLE or not PIL_AVAILABLE:
            return await self._generate_default_thumbnail('video')
            
        try:
            # Save video to temporary file
            import tempfile
            import os
            
            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_file:
                temp_file.write(file_content)
                temp_file_path = temp_file.name
            
            try:
                # Open video
                cap = cv2.VideoCapture(temp_file_path)
                
                if not cap.isOpened():
                    return await self._generate_default_thumbnail('video')
                
                # Get frame from middle of video
                frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
                middle_frame = frame_count // 2
                cap.set(cv2.CAP_PROP_POS_FRAMES, middle_frame)
                
                ret, frame = cap.read()
                cap.release()
                
                if not ret:
                    return await self._generate_default_thumbnail('video')
                
                # Convert BGR to RGB
                frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                
                # Create PIL image
                image = Image.fromarray(frame)
                
                # Create thumbnail
                image.thumbnail(
                    (THUMBNAIL.VIDEO.WIDTH, THUMBNAIL.VIDEO.HEIGHT), 
                    Image.Resampling.LANCZOS
                )
                
                # Save as JPEG
                output = io.BytesIO()
                image.save(output, format='JPEG', quality=THUMBNAIL.VIDEO.QUALITY, optimize=True)
                return output.getvalue()
                
            finally:
                # Clean up temp file
                try:
                    os.unlink(temp_file_path)
                except Exception:
                    pass
                    
        except Exception as e:
            print(f"Video thumbnail generation failed: {str(e)}")
            return await self._generate_default_thumbnail('video')
    
    async def _generate_document_thumbnail(self, file_content: bytes, file_format: str) -> Optional[bytes]:
        """Generate thumbnail for document files"""
        if file_format == 'pdf':
            return await self._generate_pdf_thumbnail(file_content)
        else:
            return await self._generate_default_thumbnail('document')
    
    async def _generate_pdf_thumbnail(self, file_content: bytes) -> Optional[bytes]:
        """Generate thumbnail for PDF files"""
        if not PDF_AVAILABLE or not PIL_AVAILABLE:
            return await self._generate_default_thumbnail('pdf')
            
        try:
            # Read PDF
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
            
            if len(pdf_reader.pages) == 0:
                return await self._generate_default_thumbnail('pdf')
            
            # For now, create a simple PDF icon
            # In production, you might want to use a library like pdf2image
            return await self._generate_default_thumbnail('pdf')
            
        except Exception as e:
            print(f"PDF thumbnail generation failed: {str(e)}")
            return await self._generate_default_thumbnail('pdf')
    
    async def _generate_audio_thumbnail(self) -> Optional[bytes]:
        """Generate thumbnail for audio files"""
        return await self._generate_default_thumbnail('audio')
    
    async def _generate_default_thumbnail(self, file_type: str) -> Optional[bytes]:
        """Generate a default icon-based thumbnail"""
        if not PIL_AVAILABLE:
            return None
            
        try:
            # Create thumbnail with file type icon
            image = Image.new('RGB', (THUMBNAIL.IMAGE.WIDTH, THUMBNAIL.IMAGE.HEIGHT), color=(240, 240, 240))
            draw = ImageDraw.Draw(image)
            
            # Draw border
            draw.rectangle([0, 0, THUMBNAIL.IMAGE.WIDTH-1, THUMBNAIL.IMAGE.HEIGHT-1], outline=(200, 200, 200), width=2)
            
            # Try to load font
            try:
                font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 24)
            except Exception:
                try:
                    font = ImageFont.load_default()
                except Exception:
                    font = None
            
            # Draw file type text
            if font:
                text = file_type.upper()[:4]  # Limit to 4 characters
                bbox = draw.textbbox((0, 0), text, font=font)
                text_width = bbox[2] - bbox[0]
                text_height = bbox[3] - bbox[1]
                
                x = (THUMBNAIL.IMAGE.WIDTH - text_width) // 2
                y = (THUMBNAIL.IMAGE.HEIGHT - text_height) // 2
                
                draw.text((x, y), text, fill=(100, 100, 100), font=font)
            
            # Add file type specific colors
            colors = {
                'image': (0, 150, 255),
                'video': (255, 100, 100),
                'audio': (100, 255, 100),
                'pdf': (255, 0, 0),
                'document': (0, 100, 255),
                'txt': (100, 100, 100)
            }
            
            color = colors.get(file_type, (150, 150, 150))
            
            # Draw colored accent
            draw.rectangle([10, 10, 30, 30], fill=color)
            
            # Save as JPEG
            output = io.BytesIO()
            image.save(output, format='JPEG', quality=THUMBNAIL.IMAGE.QUALITY, optimize=True)
            return output.getvalue()
            
        except Exception as e:
            print(f"Default thumbnail generation failed: {str(e)}")
            return None 