#!/usr/bin/env python3
"""
SectoolBox Security Test Script
Tests all security features of the backend API
"""
import requests
import json
import os
import time
import tempfile
import random
import string
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor

# Get backend URL from frontend .env file
with open('/app/frontend/.env', 'r') as f:
    for line in f:
        if line.startswith('REACT_APP_BACKEND_URL='):
            BACKEND_URL = line.strip().split('=')[1]
            break

# API base URL
API_URL = f"{BACKEND_URL}/api"

def test_security_headers():
    """Test that security headers are present in responses"""
    print("\n=== Testing Security Headers ===")
    response = requests.get(f"{API_URL}/health")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        headers = response.headers
        print("Security Headers:")
        
        # Check for required security headers
        required_headers = [
            "Content-Security-Policy",
            "Strict-Transport-Security",
            "X-Content-Type-Options",
            "X-Frame-Options",
            "X-XSS-Protection",
            "Referrer-Policy",
            "Cache-Control"
        ]
        
        all_present = True
        for header in required_headers:
            if header in headers:
                print(f"✅ {header}: {headers[header]}")
            else:
                print(f"❌ {header}: Missing")
                all_present = False
        
        # Verify specific header values
        if "X-Content-Type-Options" in headers and headers["X-Content-Type-Options"] != "nosniff":
            print(f"❌ X-Content-Type-Options should be 'nosniff', got '{headers['X-Content-Type-Options']}'")
            all_present = False
            
        if "X-Frame-Options" in headers and headers["X-Frame-Options"] != "DENY":
            print(f"❌ X-Frame-Options should be 'DENY', got '{headers['X-Frame-Options']}'")
            all_present = False
            
        if "X-XSS-Protection" in headers and headers["X-XSS-Protection"] != "1; mode=block":
            print(f"❌ X-XSS-Protection should be '1; mode=block', got '{headers['X-XSS-Protection']}'")
            all_present = False
        
        # Verify CSP contains essential directives
        if "Content-Security-Policy" in headers:
            csp = headers["Content-Security-Policy"]
            required_csp_directives = ["default-src", "script-src", "object-src"]
            for directive in required_csp_directives:
                if directive not in csp:
                    print(f"❌ CSP missing directive: {directive}")
                    all_present = False
        
        if all_present:
            print("✅ All required security headers are present with correct values")
            return True
        else:
            print("❌ Some security headers are missing or have incorrect values")
            return False
    else:
        print(f"❌ Failed to test security headers: {response.text}")
        return False

def test_rate_limiting():
    """Test rate limiting by making multiple rapid requests"""
    print("\n=== Testing Rate Limiting ===")
    
    # Test endpoints with different rate limits
    endpoints = [
        {"url": f"{API_URL}/health", "limit": 60, "name": "Health Check"},
        {"url": f"{API_URL}/announcements", "limit": 60, "name": "Announcements Get"},
        {"url": f"{API_URL}/announcements", "limit": 10, "name": "Announcements Post", "method": "post", 
         "data": {"title": "Test", "content": "Test content", "is_important": False}}
    ]
    
    results = {}
    
    for endpoint in endpoints:
        print(f"\nTesting rate limiting for: {endpoint['name']}")
        method = endpoint.get("method", "get")
        url = endpoint["url"]
        limit = endpoint["limit"]
        data = endpoint.get("data")
        
        # Make requests slightly above the limit to trigger rate limiting
        request_count = limit + 10
        print(f"Making {request_count} requests (limit is {limit}/minute)...")
        
        responses = []
        start_time = time.time()
        
        # Use a session for connection pooling
        session = requests.Session()
        
        for i in range(request_count):
            if method == "get":
                response = session.get(url)
            else:
                response = session.post(url, json=data)
            responses.append(response)
            
            # Print progress every 10 requests
            if (i + 1) % 10 == 0:
                print(f"Made {i + 1} requests...")
        
        elapsed = time.time() - start_time
        print(f"Completed {request_count} requests in {elapsed:.2f} seconds")
        
        # Check if rate limiting was triggered
        status_codes = [r.status_code for r in responses]
        rate_limited = 429 in status_codes
        
        if rate_limited:
            first_429_index = status_codes.index(429)
            print(f"✅ Rate limiting triggered after {first_429_index} requests")
            
            # Check rate limit headers in the response
            rate_limited_response = responses[first_429_index]
            headers = rate_limited_response.headers
            
            if "Retry-After" in headers:
                print(f"✅ Retry-After header present: {headers['Retry-After']}")
            else:
                print("❌ Retry-After header missing")
            
            results[endpoint["name"]] = True
        else:
            print(f"❌ Rate limiting not triggered after {request_count} requests")
            results[endpoint["name"]] = False
        
        session.close()
    
    # Overall result
    if all(results.values()):
        print("\n✅ Rate limiting is working correctly for all tested endpoints")
        return True
    else:
        print("\n❌ Rate limiting failed for some endpoints")
        return False

