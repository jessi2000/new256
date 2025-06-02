#!/usr/bin/env python3
"""
SectoolBox Backend Test Script
Tests all backend API endpoints to verify functionality
"""
import requests
import json
import os
import time
import tempfile
import random
import string
from datetime import datetime

# Get backend URL from frontend .env file
with open('/app/frontend/.env', 'r') as f:
    for line in f:
        if line.startswith('REACT_APP_BACKEND_URL='):
            BACKEND_URL = line.strip().split('=')[1]
            break

# API base URL
API_URL = f"{BACKEND_URL}/api"

def test_health_check():
    """Test the health check endpoint"""
    print("\n=== Testing Health Check Endpoint ===")
    response = requests.get(f"{API_URL}/health")
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Response: {data}")
        assert 'status' in data and data['status'] == 'healthy'
        assert 'timestamp' in data
        print("✅ Health check endpoint is working correctly")
        return True
    else:
        print(f"❌ Health check failed: {response.text}")
        return False

def test_announcements():
    """Test the announcements endpoints"""
    print("\n=== Testing Announcements Endpoints ===")
    
    # Create a test announcement
    test_title = f"Test Announcement {datetime.now().isoformat()}"
    create_data = {
        "title": test_title,
        "content": "This is a test announcement created by the backend test script",
        "is_important": True
    }
    
    print("Creating test announcement...")
    create_response = requests.post(f"{API_URL}/announcements", json=create_data)
    print(f"Status Code: {create_response.status_code}")
    
    if create_response.status_code == 200:
        announcement = create_response.json()
        print(f"Created announcement: {announcement['title']}")
        announcement_id = announcement['id']
        
        # Get all announcements
        print("\nFetching all announcements...")
        get_response = requests.get(f"{API_URL}/announcements")
        print(f"Status Code: {get_response.status_code}")
        
        if get_response.status_code == 200:
            announcements = get_response.json()
            print(f"Found {len(announcements)} announcements")
            
            # Verify our test announcement is in the list
            found = False
            for a in announcements:
                if a['id'] == announcement_id:
                    found = True
                    break
            
            if found:
                print("✅ Test announcement found in the list")
            else:
                print("❌ Test announcement not found in the list")
                return False
            
            # Delete the test announcement
            print("\nDeleting test announcement...")
            delete_response = requests.delete(f"{API_URL}/announcements/{announcement_id}")
            print(f"Status Code: {delete_response.status_code}")
            
            if delete_response.status_code == 200:
                print("✅ Test announcement deleted successfully")
                
                # Verify it's gone
                get_response = requests.get(f"{API_URL}/announcements")
                announcements = get_response.json()
                found = False
                for a in announcements:
                    if a['id'] == announcement_id:
                        found = True
                        break
                
                if not found:
                    print("✅ Announcement deletion verified")
                    return True
                else:
                    print("❌ Announcement still exists after deletion")
                    return False
            else:
                print(f"❌ Failed to delete announcement: {delete_response.text}")
                return False
        else:
            print(f"❌ Failed to get announcements: {get_response.text}")
            return False
    else:
        print(f"❌ Failed to create announcement: {create_response.text}")
        return False

def test_custom_scripts():
    """Test the custom scripts endpoint"""
    print("\n=== Testing Custom Scripts Endpoint ===")
    response = requests.get(f"{API_URL}/custom-scripts")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        scripts = response.json()
        print(f"Found {len(scripts)} custom scripts:")
        
        # Check for the required scripts
        required_scripts = [
            "ExifTool Analyzer",
            "File Inspector",
            "String Extractor"
        ]
        
        found_scripts = []
        for script in scripts:
            print(f"- {script['name']}: {script['description']}")
            if script['name'] in required_scripts:
                found_scripts.append(script['name'])
        
        # Verify all required scripts are found
        missing_scripts = set(required_scripts) - set(found_scripts)
        if not missing_scripts:
            print("✅ All required custom scripts found")
            return True, scripts
        else:
            print(f"❌ Missing scripts: {missing_scripts}")
            return False, scripts
    else:
        print(f"❌ Failed to get custom scripts: {response.text}")
        return False, []

def create_test_file():
    """Create a test file for upload"""
    print("\n=== Creating Test File ===")
    
    # Create a temporary file with some test content
    with tempfile.NamedTemporaryFile(delete=False, suffix='.txt') as temp:
        # Add some random content
        content = f"""This is a test file created by the backend test script.
Created at: {datetime.now().isoformat()}

Some random data:
{''.join(random.choices(string.ascii_letters + string.digits, k=100))}

Some patterns for string extraction:
Email: test@example.com
URL: https://example.com
IP Address: 192.168.1.1
Credit Card: 4111-1111-1111-1111
"""
        temp.write(content.encode('utf-8'))
        temp_path = temp.name
    
    print(f"Created test file: {temp_path}")
    return temp_path

def test_file_upload_for_script(file_path):
    """Test the file upload for script endpoint"""
    print("\n=== Testing File Upload for Script ===")
    
    with open(file_path, 'rb') as f:
        files = {'file': (os.path.basename(file_path), f)}
        response = requests.post(f"{API_URL}/upload-file-for-script", files=files)
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"Upload result: {result}")
        assert 'message' in result and 'File uploaded successfully' in result['message']
        assert 'filename' in result
        assert 'size' in result
        assert 'path' in result
        print("✅ File upload for script endpoint is working correctly")
        return True
    else:
        print(f"❌ File upload failed: {response.text}")
        return False

