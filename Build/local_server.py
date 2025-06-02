#!/usr/bin/env python3
"""
SectoolBox Local Development Server
Launches the SectoolBox website locally for testing and development.
"""

import os
import sys
import subprocess
import time
import signal
import threading
import requests
from pathlib import Path

# ANSI color codes for console output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_colored(message, color=Colors.OKBLUE):
    """Print colored message to console"""
    print(f"{color}{message}{Colors.ENDC}")

def print_header():
    """Print the application header"""
    print_colored("\n" + "="*60, Colors.HEADER)
    print_colored("🔒 SECTOOLBOX LOCAL DEVELOPMENT SERVER", Colors.HEADER)
    print_colored("="*60, Colors.HEADER)
    print_colored("Production-ready cybersecurity file analysis platform", Colors.OKCYAN)
    print_colored("Version: 1.0.0 | Security: Enterprise Grade", Colors.OKCYAN)
    print_colored("="*60 + "\n", Colors.HEADER)

def check_dependencies():
    """Check if required dependencies are installed"""
    print_colored("🔍 Checking dependencies...", Colors.OKBLUE)
    
    required_commands = ['python3', 'node', 'yarn']
    missing = []
    
    for cmd in required_commands:
        try:
            subprocess.run([cmd, '--version'], 
                         stdout=subprocess.DEVNULL, 
                         stderr=subprocess.DEVNULL, 
                         check=True)
            print_colored(f"  ✅ {cmd} is installed", Colors.OKGREEN)
        except (subprocess.CalledProcessError, FileNotFoundError):
            missing.append(cmd)
            print_colored(f"  ❌ {cmd} is missing", Colors.FAIL)
    
    if missing:
        print_colored(f"\n❌ Missing dependencies: {', '.join(missing)}", Colors.FAIL)
        print_colored("Please install the missing dependencies and try again.", Colors.WARNING)
        return False
    
    print_colored("✅ All dependencies are installed!\n", Colors.OKGREEN)
    return True

def install_backend_dependencies():
    """Install Python backend dependencies"""
    print_colored("📦 Installing backend dependencies...", Colors.OKBLUE)
    
    backend_dir = Path(__file__).parent.parent / "backend"
    requirements_file = backend_dir / "requirements.txt"
    
    if not requirements_file.exists():
        print_colored("❌ requirements.txt not found in backend directory", Colors.FAIL)
        return False
    
    try:
        result = subprocess.run([
            sys.executable, '-m', 'pip', 'install', '-r', str(requirements_file)
        ], cwd=backend_dir, capture_output=True, text=True)
        
        if result.returncode == 0:
            print_colored("✅ Backend dependencies installed successfully!", Colors.OKGREEN)
            return True
        else:
            print_colored(f"❌ Failed to install backend dependencies: {result.stderr}", Colors.FAIL)
            return False
    except Exception as e:
        print_colored(f"❌ Error installing backend dependencies: {e}", Colors.FAIL)
        return False

def install_frontend_dependencies():
    """Install Node.js frontend dependencies"""
    print_colored("📦 Installing frontend dependencies...", Colors.OKBLUE)
    
    frontend_dir = Path(__file__).parent.parent / "frontend"
    package_json = frontend_dir / "package.json"
    
    if not package_json.exists():
        print_colored("❌ package.json not found in frontend directory", Colors.FAIL)
        return False
    
    try:
        result = subprocess.run(['yarn', 'install'], 
                              cwd=frontend_dir, 
                              capture_output=True, 
                              text=True)
        
        if result.returncode == 0:
            print_colored("✅ Frontend dependencies installed successfully!", Colors.OKGREEN)
            return True
        else:
            print_colored(f"❌ Failed to install frontend dependencies: {result.stderr}", Colors.FAIL)
            return False
    except Exception as e:
        print_colored(f"❌ Error installing frontend dependencies: {e}", Colors.FAIL)
        return False

def setup_environment():
    """Setup environment variables"""
    print_colored("⚙️  Setting up environment...", Colors.OKBLUE)
    
    backend_dir = Path(__file__).parent.parent / "backend"
    frontend_dir = Path(__file__).parent.parent / "frontend"
    
    # Create backend .env if it doesn't exist
    backend_env = backend_dir / ".env"
    if not backend_env.exists():
        with open(backend_env, 'w') as f:
            f.write('MONGO_URL="mongodb://localhost:27017"\n')
            f.write('DB_NAME="sectoolbox_dev"\n')
        print_colored("✅ Created backend .env file", Colors.OKGREEN)
    
    # Create frontend .env if it doesn't exist
    frontend_env = frontend_dir / ".env"
    if not frontend_env.exists():
        with open(frontend_env, 'w') as f:
            f.write('REACT_APP_BACKEND_URL=http://localhost:8001\n')
        print_colored("✅ Created frontend .env file", Colors.OKGREEN)
    
    # Check if MongoDB is available
    try:
        import pymongo
        client = pymongo.MongoClient("mongodb://localhost:27017", serverSelectionTimeoutMS=2000)
        client.server_info()
        print_colored("✅ MongoDB connection successful", Colors.OKGREEN)
    except Exception:
        print_colored("⚠️  MongoDB not available - using in-memory storage", Colors.WARNING)
    
    return True

