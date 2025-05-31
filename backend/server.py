import os
import uuid
import subprocess
import tempfile
import shutil
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import hashlib
import magic
import io
import logging
from motor.motor_asyncio import AsyncIOMotorClient
import exifread
import json
from pathlib import Path
from dotenv import load_dotenv
from PIL import Image
from PIL.ExifTags import TAGS

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create directories for custom scripts
SCRIPTS_DIR = ROOT_DIR / "custom-scripts"
SCRIPTS_DIR.mkdir(exist_ok=True)

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

class CustomScript(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = ""
    command: str
    file_path: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_executed: Optional[datetime] = None
    execution_count: int = 0

class ScriptExecutionResult(BaseModel):
    script_name: str
    output: str
    error: Optional[str] = None
    execution_time: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)

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
    import math
    
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
            entropy -= probability * math.log2(probability)
    
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

# Custom Scripts API Endpoints

@api_router.get("/custom-scripts", response_model=List[CustomScript])
async def get_custom_scripts():
    """Get all custom scripts"""
    try:
        scripts = await db.custom_scripts.find().sort("created_at", -1).to_list(100)
        return [CustomScript(**script) for script in scripts]
    except Exception as e:
        logger.error(f"Error fetching custom scripts: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching custom scripts")

@api_router.post("/upload-script")
async def upload_script(
    script_name: str = Form(...),
    command: str = Form(...),
    description: str = Form(""),
    script_file: UploadFile = File(...)
):
    """Upload a custom script"""
    try:
        # Validate file type
        if not script_file.filename.endswith('.py'):
            raise HTTPException(status_code=400, detail="Only Python (.py) files are allowed")
        
        # Check if script name already exists
        existing = await db.custom_scripts.find_one({"name": script_name})
        if existing:
            raise HTTPException(status_code=400, detail="Script name already exists")
        
        # Create script directory
        script_dir = SCRIPTS_DIR / script_name
        script_dir.mkdir(exist_ok=True)
        
        # Save the uploaded script file
        script_path = script_dir / script_file.filename
        with open(script_path, "wb") as f:
            content = await script_file.read()
            f.write(content)
        
        # Create command.txt file
        command_file = script_dir / "command.txt"
        with open(command_file, "w") as f:
            f.write(command)
        
        # Create script record in database
        script_record = CustomScript(
            name=script_name,
            description=description,
            command=command,
            file_path=str(script_path)
        )
        
        await db.custom_scripts.insert_one(script_record.dict())
        
        return {"message": "Script uploaded successfully", "script_name": script_name}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading script: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error uploading script: {str(e)}")

@api_router.post("/execute-script")
async def execute_script(request: dict):
    """Execute a custom script"""
    try:
        script_name = request.get("script_name")
        if not script_name:
            raise HTTPException(status_code=400, detail="Script name is required")
        
        # Get script from database
        script_doc = await db.custom_scripts.find_one({"name": script_name})
        if not script_doc:
            raise HTTPException(status_code=404, detail="Script not found")
        
        script = CustomScript(**script_doc)
        script_dir = SCRIPTS_DIR / script_name
        
        if not script_dir.exists():
            raise HTTPException(status_code=404, detail="Script directory not found")
        
        # Read command from command.txt if it exists
        command_file = script_dir / "command.txt"
        if command_file.exists():
            with open(command_file, "r") as f:
                command = f.read().strip()
        else:
            command = script.command
        
        # Execute the script
        start_time = datetime.utcnow()
        
        try:
            # Change to script directory and execute
            result = subprocess.run(
                command.split(),
                cwd=script_dir,
                capture_output=True,
                text=True,
                timeout=30,  # 30 second timeout
                check=False
            )
            
            end_time = datetime.utcnow()
            execution_time = (end_time - start_time).total_seconds()
            
            # Combine stdout and stderr
            output = ""
            if result.stdout:
                output += "STDOUT:\n" + result.stdout + "\n"
            if result.stderr:
                output += "STDERR:\n" + result.stderr + "\n"
            if not output:
                output = "Script executed with no output"
            
            # Add return code info
            output += f"\nReturn Code: {result.returncode}"
            
            # Update script statistics
            await db.custom_scripts.update_one(
                {"name": script_name},
                {
                    "$set": {"last_executed": datetime.utcnow()},
                    "$inc": {"execution_count": 1}
                }
            )
            
            # Store execution result
            execution_result = ScriptExecutionResult(
                script_name=script_name,
                output=output,
                error=result.stderr if result.stderr else None,
                execution_time=execution_time
            )
            
            await db.script_executions.insert_one(execution_result.dict())
            
            return {"output": output, "execution_time": execution_time}
            
        except subprocess.TimeoutExpired:
            return {"output": "Error: Script execution timed out (30 seconds)", "execution_time": 30.0}
        except Exception as exec_error:
            error_msg = f"Execution error: {str(exec_error)}"
            return {"output": error_msg, "execution_time": 0.0}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error executing script: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error executing script: {str(e)}")

@api_router.delete("/custom-scripts/{script_name}")
async def delete_script(script_name: str):
    """Delete a custom script"""
    try:
        # Check if script exists
        script_doc = await db.custom_scripts.find_one({"name": script_name})
        if not script_doc:
            raise HTTPException(status_code=404, detail="Script not found")
        
        # Remove script directory
        script_dir = SCRIPTS_DIR / script_name
        if script_dir.exists():
            shutil.rmtree(script_dir)
        
        # Remove from database
        await db.custom_scripts.delete_one({"name": script_name})
        
        # Remove execution history
        await db.script_executions.delete_many({"script_name": script_name})
        
        return {"message": "Script deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting script: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting script: {str(e)}")

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