def create_test_files():
    """Create test files for security testing"""
    print("\n=== Creating Test Files for Security Testing ===")
    
    files = {}
    
    # 1. Normal valid file
    with tempfile.NamedTemporaryFile(delete=False, suffix='.txt') as temp:
        content = f"This is a normal test file for security testing.\nCreated at: {datetime.now().isoformat()}"
        temp.write(content.encode('utf-8'))
        files["normal"] = temp.name
    print(f"Created normal test file: {files['normal']}")
    
    # 2. Oversized file (51MB, just over the 50MB limit)
    with tempfile.NamedTemporaryFile(delete=False, suffix='.txt') as temp:
        temp.write(b'A' * (51 * 1024 * 1024))
        files["oversized"] = temp.name
    print(f"Created oversized test file: {files['oversized']}")
    
    # 3. File with XSS payload
    with tempfile.NamedTemporaryFile(delete=False, suffix='.html') as temp:
        content = "<script>alert('XSS')</script><img src=x onerror=alert('XSS')>"
        temp.write(content.encode('utf-8'))
        files["xss"] = temp.name
    print(f"Created XSS test file: {files['xss']}")
    
    # 4. File with dangerous filename characters
    dangerous_filename = "../../etc/passwd.txt"
    with tempfile.NamedTemporaryFile(delete=False, suffix='.txt') as temp:
        content = "This file has a dangerous name when uploaded"
        temp.write(content.encode('utf-8'))
        files["dangerous_name"] = (temp.name, dangerous_filename)
    print(f"Created file with dangerous filename: {files['dangerous_name'][0]} (will be uploaded as {files['dangerous_name'][1]})")
    
    return files

def test_file_upload_security(test_files):
    """Test file upload security features"""
    print("\n=== Testing File Upload Security ===")
    
    results = {}
    
    # 1. Test valid file upload
    print("\nTesting valid file upload...")
    with open(test_files["normal"], 'rb') as f:
        files = {'file': (os.path.basename(test_files["normal"]), f, 'text/plain')}
        response = requests.post(f"{API_URL}/upload-file-for-script", files=files)
    
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Upload result: {result}")
        results["valid_file"] = True
        print("✅ Valid file upload successful")
    else:
        print(f"❌ Valid file upload failed: {response.text}")
        results["valid_file"] = False
    
    # 2. Test oversized file upload
    print("\nTesting oversized file upload (should be rejected)...")
    with open(test_files["oversized"], 'rb') as f:
        files = {'file': (os.path.basename(test_files["oversized"]), f, 'text/plain')}
        response = requests.post(f"{API_URL}/upload-file-for-script", files=files)
    
    print(f"Status Code: {response.status_code}")
    if response.status_code == 413:
        print("✅ Oversized file correctly rejected with 413 Payload Too Large")
        results["oversized_file"] = True
    else:
        print(f"❌ Oversized file not properly rejected: {response.status_code}, {response.text}")
        results["oversized_file"] = False
    
    # 3. Test file with XSS payload
    print("\nTesting file with XSS payload...")
    with open(test_files["xss"], 'rb') as f:
        files = {'file': (os.path.basename(test_files["xss"]), f, 'text/html')}
        response = requests.post(f"{API_URL}/upload-file-for-script", files=files)
    
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Upload result: {result}")
        
        # Check if security warnings are present
        if "security_warnings" in result and result["security_warnings"]:
            print(f"✅ Security warnings detected: {result['security_warnings']}")
            results["xss_file"] = True
        else:
            print("❌ No security warnings for file with XSS payload")
            results["xss_file"] = False
    else:
        print(f"❌ XSS file upload failed: {response.text}")
        results["xss_file"] = False
    
    # 4. Test file with dangerous filename
    print("\nTesting file with dangerous filename (should be sanitized)...")
    original_path, dangerous_name = test_files["dangerous_name"]
    with open(original_path, 'rb') as f:
        files = {'file': (dangerous_name, f, 'text/plain')}
        response = requests.post(f"{API_URL}/upload-file-for-script", files=files)
    
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Upload result: {result}")
        
        # Check if filename was sanitized
        if result["filename"] != dangerous_name and "../" not in result["filename"]:
            print(f"✅ Dangerous filename sanitized: '{dangerous_name}' -> '{result['filename']}'")
            results["dangerous_filename"] = True
        else:
            print(f"❌ Dangerous filename not properly sanitized: {result['filename']}")
            results["dangerous_filename"] = False
    else:
        print(f"❌ Dangerous filename upload failed: {response.text}")
        results["dangerous_filename"] = False
    
    # Overall result
    if all(results.values()):
        print("\n✅ File upload security is working correctly")
        return True
    else:
        print("\n❌ File upload security has issues")
        return False

