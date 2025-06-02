import os
import uuid
import subprocess
import tempfile
import shutil
from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi import APIRouter
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from pydantic import BaseModel, Field, validator
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
import time
import asyncio
from contextlib import asynccontextmanager
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from secure import Secure

# Import our security module
import sys
sys.path.append('/app/backend')
from security import (
    SecurityConfig, SecurityValidator, SecurityLogger, security_logger,
    create_secure_error_response
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create directories for custom scripts
SCRIPTS_DIR = ROOT_DIR / "custom-scripts"
SCRIPTS_DIR.mkdir(exist_ok=True)

# Secure file upload directory with proper permissions
UPLOADS_DIR = Path("/tmp/sectoolbox_uploads")
UPLOADS_DIR.mkdir(exist_ok=True, mode=0o700)  # Restricted permissions

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Rate limiter setup
limiter = Limiter(key_func=get_remote_address)

# Security headers setup - simplified configuration
secure = Secure()

# Application lifespan management
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    security_logger.logger.info("SectoolBox API starting up with security hardening enabled")
    yield
    # Shutdown
    security_logger.logger.info("SectoolBox API shutting down")
    client.close()

# Create the main app
app = FastAPI(
    title="SectoolBox API", 
    description="Secure CTF Tools and File Analysis API",
    lifespan=lifespan
)

# Add security middleware
app.add_middleware(SlowAPIMiddleware)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Add trusted host middleware (adjust hosts as needed)
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=["*"]  # In production, specify exact domains
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security middleware to add headers
@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    
    # Add comprehensive security headers manually
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https:; "
        "font-src 'self' data:; "
        "connect-src 'self' https:; "
        "media-src 'self'; "
        "object-src 'none'; "
        "frame-src 'none'; "
        "base-uri 'self'; "
        "form-action 'self'; "
        "upgrade-insecure-requests"
    )
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    response.headers["X-API-Version"] = "1.0.0"
    response.headers["X-Request-ID"] = str(uuid.uuid4())
    
    return response

# Security monitoring middleware
@app.middleware("http")
async def security_monitoring_middleware(request: Request, call_next):
    start_time = time.time()
    client_ip = SecurityValidator.get_client_ip(request)
    
    try:
        response = await call_next(request)
        
        # Log suspicious activities
        if response.status_code >= 400:
            security_logger.log_error(
                client_ip=client_ip,
                error_type=f"HTTP_{response.status_code}",
                details=f"Path: {request.url.path}, Method: {request.method}"
            )
        
        return response
    
    except Exception as e:
        # Log security incidents
        security_logger.log_error(
            client_ip=client_ip,
            error_type="EXCEPTION",
            details=f"Path: {request.url.path}, Error: {str(e)[:200]}"
        )
        raise

# Define Models with enhanced validation
class Announcement(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1, max_length=5000)
    date: datetime = Field(default_factory=datetime.utcnow)
    is_important: bool = False
    
    @validator('title', 'content')
    def sanitize_text_fields(cls, v):
        return SecurityValidator.sanitize_text_input(v)

class AnnouncementCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1, max_length=5000)
    is_important: bool = False
    
    @validator('title', 'content')
    def sanitize_text_fields(cls, v):
        return SecurityValidator.sanitize_text_input(v)

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
    security_analysis: Optional[Dict[str, Any]] = None

