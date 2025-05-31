# SectoolBox - DigitalOcean Deployment Guide

## 🚀 Complete Step-by-Step Deployment Guide for DigitalOcean

This guide will help you deploy SectoolBox (CTF Toolkit) on DigitalOcean with full forensics tools and custom script functionality.

---

## 📋 Prerequisites

- DigitalOcean account
- Domain name (optional but recommended)
- Basic knowledge of Linux commands
- SSH client

---

## 🖥️ Step 1: Create DigitalOcean Droplet

### 1.1 Droplet Configuration
- **Image**: Ubuntu 22.04 (LTS) x64
- **Plan**: 
  - **Basic**: $24/month (4GB RAM, 2 vCPUs, 80GB SSD) - **Recommended**
  - **CPU-Optimized**: $48/month (8GB RAM, 4 vCPUs, 160GB SSD) - For heavy usage
- **Region**: Choose closest to your users
- **Authentication**: SSH Key (recommended) or Password
- **Hostname**: `sectoolbox-server`

### 1.2 Additional Options
- **Enable**: Monitoring, IPv6, Backup (optional)
- **User Data**: Leave empty for now

---

## 🔧 Step 2: Initial Server Setup

### 2.1 Connect to Your Droplet
```bash
ssh root@YOUR_DROPLET_IP
```

### 2.2 Update System
```bash
apt update && apt upgrade -y
```

### 2.3 Create Non-Root User (Recommended)
```bash
adduser sectool
usermod -aG sudo sectool
rsync --archive --chown=sectool:sectool ~/.ssh /home/sectool
```

### 2.4 Configure Firewall
```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

---

## 🛠️ Step 3: Install Required Dependencies

### 3.1 Install Basic Dependencies
```bash
# Essential packages
apt install -y curl wget git unzip software-properties-common

# Python and development tools
apt install -y python3 python3-pip python3-venv python3-dev

# Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# Install Yarn
npm install -g yarn

# File analysis tools
apt install -y libmagic1 libmagic-dev file

# Security and forensics tools
apt install -y binutils hexdump exif exiftool
```

### 3.2 Install Advanced Forensics Tools

#### Install Steghide
```bash
apt install -y steghide
```

#### Install zsteg (Ruby-based)
```bash
apt install -y ruby ruby-dev
gem install zsteg
```

#### Install Outguess
```bash
apt install -y outguess
```

#### Install additional analysis tools
```bash
# PDF analysis
apt install -y poppler-utils

# Archive analysis
apt install -y p7zip-full unrar-free

# Network analysis
apt install -y tcpdump wireshark-common

# Strings and analysis
apt install -y strings foremost

# Image analysis
apt install -y imagemagick
```

### 3.3 Install MongoDB
```bash
# Import MongoDB GPG key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install MongoDB
apt update
apt install -y mongodb-org

# Start and enable MongoDB
systemctl start mongod
systemctl enable mongod
```

### 3.4 Install Nginx
```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

### 3.5 Install Supervisor (Process Manager)
```bash
apt install -y supervisor
systemctl start supervisor
systemctl enable supervisor
```

---

## 📂 Step 4: Deploy Application

### 4.1 Clone Repository
```bash
cd /opt
git clone https://github.com/yourusername/sectoolbox.git
cd sectoolbox

# Set proper ownership
chown -R sectool:sectool /opt/sectoolbox
```

### 4.2 Backend Setup
```bash
cd /opt/sectoolbox/backend

# Create Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
nano .env
```

**Edit .env file:**
```env
MONGO_URL=mongodb://localhost:27017
SECRET_KEY=your-super-secret-key-here
ENVIRONMENT=production
```

### 4.3 Frontend Setup
```bash
cd /opt/sectoolbox/frontend

# Install dependencies
yarn install

# Build production version
yarn build
```

### 4.4 Environment Configuration
```bash
# Backend .env
echo 'MONGO_URL="mongodb://localhost:27017"' > /opt/sectoolbox/backend/.env

# Frontend .env (adjust YOUR_DOMAIN)
echo 'REACT_APP_BACKEND_URL=https://YOUR_DOMAIN' > /opt/sectoolbox/frontend/.env

# Or use IP if no domain
echo 'REACT_APP_BACKEND_URL=http://YOUR_DROPLET_IP' > /opt/sectoolbox/frontend/.env
```

---