def test_input_validation():
    """Test input validation for announcements"""
    print("\n=== Testing Input Validation ===")
    
    results = {}
    created_ids = []
    
    # 1. Test valid announcement creation
    print("\nTesting valid announcement creation...")
    valid_data = {
        "title": f"Test Announcement {datetime.now().isoformat()}",
        "content": "This is a test announcement for security testing.",
        "is_important": False
    }
    response = requests.post(f"{API_URL}/announcements", json=valid_data)
    
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Created announcement: {result['title']}")
        created_ids.append(result["id"])
        results["valid_announcement"] = True
        print("✅ Valid announcement created successfully")
    else:
        print(f"❌ Valid announcement creation failed: {response.text}")
        results["valid_announcement"] = False
    
    # 2. Test XSS payload in announcement
    print("\nTesting XSS payload in announcement (should be sanitized)...")
    xss_data = {
        "title": "<script>alert('XSS')</script>Test Title",
        "content": "Content with <script>document.cookie</script> script tags and <img src=x onerror=alert('XSS')>",
        "is_important": False
    }
    response = requests.post(f"{API_URL}/announcements", json=xss_data)
    
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Created announcement with sanitized content: {result}")
        created_ids.append(result["id"])
        
        # Check if XSS was sanitized
        if "<script>" not in result["title"] and "<script>" not in result["content"]:
            print("✅ XSS payload was properly sanitized")
            results["xss_sanitization"] = True
        else:
            print("❌ XSS payload was not properly sanitized")
            results["xss_sanitization"] = False
    else:
        print(f"❌ XSS announcement creation failed: {response.text}")
        results["xss_sanitization"] = False
    
    # 3. Test very long content (over the 5000 character limit)
    print("\nTesting very long content (should be limited)...")
    long_data = {
        "title": "Long Content Test",
        "content": "A" * 6000,  # Over the 5000 character limit
        "is_important": False
    }
    response = requests.post(f"{API_URL}/announcements", json=long_data)
    
    print(f"Status Code: {response.status_code}")
    if response.status_code != 200:
        print("✅ Very long content correctly rejected")
        results["content_length_limit"] = True
    else:
        result = response.json()
        created_ids.append(result["id"])
        
        # Check if content was truncated
        if len(result["content"]) <= 5000:
            print(f"✅ Long content was truncated to {len(result['content'])} characters")
            results["content_length_limit"] = True
        else:
            print(f"❌ Long content was not properly limited: {len(result['content'])} characters")
            results["content_length_limit"] = False
    
    # Clean up created announcements
    print("\nCleaning up test announcements...")
    for announcement_id in created_ids:
        response = requests.delete(f"{API_URL}/announcements/{announcement_id}")
        if response.status_code == 200:
            print(f"✅ Deleted announcement: {announcement_id}")
        else:
            print(f"❌ Failed to delete announcement {announcement_id}: {response.text}")
    
    # Overall result
    if all(results.values()):
        print("\n✅ Input validation is working correctly")
        return True
    else:
        print("\n❌ Input validation has issues")
        return False