class CustomScript(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field("", max_length=500)
    command: str = Field(..., min_length=1, max_length=200)
    file_path: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_executed: Optional[datetime] = None
    execution_count: int = 0
    
    @validator('name', 'description')
    def sanitize_text_fields(cls, v):
        return SecurityValidator.sanitize_text_input(v)
    
    @validator('command')
    def validate_command(cls, v):
        if not SecurityValidator.validate_script_command(v):
            raise ValueError("Invalid or potentially dangerous command")
        return v

class ScriptExecutionResult(BaseModel):
    script_name: str
    output: str
    error: Optional[str] = None
    execution_time: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# Enhanced error handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    client_ip = SecurityValidator.get_client_ip(request)
    security_logger.log_error(
        client_ip=client_ip,
        error_type=f"HTTP_{exc.status_code}",
        details=f"Path: {request.url.path}, Detail: {exc.detail}"
    )
    return create_secure_error_response(
        message=exc.detail,
        status_code=exc.status_code
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    client_ip = SecurityValidator.get_client_ip(request)
    security_logger.log_error(
        client_ip=client_ip,
        error_type="UNHANDLED_EXCEPTION",
        details=f"Path: {request.url.path}, Error: {str(exc)[:200]}"
    )
    return create_secure_error_response(
        message="Internal server error",
        status_code=500
    )

# Basic endpoints with rate limiting
@api_router.get("/")
@limiter.limit("30/minute")
async def root(request: Request):
    return {"message": "SectoolBox API is running", "version": "1.0.0", "security": "enabled"}

@api_router.get("/health")
@limiter.limit("60/minute")
async def health_check(request: Request):
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Announcements endpoints with enhanced security
@api_router.post("/announcements", response_model=Announcement)
@limiter.limit("10/minute")
async def create_announcement(request: Request, input: AnnouncementCreate):
    try:
        announcement_dict = input.dict()
        announcement_obj = Announcement(**announcement_dict)
        await db.announcements.insert_one(announcement_obj.dict())
        
        client_ip = SecurityValidator.get_client_ip(request)
        security_logger.logger.info(f"Announcement created by IP: {client_ip}")
        
        return announcement_obj
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create announcement")

@api_router.get("/announcements", response_model=List[Announcement])
@limiter.limit("60/minute")
async def get_announcements(request: Request):
    try:
        announcements = await db.announcements.find().sort("date", -1).to_list(20)
        return [Announcement(**announcement) for announcement in announcements]
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve announcements")

@api_router.delete("/announcements/{announcement_id}")
@limiter.limit("5/minute")
async def delete_announcement(request: Request, announcement_id: str):
    try:
        # Validate UUID format
        try:
            uuid.UUID(announcement_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid announcement ID format")
        
        result = await db.announcements.delete_one({"id": announcement_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Announcement not found")
        
        client_ip = SecurityValidator.get_client_ip(request)
        security_logger.logger.info(f"Announcement {announcement_id} deleted by IP: {client_ip}")
        
        return {"message": "Announcement deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to delete announcement")

# Secure file analysis utility functions
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
    """Extract printable strings from binary data with security filtering"""
    strings = []
    current_string = ""
    
    for byte in data:
        char = chr(byte)
        if char.isprintable() and char not in '\n\r\t':
            current_string += char
        else:
            if len(current_string) >= min_length:
                # Filter out potentially dangerous strings
                safe_string = SecurityValidator.sanitize_text_input(current_string, max_length=1000)
                if safe_string and len(safe_string) >= min_length:
                    strings.append(safe_string)
            current_string = ""
    
    if len(current_string) >= min_length:
        safe_string = SecurityValidator.sanitize_text_input(current_string, max_length=1000)
        if safe_string and len(safe_string) >= min_length:
            strings.append(safe_string)
    
    return strings[:1000]  # Limit number of strings

def extract_exif_data(image_data: bytes) -> Dict[str, Any]:
    """Extract EXIF data from image with security filtering"""
    try:
        image = Image.open(io.BytesIO(image_data))
        exifdata = image.getexif()
        
        if not exifdata:
            return {}
        
        exif_dict = {}
        for tag_id, value in exifdata.items():
            tag = TAGS.get(tag_id, tag_id)
            # Sanitize EXIF values
            safe_value = SecurityValidator.sanitize_text_input(str(value), max_length=500)
            exif_dict[str(tag)] = safe_value
        
        return exif_dict
    except Exception:
        return {}

# Enhanced file analysis endpoint
@api_router.post("/analyze-file", response_model=FileAnalysisResult)
@limiter.limit("20/minute")
async def analyze_file(request: Request, file: UploadFile = File(...)):
    client_ip = SecurityValidator.get_client_ip(request)
    
    try:
        # Validate file upload
        if not file.filename:
            raise HTTPException(status_code=400, detail="Filename is required")
        
        # Read file content with size limit
        file_content = await file.read()
        
        # Check file size after reading
        if len(file_content) > SecurityConfig.MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large")
        
        # Sanitize filename
        safe_filename = SecurityValidator.sanitize_filename(file.filename)
        
        # Get MIME type
        mime_type = magic.from_buffer(file_content, mime=True)
        
        # Validate file content
        security_analysis = SecurityValidator.validate_file_content(
            file_content, safe_filename, mime_type
        )
        
        # Log the upload
        security_logger.log_file_upload(
            filename=safe_filename,
            size=len(file_content),
            mime_type=mime_type,
            client_ip=client_ip,
            issues=security_analysis.get('issues', [])
        )
        
        # Block dangerous files
        if not security_analysis['is_safe']:
            raise HTTPException(status_code=400, detail="File failed security validation")
        
        # Calculate hashes
        hashes = calculate_hashes(file_content)
        
        # Calculate entropy
        entropy = calculate_entropy(file_content)
        
        # Extract strings safely
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
            filename=safe_filename,
            file_size=len(file_content),
            mime_type=mime_type,
            md5_hash=hashes["md5"],
            sha1_hash=hashes["sha1"],
            sha256_hash=hashes["sha256"],
            strings_count=strings_count,
            entropy=entropy,
            metadata=metadata,
            exif_data=exif_data if exif_data else None,
            security_analysis=security_analysis
        )
        
        # Store analysis result in database
        await db.file_analyses.insert_one(analysis_result.dict())
        
        return analysis_result
        
    except HTTPException:
        raise
    except Exception as e:
        security_logger.log_error(
            client_ip=client_ip,
            error_type="FILE_ANALYSIS_ERROR",
            details=str(e)[:200]
        )
        raise HTTPException(status_code=500, detail="Error analyzing file")

@api_router.get("/file-analyses", response_model=List[FileAnalysisResult])
@limiter.limit("30/minute")
async def get_file_analyses(request: Request):
    """Get recent file analyses"""
    try:
        analyses = await db.file_analyses.find().sort("analysis_date", -1).limit(50).to_list(50)
        return [FileAnalysisResult(**analysis) for analysis in analyses]
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve file analyses")

# Enhanced tool usage logging
@api_router.post("/tool-usage")
@limiter.limit("60/minute")
async def log_tool_usage(request: Request, tool_name: str, input_data: str = ""):
    """Log tool usage for analytics with security validation"""
    try:
        # Sanitize inputs
        safe_tool_name = SecurityValidator.sanitize_text_input(tool_name, max_length=100)
        safe_input_data = SecurityValidator.sanitize_text_input(input_data, max_length=1000)
        
        usage_log = {
            "id": str(uuid.uuid4()),
            "tool_name": safe_tool_name,
            "timestamp": datetime.utcnow(),
            "input_length": len(safe_input_data),
            "client_ip": SecurityValidator.get_client_ip(request)
        }
        await db.tool_usage.insert_one(usage_log)
        return {"message": "Usage logged"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to log tool usage")

# Secure file upload for custom scripts
@api_router.post("/upload-file-for-script")
@limiter.limit("20/minute")
async def upload_file_for_script(request: Request, file: UploadFile = File(...)):
    """Upload a file to be used with custom scripts - with enhanced security"""
    client_ip = SecurityValidator.get_client_ip(request)
    
    try:
        if not file.filename:
            raise HTTPException(status_code=400, detail="Filename is required")
        
        # Sanitize filename
        safe_filename = SecurityValidator.sanitize_filename(file.filename)
        
        # Read file content with size limit
        file_content = await file.read()
        
        # Check file size after reading
        if len(file_content) > SecurityConfig.MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large")
        
        # Get MIME type
        mime_type = magic.from_buffer(file_content, mime=True)
        
        # Validate file content
        security_analysis = SecurityValidator.validate_file_content(
            file_content, safe_filename, mime_type
        )
        
        # Log the upload
        security_logger.log_file_upload(
            filename=safe_filename,
            size=len(file_content),
            mime_type=mime_type,
            client_ip=client_ip,
            issues=security_analysis.get('issues', [])
        )
        
        # Block dangerous files
        if not security_analysis['is_safe']:
            raise HTTPException(status_code=400, detail="File failed security validation")
        
        # Clear previous uploads securely
        for old_file in UPLOADS_DIR.glob("*"):
            try:
                old_file.unlink()
            except Exception:
                pass  # Continue if file deletion fails
        
        # Save the uploaded file with secure permissions
        file_path = UPLOADS_DIR / safe_filename
        with open(file_path, "wb") as buffer:
            buffer.write(file_content)
        
        # Set restrictive permissions
        os.chmod(file_path, 0o600)
        
        return {
            "message": "File uploaded successfully",
            "filename": safe_filename,
            "size": len(file_content),
            "path": str(file_path),
            "security_warnings": security_analysis.get('warnings', [])
        }
        
    except HTTPException:
        raise
    except Exception as e:
        security_logger.log_error(
            client_ip=client_ip,
            error_type="FILE_UPLOAD_ERROR",
            details=str(e)[:200]
        )
        raise HTTPException(status_code=500, detail="Error uploading file")

@api_router.get("/custom-scripts", response_model=List[CustomScript])
@limiter.limit("30/minute")
async def get_custom_scripts(request: Request):
    """Get all custom scripts from directory structure"""
    try:
        scripts = []
        
        # Scan the custom-scripts directory
        for script_dir in SCRIPTS_DIR.iterdir():
            if script_dir.is_dir():
                config_file = script_dir / "config.json"
                if config_file.exists():
                    try:
                        with open(config_file, 'r') as f:
                            config = json.load(f)
                        
                        # Validate script configuration
                        name = SecurityValidator.sanitize_text_input(
                            config.get("name", script_dir.name), max_length=100
                        )
                        description = SecurityValidator.sanitize_text_input(
                            config.get("description", ""), max_length=500
                        )
                        command = config.get("command", "")
                        
                        # Validate command
                        if not SecurityValidator.validate_script_command(command):
                            security_logger.log_security_violation(
                                client_ip=SecurityValidator.get_client_ip(request),
                                violation_type="DANGEROUS_SCRIPT_COMMAND",
                                details=f"Script: {name}, Command: {command}"
                            )
                            continue
                        
                        # Find the script file (look for .py files)
                        script_files = list(script_dir.glob("*.py"))
                        if script_files:
                            script_path = script_files[0]  # Use first .py file found
                            
                            script = CustomScript(
                                name=name,
                                description=description,
                                command=command,
                                file_path=str(script_path),
                                created_at=datetime.fromtimestamp(script_path.stat().st_mtime)
                            )
                            scripts.append(script)
                    except (json.JSONDecodeError, KeyError, OSError, ValueError) as e:
                        security_logger.log_error(
                            client_ip=SecurityValidator.get_client_ip(request),
                            error_type="SCRIPT_CONFIG_ERROR",
                            details=f"Invalid config in {script_dir}: {str(e)[:200]}"
                        )
                        continue
        
        return scripts
        
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error fetching custom scripts")

@api_router.post("/execute-script")
@limiter.limit("10/minute")  # Stricter limit for script execution
async def execute_script(request: Request, script_request: dict):
    """Execute a custom script from directory structure - with enhanced security"""
    client_ip = SecurityValidator.get_client_ip(request)
    
    try:
        script_name = script_request.get("script_name")
        if not script_name:
            raise HTTPException(status_code=400, detail="Script name is required")
        
        # Sanitize script name
        safe_script_name = SecurityValidator.sanitize_text_input(script_name, max_length=100)
        
        # Find the script directory by name
        script_dir = None
        for dir_path in SCRIPTS_DIR.iterdir():
            if dir_path.is_dir():
                config_file = dir_path / "config.json"
                if config_file.exists():
                    try:
                        with open(config_file, 'r') as f:
                            config = json.load(f)
                        if config.get("name") == safe_script_name:
                            script_dir = dir_path
                            break
                    except (json.JSONDecodeError, KeyError):
                        continue
        
        if not script_dir:
            raise HTTPException(status_code=404, detail="Script not found")
        
        # Read and validate config
        config_file = script_dir / "config.json"
        with open(config_file, 'r') as f:
            config = json.load(f)
        
        command = config.get("command", "python script.py")
        
        # Validate command again
        if not SecurityValidator.validate_script_command(command):
            security_logger.log_security_violation(
                client_ip=client_ip,
                violation_type="DANGEROUS_SCRIPT_EXECUTION",
                details=f"Script: {safe_script_name}, Command: {command}"
            )
            raise HTTPException(status_code=403, detail="Script execution denied for security reasons")
        
        # Log script execution attempt
        security_logger.log_script_execution(
            script_name=safe_script_name,
            command=command,
            client_ip=client_ip,
            success=False  # Will update if successful
        )
        
        # Execute the script with security measures
        start_time = datetime.utcnow()
        
        try:
            # Create a secure environment
            secure_env = os.environ.copy()
            secure_env['PATH'] = '/usr/bin:/bin'  # Restricted PATH
            secure_env.pop('LD_LIBRARY_PATH', None)  # Remove potentially dangerous env vars
            
            # Execute the script with restrictions
            result = subprocess.run(
                command.split(),
                cwd=script_dir,
                capture_output=True,
                text=True,
                timeout=SecurityConfig.SCRIPT_TIMEOUT,
                check=False,
                env=secure_env
            )
            
            end_time = datetime.utcnow()
            execution_time = (end_time - start_time).total_seconds()
            
            # Limit output size
            stdout = result.stdout or ""
            stderr = result.stderr or ""
            
            if len(stdout) > SecurityConfig.MAX_SCRIPT_OUTPUT_SIZE:
                stdout = stdout[:SecurityConfig.MAX_SCRIPT_OUTPUT_SIZE] + "\n[OUTPUT TRUNCATED]"
            if len(stderr) > SecurityConfig.MAX_SCRIPT_OUTPUT_SIZE:
                stderr = stderr[:SecurityConfig.MAX_SCRIPT_OUTPUT_SIZE] + "\n[ERROR OUTPUT TRUNCATED]"
            
            # Sanitize output
            safe_stdout = SecurityValidator.sanitize_text_input(stdout, max_length=SecurityConfig.MAX_SCRIPT_OUTPUT_SIZE)
            safe_stderr = SecurityValidator.sanitize_text_input(stderr, max_length=SecurityConfig.MAX_SCRIPT_OUTPUT_SIZE)
            
            # Combine stdout and stderr
            output = ""
            if safe_stdout:
                output += "STDOUT:\n" + safe_stdout + "\n"
            if safe_stderr:
                output += "STDERR:\n" + safe_stderr + "\n"
            if not output:
                output = "Script executed with no output"
            
            # Add return code info
            output += f"\nReturn Code: {result.returncode}"
            
            # Log successful execution
            security_logger.log_script_execution(
                script_name=safe_script_name,
                command=command,
                client_ip=client_ip,
                success=True
            )
            
            # Store execution result
            execution_result = {
                "script_name": safe_script_name,
                "output": output,
                "error": safe_stderr if safe_stderr else None,
                "execution_time": execution_time,
                "timestamp": datetime.utcnow(),
                "client_ip": client_ip
            }
            
            # Store in database
            try:
                await db.script_executions.insert_one(execution_result)
            except Exception as db_error:
                security_logger.log_error(
                    client_ip=client_ip,
                    error_type="DATABASE_ERROR",
                    details=f"Failed to log execution: {str(db_error)[:200]}"
                )
            
            return {"output": output, "execution_time": execution_time}
            
        except subprocess.TimeoutExpired:
            security_logger.log_security_violation(
                client_ip=client_ip,
                violation_type="SCRIPT_TIMEOUT",
                details=f"Script: {safe_script_name} timed out"
            )
            return {"output": f"Error: Script execution timed out ({SecurityConfig.SCRIPT_TIMEOUT} seconds)", "execution_time": SecurityConfig.SCRIPT_TIMEOUT}
            
        except Exception as exec_error:
            security_logger.log_error(
                client_ip=client_ip,
                error_type="SCRIPT_EXECUTION_ERROR",
                details=f"Script: {safe_script_name}, Error: {str(exec_error)[:200]}"
            )
            error_msg = "Script execution failed"
            return {"output": error_msg, "execution_time": 0.0}
        
    except HTTPException:
        raise
    except Exception as e:
        security_logger.log_error(
            client_ip=client_ip,
            error_type="GENERAL_SCRIPT_ERROR",
            details=str(e)[:200]
        )
        raise HTTPException(status_code=500, detail="Error executing script")

# Include the router in the main app
app.include_router(api_router)

# Secure CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_credentials=False,  # More secure
    allow_origins=[
        "https://4e700c55-6382-44df-bdef-0bf91559b9c6.preview.emergentagent.com",
        "http://localhost:3000",
        "https://localhost:3000"
    ],  # Restrict to specific origins
    allow_methods=["GET", "POST", "DELETE"],  # Only allowed methods
    allow_headers=[
        "Accept",
        "Accept-Language",
        "Content-Language",
        "Content-Type",
        "Authorization"
    ],  # Restrict headers
    max_age=600,  # Cache preflight for 10 minutes
)

# Configure secure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('/var/log/sectoolbox.log', mode='a')
    ]
)
logger = logging.getLogger(__name__)

# Log startup
logger.info("SectoolBox API started with comprehensive security hardening")
