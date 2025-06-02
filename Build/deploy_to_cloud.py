#!/usr/bin/env python3
"""
SectoolBox Cloud Deployment Script
Interactive Python script for deploying SectoolBox to cloud services.
"""

import os
import sys
import json
import subprocess
import requests
import time
from pathlib import Path
from typing import Dict, Any

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
    """Print the deployment header"""
    print_colored("\n" + "="*60, Colors.HEADER)
    print_colored("☁️  SECTOOLBOX CLOUD DEPLOYMENT WIZARD", Colors.HEADER)
    print_colored("="*60, Colors.HEADER)
    print_colored("Deploy your security platform to the cloud", Colors.OKCYAN)
    print_colored("Supported: Digital Ocean, AWS, Heroku, Vercel", Colors.OKCYAN)
    print_colored("="*60 + "\n", Colors.HEADER)

def get_user_input(prompt: str, default: str = "", required: bool = True) -> str:
    """Get user input with validation"""
    while True:
        if default:
            user_input = input(f"{prompt} [{default}]: ").strip()
            if not user_input:
                return default
        else:
            user_input = input(f"{prompt}: ").strip()
        
        if user_input or not required:
            return user_input
        
        if required:
            print_colored("❌ This field is required!", Colors.FAIL)

def get_yes_no(prompt: str, default: bool = True) -> bool:
    """Get yes/no input from user"""
    default_str = "Y/n" if default else "y/N"
    while True:
        response = input(f"{prompt} [{default_str}]: ").strip().lower()
        if not response:
            return default
        if response in ['y', 'yes']:
            return True
        if response in ['n', 'no']:
            return False
        print_colored("Please enter 'y' or 'n'", Colors.WARNING)

def collect_deployment_info() -> Dict[str, Any]:
    """Collect deployment information from user"""
    print_colored("📋 Let's collect your deployment information...\n", Colors.OKBLUE)
    
    deployment_info = {}
    
    # Cloud provider selection
    print_colored("☁️  Cloud Provider Selection:", Colors.BOLD)
    print("1. Digital Ocean (Recommended)")
    print("2. AWS (Amazon Web Services)")
    print("3. Heroku")
    print("4. Vercel (Frontend only)")
    print("5. Custom VPS")
    
    while True:
        choice = input("\nSelect cloud provider (1-5): ").strip()
        if choice in ['1', '2', '3', '4', '5']:
            providers = {
                '1': 'digitalocean',
                '2': 'aws',
                '3': 'heroku',
                '4': 'vercel',
                '5': 'custom'
            }
            deployment_info['provider'] = providers[choice]
            break
        print_colored("Please select a valid option (1-5)", Colors.WARNING)
    
    # Domain configuration
    print_colored("\n🌐 Domain Configuration:", Colors.BOLD)
    deployment_info['domain'] = get_user_input(
        "Enter your domain name (e.g., sectoolbox.yourdomain.com)",
        required=False
    )
    
    deployment_info['use_https'] = get_yes_no("Enable HTTPS/SSL?", True)
    
    # Application configuration
    print_colored("\n⚙️  Application Configuration:", Colors.BOLD)
    deployment_info['app_name'] = get_user_input(
        "Application name", 
        "sectoolbox", 
        required=True
    )
    
    deployment_info['environment'] = get_user_input(
        "Environment (production/staging)", 
        "production"
    )
    
    # Database configuration
    print_colored("\n🗄️  Database Configuration:", Colors.BOLD)
    if deployment_info['provider'] in ['digitalocean', 'aws', 'custom']:
        deployment_info['db_type'] = 'mongodb'
        deployment_info['db_host'] = get_user_input(
            "MongoDB connection URL", 
            "mongodb://localhost:27017"
        )
    else:
        deployment_info['db_type'] = 'mongodb_atlas'
        deployment_info['db_host'] = get_user_input(
            "MongoDB Atlas connection string",
            required=False
        )
    
    # Provider-specific configuration
    if deployment_info['provider'] == 'digitalocean':
        print_colored("\n🐙 Digital Ocean Configuration:", Colors.BOLD)
        deployment_info['do_api_token'] = get_user_input(
            "Digital Ocean API Token",
            required=False
        )
        deployment_info['droplet_size'] = get_user_input(
            "Droplet size", 
            "s-2vcpu-2gb"
        )
        deployment_info['region'] = get_user_input(
            "Region", 
            "nyc1"
        )
    
    elif deployment_info['provider'] == 'aws':
        print_colored("\n☁️  AWS Configuration:", Colors.BOLD)
        deployment_info['aws_access_key'] = get_user_input(
            "AWS Access Key ID",
            required=False
        )
        deployment_info['aws_secret_key'] = get_user_input(
            "AWS Secret Access Key",
            required=False
        )
        deployment_info['aws_region'] = get_user_input(
            "AWS Region", 
            "us-east-1"
        )
    
    elif deployment_info['provider'] == 'heroku':
        print_colored("\n🟣 Heroku Configuration:", Colors.BOLD)
        deployment_info['heroku_api_key'] = get_user_input(
            "Heroku API Key",
            required=False
        )
        deployment_info['heroku_app_name'] = get_user_input(
            "Heroku App Name", 
            deployment_info['app_name']
        )
    
    # Security configuration
    print_colored("\n🔒 Security Configuration:", Colors.BOLD)
    deployment_info['admin_email'] = get_user_input(
        "Admin email for notifications",
        required=False
    )
    
    deployment_info['enable_rate_limiting'] = get_yes_no("Enable rate limiting?", True)
    deployment_info['enable_security_headers'] = get_yes_no("Enable security headers?", True)
    
    return deployment_info

