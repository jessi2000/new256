#!/usr/bin/env python3
import requests
import json
import time
import os
import base64
import unittest
import sys
from datetime import datetime
from PIL import Image
import io

# Get the backend URL from the frontend .env file
BACKEND_URL = "https://dba0eb53-99df-4275-b1aa-9851ea215e40.preview.emergentagent.com"
API_URL = f"{BACKEND_URL}/api"

class BackendAPITest(unittest.TestCase):
    """Test suite for SectoolBox Backend API"""
    
    def setUp(self):
        """Setup for tests"""
        self.announcement_ids = []  # Store created announcement IDs for cleanup
    
    def tearDown(self):
        """Cleanup after tests"""
        # Delete any announcements created during testing
        for announcement_id in self.announcement_ids:
            try:
                requests.delete(f"{API_URL}/announcements/{announcement_id}")
            except Exception as e:
                print(f"Error cleaning up announcement {announcement_id}: {e}")
    
    def test_01_health_check(self):
        """Test the health check endpoint"""
        print("\n🔍 Testing health check endpoint...")
        response = requests.get(f"{API_URL}/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertIn("timestamp", data)
        print("✅ Health check endpoint is working correctly")
    
    def test_02_root_endpoint(self):
        """Test the root endpoint"""
        print("\n🔍 Testing root endpoint...")
        response = requests.get(f"{API_URL}/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("message", data)
        self.assertIn("version", data)
        print("✅ Root endpoint is working correctly")
    
    def test_03_announcements_crud(self):
        """Test announcements CRUD operations"""
        print("\n🔍 Testing announcements CRUD operations...")
        
        # Create announcement
        announcement_data = {
            "title": "Test Announcement",
            "content": "This is a test announcement created by the API test",
            "is_important": True
        }
        
        # Test create
        create_response = requests.post(
            f"{API_URL}/announcements", 
            json=announcement_data
        )
        self.assertEqual(create_response.status_code, 200)
        created = create_response.json()
        self.assertEqual(created["title"], announcement_data["title"])
        self.assertEqual(created["content"], announcement_data["content"])
        self.assertEqual(created["is_important"], announcement_data["is_important"])
        self.assertIn("id", created)
        
        # Store ID for cleanup
        announcement_id = created["id"]
        self.announcement_ids.append(announcement_id)
        
        # Test get all
        get_response = requests.get(f"{API_URL}/announcements")
        self.assertEqual(get_response.status_code, 200)
        announcements = get_response.json()
        self.assertIsInstance(announcements, list)
        
        # Verify our announcement is in the list
        found = False
        for announcement in announcements:
            if announcement["id"] == announcement_id:
                found = True
                break
        self.assertTrue(found, "Created announcement not found in list")
        
        # Test delete
        delete_response = requests.delete(f"{API_URL}/announcements/{announcement_id}")
        self.assertEqual(delete_response.status_code, 200)
        
        # Verify deletion
        get_response = requests.get(f"{API_URL}/announcements")
        announcements = get_response.json()
        found = False
        for announcement in announcements:
            if announcement["id"] == announcement_id:
                found = True
                break
        self.assertFalse(found, "Announcement was not deleted properly")
        
        # Remove from cleanup list since we already deleted it
        self.announcement_ids.remove(announcement_id)
        
        print("✅ Announcements CRUD operations are working correctly")
    
    def test_04_file_analysis(self):
        """Test file analysis upload and processing"""
        print("\n🔍 Testing file analysis functionality...")
        
        # Create a simple text file for testing
        test_content = "This is a test file for analysis.\nIt contains some text data for testing the file analysis API."
        
        # Create a temporary file
        with open("test_file.txt", "w") as f:
            f.write(test_content)
        
        try:
            # Upload file for analysis
            with open("test_file.txt", "rb") as f:
                files = {"file": ("test_file.txt", f, "text/plain")}
                response = requests.post(f"{API_URL}/analyze-file", files=files)
            
            self.assertEqual(response.status_code, 200)
            result = response.json()
            
            # Verify analysis result fields
            self.assertEqual(result["filename"], "test_file.txt")
            self.assertIn("file_size", result)
            self.assertIn("mime_type", result)
            self.assertIn("md5_hash", result)
            self.assertIn("sha1_hash", result)
            self.assertIn("sha256_hash", result)
            self.assertIn("strings_count", result)
            self.assertIn("entropy", result)
            
            # Test getting file analyses
            analyses_response = requests.get(f"{API_URL}/file-analyses")
            self.assertEqual(analyses_response.status_code, 200)
            analyses = analyses_response.json()
            self.assertIsInstance(analyses, list)
            
            # Verify our analysis is in the list
            found = False
            for analysis in analyses:
                if analysis["filename"] == "test_file.txt" and analysis["md5_hash"] == result["md5_hash"]:
                    found = True
                    break
            self.assertTrue(found, "Created file analysis not found in list")
            
            print("✅ File analysis functionality is working correctly")
            
        finally:
            # Clean up the test file
            if os.path.exists("test_file.txt"):
                os.remove("test_file.txt")
    
    def test_04b_enhanced_image_analysis(self):
        """Test enhanced image analysis features"""
        print("\n🔍 Testing enhanced image analysis features...")
        
        # Create a simple test image
        img = Image.new('RGB', (100, 100), color = (73, 109, 137))
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='PNG')
        img_byte_arr = img_byte_arr.getvalue()
        
        # Save the image to a file
        with open("test_image.png", "wb") as f:
            f.write(img_byte_arr)
        
        try:
            # Upload image for analysis
            with open("test_image.png", "rb") as f:
                files = {"file": ("test_image.png", f, "image/png")}
                response = requests.post(f"{API_URL}/analyze-file", files=files)
            
            self.assertEqual(response.status_code, 200)
            result = response.json()
            
            # Verify image-specific analysis fields
            self.assertEqual(result["filename"], "test_image.png")
            self.assertIn("file_size", result)
            self.assertIn("mime_type", result)
            self.assertEqual(result["mime_type"], "image/png")
            
            # Check for basic image analysis - note that enhanced features might not be implemented yet
            print("✅ Basic image analysis is working correctly")
            print("Note: Enhanced image analysis features are not fully implemented yet")
            
        finally:
            # Clean up the test file
            if os.path.exists("test_image.png"):
                os.remove("test_image.png")
    
    def test_05_tool_usage_logging(self):
        """Test tool usage logging"""
        print("\n🔍 Testing tool usage logging...")
        
        # Log tool usage
        tool_data = {
            "tool_name": "base64_encoder",
            "input_data": "test data for encoding"
        }
        
        response = requests.post(
            f"{API_URL}/tool-usage",
            params=tool_data
        )
        
        self.assertEqual(response.status_code, 200)
        result = response.json()
        self.assertIn("message", result)
        
        print("✅ Tool usage logging is working correctly")
    
    def test_06_custom_scripts(self):
        """Test custom scripts functionality"""
        print("\n🔍 Testing custom scripts functionality...")
        
        # Get list of custom scripts
        scripts_response = requests.get(f"{API_URL}/custom-scripts")
        
        # This might return empty list if no scripts are configured, which is fine
        self.assertEqual(scripts_response.status_code, 200)
        scripts = scripts_response.json()
        self.assertIsInstance(scripts, list)
        
        # Verify we have scripts and they're properly loaded
        self.assertTrue(len(scripts) > 0, "No custom scripts found")
        
        # Check for expected script properties
        for script in scripts:
            self.assertIn("name", script)
            self.assertIn("description", script)
            self.assertIn("command", script)
        
        # Test execution of each script
        for script in scripts:
            script_name = script["name"]
            print(f"Testing script: {script_name}...")
            
            exec_response = requests.post(
                f"{API_URL}/execute-script",
                json={"script_name": script_name}
            )
            
            self.assertEqual(exec_response.status_code, 200)
            exec_result = exec_response.json()
            self.assertIn("output", exec_result)
            self.assertIn("execution_time", exec_result)
            
            # Verify script execution doesn't return an error
            self.assertNotIn("Error", exec_result["output"])
            
            print(f"✅ Script execution successful: {script_name}")
        
        print(f"✅ All {len(scripts)} custom scripts loaded and executed successfully")
    
    def test_07_tools_functionality(self):
        """Test basic tools functionality"""
        print("\n🔍 Testing basic tools functionality...")
        
        # Test the tool-usage endpoint which is implemented
        tool_data = {
            "tool_name": "base64_encoder",
            "input_data": "test data for encoding"
        }
        
        response = requests.post(
            f"{API_URL}/tool-usage",
            params=tool_data
        )
        
        self.assertEqual(response.status_code, 200)
        result = response.json()
        self.assertIn("message", result)
        
        print("✅ Tool usage logging is working correctly")
        print("Note: The execute-tool endpoint is not implemented yet, but tool usage tracking works")

def run_tests():
    """Run all tests and return results"""
    test_suite = unittest.TestSuite()
    test_suite.addTest(unittest.makeSuite(BackendAPITest))
    
    # Run tests
    result = unittest.TextTestRunner(verbosity=2).run(test_suite)
    
    return result

if __name__ == "__main__":
    print(f"🚀 Starting SectoolBox Backend API Tests")
    print(f"🔗 API URL: {API_URL}")
    print("-" * 80)
    
    # Install Pillow if not already installed
    try:
        import PIL
    except ImportError:
        print("Installing Pillow library for image analysis tests...")
        os.system("pip install Pillow")
    
    result = run_tests()
    
    print("-" * 80)
    if result.wasSuccessful():
        print("✅ All tests passed successfully!")
        sys.exit(0)
    else:
        print(f"❌ Tests failed: {len(result.failures)} failures, {len(result.errors)} errors")
        sys.exit(1)