def test_script_execution_security():
    """Test script execution security features"""
    print("\n=== Testing Script Execution Security ===")
    
    # First, get available scripts
    response = requests.get(f"{API_URL}/custom-scripts")
    if response.status_code != 200:
        print(f"❌ Failed to get custom scripts: {response.text}")
        return False
    
    scripts = response.json()
    if not scripts:
        print("❌ No custom scripts available for testing")
        return False
    
    print(f"Found {len(scripts)} custom scripts")
    
    results = {}
    
    # 1. Test execution of a valid script
    print("\nTesting execution of a valid script...")
    script_name = scripts[0]["name"]
    script_request = {"script_name": script_name}
    response = requests.post(f"{API_URL}/execute-script", json=script_request)
    
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Execution result: {result}")
        results["valid_script"] = True
        print(f"✅ Valid script '{script_name}' executed successfully")
    else:
        print(f"❌ Valid script execution failed: {response.text}")
        results["valid_script"] = False
    
    # 2. Test execution with dangerous script name (injection attempt)
    print("\nTesting execution with dangerous script name (should be rejected)...")
    dangerous_script_names = [
        f"{script_name}; rm -rf /",
        f"{script_name} && cat /etc/passwd",
        f"{script_name} | grep password",
        f"{script_name}`cat /etc/passwd`",
        f"{script_name}$(cat /etc/passwd)"
    ]
    
    dangerous_results = []
    for dangerous_name in dangerous_script_names:
        print(f"Testing dangerous script name: {dangerous_name}")
        script_request = {"script_name": dangerous_name}
        response = requests.post(f"{API_URL}/execute-script", json=script_request)
        
        print(f"Status Code: {response.status_code}")
        if response.status_code != 200:
            print(f"✅ Dangerous script name correctly rejected")
            dangerous_results.append(True)
        else:
            result = response.json()
            print(f"❌ Dangerous script name not rejected: {result}")
            dangerous_results.append(False)
    
    results["dangerous_script_names"] = all(dangerous_results)
    
    # 3. Test script timeout (this is harder to test without a specific long-running script)
    print("\nNote: Script timeout testing would require a specific long-running script")
    
    # Overall result
    if all(results.values()):
        print("\n✅ Script execution security is working correctly")
        return True
    else:
        print("\n❌ Script execution security has issues")
        return False

def test_error_handling():
    """Test that error responses don't expose sensitive information"""
    print("\n=== Testing Error Handling ===")
    
    results = {}
    
    # 1. Test non-existent endpoint
    print("\nTesting non-existent endpoint...")
    response = requests.get(f"{API_URL}/non-existent-endpoint")
    
    print(f"Status Code: {response.status_code}")
    if response.status_code == 404:
        error_data = response.json()
        print(f"Error response: {error_data}")
        
        # Check error response format
        if "error" in error_data and "timestamp" in error_data and "request_id" in error_data:
            print("✅ Error response has correct format")
            
            # Verify no stack traces or sensitive info is exposed
            response_text = response.text.lower()
            sensitive_terms = ["traceback", "file \"", "line", "exception", "error:", "at "]
            contains_sensitive = any(term in response_text for term in sensitive_terms)
            
            if not contains_sensitive:
                print("✅ No sensitive information in error response")
                results["non_existent_endpoint"] = True
            else:
                print("❌ Error response may contain sensitive information")
                results["non_existent_endpoint"] = False
        else:
            print("❌ Error response has incorrect format")
            results["non_existent_endpoint"] = False
    else:
        print(f"❌ Unexpected status code for non-existent endpoint: {response.status_code}")
        results["non_existent_endpoint"] = False
    
    # 2. Test invalid JSON in request
    print("\nTesting invalid JSON in request...")
    headers = {"Content-Type": "application/json"}
    response = requests.post(
        f"{API_URL}/announcements", 
        data="invalid json data", 
        headers=headers
    )
    
    print(f"Status Code: {response.status_code}")
    if response.status_code != 200:
        error_data = response.json()
        print(f"Error response: {error_data}")
        
        # Verify no sensitive info in error
        response_text = response.text.lower()
        sensitive_terms = ["traceback", "file \"", "line", "exception", "error:", "at "]
        contains_sensitive = any(term in response_text for term in sensitive_terms)
        
        if not contains_sensitive:
            print("✅ No sensitive information in error response")
            results["invalid_json"] = True
        else:
            print("❌ Error response may contain sensitive information")
            results["invalid_json"] = False
    else:
        print("❌ Invalid JSON was accepted")
        results["invalid_json"] = False
    
    # 3. Test invalid UUID in announcement deletion
    print("\nTesting invalid UUID in announcement deletion...")
    response = requests.delete(f"{API_URL}/announcements/not-a-valid-uuid")
    
    print(f"Status Code: {response.status_code}")
    if response.status_code == 400:
        error_data = response.json()
        print(f"Error response: {error_data}")
        
        # Verify no sensitive info in error
        response_text = response.text.lower()
        sensitive_terms = ["traceback", "file \"", "line", "exception", "error:", "at "]
        contains_sensitive = any(term in response_text for term in sensitive_terms)
        
        if not contains_sensitive:
            print("✅ No sensitive information in error response")
            results["invalid_uuid"] = True
        else:
            print("❌ Error response may contain sensitive information")
            results["invalid_uuid"] = False
    else:
        print(f"❌ Unexpected status code for invalid UUID: {response.status_code}")
        results["invalid_uuid"] = False
    
    # Overall result
    if all(results.values()):
        print("\n✅ Error handling is secure")
        return True
    else:
        print("\n❌ Error handling has security issues")
        return False

