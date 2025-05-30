from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
import hashlib
import magic
from PIL import Image
from PIL.ExifTags import TAGS
import io
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="SectoolBox API", description="CTF Tools and File Analysis API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class Announcement(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    date: datetime = Field(default_factory=datetime.utcnow)
    is_important: bool = False

class AnnouncementCreate(BaseModel):
    title: str
    content: str
    is_important: bool = False

class FileAnalysisResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    filename: str
    file_size: int
    mime_type: str
    md5_hash: str
    sha1_hash: str
    sha256_hash: str
    analysis_date: datetime = Field(default_factory=datetime.utcnow)
    strings_count: Optional[int] = None
    entropy: Optional[float] = None
    metadata: Optional[Dict[str, Any]] = None
    exif_data: Optional[Dict[str, Any]] = None

# Basic endpoints
@api_router.get("/")
async def root():
    return {"message": "SectoolBox API is running", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Announcements endpoints
@api_router.post("/announcements", response_model=Announcement)
async def create_announcement(input: AnnouncementCreate):
    announcement_dict = input.dict()
    announcement_obj = Announcement(**announcement_dict)
    await db.announcements.insert_one(announcement_obj.dict())
    return announcement_obj

@api_router.get("/announcements", response_model=List[Announcement])
async def get_announcements():
    announcements = await db.announcements.find().sort("date", -1).to_list(20)
    return [Announcement(**announcement) for announcement in announcements]

@api_router.delete("/announcements/{announcement_id}")
async def delete_announcement(announcement_id: str):
    result = await db.announcements.delete_one({"id": announcement_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return {"message": "Announcement deleted successfully"}

# File analysis utility functions
def calculate_hashes(file_content: bytes) -> Dict[str, str]:
    """Calculate MD5, SHA1, and SHA256 hashes of file content"""
    return {
        "md5": hashlib.md5(file_content).hexdigest(),
        "sha1": hashlib.sha1(file_content).hexdigest(),
        "sha256": hashlib.sha256(file_content).hexdigest()
    }

def calculate_entropy(data: bytes) -> float:
    """Calculate Shannon entropy of data"""
    if not data:
        return 0.0
    
    # Count frequency of each byte value
    frequency = [0] * 256
    for byte in data:
        frequency[byte] += 1
    
    # Calculate entropy
    entropy = 0.0
    data_len = len(data)
    for count in frequency:
        if count > 0:
            probability = count / data_len
            entropy -= probability * (probability.bit_length() - 1)
    
    return entropy

def extract_strings(data: bytes, min_length: int = 4) -> List[str]:
    """Extract printable strings from binary data"""
    strings = []
    current_string = ""
    
    for byte in data:
        char = chr(byte)
        if char.isprintable() and char not in '\n\r\t':
            current_string += char
        else:
            if len(current_string) >= min_length:
                strings.append(current_string)
            current_string = ""
    
    if len(current_string) >= min_length:
        strings.append(current_string)
    
    return strings

def extract_exif_data(image_data: bytes) -> Dict[str, Any]:
    """Extract EXIF data from image"""
    try:
        image = Image.open(io.BytesIO(image_data))
        exifdata = image.getexif()
        
        if not exifdata:
            return {}
        
        exif_dict = {}
        for tag_id, value in exifdata.items():
            tag = TAGS.get(tag_id, tag_id)
            exif_dict[str(tag)] = str(value)
        
        return exif_dict
    except Exception:
        return {}

# File analysis endpoint
@api_router.post("/analyze-file", response_model=FileAnalysisResult)
async def analyze_file(file: UploadFile = File(...)):
    try:
        # Read file content
        file_content = await file.read()
        
        # Get MIME type
        mime_type = magic.from_buffer(file_content, mime=True)
        
        # Calculate hashes
        hashes = calculate_hashes(file_content)
        
        # Calculate entropy
        entropy = calculate_entropy(file_content)
        
        # Extract strings
        strings = extract_strings(file_content)
        strings_count = len(strings)
        
        # Basic metadata
        metadata = {
            "file_size": len(file_content),
            "strings_sample": strings[:10] if strings else [],  # First 10 strings as sample
        }
        
        # Extract EXIF data for images
        exif_data = {}
        if mime_type.startswith('image/'):
            exif_data = extract_exif_data(file_content)
        
        # Create analysis result
        analysis_result = FileAnalysisResult(
            filename=file.filename,
            file_size=len(file_content),
            mime_type=mime_type,
            md5_hash=hashes["md5"],
            sha1_hash=hashes["sha1"],
            sha256_hash=hashes["sha256"],
            strings_count=strings_count,
            entropy=entropy,
            metadata=metadata,
            exif_data=exif_data if exif_data else None
        )
        
        # Store analysis result in database
        await db.file_analyses.insert_one(analysis_result.dict())
        
        return analysis_result
        
    except Exception as e:
        logging.error(f"Error analyzing file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error analyzing file: {str(e)}")

@api_router.get("/file-analyses", response_model=List[FileAnalysisResult])
async def get_file_analyses():
    """Get recent file analyses"""
    analyses = await db.file_analyses.find().sort("analysis_date", -1).limit(50).to_list(50)
    return [FileAnalysisResult(**analysis) for analysis in analyses]

# Tool endpoints for logging usage (optional)
@api_router.post("/tool-usage")
async def log_tool_usage(tool_name: str, input_data: str = ""):
    """Log tool usage for analytics"""
    usage_log = {
        "id": str(uuid.uuid4()),
        "tool_name": tool_name,
        "timestamp": datetime.utcnow(),
        "input_length": len(input_data)
    }
    await db.tool_usage.insert_one(usage_log)
    return {"message": "Usage logged"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
