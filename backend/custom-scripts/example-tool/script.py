#!/usr/bin/env python3
"""
Example Custom Script for SectoolBox
This script demonstrates the custom script functionality.
"""

import sys
import datetime
import platform

def main():
    print("=== SectoolBox Custom Script Example ===")
    print(f"Execution Time: {datetime.datetime.now()}")
    print(f"Python Version: {sys.version}")
    print(f"Platform: {platform.system()} {platform.release()}")
    print(f"Arguments: {sys.argv[1:] if len(sys.argv) > 1 else 'None'}")
    
    # Simple demonstration functionality
    print("\n--- Script Functionality ---")
    print("1. This is a test script")
    print("2. It shows system information")
    print("3. Custom scripts can be placed in the custom-scripts directory")
    print("4. Each script needs a config.json file with name, command, and description")
    
    # Example of some analysis
    sample_data = "Hello, SectoolBox!"
    print(f"\n--- Sample Analysis ---")
    print(f"Sample Data: {sample_data}")
    print(f"Length: {len(sample_data)}")
    print(f"Uppercase: {sample_data.upper()}")
    print(f"Character Count: {dict((c, sample_data.count(c)) for c in set(sample_data))}")
    
    print("\n=== Script Completed Successfully ===")

if __name__ == "__main__":
    main()