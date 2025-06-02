#!/usr/bin/env python3
"""
String Extractor Script
Extract and analyze printable strings from uploaded files.
"""
import os
import re
import sys
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

def extract_strings(file_path, min_length=4):
    """Extract printable strings from file"""
    try:
        with open(file_path, 'rb') as f:
            data = f.read()
        
        # Extract ASCII strings
        ascii_strings = []
        current_string = ""
        
        for byte in data:
            if 32 <= byte <= 126:  # Printable ASCII
                current_string += chr(byte)
            else:
                if len(current_string) >= min_length:
                    ascii_strings.append(current_string)
                current_string = ""
        
        # Don't forget the last string
        if len(current_string) >= min_length:
            ascii_strings.append(current_string)
        
        # Extract Unicode strings (UTF-8)
        try:
            text = data.decode('utf-8', errors='ignore')
            unicode_strings = re.findall(r'[^\x00-\x1f\x7f-\x9f]{4,}', text)
        except:
            unicode_strings = []
        
        # Extract wide strings (UTF-16)
        wide_strings = []
        try:
            # Try UTF-16 LE
            text_wide = data.decode('utf-16le', errors='ignore')
            wide_strings.extend(re.findall(r'[^\x00-\x1f\x7f-\x9f]{4,}', text_wide))
        except:
            pass
        
        return {
            'ascii': ascii_strings,
            'unicode': unicode_strings,
            'wide': wide_strings
        }
        
    except Exception as e:
        return {'error': f'Failed to extract strings: {str(e)}'}

def analyze_strings(strings_dict):
    """Analyze extracted strings for interesting patterns"""
    all_strings = []
    for string_type, strings in strings_dict.items():
        if string_type != 'error':
            all_strings.extend(strings)
    
    analysis = {
        'total_strings': len(all_strings),
        'by_type': {k: len(v) for k, v in strings_dict.items() if k != 'error'},
        'interesting_patterns': []
    }
    
    # Look for interesting patterns
    patterns = {
        'URLs': re.compile(r'https?://[^\s]+'),
        'Email addresses': re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'),
        'File paths': re.compile(r'[A-Za-z]:\\[\\a-zA-Z0-9\s._-]+|/[/a-zA-Z0-9\s._-]+'),
        'IP addresses': re.compile(r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b'),
        'Credit card numbers': re.compile(r'\b(?:\d{4}[-\s]?){3}\d{4}\b'),
        'Registry keys': re.compile(r'HKEY_[A-Z_]+\\[\\A-Za-z0-9\s._-]+'),
        'Base64': re.compile(r'[A-Za-z0-9+/]{20,}={0,2}'),
    }
    
    found_patterns = {}
    for pattern_name, pattern in patterns.items():
        matches = []
        for string in all_strings:
            matches.extend(pattern.findall(string))
        if matches:
            found_patterns[pattern_name] = list(set(matches))  # Remove duplicates
    
    analysis['found_patterns'] = found_patterns
    
    # String length analysis
    lengths = [len(s) for s in all_strings]
    if lengths:
        analysis['string_lengths'] = {
            'min': min(lengths),
            'max': max(lengths),
            'avg': sum(lengths) / len(lengths)
        }
    
    return analysis

def main():
    """Main function"""
    print("=== String Extractor ===")
    print("Extracting and analyzing strings from uploaded files")
    print()
    
    # Find uploaded file
    uploaded_file = get_uploaded_file()
    
    if not uploaded_file:
        print("❌ No uploaded file found!")
        print("Please upload a file first using the file upload feature.")
        return
    
    print(f"🔍 Extracting strings from: {uploaded_file.name}")
    print("=" * 60)
    
    # Extract strings
    strings_dict = extract_strings(uploaded_file)
    
    if 'error' in strings_dict:
        print(f"❌ Error: {strings_dict['error']}")
        return
    
    # Analyze strings
    analysis = analyze_strings(strings_dict)
    
    # Print results
    print(f"📊 EXTRACTION SUMMARY")
    print(f"   Total strings found: {analysis['total_strings']}")
    for string_type, count in analysis['by_type'].items():
        print(f"   {string_type.capitalize()}: {count}")
    print()
    
    if 'string_lengths' in analysis:
        lengths = analysis['string_lengths']
        print(f"📏 STRING LENGTH STATISTICS")
        print(f"   Minimum length: {lengths['min']}")
        print(f"   Maximum length: {lengths['max']}")
        print(f"   Average length: {lengths['avg']:.1f}")
        print()
    
    # Show interesting patterns
    if analysis['found_patterns']:
        print("🎯 INTERESTING PATTERNS FOUND")
        for pattern_name, matches in analysis['found_patterns'].items():
            print(f"   {pattern_name}: {len(matches)} found")
            for match in matches[:3]:  # Show first 3 matches
                print(f"      • {match}")
            if len(matches) > 3:
                print(f"      ... and {len(matches) - 3} more")
            print()
    else:
        print("🎯 No interesting patterns detected")
        print()
    
    # Show sample strings
    all_strings = []
    for string_type, strings in strings_dict.items():
        if string_type != 'error':
            all_strings.extend(strings)
    
    if all_strings:
        print("📝 SAMPLE STRINGS (first 10)")
        for i, string in enumerate(all_strings[:10], 1):
            display_string = string[:50] + "..." if len(string) > 50 else string
            print(f"   {i:2d}. {display_string}")
        
        if len(all_strings) > 10:
            print(f"   ... and {len(all_strings) - 10} more strings")
    
    print("=" * 60)
    print("✅ String extraction complete!")

if __name__ == "__main__":
    main()
