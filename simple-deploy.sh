#!/bin/bash

# Simple deployment script for bahr-alqeta3.store
# Run this directly on your server after uploading files

set -e

echo "🚀 Deploying bahr-alqeta3.store..."
echo ""

# Check if we're in the right directory
if [ ! -f "docker-compose.production.yml" ]; then
    echo "❌ Error: docker-compose.production.yml not found"
    echo "Please run this script from ~/bahr-alqeta3 directory"
    exit 1
fi

# Install certbot if needed
echo "📦 Checking certbot..."
if ! command -v certbot &> /dev/null; then
    echo "Installing certbot..."
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
else
    echo "✅ Certbot already installed"
fi

# Create nginx configs
echo ""
echo "📝 Creating nginx configurations..."

# Landing page config
sudo tee /etc/nginx/sites-available/bahr-landing > /dev/null << 'EOF'
server {
    listen 80;
    server_name bahr-alqeta3.store www.bahr-alqeta3.store;

    location / {
        proxy_pass http://localhost:8082;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Dashboard config
sudo tee /etc/nginx/sites-available/bahr-dashboard > /dev/null << 'EOF'
server {
    listen 80;
    server_name admin.bahr-alqeta3.store;

    location / {
        proxy_pass http://localhost:8081;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Backend config
sudo tee /etc/nginx/sites-available/bahr-backend > /dev/null << 'EOF'
server {
    listen 80;
    server_name api.bahr-alqeta3.store;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

echo "✅ Nginx configs created"

# Enable sites
echo ""
echo "🔗 Enabling nginx sites..."
sudo ln -sf /etc/nginx/sites-available/bahr-landing /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/bahr-dashboard /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/bahr-backend /etc/nginx/sites-enabled/

# Remove default if exists
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx
echo ""
echo "✅ Testing nginx configuration..."
sudo nginx -t

# Reload nginx
echo ""
echo "🔄 Reloading nginx..."
sudo systemctl reload nginx

echo ""
echo "✅ Nginx setup complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Create .env file:"
echo "   cp .env.production.example .env"
echo "   nano .env  # Edit with your secrets"
echo ""
echo "2. Start Docker services:"
echo "   docker-compose -f docker-compose.production.yml up -d --build"
echo ""
echo "3. Check services are running:"
echo "   docker-compose -f docker-compose.production.yml ps"
echo ""
echo "4. Setup SSL (replace YOUR_EMAIL):"
echo "   sudo certbot --nginx \\"
echo "     -d bahr-alqeta3.store \\"
echo "     -d www.bahr-alqeta3.store \\"
echo "     -d admin.bahr-alqeta3.store \\"
echo "     -d api.bahr-alqeta3.store \\"
echo "     --email YOUR_EMAIL \\"
echo "     --agree-tos \\"
echo "     --non-interactive"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