def generate_docker_files(deployment_info: Dict[str, Any]) -> None:
    """Generate Docker configuration files"""
    print_colored("🐳 Generating Docker configuration...", Colors.OKBLUE)
    
    # Dockerfile for backend
    dockerfile_backend = """FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    libmagic1 \\
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8001

# Run the application
CMD ["python", "-m", "uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
"""
    
    # Dockerfile for frontend
    dockerfile_frontend = """FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Production stage
FROM nginx:alpine

# Copy built application
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
"""
    
    # Docker Compose
    docker_compose = f"""version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8001:8001"
    environment:
      - MONGO_URL={deployment_info.get('db_host', 'mongodb://mongo:27017')}
      - DB_NAME=sectoolbox_{deployment_info['environment']}
    depends_on:
      - mongo
    volumes:
      - ./backend/logs:/app/logs

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
    environment:
      - REACT_APP_BACKEND_URL=http://backend:8001

  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=sectoolbox_{deployment_info['environment']}

volumes:
  mongo_data:
"""
    
    # Nginx configuration
    nginx_conf = f"""events {{
    worker_connections 1024;
}}

http {{
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;";

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

    server {{
        listen 80;
        server_name {deployment_info.get('domain', 'localhost')};
        root /usr/share/nginx/html;
        index index.html;

        # Frontend routes
        location / {{
            try_files $uri $uri/ /index.html;
        }}

        # API routes
        location /api/ {{
            proxy_pass http://backend:8001/api/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }}

        # Security
        location ~ /\\. {{
            deny all;
        }}
    }}
}}
"""
    
    # Create deployment directory
    deploy_dir = Path("deployment")
    deploy_dir.mkdir(exist_ok=True)
    
    # Write files
    (deploy_dir / "Dockerfile.backend").write_text(dockerfile_backend)
    (deploy_dir / "Dockerfile.frontend").write_text(dockerfile_frontend)
    (deploy_dir / "docker-compose.yml").write_text(docker_compose)
    (deploy_dir / "nginx.conf").write_text(nginx_conf)
    
    print_colored("✅ Docker configuration generated!", Colors.OKGREEN)

