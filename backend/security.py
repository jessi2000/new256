"""
Security utilities and configuration for SectoolBox
"""
import os
import re
import hashlib
import mimetypes
from typing import List, Optional, Dict, Any
from pathlib import Path
import logging
import bleach
import validators
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
import defusedxml
from datetime import datetime
import secrets

# Configure secure XML parsing
defusedxml.defuse_stdlib()

# Security configuration
class SecurityConfig:
    """Security configuration settings"""
    
    # File upload restrictions
    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
    ALLOWED_MIME_TYPES = {
        # Text files
        'text/plain',
        'text/csv',
        'text/html',
        'text/xml',
        'application/json',
        'application/xml',
        
        # Archives
        'application/zip',
        'application/x-tar',
        'application/x-gzip',
        'application/x-7z-compressed',
        'application/x-rar-compressed',
        
        # Executables (for security analysis)
        'application/x-executable',
        'application/x-dosexec',
        'application/x-mach-binary',
        'application/x-elf',
        
        # Images
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/bmp',
        'image/webp',
        'image/tiff',
        
        # Documents
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        
        # Programming files
        'application/x-python-code',
        'application/javascript',
        'text/x-python',
        'text/x-c',
        'text/x-java-source',
        
        # Binary formats
        'application/octet-stream',
    }
    
    ALLOWED_FILE_EXTENSIONS = {
        '.txt', '.csv', '.json', '.xml', '.html', '.htm',
        '.zip', '.tar', '.gz', '.7z', '.rar',
        '.exe', '.dll', '.so', '.dylib', '.bin',
        '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff',
        '.pdf', '.doc', '.docx', '.xls', '.xlsx',
        '.py', '.js', '.c', '.cpp', '.h', '.java',
        '.log', '.conf', '.cfg', '.ini'
    }
    
    # Dangerous file patterns to block
    DANGEROUS_PATTERNS = [
        r'\.\./',  # Path traversal
        r'\\\.\\',  # Windows path traversal
        r'<script',  # Script tags
        r'javascript:',  # JavaScript URLs
        r'vbscript:',  # VBScript URLs
        r'file://',  # File URLs
        r'data:',  # Data URLs
    ]
    
    # Rate limiting
    RATE_LIMIT_PER_MINUTE = 100
    SCRIPT_EXECUTION_RATE_LIMIT = 10
    FILE_UPLOAD_RATE_LIMIT = 20
    
    # Script execution restrictions
    SCRIPT_TIMEOUT = 30  # seconds
    MAX_SCRIPT_OUTPUT_SIZE = 1024 * 1024  # 1MB
    
    # Allowed script commands (whitelist approach)
    ALLOWED_SCRIPT_COMMANDS = {
        'python', 'python3', 'node', 'bash', 'sh',
        'grep', 'awk', 'sed', 'cat', 'head', 'tail',
        'file', 'strings', 'hexdump', 'xxd',
        'openssl', 'base64', 'md5sum', 'sha256sum'
    }


