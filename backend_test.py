
import requests
import sys
import os
import json
from datetime import datetime
import tempfile
import base64

class SectoolBoxAPITester:
    def __init__(self, base_url):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'} if not files else {}
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                if files:
                    response = requests.post(url, files=files)
                else:
                    response = requests.post(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            
            # Try to get JSON response, but handle non-JSON responses
            try:
                response_data = response.json()
            except:
                response_data = {"text": response.text[:100] + "..." if len(response.text) > 100 else response.text}
            
            result = {
                "name": name,
                "success": success,
                "expected_status": expected_status,
                "actual_status": response.status_code,
                "response": response_data
            }
            
            self.test_results.append(result)
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"Response: {json.dumps(response_data, indent=2)}")

            return success, response_data if success else {}

        except Exception as e:
            error_msg = str(e)
            print(f"❌ Failed - Error: {error_msg}")
            self.test_results.append({
                "name": name,
                "success": False,
                "error": error_msg
            })
            return False, {}

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        return self.run_test(
            "Root API Endpoint",
            "GET",
            "",
            200
        )

    def test_health_check(self):
        """Test the health check endpoint"""
        return self.run_test(
            "Health Check",
            "GET",
            "health",
            200
        )

    def test_get_announcements(self):
        """Test getting announcements"""
        return self.run_test(
            "Get Announcements",
            "GET",
            "announcements",
            200
        )

    def test_create_announcement(self):
        """Test creating an announcement"""
        data = {
            "title": f"Test Announcement {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            "content": "This is a test announcement created by the API tester.",
            "is_important": True
        }
        return self.run_test(
            "Create Announcement",
            "POST",
            "announcements",
            200,
            data=data
        )

    def test_delete_announcement(self, announcement_id):
        """Test deleting an announcement"""
        return self.run_test(
            "Delete Announcement",
            "DELETE",
            f"announcements/{announcement_id}",
            200
        )

    def test_file_analysis(self):
        """Test file analysis with a text file"""
        # Create a temporary text file
        with tempfile.NamedTemporaryFile(suffix='.txt', delete=False) as temp:
            temp.write(b"This is a test file for SectoolBox file analysis API.")
            temp_path = temp.name
        
        try:
            with open(temp_path, 'rb') as f:
                files = {'file': ('test.txt', f, 'text/plain')}
                return self.run_test(
                    "File Analysis - Text File",
                    "POST",
                    "analyze-file",
                    200,
                    files=files
                )
        finally:
            os.unlink(temp_path)

    def test_file_analysis_image(self):
        """Test file analysis with a small base64 encoded image"""
        # Small 1x1 pixel PNG image (base64 encoded)
        base64_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
        image_data = base64.b64decode(base64_image)
        
        # Create a temporary image file
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp:
            temp.write(image_data)
            temp_path = temp.name
        
        try:
            with open(temp_path, 'rb') as f:
                files = {'file': ('test.png', f, 'image/png')}
                return self.run_test(
                    "File Analysis - Image File",
                    "POST",
                    "analyze-file",
                    200,
                    files=files
                )
        finally:
            os.unlink(temp_path)

    def test_get_file_analyses(self):
        """Test getting file analyses"""
        return self.run_test(
            "Get File Analyses",
            "GET",
            "file-analyses",
            200
        )

    def test_tool_usage_logging(self):
        """Test logging tool usage"""
        data = {
            "tool_name": "base64_encode",
            "input_data": "test data"
        }
        return self.run_test(
            "Log Tool Usage",
            "POST",
            "tool-usage",
            200,
            data=data
        )

    def print_summary(self):
        """Print a summary of all test results"""
        print("\n" + "="*50)
        print(f"📊 TEST SUMMARY: {self.tests_passed}/{self.tests_run} tests passed")
        print("="*50)
        
        # Print failed tests
        if self.tests_passed < self.tests_run:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result.get("success", False):
                    print(f"  - {result['name']}")
                    if "error" in result:
                        print(f"    Error: {result['error']}")
                    elif "actual_status" in result:
                        print(f"    Expected status: {result['expected_status']}, got: {result['actual_status']}")
                        print(f"    Response: {json.dumps(result['response'], indent=2)[:200]}...")
            print()
        
        return self.tests_passed == self.tests_run

def main():
    # Get backend URL from environment or use the one from frontend/.env
    backend_url = "https://0eec977e-fcbd-40e3-9278-0e7974813b84.preview.emergentagent.com"
    
    print(f"🚀 Testing SectoolBox API at: {backend_url}")
    
    tester = SectoolBoxAPITester(backend_url)
    
    # Run tests
    tester.test_root_endpoint()
    tester.test_health_check()
    tester.test_get_announcements()
    
    # Create and then delete an announcement
    success, announcement_data = tester.test_create_announcement()
    if success and "id" in announcement_data:
        tester.test_delete_announcement(announcement_data["id"])
    
    # Test file analysis
    tester.test_file_analysis()
    tester.test_file_analysis_image()
    tester.test_get_file_analyses()
    
    # Test tool usage logging
    tester.test_tool_usage_logging()
    
    # Print summary
    all_passed = tester.print_summary()
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())