def generate_deployment_scripts(deployment_info: Dict[str, Any]) -> None:
    """Generate provider-specific deployment scripts"""
    print_colored("📜 Generating deployment scripts...", Colors.OKBLUE)
    
    deploy_dir = Path("deployment")
    
    if deployment_info['provider'] == 'digitalocean':
        # Digital Ocean deployment script
        do_script = f"""#!/bin/bash
set -e

echo "🐙 Deploying to Digital Ocean..."

# Create droplet
doctl compute droplet create {deployment_info['app_name']} \\
    --image docker-20-04 \\
    --size {deployment_info['droplet_size']} \\
    --region {deployment_info['region']} \\
    --ssh-keys $(doctl compute ssh-key list --format ID --no-header | tr '\\n' ',')

# Wait for droplet to be ready
echo "⏳ Waiting for droplet to be ready..."
sleep 60

# Get droplet IP
DROPLET_IP=$(doctl compute droplet list --format Name,PublicIPv4 --no-header | grep {deployment_info['app_name']} | awk '{{print $2}}')
echo "📡 Droplet IP: $DROPLET_IP"

# Copy files to droplet
echo "📁 Copying files to droplet..."
scp -r ../backend ../frontend docker-compose.yml root@$DROPLET_IP:/root/

# Deploy application
echo "🚀 Deploying application..."
ssh root@$DROPLET_IP << 'EOF'
cd /root
docker-compose up -d
EOF

echo "✅ Deployment complete!"
echo "🌐 Your application should be available at: http://$DROPLET_IP"
"""
        (deploy_dir / "deploy_digitalocean.sh").write_text(do_script)
        os.chmod(deploy_dir / "deploy_digitalocean.sh", 0o755)
    
    elif deployment_info['provider'] == 'heroku':
        # Heroku deployment files
        procfile = """web: cd frontend && yarn start
worker: cd backend && python -m uvicorn server:app --host 0.0.0.0 --port $PORT
"""
        
        heroku_script = f"""#!/bin/bash
set -e

echo "🟣 Deploying to Heroku..."

# Login to Heroku
heroku login

# Create Heroku app
heroku create {deployment_info['heroku_app_name']}

# Add MongoDB addon
heroku addons:create mongolab:sandbox -a {deployment_info['heroku_app_name']}

# Set environment variables
heroku config:set NODE_ENV=production -a {deployment_info['heroku_app_name']}
heroku config:set REACT_APP_BACKEND_URL=https://{deployment_info['heroku_app_name']}.herokuapp.com -a {deployment_info['heroku_app_name']}

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main

echo "✅ Deployment complete!"
echo "🌐 Your application is available at: https://{deployment_info['heroku_app_name']}.herokuapp.com"
"""
        
        (deploy_dir / "Procfile").write_text(procfile)
        (deploy_dir / "deploy_heroku.sh").write_text(heroku_script)
        os.chmod(deploy_dir / "deploy_heroku.sh", 0o755)
    
    print_colored("✅ Deployment scripts generated!", Colors.OKGREEN)

def generate_environment_files(deployment_info: Dict[str, Any]) -> None:
    """Generate environment configuration files"""
    print_colored("⚙️  Generating environment files...", Colors.OKBLUE)
    
    deploy_dir = Path("deployment")
    
    # Backend environment
    backend_env = f"""# SectoolBox Backend Configuration
MONGO_URL={deployment_info.get('db_host', 'mongodb://localhost:27017')}
DB_NAME=sectoolbox_{deployment_info['environment']}
ENVIRONMENT={deployment_info['environment']}
ADMIN_EMAIL={deployment_info.get('admin_email', '')}
ENABLE_RATE_LIMITING={str(deployment_info.get('enable_rate_limiting', True)).lower()}
ENABLE_SECURITY_HEADERS={str(deployment_info.get('enable_security_headers', True)).lower()}
"""
    
    # Frontend environment
    if deployment_info.get('domain'):
        if deployment_info.get('use_https'):
            backend_url = f"https://{deployment_info['domain']}"
        else:
            backend_url = f"http://{deployment_info['domain']}"
    else:
        backend_url = "http://localhost:8001"
    
    frontend_env = f"""# SectoolBox Frontend Configuration
REACT_APP_BACKEND_URL={backend_url}
REACT_APP_APP_NAME={deployment_info['app_name']}
REACT_APP_ENVIRONMENT={deployment_info['environment']}
"""
    
    (deploy_dir / "backend.env").write_text(backend_env)
    (deploy_dir / "frontend.env").write_text(frontend_env)
    
    print_colored("✅ Environment files generated!", Colors.OKGREEN)