class SecurityValidator:
    """Security validation utilities"""
    
    @staticmethod
    def sanitize_filename(filename: str) -> str:
        """Sanitize filename to prevent path traversal and other attacks"""
        if not filename:
            raise HTTPException(status_code=400, detail="Filename cannot be empty")
        
        # Remove path components
        filename = os.path.basename(filename)
        
        # Check for dangerous patterns
        for pattern in SecurityConfig.DANGEROUS_PATTERNS:
            if re.search(pattern, filename, re.IGNORECASE):
                raise HTTPException(status_code=400, detail="Dangerous filename pattern detected")
        
        # Replace dangerous characters
        filename = re.sub(r'[^\w\-_\.]', '_', filename)
        
        # Ensure filename isn't too long
        if len(filename) > 255:
            name, ext = os.path.splitext(filename)
            filename = name[:250] + ext
        
        # Ensure it's not empty after sanitization
        if not filename or filename in ['.', '..']:
            filename = f"safe_file_{secrets.token_hex(8)}.bin"
            
        return filename
    
    @staticmethod
    def validate_file_content(content: bytes, filename: str, mime_type: str) -> Dict[str, Any]:
        """Validate file content for security issues"""
        validation_result = {
            'is_safe': True,
            'issues': [],
            'warnings': []
        }
        
        # Check file size
        if len(content) > SecurityConfig.MAX_FILE_SIZE:
            validation_result['is_safe'] = False
            validation_result['issues'].append(f"File too large: {len(content)} bytes > {SecurityConfig.MAX_FILE_SIZE} bytes")
        
        # Check MIME type
        if mime_type not in SecurityConfig.ALLOWED_MIME_TYPES:
            validation_result['warnings'].append(f"Uncommon MIME type: {mime_type}")
        
        # Check file extension
        ext = os.path.splitext(filename)[1].lower()
        if ext not in SecurityConfig.ALLOWED_FILE_EXTENSIONS:
            validation_result['warnings'].append(f"Uncommon file extension: {ext}")
        
        # Check for executable headers
        if content.startswith(b'MZ') or content.startswith(b'\x7fELF'):
            validation_result['warnings'].append("Executable file detected")
        
        # Check for script content
        script_patterns = [
            b'<script', b'javascript:', b'vbscript:',
            b'<?php', b'<%', b'${', b'eval(',
        ]
        for pattern in script_patterns:
            if pattern in content.lower():
                validation_result['warnings'].append(f"Potentially dangerous script content detected")
                break
        
        # Calculate entropy to detect encrypted/compressed content
        if len(content) > 0:
            entropy = SecurityValidator.calculate_entropy(content[:1024])  # Check first 1KB
            if entropy > 7.5:
                validation_result['warnings'].append("High entropy content detected (encrypted/compressed)")
        
        return validation_result
    
    @staticmethod
    def calculate_entropy(data: bytes) -> float:
        """Calculate Shannon entropy of data"""
        if not data:
            return 0.0
        
        import math
        frequency = [0] * 256
        for byte in data:
            frequency[byte] += 1
        
        entropy = 0.0
        data_len = len(data)
        for count in frequency:
            if count > 0:
                probability = count / data_len
                entropy -= probability * math.log2(probability)
        
        return entropy
    
    @staticmethod
    def sanitize_text_input(text: str, max_length: int = 10000) -> str:
        """Sanitize text input to prevent XSS and injection attacks"""
        if not text:
            return ""
        
        # Limit length
        if len(text) > max_length:
            text = text[:max_length]
        
        # Use bleach to sanitize HTML/script content
        allowed_tags = ['b', 'i', 'u', 'em', 'strong', 'p', 'br']
        allowed_attributes = {}
        
        sanitized = bleach.clean(
            text,
            tags=allowed_tags,
            attributes=allowed_attributes,
            strip=True
        )
        
        # Additional checks for injection attempts
        dangerous_patterns = [
            r'<script[^>]*>.*?</script>',
            r'javascript:',
            r'vbscript:',
            r'on\w+\s*=',
            r'expression\s*\(',
            r'@import',
            r'background-image\s*:',
        ]
        
        for pattern in dangerous_patterns:
            sanitized = re.sub(pattern, '', sanitized, flags=re.IGNORECASE | re.DOTALL)
        
        return sanitized.strip()
    
    @staticmethod
    def validate_script_command(command: str) -> bool:
        """Validate script command for security"""
        if not command:
            return False
        
        # Split command and check first part (the actual command)
        parts = command.split()
        if not parts:
            return False
        
        base_command = parts[0]
        
        # Check if command is in whitelist
        if base_command not in SecurityConfig.ALLOWED_SCRIPT_COMMANDS:
            return False
        
        # Check for dangerous patterns in full command
        dangerous_command_patterns = [
            r'rm\s+-rf',
            r'>\s*/dev',
            r'curl.*\|',
            r'wget.*\|',
            r'nc\s+.*\s+.*',  # netcat
            r'bash\s+-c',
            r'sh\s+-c',
            r'\$\(',  # Command substitution
            r'`.*`',  # Backticks
            r'&&',
            r'\|\|',
            r';\s*rm',
            r';\s*cat\s+/etc',
        ]
        
        for pattern in dangerous_command_patterns:
            if re.search(pattern, command, re.IGNORECASE):
                return False
        
        return True
    
    @staticmethod
    def validate_url(url: str) -> bool:
        """Validate URL for security"""
        if not url:
            return False
        
        try:
            return validators.url(url) is True
        except Exception:
            return False
    
    @staticmethod
    def get_client_ip(request: Request) -> str:
        """Get client IP address from request"""
        # Check for forwarded headers first
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            # Take the first IP in the chain
            return forwarded_for.split(',')[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip.strip()
        
        # Fall back to direct client IP
        return request.client.host if request.client else "unknown"


class SecurityLogger:
    """Security event logging"""
    
    def __init__(self):
        self.logger = logging.getLogger("security")
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            '%(asctime)s - SECURITY - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        self.logger.addHandler(handler)
        self.logger.setLevel(logging.INFO)
    
    def log_file_upload(self, filename: str, size: int, mime_type: str, client_ip: str, issues: List[str] = None):
        """Log file upload event"""
        self.logger.info(
            f"FILE_UPLOAD - IP: {client_ip}, File: {filename}, Size: {size}, MIME: {mime_type}, Issues: {issues or 'None'}"
        )
    
    def log_script_execution(self, script_name: str, command: str, client_ip: str, success: bool):
        """Log script execution event"""
        status = "SUCCESS" if success else "FAILED"
        self.logger.info(
            f"SCRIPT_EXECUTION - IP: {client_ip}, Script: {script_name}, Command: {command}, Status: {status}"
        )
    
    def log_rate_limit_violation(self, client_ip: str, endpoint: str):
        """Log rate limit violation"""
        self.logger.warning(
            f"RATE_LIMIT_VIOLATION - IP: {client_ip}, Endpoint: {endpoint}"
        )
    
    def log_security_violation(self, client_ip: str, violation_type: str, details: str):
        """Log security violation"""
        self.logger.warning(
            f"SECURITY_VIOLATION - IP: {client_ip}, Type: {violation_type}, Details: {details}"
        )
    
    def log_error(self, client_ip: str, error_type: str, details: str):
        """Log security-related error"""
        self.logger.error(
            f"SECURITY_ERROR - IP: {client_ip}, Type: {error_type}, Details: {details}"
        )


# Create global security logger instance
security_logger = SecurityLogger()


def create_secure_error_response(message: str = "An error occurred", status_code: int = 500) -> JSONResponse:
    """Create a secure error response that doesn't leak sensitive information"""
    # Generic error messages to prevent information disclosure
    generic_messages = {
        400: "Bad request",
        401: "Unauthorized",
        403: "Forbidden",
        404: "Not found",
        429: "Rate limit exceeded",
        500: "Internal server error"
    }
    
    safe_message = generic_messages.get(status_code, "An error occurred")
    
    return JSONResponse(
        status_code=status_code,
        content={
            "error": safe_message,
            "timestamp": datetime.utcnow().isoformat(),
            "request_id": secrets.token_hex(8)
        }
    )