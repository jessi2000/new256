# 🔒 SectoolBox - Enterprise Cybersecurity Platform

<div align="center">

![SectoolBox Logo](https://img.shields.io/badge/SectoolBox-Enterprise%20Security-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-1.0.0-green?style=for-the-badge)
![Security](https://img.shields.io/badge/Security-Enterprise%20Grade-red?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**Production-ready cybersecurity file analysis platform with enterprise-grade security**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Deployment](#-deployment) • [Customization](#-customization)

</div>

---

## 🎯 Overview

SectoolBox is a comprehensive cybersecurity platform designed for file analysis, CTF challenges, and security research. Built with enterprise-grade security features, it provides a secure environment for analyzing files, executing custom scripts, and managing security tools.

### ✨ Key Highlights

- 🔒 **Enterprise Security**: Comprehensive security hardening with OWASP protection
- 🚀 **High Performance**: Optimized for fast file analysis and processing
- 🎨 **Modern UI**: Beautiful, responsive interface with dark theme
- 🛠️ **Extensible**: Custom script support and modular architecture
- 📊 **Real-time Analysis**: Live security assessment and threat detection
- 🌐 **Cloud Ready**: Easy deployment to major cloud providers

---

## 🚀 Features

### 🔍 File Analysis & Security
- **Multi-format Support**: Analyze any file type with comprehensive validation
- **Security Scanning**: Real-time threat detection and risk assessment
- **Hash Generation**: MD5, SHA1, SHA256, SHA512 hash calculations
- **String Extraction**: Advanced printable string extraction and filtering
- **Hex Analysis**: Full hex dump with search and filtering capabilities
- **Metadata Extraction**: EXIF data and file metadata analysis
- **Entropy Analysis**: Detect encrypted, compressed, or suspicious content

### 🛠️ CTF Tools & Scripts
- **Custom Scripts**: Execute security analysis scripts safely
- **Built-in Tools**: Collection of common CTF and security tools
- **Encoding/Decoding**: Base64, URL, HTML entity encoding tools
- **Hash Tools**: Various hashing and cryptographic utilities
- **Network Tools**: Basic network analysis and reconnaissance
- **Text Analysis**: Pattern detection and text processing tools

### 🔐 Security Features
- **Input Sanitization**: XSS and injection attack prevention
- **Rate Limiting**: Protection against abuse and DoS attacks
- **File Validation**: Comprehensive file type and content validation
- **Script Security**: Sandboxed execution with timeout protection
- **Security Headers**: Full CSP, HSTS, and security header implementation
- **Audit Logging**: Complete security event monitoring

### 📊 Management Features
- **Announcements**: System-wide notifications and updates
- **File History**: Track analyzed files and results
- **User Dashboard**: Overview of system activity and statistics
- **Real-time Monitoring**: Live system health and performance metrics

---

## 🏗️ Architecture

### Frontend (React)
```
src/
├── components/          # Reusable UI components
├── pages/              # Main application pages
│   ├── HomePage.js     # Landing page with features
│   ├── ToolsPage.js    # CTF tools collection
│   ├── FileAnalysisPage.js  # File analysis interface
│   ├── CustomPage.js   # Custom script execution
│   └── AboutPage.js    # Team and project info
├── utils/              # Utility functions
│   └── security.js     # Frontend security utilities
└── App.js              # Main application component
```

### Backend (FastAPI)
```
backend/
├── server.py           # Main FastAPI application
├── security.py         # Security utilities and validation
├── custom-scripts/     # Custom analysis scripts
│   ├── demo-text-analyzer/
│   ├── network-scanner/
│   ├── port-scanner/
│   └── ...
└── requirements.txt    # Python dependencies
```

### Database (MongoDB)
- **Collections**: announcements, file_analyses, script_executions, tool_usage
- **Indexes**: Optimized for fast queries and searches
- **Security**: Input validation and injection prevention

---

## 🚀 Quick Start

### Option 1: Local Development Server (Recommended)

1. **Download and Setup:**
   ```bash
   # Clone or download the project
   cd sectoolbox
   
   # Run the local development server
   python3 Build/local_server.py
   ```

2. **Access the Application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8001
   - API Documentation: http://localhost:8001/docs

### Option 2: Manual Setup

1. **Prerequisites:**
   ```bash
   # Install required tools
   - Python 3.11+
   - Node.js 18+
   - Yarn package manager
   - MongoDB (optional, for persistence)
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   pip install -r requirements.txt
   python -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   yarn install
   yarn start
   ```

### Option 3: Docker Deployment

1. **Using Docker Compose:**
   ```bash
   # Generate deployment files
   python3 Build/deploy_to_cloud.py
   
   # Deploy with Docker
   cd deployment
   docker-compose up -d
   ```

---

## 📚 Documentation

### 🎨 Customization Guide

#### Changing Colors and Theme

1. **Background Gradients:**
   ```css
   /* In App.css or component styles */
   .custom-gradient {
     background: linear-gradient(to-br, from-your-color via-middle-color to-end-color);
   }
   ```

2. **Primary Colors:**
   ```javascript
   // Update in tailwind.config.js
   module.exports = {
     theme: {
       extend: {
         colors: {
           'brand-primary': '#your-color',
           'brand-secondary': '#your-color',
         }
       }
     }
   }
   ```

3. **Component Styling:**
   ```javascript
   // Example: Change button colors in any component
   className="bg-your-color hover:bg-your-hover-color text-white"
   ```

#### Changing Fonts

1. **Google Fonts:**
   ```html
   <!-- Add to public/index.html -->
   <link href="https://fonts.googleapis.com/css2?family=Your-Font:wght@400;500;700&display=swap" rel="stylesheet">
   ```

2. **CSS Configuration:**
   ```css
   /* In App.css */
   body {
     font-family: 'Your-Font', sans-serif;
   }
   ```

3. **Tailwind Configuration:**
   ```javascript
   // In tailwind.config.js
   fontFamily: {
     'custom': ['Your-Font', 'sans-serif'],
   }
   ```

#### Layout Modifications

1. **Navigation Bar:**
   ```javascript
   // Edit src/App.js - Navigation component
   const navItems = [
     { to: '/', label: 'Home', icon: Home },
     { to: '/your-page', label: 'Your Page', icon: YourIcon },
     // Add or modify navigation items
   ];
   ```

2. **Homepage Sections:**
   ```javascript
   // Edit src/pages/HomePage.js
   // Modify feature cards, hero section, or add new sections
   ```

3. **Footer Content:**
   ```javascript
   // Edit src/App.js - Footer component
   // Change team members, links, or footer content
   ```

### 🛠️ Adding Features

#### Adding New Tools

1. **Create Tool Component:**
   ```javascript
   // src/components/tools/YourTool.js
   import React, { useState } from 'react';
   
   const YourTool = () => {
     const [input, setInput] = useState('');
     const [output, setOutput] = useState('');
     
     const processTool = () => {
       // Your tool logic here
       setOutput(processedResult);
     };
     
     return (
       <div className="tool-card">
         {/* Your tool UI */}
       </div>
     );
   };
   ```

2. **Add to Tools Page:**
   ```javascript
   // src/pages/ToolsPage.js
   import YourTool from '../components/tools/YourTool';
   
   // Add to tools array
   const tools = [
     {
       id: 'your-tool',
       name: 'Your Tool',
       description: 'Description of your tool',
       category: 'your-category',
       component: YourTool
     },
     // ... other tools
   ];
   ```

#### Adding Custom Scripts

1. **Create Script Directory:**
   ```bash
   mkdir backend/custom-scripts/your-script
   cd backend/custom-scripts/your-script
   ```

2. **Create Configuration:**
   ```json
   // config.json
   {
     "name": "Your Script",
     "description": "Description of your script",
     "command": "python your_script.py"
   }
   ```

3. **Create Script:**
   ```python
   # your_script.py
   import sys
   import os
   
   def main():
       # Your script logic here
       print("Script output")
   
   if __name__ == "__main__":
       main()
   ```

#### Adding New Pages

1. **Create Page Component:**
   ```javascript
   // src/pages/YourPage.js
   import React from 'react';
   
   const YourPage = () => {
     return (
       <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-gray-950">
         {/* Your page content */}
       </div>
     );
   };
   
   export default YourPage;
   ```

2. **Add Route:**
   ```javascript
   // src/App.js
   import YourPage from './pages/YourPage';
   
   // Add to Routes
   <Route path="/your-page" element={<YourPage />} />
   ```

3. **Add Navigation:**
   ```javascript
   // Add to navItems array in App.js
   { to: '/your-page', label: 'Your Page', icon: YourIcon }
   ```

#### Backend API Extensions

1. **Add New Endpoint:**
   ```python
   # backend/server.py
   @api_router.post("/your-endpoint")
   async def your_endpoint(request: Request, data: YourModel):
       try:
           # Your endpoint logic
           return {"result": "success"}
       except Exception as e:
           raise HTTPException(status_code=500, detail=str(e))
   ```

2. **Create Data Models:**
   ```python
   # Add to server.py or separate models file
   class YourModel(BaseModel):
       field1: str
       field2: int = Field(default=0)
       field3: Optional[str] = None
   ```

3. **Frontend Integration:**
   ```javascript
   // In your React component
   const callYourEndpoint = async (data) => {
     const response = await axios.post(`${API_URL}/your-endpoint`, data);
     return response.data;
   };
   ```

---

## 🌐 Deployment

### Cloud Deployment Wizard

Use the interactive deployment script for easy cloud deployment:

```bash
python3 Build/deploy_to_cloud.py
```

This will guide you through:
- Cloud provider selection (Digital Ocean, AWS, Heroku, etc.)
- Domain and SSL configuration
- Database setup
- Environment variable configuration
- Security settings

### Supported Platforms

#### Digital Ocean (Recommended)
- **Droplet Types**: Basic, General Purpose, CPU-Optimized
- **Regions**: All DO regions supported
- **Features**: Automated deployment, load balancing, monitoring

#### AWS (Amazon Web Services)
- **Services**: EC2, ECS, Lambda (serverless)
- **Regions**: All AWS regions
- **Features**: Auto-scaling, CloudWatch monitoring, SSL certificates

#### Heroku
- **Tiers**: Hobby, Standard, Performance
- **Add-ons**: MongoDB Atlas, Redis, Monitoring
- **Features**: Git-based deployment, automatic scaling

#### Vercel (Frontend Only)
- **Features**: Edge deployment, serverless functions
- **Integration**: Works with separate backend deployment

### Manual Deployment

#### Docker Deployment

1. **Build Images:**
   ```bash
   # Backend
   docker build -t sectoolbox-backend ./backend
   
   # Frontend
   docker build -t sectoolbox-frontend ./frontend
   ```

2. **Run with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

#### Traditional Server Deployment

1. **Server Requirements:**
   - Ubuntu 20.04+ or CentOS 8+
   - 2GB+ RAM, 20GB+ storage
   - Python 3.11+, Node.js 18+
   - MongoDB 6.0+

2. **Installation:**
   ```bash
   # Install dependencies
   sudo apt update
   sudo apt install python3 python3-pip nodejs npm mongodb
   
   # Install application
   pip3 install -r backend/requirements.txt
   npm install -g yarn
   cd frontend && yarn install && yarn build
   
   # Configure services
   sudo systemctl enable mongodb
   sudo systemctl start mongodb
   ```

3. **Process Management:**
   ```bash
   # Using PM2 for process management
   npm install -g pm2
   pm2 start backend/server.py --interpreter python3
   pm2 start "yarn serve" --name frontend
   pm2 startup
   pm2 save
   ```

---

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
# Database Configuration
MONGO_URL=mongodb://localhost:27017
DB_NAME=sectoolbox_production

# Security Settings
ENABLE_RATE_LIMITING=true
ENABLE_SECURITY_HEADERS=true
MAX_FILE_SIZE=52428800

# Application Settings
ENVIRONMENT=production
LOG_LEVEL=INFO
```

#### Frontend (.env)
```bash
# API Configuration
REACT_APP_BACKEND_URL=https://your-domain.com
REACT_APP_API_TIMEOUT=30000

# Application Settings
REACT_APP_APP_NAME=SectoolBox
REACT_APP_VERSION=1.0.0
```

### Security Configuration

#### Rate Limiting
```python
# Customize in backend/security.py
RATE_LIMIT_PER_MINUTE = 100          # General endpoints
FILE_UPLOAD_RATE_LIMIT = 20          # File uploads
SCRIPT_EXECUTION_RATE_LIMIT = 10     # Script execution
```

#### File Upload Settings
```python
# Customize in backend/security.py
MAX_FILE_SIZE = 50 * 1024 * 1024     # 50MB
ALLOWED_MIME_TYPES = {
    'text/plain', 'image/jpeg', 'application/pdf'
    # Add your allowed types
}
```

#### Security Headers
```python
# Customize in backend/server.py
SECURITY_HEADERS = {
    "Content-Security-Policy": "default-src 'self'",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff"
}
```

---

## 🧪 Testing

### Running Tests

```bash
# Backend tests
cd backend
python -m pytest tests/

# Frontend tests
cd frontend
yarn test

# Integration tests
python Build/test_integration.py
```

### Security Testing

```bash
# Run security tests
python Build/security_test.py

# Check for vulnerabilities
npm audit
pip-audit
```

### Performance Testing

```bash
# Load testing with wrk
wrk -t12 -c400 -d30s http://localhost:8001/api/health

# Frontend performance
cd frontend
yarn build
yarn analyze
```

---

## 📁 File Structure

```
sectoolbox/
├── 📁 Build/                          # Deployment and build scripts
│   ├── 🐍 local_server.py            # Local development server
│   ├── ☁️ deploy_to_cloud.py         # Cloud deployment wizard
│   └── 📋 README.md                  # This documentation
│
├── 📁 backend/                        # FastAPI backend application
│   ├── 🐍 server.py                  # Main application server
│   ├── 🔒 security.py                # Security utilities
│   ├── 📁 custom-scripts/            # Custom analysis scripts
│   │   ├── 📁 demo-text-analyzer/
│   │   ├── 📁 network-scanner/
│   │   ├── 📁 port-scanner/
│   │   └── 📁 ...
│   ├── ⚙️ requirements.txt           # Python dependencies
│   └── 🔧 .env                       # Environment configuration
│
├── 📁 frontend/                       # React frontend application
│   ├── 📁 public/                    # Static assets
│   ├── 📁 src/                       # Source code
│   │   ├── 📁 components/            # Reusable components
│   │   ├── 📁 pages/                 # Main pages
│   │   │   ├── 🏠 HomePage.js
│   │   │   ├── 🛠️ ToolsPage.js
│   │   │   ├── 📄 FileAnalysisPage.js
│   │   │   ├── ⚙️ CustomPage.js
│   │   │   └── ℹ️ AboutPage.js
│   │   ├── 📁 utils/                 # Utility functions
│   │   │   └── 🔒 security.js
│   │   ├── 🎨 App.css                # Global styles
│   │   ├── ⚛️ App.js                  # Main component
│   │   └── 🎯 index.js               # Entry point
│   ├── 📦 package.json               # Node.js dependencies
│   ├── ⚙️ tailwind.config.js         # Tailwind CSS config
│   └── 🔧 .env                       # Environment configuration
│
├── 📁 tests/                          # Test files
│   ├── 🧪 test_backend.py
│   ├── 🧪 test_frontend.js
│   └── 🔒 test_security.py
│
├── 📋 README.md                       # Main documentation
├── 🔒 SECURITY.md                     # Security documentation
├── 🔒 SECURITY_SUMMARY.md             # Security overview
└── 📄 .gitignore                     # Git ignore rules
```

---

## 🐛 Troubleshooting

### Common Issues

#### Frontend Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
yarn cache clean
yarn install
```

#### Backend Import Errors
```bash
# Reinstall Python packages
pip uninstall -r requirements.txt -y
pip install -r requirements.txt
```

#### Database Connection Issues
```bash
# Check MongoDB status
sudo systemctl status mongodb

# Reset database
mongo
> use sectoolbox_dev
> db.dropDatabase()
```

#### CORS Errors
```javascript
// Update backend CORS settings in server.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Add your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### File Upload Issues
```python
# Check file permissions
chmod 755 /tmp/sectoolbox_uploads

# Increase upload limits in server.py
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB
```

### Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| 400 | Bad Request | Check input validation and format |
| 413 | Payload Too Large | Reduce file size or increase limits |
| 429 | Rate Limited | Wait before retrying requests |
| 500 | Server Error | Check backend logs and configuration |

### Performance Issues

#### Slow File Analysis
- Reduce file size limits
- Optimize string extraction algorithms
- Use pagination for large result sets

#### High Memory Usage
- Implement streaming for large files
- Add garbage collection triggers
- Monitor memory usage patterns

#### Slow API Responses
- Add database indexes
- Implement response caching
- Optimize database queries

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup

1. **Fork and Clone:**
   ```bash
   git clone https://github.com/yourusername/sectoolbox.git
   cd sectoolbox
   ```

2. **Development Environment:**
   ```bash
   python3 Build/local_server.py
   ```

3. **Make Changes:**
   - Follow the coding standards
   - Add tests for new features
   - Update documentation

4. **Submit PR:**
   - Create descriptive commit messages
   - Include tests and documentation
   - Follow the PR template

### Coding Standards

#### Python (Backend)
```python
# Follow PEP 8
# Use type hints
# Add docstrings

def process_file(file_content: bytes) -> Dict[str, Any]:
    """
    Process file content and return analysis results.
    
    Args:
        file_content: Raw file bytes
        
    Returns:
        Dictionary containing analysis results
    """
    pass
```

#### JavaScript (Frontend)
```javascript
// Use modern ES6+ syntax
// Follow React best practices
// Add JSDoc comments

/**
 * Process tool input and return results
 * @param {string} input - Tool input
 * @returns {Promise<string>} Processed output
 */
const processTool = async (input) => {
  // Implementation
};
```

### Testing Guidelines

- Write unit tests for all new functions
- Add integration tests for API endpoints
- Test security features thoroughly
- Include error handling tests

---

## 📞 Support

### Getting Help

- **Documentation**: Check this README and SECURITY.md
- **Issues**: Create GitHub issues for bugs
- **Discussions**: Use GitHub discussions for questions
- **Security**: Report security issues privately

### Reporting Bugs

When reporting bugs, include:
- Steps to reproduce
- Expected vs actual behavior
- Error messages and logs
- Environment details (OS, browser, versions)

### Feature Requests

We welcome feature requests! Please include:
- Use case description
- Proposed solution
- Alternative solutions considered
- Additional context

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Third-Party Licenses

- React: MIT License
- FastAPI: MIT License
- MongoDB: Server Side Public License (SSPL)
- Tailwind CSS: MIT License

---

## 🏆 Acknowledgments

### Security Frameworks
- OWASP Top 10 compliance
- NIST Cybersecurity Framework
- CIS Security Controls

### Technologies Used
- **Frontend**: React, Tailwind CSS, Axios
- **Backend**: FastAPI, MongoDB, Python
- **Security**: Bleach, Slowapi, Secure headers
- **Deployment**: Docker, Docker Compose

### Contributors

Special thanks to all contributors who helped make SectoolBox a reality:

- **Security Team**: Enterprise-grade security implementation
- **UI/UX Team**: Beautiful and intuitive interface design
- **Backend Team**: Robust and scalable API development
- **DevOps Team**: Reliable deployment and infrastructure

---

<div align="center">

**🔒 SectoolBox - Secure by Design, Built for Scale**

Made with ❤️ for the cybersecurity community

[⬆️ Back to Top](#-sectoolbox---enterprise-cybersecurity-platform)

</div>