#!/usr/bin/env python3
"""
File Inspector Script
Deep inspection of files with entropy analysis and structure detection.
"""
import os
import sys
import math
import json
from pathlib import Path
from collections import Counter

def get_uploaded_file():
    """Get the path to the uploaded file"""
    uploads_dir = Path("/tmp/sectoolbox_uploads")
    if uploads_dir.exists():
        files = list(uploads_dir.glob("*"))
        if files:
            latest_file = max(files, key=os.path.getctime)
            return latest_file
    return None

def calculate_entropy(data):
    """Calculate Shannon entropy of data"""
    if not data:
        return 0
    
    counter = Counter(data)
    length = len(data)
    entropy = 0
    
    for count in counter.values():
        if count == 0:
            continue
        probability = count / length
        entropy -= probability * math.log2(probability)
    
    return entropy

def analyze_file_structure(file_path):
    """Analyze file structure and characteristics"""
    try:
        with open(file_path, 'rb') as f:
            data = f.read()
        
        analysis = {}
        
        # Basic info
        analysis['file_size'] = len(data)
        analysis['file_name'] = file_path.name
        
        # Entropy analysis
        entropy = calculate_entropy(data)
        analysis['entropy'] = round(entropy, 4)
        analysis['entropy_assessment'] = (
            'Low (structured data)' if entropy < 3 else
            'Medium (some randomness)' if entropy < 6 else
            'High (compressed/encrypted)' if entropy < 7.5 else
            'Very High (encrypted/random)'
        )
        
        # Byte frequency analysis
        byte_freq = Counter(data)
        analysis['unique_bytes'] = len(byte_freq)
        analysis['most_common_byte'] = f"0x{byte_freq.most_common(1)[0][0]:02x}"
        analysis['most_common_count'] = byte_freq.most_common(1)[0][1]
        
        # Null byte analysis
        null_count = data.count(0)
        analysis['null_bytes'] = null_count
        analysis['null_percentage'] = round((null_count / len(data)) * 100, 2) if data else 0
        
        # ASCII analysis
        ascii_count = sum(1 for b in data if 32 <= b <= 126)
        analysis['ascii_chars'] = ascii_count
        analysis['ascii_percentage'] = round((ascii_count / len(data)) * 100, 2) if data else 0
        
        # Pattern detection
        patterns = []
        if data.count(b'\x00\x00') > len(data) * 0.01:
            patterns.append('Null padding detected')
        if data.count(b'\xFF\xFF') > len(data) * 0.01:
            patterns.append('High byte padding detected')
        if len(set(data[::8])) < 10:  # Every 8th byte is similar
            patterns.append('Structured data pattern detected')
        
        analysis['patterns'] = patterns if patterns else ['No obvious patterns detected']
        
        # File header analysis
        header = data[:32]
        analysis['header_hex'] = header.hex().upper()
        analysis['header_ascii'] = ''.join(chr(b) if 32 <= b <= 126 else '.' for b in header)
        
        return analysis
        
    except Exception as e:
        return {'error': f'Failed to analyze file: {str(e)}'}

def main():
    """Main function"""
    print("=== File Inspector ===")
    print("Deep inspection and analysis of uploaded files")
    print()
    
    # Find uploaded file
    uploaded_file = get_uploaded_file()
    
    if not uploaded_file:
        print("❌ No uploaded file found!")
        print("Please upload a file first using the file upload feature.")
        return
    
    print(f"🔍 Inspecting file: {uploaded_file.name}")
    print("=" * 60)
    
    # Analyze the file
    analysis = analyze_file_structure(uploaded_file)
    
    if 'error' in analysis:
        print(f"❌ Error: {analysis['error']}")
        return
    
    # Print results
    print(f"📁 File Name: {analysis['file_name']}")
    print(f"📏 File Size: {analysis['file_size']:,} bytes")
    print()
    
    print("🔬 ENTROPY ANALYSIS")
    print(f"   Shannon Entropy: {analysis['entropy']}")
    print(f"   Assessment: {analysis['entropy_assessment']}")
    print()
    
    print("📊 BYTE ANALYSIS")
    print(f"   Unique Bytes: {analysis['unique_bytes']}/256")
    print(f"   Most Common Byte: {analysis['most_common_byte']} (occurs {analysis['most_common_count']} times)")
    print(f"   Null Bytes: {analysis['null_bytes']} ({analysis['null_percentage']}%)")
    print(f"   ASCII Characters: {analysis['ascii_chars']} ({analysis['ascii_percentage']}%)")
    print()
    
    print("🔍 PATTERN ANALYSIS")
    for pattern in analysis['patterns']:
        print(f"   • {pattern}")
    print()
    
    print("🔖 FILE HEADER")
    print(f"   Hex: {analysis['header_hex']}")
    print(f"   ASCII: {analysis['header_ascii']}")
    
    print("=" * 60)
    print("✅ Inspection complete!")

if __name__ == "__main__":
    main()
