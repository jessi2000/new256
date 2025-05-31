#!/usr/bin/env python3
"""
Demo Text Analyzer - CTF Text Analysis Tool
Analyzes text for various patterns commonly found in CTF challenges
"""

import string
import re
from collections import Counter
from datetime import datetime

def analyze_text_patterns(text):
    """Analyze various patterns in text that might be useful for CTF challenges"""
    results = []
    
    results.append("=" * 60)
    results.append("🔍 DEMO TEXT ANALYZER - CTF PATTERN DETECTION")
    results.append("=" * 60)
    results.append(f"⏰ Analysis Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    results.append("")
    
    # Sample texts if none provided
    sample_texts = [
        "VGhpcyBpcyBhIGJhc2U2NCBlbmNvZGVkIHN0cmluZw==",
        "FLAG{th1s_1s_4_s4mpl3_fl4g}",
        ".... . .-.. .-.. ---   .-- --- .-. .-.. -..",
        "Guvf vf EBG13 rapbqrq grkg",
        "7468697320697320686578",
        "The quick brown fox jumps over the lazy dog"
    ]
    
    for i, text in enumerate(sample_texts, 1):
        results.append(f"📝 Sample Text {i}: {text}")
        results.append("-" * 50)
        
        # Basic statistics
        results.append(f"📊 Length: {len(text)} characters")
        results.append(f"📊 Words: {len(text.split())}")
        results.append(f"📊 Unique characters: {len(set(text))}")
        
        # Character frequency analysis
        char_freq = Counter(text.lower())
        most_common = char_freq.most_common(5)
        results.append(f"📊 Top 5 characters: {most_common}")
        
        # Pattern detection
        results.append("\n🔍 PATTERN ANALYSIS:")
        
        # Check for Base64 pattern
        if re.match(r'^[A-Za-z0-9+/]*={0,2}$', text.replace(' ', '')):
            results.append("✅ Potential Base64 encoding detected!")
            try:
                import base64
                decoded = base64.b64decode(text).decode('utf-8', errors='ignore')
                results.append(f"   Decoded: {decoded}")
            except:
                results.append("   Failed to decode as Base64")
        
        # Check for flag format
        flag_patterns = [
            r'FLAG\{[^}]+\}',
            r'CTF\{[^}]+\}',
            r'flag\{[^}]+\}',
            r'ctf\{[^}]+\}'
        ]
        for pattern in flag_patterns:
            if re.search(pattern, text):
                results.append("🚩 FLAG FORMAT DETECTED!")
                break
        
        # Check for Morse code
        if re.match(r'^[.\-\s]+$', text):
            results.append("📡 Potential Morse code detected!")
            morse_dict = {
                '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E',
                '..-.': 'F', '--.': 'G', '....': 'H', '..': 'I', '.---': 'J',
                '-.-': 'K', '.-..': 'L', '--': 'M', '-.': 'N', '---': 'O',
                '.--.': 'P', '--.-': 'Q', '.-.': 'R', '...': 'S', '-': 'T',
                '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X', '-.--': 'Y',
                '--..': 'Z'
            }
            words = text.split('  ')
            decoded_words = []
            for word in words:
                decoded_word = ''
                for char in word.split(' '):
                    if char in morse_dict:
                        decoded_word += morse_dict[char]
                decoded_words.append(decoded_word)
            if decoded_words:
                results.append(f"   Decoded: {' '.join(decoded_words)}")
        
        # Check for hex
        if re.match(r'^[0-9a-fA-F\s]+$', text.replace(' ', '')):
            results.append("🔢 Potential hexadecimal encoding detected!")
            try:
                hex_clean = text.replace(' ', '')
                if len(hex_clean) % 2 == 0:
                    decoded = bytes.fromhex(hex_clean).decode('utf-8', errors='ignore')
                    results.append(f"   Decoded: {decoded}")
            except:
                results.append("   Failed to decode as hex")
        
        # Check for ROT13
        rot13_decoded = text.translate(str.maketrans(
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
            'NOPQRSTUVWXYZABCDEFGHIJKLMnopqrstuvwxyzabcdefghijklm'
        ))
        if rot13_decoded != text and rot13_decoded.isprintable():
            results.append("🔄 ROT13 encoding detected!")
            results.append(f"   ROT13 decoded: {rot13_decoded}")
        
        # Entropy calculation (simplified)
        entropy = 0
        for char in set(text):
            freq = text.count(char) / len(text)
            if freq > 0:
                entropy -= freq * (freq).bit_length()
        results.append(f"📈 Text entropy: {entropy:.2f}")
        
        results.append("")
    
    # Final analysis summary
    results.append("🎯 ANALYSIS SUMMARY:")
    results.append("-" * 30)
    results.append("✅ Pattern detection completed")
    results.append("✅ Character frequency analysis done")
    results.append("✅ Encoding detection performed")
    results.append("✅ Entropy calculation finished")
    results.append("")
    results.append("💡 This demo shows text analysis capabilities")
    results.append("🔧 Extend this script for specific CTF challenges")
    results.append("=" * 60)
    
    return "\n".join(results)

def main():
    """Main execution function"""
    try:
        analysis_result = analyze_text_patterns("")
        print(analysis_result)
    except Exception as e:
        print(f"Error during analysis: {str(e)}")
        print("Script execution failed")

if __name__ == "__main__":
    main()