## ⚙️ Step 5: Configure Services

### 5.1 Create Supervisor Configuration

#### Backend Service
```bash
cat > /etc/supervisor/conf.d/sectoolbox-backend.conf << 'EOF'
[program:sectoolbox-backend]
command=/opt/sectoolbox/backend/venv/bin/python -m uvicorn server:app --host 0.0.0.0 --port 8001
directory=/opt/sectoolbox/backend
user=sectool
autostart=true
autorestart=true
stdout_logfile=/var/log/supervisor/sectoolbox-backend.log
stderr_logfile=/var/log/supervisor/sectoolbox-backend-error.log
environment=PATH="/opt/sectoolbox/backend/venv/bin"
EOF
```

#### Frontend Service (Development - for production use Nginx)
```bash
cat > /etc/supervisor/conf.d/sectoolbox-frontend.conf << 'EOF'
[program:sectoolbox-frontend]
command=/usr/bin/yarn start
directory=/opt/sectoolbox/frontend
user=sectool
autostart=true
autorestart=true
stdout_logfile=/var/log/supervisor/sectoolbox-frontend.log
stderr_logfile=/var/log/supervisor/sectoolbox-frontend-error.log
environment=PORT="3000"
EOF
```

### 5.2 Start Services
```bash
supervisorctl reread
supervisorctl update
supervisorctl start sectoolbox-backend
supervisorctl start sectoolbox-frontend
```

---

## 🌐 Step 6: Configure Nginx (Reverse Proxy)

### 6.1 Create Nginx Configuration
```bash
cat > /etc/nginx/sites-available/sectoolbox << 'EOF'
server {
    listen 80;
    server_name YOUR_DOMAIN www.YOUR_DOMAIN;  # Replace with your domain or IP
    
    client_max_body_size 100M;  # For file uploads
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout settings for script execution
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF
```

### 6.2 Enable Site
```bash
ln -s /etc/nginx/sites-available/sectoolbox /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default  # Remove default site
nginx -t  # Test configuration
systemctl reload nginx
```

---

## 🔒 Step 7: SSL/HTTPS Setup (Recommended)

### 7.1 Install Certbot
```bash
apt install -y certbot python3-certbot-nginx
```

### 7.2 Obtain SSL Certificate
```bash
# Replace with your domain
certbot --nginx -d YOUR_DOMAIN -d www.YOUR_DOMAIN

# Follow the prompts
```

### 7.3 Auto-renewal
```bash
# Test auto-renewal
certbot renew --dry-run

# Add to crontab for automatic renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
```

---

## 📁 Step 8: Configure Custom Scripts Directory

### 8.1 Create Scripts Directory
```bash
mkdir -p /opt/sectoolbox/backend/scriptscustom
chown -R sectool:sectool /opt/sectoolbox/backend/scriptscustom
chmod 755 /opt/sectoolbox/backend/scriptscustom
```

### 8.2 Install Additional Python Packages for Scripts
```bash
cd /opt/sectoolbox/backend
source venv/bin/activate
pip install requests beautifulsoup4 pandas numpy matplotlib pillow
```

---

## 🔧 Step 9: System Optimization & Security

### 9.1 Optimize MongoDB
```bash
# Edit MongoDB configuration
nano /etc/mongod.conf
```

Add/modify these settings:
```yaml
storage:
  wiredTiger:
    engineConfig:
      cacheSizeGB: 1  # Adjust based on available RAM

net:
  bindIp: 127.0.0.1  # Only local connections
  port: 27017

systemLog:
  destination: file
  path: /var/log/mongodb/mongod.log
  logAppend: true
```

Restart MongoDB:
```bash
systemctl restart mongod
```

### 9.2 Security Hardening
```bash
# Disable unused services
systemctl disable cups-browsed
systemctl stop cups-browsed

# Install fail2ban
apt install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban

# Configure automatic security updates
apt install -y unattended-upgrades
dpkg-reconfigure unattended-upgrades
```

### 9.3 Setup Log Rotation
```bash
cat > /etc/logrotate.d/sectoolbox << 'EOF'
/var/log/supervisor/sectoolbox-*.log {
    daily
    missingok
    rotate 14
    compress
    notifempty
    create 644 sectool sectool
    postrotate
        supervisorctl restart sectoolbox-backend
        supervisorctl restart sectoolbox-frontend
    endscript
}
EOF
```

