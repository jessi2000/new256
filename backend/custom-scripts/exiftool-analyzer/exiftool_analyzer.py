#!/usr/bin/env python3
"""
ExifTool Analyzer Script
Analyzes files with exiftool-like functionality for metadata extraction.
"""
import os
import sys
import json
import hashlib
import subprocess
from datetime import datetime
from pathlib import Path

def get_uploaded_file():
    """Get the path to the uploaded file"""
    # Check for uploaded file in the uploads directory
    uploads_dir = Path("/tmp/sectoolbox_uploads")
    if uploads_dir.exists():
        # Get the most recent file
        files = list(uploads_dir.glob("*"))
        if files:
            latest_file = max(files, key=os.path.getctime)
            return latest_file
    return None

def analyze_file_metadata(file_path):
    """Analyze file metadata like exiftool"""
    try:
        metadata = {}
        
        # Basic file info
        stat = file_path.stat()
        metadata['File Name'] = file_path.name
        metadata['File Size'] = f"{stat.st_size} bytes"
        metadata['File Modified'] = datetime.fromtimestamp(stat.st_mtime).isoformat()
        metadata['File Permissions'] = oct(stat.st_mode)[-3:]
        
        # File signature analysis
        with open(file_path, 'rb') as f:
            header = f.read(16)
            metadata['File Header'] = header.hex().upper()
            
            # Detect file type by magic bytes
            if header.startswith(b'\xFF\xD8\xFF'):
                metadata['File Type'] = 'JPEG Image'
            elif header.startswith(b'\x89PNG'):
                metadata['File Type'] = 'PNG Image'
            elif header.startswith(b'GIF8'):
                metadata['File Type'] = 'GIF Image'
            elif header.startswith(b'%PDF'):
                metadata['File Type'] = 'PDF Document'
            elif header.startswith(b'PK\x03\x04'):
                metadata['File Type'] = 'ZIP Archive'
            elif header.startswith(b'\x7fELF'):
                metadata['File Type'] = 'ELF Executable'
            elif header.startswith(b'MZ'):
                metadata['File Type'] = 'Windows Executable'
            else:
                metadata['File Type'] = 'Unknown'
        
        # Calculate hashes
        with open(file_path, 'rb') as f:
            content = f.read()
            metadata['MD5'] = hashlib.md5(content).hexdigest()
            metadata['SHA1'] = hashlib.sha1(content).hexdigest()
            metadata['SHA256'] = hashlib.sha256(content).hexdigest()
        
        # Try to extract strings if it's a binary
        try:
            result = subprocess.run(['strings', str(file_path)], 
                                 capture_output=True, text=True, timeout=10)
            if result.returncode == 0:
                strings = result.stdout.strip().split('\n')
                metadata['Strings Count'] = len([s for s in strings if len(s) >= 4])
                metadata['Sample Strings'] = strings[:5]  # First 5 strings
        except:
            metadata['Strings Count'] = 'N/A (strings command not available)'
        
        return metadata
        
    except Exception as e:
        return {'Error': f'Failed to analyze file: {str(e)}'}

def main():
    """Main function"""
    print("=== ExifTool-like Analyzer ===")
    print("Analyzing uploaded file for metadata...")
    print()
    
    # Find uploaded file
    uploaded_file = get_uploaded_file()
    
    if not uploaded_file:
        print("No uploaded file found!")
        print("Please upload a file first using the file upload feature.")
        return
    
    print(f"Analyzing file: {uploaded_file.name}")
    print("=" * 50)
    
    # Analyze the file
    metadata = analyze_file_metadata(uploaded_file)
    
    # Print results in exiftool-like format
    for key, value in metadata.items():
        if isinstance(value, list):
            print(f"{key:20}: {', '.join(map(str, value))}")
        else:
            print(f"{key:20}: {value}")
    
    print("=" * 50)
    print("Analysis complete!")

if __name__ == "__main__":
    main()