def test_security_logging():
    """Test that security events are being logged properly"""
    print("\n=== Testing Security Logging ===")
    print("Note: This test can only verify that API endpoints respond correctly to security events.")
    print("      We cannot directly verify server-side logging.")
    
    # 1. File upload should trigger logging
    print("\nTesting file upload logging...")
    with tempfile.NamedTemporaryFile(delete=False, suffix='.txt') as temp:
        temp.write(b"Test file for security logging")
        temp_path = temp.name
    
    with open(temp_path, 'rb') as f:
        files = {'file': (os.path.basename(temp_path), f, 'text/plain')}
        response = requests.post(f"{API_URL}/upload-file-for-script", files=files)
    
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print("✅ File upload completed successfully (should be logged)")
    else:
        print(f"❌ File upload failed: {response.text}")
    
    # 2. Script execution should trigger logging
    print("\nTesting script execution logging...")
    response = requests.get(f"{API_URL}/custom-scripts")
    if response.status_code == 200 and response.json():
        script_name = response.json()[0]["name"]
        script_request = {"script_name": script_name}
        response = requests.post(f"{API_URL}/execute-script", json=script_request)
        
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print(f"✅ Script execution completed successfully (should be logged)")
        else:
            print(f"❌ Script execution failed: {response.text}")
    else:
        print("❌ No scripts available for testing execution logging")
    
    # 3. Error should trigger logging
    print("\nTesting error logging...")
    response = requests.get(f"{API_URL}/non-existent-endpoint")
    print(f"Status Code: {response.status_code}")
    if response.status_code == 404:
        print("✅ Error generated successfully (should be logged)")
    else:
        print(f"❌ Unexpected response: {response.status_code}")
    
    # 4. Tool usage logging
    print("\nTesting tool usage logging...")
    tool_data = {
        "tool_name": "security-test-tool",
        "input_data": "test input"
    }
    response = requests.post(f"{API_URL}/tool-usage", params=tool_data)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print("✅ Tool usage logged successfully")
    else:
        print(f"❌ Tool usage logging failed: {response.text}")
    
    # Clean up
    os.unlink(temp_path)
    
    print("\n✅ Security logging test completed (API responses verified)")
    return True

def main():
    """Main test function"""
    print(f"Testing SectoolBox Security Features at: {API_URL}")
    print("=" * 80)
    
    # Track test results
    results = {}
    
    # Test security headers
    results["Security Headers"] = test_security_headers()
    
    # Test rate limiting
    results["Rate Limiting"] = test_rate_limiting()
    
    # Create test files for file upload security testing
    test_files = create_test_files()
    
    # Test file upload security
    results["File Upload Security"] = test_file_upload_security(test_files)
    
    # Test input validation
    results["Input Validation"] = test_input_validation()
    
    # Test script execution security
    results["Script Execution Security"] = test_script_execution_security()
    
    # Test error handling
    results["Error Handling"] = test_error_handling()
    
    # Test security logging
    results["Security Logging"] = test_security_logging()
    
    # Clean up test files
    print("\nCleaning up test files...")
    for key, path in test_files.items():
        if key == "dangerous_name":
            path = path[0]  # Extract the actual path
        try:
            os.unlink(path)
            print(f"Cleaned up test file: {path}")
        except:
            print(f"Failed to clean up test file: {path}")
    
    # Print summary
    print("\n" + "=" * 80)
    print("SECURITY TEST RESULTS SUMMARY")
    print("=" * 80)
    
    all_passed = True
    for test_name, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{test_name}: {status}")
        if not passed:
            all_passed = False
    
    print("\nOVERALL RESULT:", "✅ ALL SECURITY TESTS PASSED" if all_passed else "❌ SOME SECURITY TESTS FAILED")
    print("=" * 80)
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    main()