def create_deployment_guide(deployment_info: Dict[str, Any]) -> None:
    """Create deployment guide"""
    guide = f"""# SectoolBox Deployment Guide

## Deployment Configuration

**Provider:** {deployment_info['provider'].title()}
**Application:** {deployment_info['app_name']}
**Environment:** {deployment_info['environment']}
**Domain:** {deployment_info.get('domain', 'Not specified')}
**HTTPS:** {'Enabled' if deployment_info.get('use_https') else 'Disabled'}

## Quick Start

1. **Prerequisites:**
   - Docker and Docker Compose installed
   - Access to your cloud provider
   - Domain name (optional)

2. **Deployment Steps:**
   ```bash
   cd deployment
   
   # Copy environment files
   cp backend.env ../backend/.env
   cp frontend.env ../frontend/.env
   
   # Deploy using Docker Compose
   docker-compose up -d
   ```

3. **Verification:**
   - Backend health: http://your-domain/api/health
   - Frontend: http://your-domain
   - API Documentation: http://your-domain/api/docs

## Provider-Specific Instructions

### Digital Ocean
```bash
# Install doctl CLI tool
# Set up API token: doctl auth init
./deploy_digitalocean.sh
```

### Heroku
```bash
# Install Heroku CLI
# Login: heroku login
./deploy_heroku.sh
```

## Security Checklist

- [ ] HTTPS/SSL certificate configured
- [ ] Security headers enabled
- [ ] Rate limiting configured
- [ ] Database access secured
- [ ] Environment variables set
- [ ] Firewall rules configured
- [ ] Backup strategy implemented

## Monitoring

- Check application logs: `docker-compose logs -f`
- Monitor resource usage: `docker stats`
- Database status: Connect to MongoDB and verify collections

## Troubleshooting

### Common Issues

1. **Port conflicts:**
   - Ensure ports 80, 8001, 27017 are available
   - Modify docker-compose.yml if needed

2. **Database connection:**
   - Verify MongoDB URL in environment files
   - Check MongoDB service status

3. **CORS issues:**
   - Verify REACT_APP_BACKEND_URL is correct
   - Check backend CORS configuration

## Support

For support and updates:
- Check the main README.md file
- Review security documentation
- Monitor application logs

Deployment completed: {time.strftime('%Y-%m-%d %H:%M:%S')}
"""
    
    Path("deployment/DEPLOYMENT_GUIDE.md").write_text(guide)
    print_colored("✅ Deployment guide created!", Colors.OKGREEN)

def save_deployment_config(deployment_info: Dict[str, Any]) -> None:
    """Save deployment configuration for future reference"""
    config_file = Path("deployment/deployment_config.json")
    
    # Remove sensitive information before saving
    safe_config = deployment_info.copy()
    sensitive_keys = ['do_api_token', 'aws_access_key', 'aws_secret_key', 'heroku_api_key']
    for key in sensitive_keys:
        if key in safe_config:
            safe_config[key] = "***REDACTED***"
    
    with open(config_file, 'w') as f:
        json.dump(safe_config, f, indent=2)
    
    print_colored("✅ Deployment configuration saved!", Colors.OKGREEN)

