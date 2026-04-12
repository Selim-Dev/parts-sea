#!/bin/bash

# Quick deployment script - Run this from your LOCAL machine

set -e

echo "🚀 Quick Deploy to bahr-alqeta3.store"
echo "======================================"
echo ""

# Configuration
SERVER="root@178.18.246.104"
PROJECT_NAME="bahr-alqeta3"

echo "📦 Step 1: Creating deployment package..."
tar -czf bahr-deploy.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='dist' \
  --exclude='build' \
  --exclude='.next' \
  backend/ dashbaord/ landing/ \
  docker-compose.production.yml \
  docker-compose.alternative-ports.yml \
  deploy-to-server.sh \
  check-ports.sh \
  START_HERE.md \
  README_DEPLOYMENT.md \
  DEPLOYMENT_GUIDE.md \
  DEPLOYMENT_CHECKLIST.md \
  PORT_MANAGEMENT.md \
  SPACESHIP_DNS_SETUP.md \
  DNS_QUICK_GUIDE.txt \
  .env.production.example

echo "✅ Package created: bahr-deploy.tar.gz"
echo ""

echo "📤 Step 2: Uploading to server..."
scp bahr-deploy.tar.gz $SERVER:~/

echo "✅ Upload complete"
echo ""

echo "🔧 Step 3: Setting up on server..."
ssh $SERVER << 'ENDSSH'
set -e

# Create project directory
mkdir -p ~/bahr-alqeta3
cd ~/bahr-alqeta3

# Extract files
echo "📂 Extracting files..."
tar -xzf ~/bahr-deploy.tar.gz

# Make scripts executable
chmod +x deploy-to-server.sh check-ports.sh

# Check port availability
echo ""
echo "🔍 Checking port availability..."
bash check-ports.sh

echo ""
echo "✅ Files extracted to ~/bahr-alqeta3"
echo ""
echo "📋 Next steps:"
echo "1. Configure DNS in Spaceship (see DEPLOYMENT_GUIDE.md)"
echo "2. Run: bash deploy-to-server.sh"
echo "3. Create .env file with your secrets"
echo "4. Run: docker-compose -f docker-compose.production.yml up -d --build"
echo "5. Setup SSL: certbot --nginx -d bahr-alqeta3.store -d www.bahr-alqeta3.store -d admin.bahr-alqeta3.store -d api.bahr-alqeta3.store --email YOUR_EMAIL --agree-tos"
echo ""
echo "Note: If ports 8080-8082 are in use, use docker-compose.alternative-ports.yml instead (ports 9090-9092)"
ENDSSH

echo ""
echo "✅ Deployment package ready on server!"
echo ""
echo "🎯 To complete deployment, SSH into server and follow the steps:"
echo "   ssh $SERVER"
echo "   cd ~/bahr-alqeta3"
echo "   cat DEPLOYMENT_GUIDE.md"
echo ""