def test_script_execution(script_name):
    """Test executing a custom script"""
    print(f"\n=== Testing Script Execution: {script_name} ===")
    
    request_data = {
        "script_name": script_name
    }
    
    response = requests.post(f"{API_URL}/execute-script", json=request_data)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"Execution result:")
        print(result['output'])
        print(f"Execution time: {result['execution_time']} seconds")
        print("✅ Script execution is working correctly")
        return True
    else:
        print(f"❌ Script execution failed: {response.text}")
        return False

def test_file_analysis(file_path):
    """Test the file analysis endpoint"""
    print("\n=== Testing File Analysis Endpoint ===")
    
    with open(file_path, 'rb') as f:
        files = {'file': (os.path.basename(file_path), f)}
        response = requests.post(f"{API_URL}/analyze-file", files=files)
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"Analysis result:")
        print(f"- Filename: {result['filename']}")
        print(f"- File size: {result['file_size']} bytes")
        print(f"- MIME type: {result['mime_type']}")
        print(f"- MD5 hash: {result['md5_hash']}")
        print(f"- SHA1 hash: {result['sha1_hash']}")
        print(f"- SHA256 hash: {result['sha256_hash']}")
        print(f"- Strings count: {result['strings_count']}")
        print(f"- Entropy: {result['entropy']}")
        
        # Check for required fields
        required_fields = ['id', 'filename', 'file_size', 'mime_type', 'md5_hash', 
                          'sha1_hash', 'sha256_hash', 'analysis_date']
        missing_fields = [field for field in required_fields if field not in result]
        
        if not missing_fields:
            print("✅ File analysis endpoint is working correctly")
            return True
        else:
            print(f"❌ Missing fields in response: {missing_fields}")
            return False
    else:
        print(f"❌ File analysis failed: {response.text}")
        return False

def test_get_file_analyses():
    """Test getting file analyses"""
    print("\n=== Testing Get File Analyses Endpoint ===")
    
    response = requests.get(f"{API_URL}/file-analyses")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        analyses = response.json()
        print(f"Found {len(analyses)} file analyses")
        if analyses:
            print(f"Most recent analysis: {analyses[0]['filename']}")
        print("✅ Get file analyses endpoint is working correctly")
        return True
    else:
        print(f"❌ Failed to get file analyses: {response.text}")
        return False

def test_tool_usage():
    """Test the tool usage logging endpoint"""
    print("\n=== Testing Tool Usage Logging Endpoint ===")
    
    tool_name = "Backend Test Script"
    input_data = "Test input data"
    
    response = requests.post(f"{API_URL}/tool-usage", params={"tool_name": tool_name, "input_data": input_data})
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"Result: {result}")
        assert 'message' in result and 'Usage logged' in result['message']
        print("✅ Tool usage logging endpoint is working correctly")
        return True
    else:
        print(f"❌ Tool usage logging failed: {response.text}")
        return False

def main():
    """Main test function"""
    print(f"Testing SectoolBox Backend API at: {API_URL}")
    print("=" * 80)
    
    # Track test results
    results = {}
    
    # Test health check
    results["Health Check"] = test_health_check()
    
    # Test announcements
    results["Announcements"] = test_announcements()
    
    # Test custom scripts
    custom_scripts_result, scripts = test_custom_scripts()
    results["Custom Scripts"] = custom_scripts_result
    
    # Create a test file
    test_file = create_test_file()
    
    # Test file upload for script
    results["File Upload for Script"] = test_file_upload_for_script(test_file)
    
    # Test script execution (if we have scripts)
    if scripts:
        # Find one of the new scripts to test
        script_to_test = None
        for script in scripts:
            if script['name'] in ["ExifTool Analyzer", "File Inspector", "String Extractor"]:
                script_to_test = script['name']
                break
        
        if script_to_test:
            results[f"Script Execution ({script_to_test})"] = test_script_execution(script_to_test)
        else:
            print("❌ No new scripts found to test execution")
            results["Script Execution"] = False
    else:
        results["Script Execution"] = False
    
    # Test file analysis
    results["File Analysis"] = test_file_analysis(test_file)
    
    # Test get file analyses
    results["Get File Analyses"] = test_get_file_analyses()
    
    # Test tool usage logging
    results["Tool Usage Logging"] = test_tool_usage()
    
    # Clean up the test file
    try:
        os.unlink(test_file)
        print(f"\nCleaned up test file: {test_file}")
    except:
        print(f"\nFailed to clean up test file: {test_file}")
    
    # Print summary
    print("\n" + "=" * 80)
    print("TEST RESULTS SUMMARY")
    print("=" * 80)
    
    all_passed = True
    for test_name, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{test_name}: {status}")
        if not passed:
            all_passed = False
    
    print("\nOVERALL RESULT:", "✅ ALL TESTS PASSED" if all_passed else "❌ SOME TESTS FAILED")
    print("=" * 80)
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    main()