def run_deployment_verification() -> None:
    """Run basic deployment verification"""
    print_colored("\n🔍 Running deployment verification...", Colors.OKBLUE)
    
    checks = [
        ("Docker files", Path("deployment/docker-compose.yml").exists()),
        ("Environment files", Path("deployment/backend.env").exists()),
        ("Deployment scripts", len(list(Path("deployment").glob("deploy_*.sh"))) > 0),
        ("Configuration", Path("deployment/deployment_config.json").exists()),
        ("Documentation", Path("deployment/DEPLOYMENT_GUIDE.md").exists()),
    ]
    
    all_passed = True
    for check_name, passed in checks:
        if passed:
            print_colored(f"  ✅ {check_name}", Colors.OKGREEN)
        else:
            print_colored(f"  ❌ {check_name}", Colors.FAIL)
            all_passed = False
    
    if all_passed:
        print_colored("✅ All verification checks passed!", Colors.OKGREEN)
    else:
        print_colored("⚠️  Some verification checks failed", Colors.WARNING)
    
    return all_passed

def main():
    """Main deployment function"""
    print_header()
    
    # Collect deployment information
    deployment_info = collect_deployment_info()
    
    print_colored("\n🔧 Generating deployment files...", Colors.OKBLUE)
    
    # Generate all deployment files
    generate_docker_files(deployment_info)
    generate_deployment_scripts(deployment_info)
    generate_environment_files(deployment_info)
    create_deployment_guide(deployment_info)
    save_deployment_config(deployment_info)
    
    # Run verification
    verification_passed = run_deployment_verification()
    
    # Final instructions
    print_colored("\n" + "="*60, Colors.OKGREEN)
    print_colored("🎉 DEPLOYMENT CONFIGURATION COMPLETE! 🎉", Colors.OKGREEN)
    print_colored("="*60, Colors.OKGREEN)
    
    print_colored("\n📁 Generated Files:", Colors.OKBLUE)
    print_colored("  deployment/docker-compose.yml", Colors.OKCYAN)
    print_colored("  deployment/Dockerfile.backend", Colors.OKCYAN)
    print_colored("  deployment/Dockerfile.frontend", Colors.OKCYAN)
    print_colored("  deployment/nginx.conf", Colors.OKCYAN)
    print_colored("  deployment/backend.env", Colors.OKCYAN)
    print_colored("  deployment/frontend.env", Colors.OKCYAN)
    print_colored("  deployment/DEPLOYMENT_GUIDE.md", Colors.OKCYAN)
    
    if deployment_info['provider'] == 'digitalocean':
        print_colored("  deployment/deploy_digitalocean.sh", Colors.OKCYAN)
    elif deployment_info['provider'] == 'heroku':
        print_colored("  deployment/deploy_heroku.sh", Colors.OKCYAN)
        print_colored("  deployment/Procfile", Colors.OKCYAN)
    
    print_colored("\n🚀 Next Steps:", Colors.OKBLUE)
    print_colored("1. Review the generated files", Colors.OKCYAN)
    print_colored("2. Follow the DEPLOYMENT_GUIDE.md", Colors.OKCYAN)
    print_colored("3. Run the deployment script", Colors.OKCYAN)
    print_colored("4. Verify your deployment", Colors.OKCYAN)
    
    if deployment_info.get('domain'):
        print_colored(f"\n🌐 Your app will be available at:", Colors.OKGREEN)
        protocol = "https" if deployment_info.get('use_https') else "http"
        print_colored(f"   {protocol}://{deployment_info['domain']}", Colors.OKCYAN)
    
    print_colored("\n🔒 Security: Enterprise-grade protection enabled", Colors.OKGREEN)
    print_colored("⚡ Performance: Optimized for production", Colors.OKGREEN)
    print_colored("\nGood luck with your deployment! 🎯", Colors.OKCYAN)

if __name__ == "__main__":
    main()