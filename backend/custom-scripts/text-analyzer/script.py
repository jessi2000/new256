#!/usr/bin/env python3
"""
Demo Text Analyzer for SectoolBox
This script analyzes text for various metrics and patterns.
"""

import sys
import re
import collections
import math
import datetime

def analyze_text(text):
    """Analyze the given text and return various metrics."""
    results = {}
    
    # Basic metrics
    results["length"] = len(text)
    results["word_count"] = len(text.split())
    results["line_count"] = text.count('\n') + 1
    
    # Character frequency
    char_freq = collections.Counter(text)
    results["char_frequency"] = {char: count for char, count in char_freq.most_common(10)}
    
    # Word frequency
    words = re.findall(r'\b\w+\b', text.lower())
    word_freq = collections.Counter(words)
    results["word_frequency"] = {word: count for word, count in word_freq.most_common(10)}
    
    # Average word length
    if results["word_count"] > 0:
        results["avg_word_length"] = sum(len(word) for word in words) / results["word_count"]
    else:
        results["avg_word_length"] = 0
    
    # Readability (simple metric)
    if results["word_count"] > 0 and results["line_count"] > 0:
        avg_words_per_sentence = results["word_count"] / results["line_count"]
        results["readability"] = "Complex" if avg_words_per_sentence > 15 else "Medium" if avg_words_per_sentence > 8 else "Simple"
    else:
        results["readability"] = "N/A"
    
    # Entropy calculation
    if text:
        entropy = 0
        for count in char_freq.values():
            probability = count / len(text)
            entropy -= probability * math.log2(probability)
        results["entropy"] = entropy
    else:
        results["entropy"] = 0
    
    # Special patterns
    results["urls"] = re.findall(r'https?://\S+', text)
    results["emails"] = re.findall(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)
    results["hashtags"] = re.findall(r'#\w+', text)
    
    return results

def main():
    print("=== Demo Text Analyzer ===")
    print(f"Execution Time: {datetime.datetime.now()}")
    
    # Sample text for analysis
    sample_text = """
    This is a sample text for the Demo Text Analyzer.
    It contains multiple lines and various words.
    Some words appear multiple times, like text, analyzer, and demo.
    
    The analyzer can detect patterns like URLs: https://example.com
    And email addresses: example@email.com
    And even hashtags like #textanalysis and #demo
    
    This tool demonstrates text analysis capabilities in SectoolBox.
    """
    
    print("\n--- Sample Text ---")
    print(sample_text)
    
    # Analyze the text
    results = analyze_text(sample_text)
    
    print("\n--- Analysis Results ---")
    print(f"Text Length: {results['length']} characters")
    print(f"Word Count: {results['word_count']} words")
    print(f"Line Count: {results['line_count']} lines")
    print(f"Average Word Length: {results['avg_word_length']:.2f} characters")
    print(f"Readability: {results['readability']}")
    print(f"Text Entropy: {results['entropy']:.2f} bits per character")
    
    print("\n--- Top 5 Most Common Characters ---")
    for char, count in list(results['char_frequency'].items())[:5]:
        if char.isspace():
            char_display = f"Space ({ord(char)})"
        elif char == '\n':
            char_display = "Newline"
        else:
            char_display = char
        print(f"'{char_display}': {count} occurrences")
    
    print("\n--- Top 5 Most Common Words ---")
    for word, count in list(results['word_frequency'].items())[:5]:
        print(f"'{word}': {count} occurrences")
    
    print("\n--- Detected Patterns ---")
    print(f"URLs: {results['urls'] if results['urls'] else 'None'}")
    print(f"Emails: {results['emails'] if results['emails'] else 'None'}")
    print(f"Hashtags: {results['hashtags'] if results['hashtags'] else 'None'}")
    
    print("\n=== Analysis Completed Successfully ===")

if __name__ == "__main__":
    main()