def start_backend():
    """Start the FastAPI backend server"""
    print_colored("🚀 Starting backend server...", Colors.OKBLUE)
    
    backend_dir = Path(__file__).parent.parent / "backend"
    
    # Start the backend server
    try:
        process = subprocess.Popen([
            sys.executable, '-m', 'uvicorn', 'server:app', 
            '--host', '0.0.0.0', '--port', '8001', '--reload'
        ], cwd=backend_dir)
        
        # Wait for server to start
        time.sleep(3)
        
        # Check if server is running
        try:
            response = requests.get('http://localhost:8001/api/health', timeout=5)
            if response.status_code == 200:
                print_colored("✅ Backend server started successfully!", Colors.OKGREEN)
                print_colored("   Backend URL: http://localhost:8001", Colors.OKCYAN)
                return process
            else:
                print_colored("❌ Backend server not responding properly", Colors.FAIL)
                return None
        except requests.RequestException:
            print_colored("❌ Backend server not responding", Colors.FAIL)
            return None
            
    except Exception as e:
        print_colored(f"❌ Failed to start backend server: {e}", Colors.FAIL)
        return None

def start_frontend():
    """Start the React frontend server"""
    print_colored("🚀 Starting frontend server...", Colors.OKBLUE)
    
    frontend_dir = Path(__file__).parent.parent / "frontend"
    
    # Start the frontend server
    try:
        process = subprocess.Popen([
            'yarn', 'start'
        ], cwd=frontend_dir)
        
        # Wait for server to start
        time.sleep(5)
        
        # Check if server is running
        try:
            response = requests.get('http://localhost:3000', timeout=10)
            if response.status_code == 200:
                print_colored("✅ Frontend server started successfully!", Colors.OKGREEN)
                print_colored("   Frontend URL: http://localhost:3000", Colors.OKCYAN)
                return process
            else:
                print_colored("❌ Frontend server not responding properly", Colors.FAIL)
                return None
        except requests.RequestException:
            print_colored("❌ Frontend server not responding", Colors.FAIL)
            return None
            
    except Exception as e:
        print_colored(f"❌ Failed to start frontend server: {e}", Colors.FAIL)
        return None

def main():
    """Main function to start the local development server"""
    print_header()
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Install dependencies
    if not install_backend_dependencies():
        sys.exit(1)
    
    if not install_frontend_dependencies():
        sys.exit(1)
    
    # Setup environment
    if not setup_environment():
        sys.exit(1)
    
    print_colored("\n🎯 Starting SectoolBox servers...", Colors.OKBLUE)
    
    # Start backend
    backend_process = start_backend()
    if not backend_process:
        print_colored("❌ Failed to start backend server", Colors.FAIL)
        sys.exit(1)
    
    # Start frontend
    frontend_process = start_frontend()
    if not frontend_process:
        print_colored("❌ Failed to start frontend server", Colors.FAIL)
        backend_process.terminate()
        sys.exit(1)
    
    # Success message
    print_colored("\n" + "="*60, Colors.OKGREEN)
    print_colored("🎉 SECTOOLBOX IS NOW RUNNING LOCALLY! 🎉", Colors.OKGREEN)
    print_colored("="*60, Colors.OKGREEN)
    print_colored("Frontend: http://localhost:3000", Colors.OKCYAN)
    print_colored("Backend:  http://localhost:8001", Colors.OKCYAN)
    print_colored("API Docs: http://localhost:8001/docs", Colors.OKCYAN)
    print_colored("="*60, Colors.OKGREEN)
    print_colored("\n📋 Features Available:", Colors.OKBLUE)
    print_colored("  • File Analysis & Security Scanning", Colors.OKCYAN)
    print_colored("  • Custom Script Execution", Colors.OKCYAN)
    print_colored("  • Announcements Management", Colors.OKCYAN)
    print_colored("  • CTF Tools Collection", Colors.OKCYAN)
    print_colored("  • Enterprise-grade Security", Colors.OKCYAN)
    print_colored("\n🔒 Security: All processing happens locally", Colors.OKGREEN)
    print_colored("⚡ Performance: Optimized for fast analysis", Colors.OKGREEN)
    print_colored("\nPress Ctrl+C to stop the servers", Colors.WARNING)
    
    def signal_handler(sig, frame):
        print_colored("\n\n🛑 Shutting down servers...", Colors.WARNING)
        try:
            frontend_process.terminate()
            backend_process.terminate()
            
            # Wait for processes to terminate
            frontend_process.wait(timeout=5)
            backend_process.wait(timeout=5)
        except:
            # Force kill if they don't terminate gracefully
            try:
                frontend_process.kill()
                backend_process.kill()
            except:
                pass
        
        print_colored("✅ Servers stopped successfully!", Colors.OKGREEN)
        print_colored("Thank you for using SectoolBox! 🎯", Colors.OKCYAN)
        sys.exit(0)
    
    # Handle Ctrl+C gracefully
    signal.signal(signal.SIGINT, signal_handler)
    
    try:
        # Keep the script running
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        signal_handler(None, None)

if __name__ == "__main__":
    main()