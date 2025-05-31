#!/usr/bin/env python3
import requests
import json
import os
import time
import unittest
import tempfile
import random
import string
from datetime import datetime

# Get the backend URL from the frontend .env file
with open('/app/frontend/.env', 'r') as f:
    for line in f:
        if line.startswith('REACT_APP_BACKEND_URL='):
            BACKEND_URL = line.strip().split('=')[1].strip('"\'')
            break

# Ensure the URL ends with /api for all API requests
API_URL = f"{BACKEND_URL}/api"

class SectoolBoxBackendTests(unittest.TestCase):
    """Test suite for SectoolBox backend API"""

    def setUp(self):
        """Set up test environment"""
        self.session = requests.Session()
        # Generate a random string for test data
        self.random_string = ''.join(random.choices(string.ascii_letters + string.digits, k=10))
        
    def tearDown(self):
        """Clean up after tests"""
        self.session.close()

    def test_01_health_check(self):
        """Test the health check endpoint"""
        response = self.session.get(f"{API_URL}/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertIn("timestamp", data)
        print("✅ Health check endpoint working")

    def test_02_root_endpoint(self):
        """Test the root endpoint"""
        response = self.session.get(API_URL)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("message", data)
        self.assertIn("version", data)
        print("✅ Root endpoint working")

    def test_03_announcements_crud(self):
        """Test CRUD operations for announcements"""
        # Create an announcement
        announcement_data = {
            "title": f"Test Announcement {self.random_string}",
            "content": "This is a test announcement created by the test suite",
            "is_important": True
        }
        
        # Create
        create_response = self.session.post(
            f"{API_URL}/announcements", 
            json=announcement_data
        )
        self.assertEqual(create_response.status_code, 200)
        created_announcement = create_response.json()
        self.assertEqual(created_announcement["title"], announcement_data["title"])
        self.assertEqual(created_announcement["content"], announcement_data["content"])
        self.assertEqual(created_announcement["is_important"], announcement_data["is_important"])
        announcement_id = created_announcement["id"]
        
        # Read (list)
        list_response = self.session.get(f"{API_URL}/announcements")
        self.assertEqual(list_response.status_code, 200)
        announcements = list_response.json()
        self.assertIsInstance(announcements, list)
        
        # Verify our announcement is in the list
        found = False
        for announcement in announcements:
            if announcement["id"] == announcement_id:
                found = True
                break
        self.assertTrue(found, "Created announcement not found in list")
        
        # Delete
        delete_response = self.session.delete(f"{API_URL}/announcements/{announcement_id}")
        self.assertEqual(delete_response.status_code, 200)
        
        # Verify deletion
        list_response_after = self.session.get(f"{API_URL}/announcements")
        announcements_after = list_response_after.json()
        
        found_after = False
        for announcement in announcements_after:
            if announcement["id"] == announcement_id:
                found_after = True
                break
        self.assertFalse(found_after, "Announcement was not properly deleted")
        
        print("✅ Announcements CRUD operations working")

    def test_04_file_analysis(self):
        """Test file analysis functionality"""
        # Create a temporary text file
        with tempfile.NamedTemporaryFile(suffix='.txt', delete=False) as temp:
            temp.write(b"This is a test file for analysis.\nIt contains some text data for testing the file analysis API.")
            temp_path = temp.name
        
        try:
            # Upload the file for analysis
            with open(temp_path, 'rb') as f:
                files = {'file': ('test_file.txt', f, 'text/plain')}
                response = self.session.post(f"{API_URL}/analyze-file", files=files)
            
            self.assertEqual(response.status_code, 200)
            analysis = response.json()
            
            # Verify analysis fields
            self.assertEqual(analysis["filename"], "test_file.txt")
            self.assertIn("file_size", analysis)
            self.assertIn("mime_type", analysis)
            self.assertIn("md5_hash", analysis)
            self.assertIn("sha1_hash", analysis)
            self.assertIn("sha256_hash", analysis)
            self.assertIn("strings_count", analysis)
            self.assertIn("entropy", analysis)
            
            # Get file analyses list
            list_response = self.session.get(f"{API_URL}/file-analyses")
            self.assertEqual(list_response.status_code, 200)
            analyses = list_response.json()
            self.assertIsInstance(analyses, list)
            
            # Verify our analysis is in the list
            found = False
            for item in analyses:
                if item["id"] == analysis["id"]:
                    found = True
                    break
            self.assertTrue(found, "Created file analysis not found in list")
            
            print("✅ File analysis functionality working")
            
        finally:
            # Clean up the temporary file
            os.unlink(temp_path)

    def test_05_tool_usage_logging(self):
        """Test tool usage logging"""
        tool_data = {
            "tool_name": f"test_tool_{self.random_string}",
            "input_data": "Test input data"
        }
        
        response = self.session.post(f"{API_URL}/tool-usage", params=tool_data)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["message"], "Usage logged")
        
        print("✅ Tool usage logging working")

    def test_06_custom_scripts_crud(self):
        """Test CRUD operations for custom scripts"""
        script_name = f"test_script_{self.random_string}"
        script_content = """
#!/usr/bin/env python3
print("Hello from test script!")
"""
        # Create a temporary Python script file
        with tempfile.NamedTemporaryFile(suffix='.py', delete=False) as temp:
            temp.write(script_content.encode())
            temp_path = temp.name
        
        try:
            # Upload the script
            with open(temp_path, 'rb') as f:
                files = {'script_file': (f"{script_name}.py", f, 'text/x-python')}
                data = {
                    'script_name': script_name,
                    'command': f"python {script_name}.py",
                    'description': "Test script created by test suite"
                }
                upload_response = self.session.post(f"{API_URL}/upload-script", files=files, data=data)
            
            self.assertEqual(upload_response.status_code, 200)
            upload_data = upload_response.json()
            self.assertEqual(upload_data["script_name"], script_name)
            
            # Get scripts list
            list_response = self.session.get(f"{API_URL}/custom-scripts")
            self.assertEqual(list_response.status_code, 200)
            scripts = list_response.json()
            self.assertIsInstance(scripts, list)
            
            # Verify our script is in the list
            found = False
            for script in scripts:
                if script["name"] == script_name:
                    found = True
                    break
            self.assertTrue(found, "Uploaded script not found in list")
            
            # Execute the script
            execute_data = {"script_name": script_name}
            execute_response = self.session.post(f"{API_URL}/execute-script", json=execute_data)
            self.assertEqual(execute_response.status_code, 200)
            execute_result = execute_response.json()
            self.assertIn("output", execute_result)
            self.assertIn("Hello from test script!", execute_result["output"])
            
            # Delete the script
            delete_response = self.session.delete(f"{API_URL}/custom-scripts/{script_name}")
            self.assertEqual(delete_response.status_code, 200)
            
            # Verify deletion
            list_response_after = self.session.get(f"{API_URL}/custom-scripts")
            scripts_after = list_response_after.json()
            
            found_after = False
            for script in scripts_after:
                if script["name"] == script_name:
                    found_after = True
                    break
            self.assertFalse(found_after, "Script was not properly deleted")
            
            print("✅ Custom scripts CRUD operations working")
            
        finally:
            # Clean up the temporary file
            os.unlink(temp_path)

if __name__ == "__main__":
    print(f"Testing SectoolBox backend API at: {API_URL}")
    unittest.main(argv=['first-arg-is-ignored'], exit=False)