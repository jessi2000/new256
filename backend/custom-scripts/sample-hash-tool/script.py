#!/usr/bin/env python3
"""
Sample Hash Tool - Custom CTF Script
This script demonstrates various hash analysis and text processing capabilities
"""

import hashlib
import binascii
import base64
import urllib.parse
import html
import sys
from datetime import datetime

def main():
    print("=" * 60)
    print("🔐 SAMPLE HASH TOOL - CTF ANALYSIS SCRIPT")
    print("=" * 60)
    print(f"⏰ Execution Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Sample data for demonstration
    sample_texts = [
        "CTF{sample_flag_12345}",
        "admin:password123",
        "Hello World!",
        "The quick brown fox jumps over the lazy dog"
    ]
    
    for i, text in enumerate(sample_texts, 1):
        print(f"📝 Sample Text {i}: {text}")
        print("-" * 40)
        
        # Generate various hashes
        md5_hash = hashlib.md5(text.encode()).hexdigest()
        sha1_hash = hashlib.sha1(text.encode()).hexdigest()
        sha256_hash = hashlib.sha256(text.encode()).hexdigest()
        
        print(f"🔍 MD5:    {md5_hash}")
        print(f"🔍 SHA1:   {sha1_hash}")
        print(f"🔍 SHA256: {sha256_hash}")
        
        # Encoding variations
        b64_encoded = base64.b64encode(text.encode()).decode()
        hex_encoded = text.encode().hex()
        url_encoded = urllib.parse.quote(text)
        html_encoded = html.escape(text)
        
        print(f"📦 Base64: {b64_encoded}")
        print(f"📦 Hex:    {hex_encoded}")
        print(f"📦 URL:    {url_encoded}")
        print(f"📦 HTML:   {html_encoded}")
        
        # Character analysis
        char_count = len(text)
        ascii_sum = sum(ord(c) for c in text)
        unique_chars = len(set(text))
        
        print(f"📊 Length: {char_count} | ASCII Sum: {ascii_sum} | Unique: {unique_chars}")
        print()
    
    # Demonstrate some CTF-style analysis
    print("🎯 CTF ANALYSIS FEATURES:")
    print("-" * 40)
    
    # Check for common CTF patterns
    flag_patterns = ["CTF{", "FLAG{", "flag{", "ctf{"]
    base64_pattern = r'^[A-Za-z0-9+/]*={0,2}$'
    
    for text in sample_texts:
        has_flag = any(pattern in text for pattern in flag_patterns)
        if has_flag:
            print(f"🚩 FLAG DETECTED: {text}")
    
    # ROT13 demonstration
    print("\n🔄 ROT13 CIPHER DEMO:")
    test_rot13 = "This is a ROT13 test"
    rot13_result = ''.join(
        chr((ord(c) - ord('a') + 13) % 26 + ord('a')) if 'a' <= c <= 'z' else
        chr((ord(c) - ord('A') + 13) % 26 + ord('A')) if 'A' <= c <= 'Z' else c
        for c in test_rot13
    )
    print(f"Original: {test_rot13}")
    print(f"ROT13:    {rot13_result}")
    
    # Binary representation
    print(f"\n💾 BINARY REPRESENTATION:")
    binary_text = "CTF"
    binary_repr = ' '.join(format(ord(c), '08b') for c in binary_text)
    print(f"Text: {binary_text}")
    print(f"Binary: {binary_repr}")
    
    print("\n" + "=" * 60)
    print("✅ SAMPLE ANALYSIS COMPLETE")
    print("💡 This demonstrates custom script capabilities in SectoolBox")
    print("🔧 Add your own scripts to enhance CTF analysis workflows")
    print("=" * 60)

if __name__ == "__main__":
    main()