---

## 🚀 Step 10: Final Testing & Verification

### 10.1 Check Services Status
```bash
# Check all services
systemctl status nginx
systemctl status mongod
supervisorctl status

# Check logs if any issues
tail -f /var/log/supervisor/sectoolbox-backend.log
tail -f /var/log/supervisor/sectoolbox-frontend.log
```

### 10.2 Test Application
1. **Open browser**: `https://YOUR_DOMAIN` or `http://YOUR_DROPLET_IP`
2. **Test tools**: Navigate to Tools page and test encoding/decoding
3. **Test file analysis**: Upload a sample file
4. **Test custom scripts**: Upload a simple Python script

### 10.3 Performance Testing
```bash
# Install htop for monitoring
apt install -y htop iotop

# Monitor system resources
htop
```

---

## 🔄 Step 11: Maintenance & Updates

### 11.1 Update Application
```bash
cd /opt/sectoolbox
git pull origin main

# Update backend
cd backend
source venv/bin/activate
pip install -r requirements.txt

# Update frontend
cd ../frontend
yarn install
yarn build

# Restart services
supervisorctl restart sectoolbox-backend
supervisorctl restart sectoolbox-frontend
```

### 11.2 Database Backup
```bash
# Create backup script
cat > /opt/sectoolbox/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --db sectoolbox --out /opt/sectoolbox/backups/mongo_$DATE
tar -czf /opt/sectoolbox/backups/sectoolbox_$DATE.tar.gz /opt/sectoolbox/backend/scriptscustom
# Keep only last 7 days of backups
find /opt/sectoolbox/backups -type f -mtime +7 -delete
EOF

chmod +x /opt/sectoolbox/backup.sh

# Add to daily cron
echo "0 2 * * * /opt/sectoolbox/backup.sh" | crontab -
```

---

## 🛟 Troubleshooting

### Common Issues & Solutions

#### 1. Backend Not Starting
```bash
# Check Python virtual environment
cd /opt/sectoolbox/backend
source venv/bin/activate
python -c "import fastapi; print('FastAPI OK')"

# Check logs
tail -f /var/log/supervisor/sectoolbox-backend-error.log
```

#### 2. Frontend Build Issues
```bash
# Clear cache and rebuild
cd /opt/sectoolbox/frontend
yarn cache clean
rm -rf node_modules
yarn install
yarn build
```

#### 3. MongoDB Connection Issues
```bash
# Check MongoDB status
systemctl status mongod
mongo --eval "db.adminCommand('ismaster')"
```

#### 4. Nginx Configuration Issues
```bash
# Test configuration
nginx -t

# Check logs
tail -f /var/log/nginx/error.log
```

#### 5. File Upload Issues
```bash
# Check permissions
ls -la /opt/sectoolbox/backend/scriptscustom
chown -R sectool:sectool /opt/sectoolbox/backend/scriptscustom
```

---

## 📊 Monitoring & Analytics

### Setup Basic Monitoring
```bash
# Install monitoring tools
apt install -y netdata

# Access monitoring at: http://YOUR_DOMAIN:19999
```

---

## 🎯 Performance Optimization Tips

1. **Enable Gzip Compression** in Nginx
2. **Use Redis** for caching (optional)
3. **Configure CDN** for static assets
4. **Monitor resource usage** regularly
5. **Set up alerts** for high resource usage

---

## ✅ Deployment Checklist

- [ ] Droplet created and configured
- [ ] All dependencies installed
- [ ] MongoDB running and secured
- [ ] Application code deployed
- [ ] Environment variables configured
- [ ] Services configured with Supervisor
- [ ] Nginx configured as reverse proxy
- [ ] SSL certificate installed (if using domain)
- [ ] Firewall configured
- [ ] Custom scripts directory setup
- [ ] Backup system configured
- [ ] Application tested and working
- [ ] Performance monitoring setup

---

## 🆘 Support & Resources

- **DigitalOcean Docs**: https://docs.digitalocean.com/
- **MongoDB Docs**: https://docs.mongodb.com/
- **Nginx Docs**: https://nginx.org/en/docs/
- **Let's Encrypt**: https://letsencrypt.org/

---

**🎉 Congratulations! Your SectoolBox is now deployed and ready for CTF competitions and security analysis!**

Remember to regularly update your system and application for security and performance improvements.