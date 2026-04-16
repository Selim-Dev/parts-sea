#!/bin/bash

# Deployment script for bahr-alqeta3.store
# Run this on your server: bash deploy-to-server.sh

set -e

echo "🚀 Starting deployment for bahr-alqeta3.store..."

# Install certbot if not installed
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing certbot..."
    sudo apt update
    sudo apt install certbot python3-certbot-nginx -y
fi

# Create nginx config for Landing Page (main domain)
echo "📝 Creating nginx config for landing page..."
cat > /etc/nginx/sites-available/bahr-landing << 'EOF'
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

# Create nginx config for Dashboard (admin subdomain)
echo "📝 Creating nginx config for dashboard..."
cat > /etc/nginx/sites-available/bahr-dashboard << 'EOF'
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

# Create nginx config for Backend API
echo "📝 Creating nginx config for backend API..."
cat > /etc/nginx/sites-available/bahr-backend << 'EOF'
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

# Enable sites
echo "🔗 Enabling sites..."
ln -sf /etc/nginx/sites-available/bahr-landing /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/bahr-dashboard /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/bahr-backend /etc/nginx/sites-enabled/

# Remove default site if exists
rm -f /etc/nginx/sites-enabled/default

# Test nginx config
echo "✅ Testing nginx configuration..."
nginx -t

# Reload nginx
echo "🔄 Reloading nginx..."
systemctl reload nginx

echo ""
echo "✅ Nginx configured successfully!"
echo ""
echo "📋 Next steps:"
echo "1. In Spaceship DNS, add these records:"
echo "   - A record: @ → 178.18.246.104"
echo "   - A record: www → 178.18.246.104"
echo "   - A record: admin → 178.18.246.104"
echo "   - A record: api → 178.18.246.104"
echo ""
echo "2. Wait 5-10 minutes for DNS to propagate"
echo ""
echo "3. Run SSL setup (replace YOUR_EMAIL):"
echo "   certbot --nginx -d bahr-alqeta3.store -d www.bahr-alqeta3.store -d admin.bahr-alqeta3.store -d api.bahr-alqeta3.store --email YOUR_EMAIL --agree-tos --non-interactive"
echo ""
echo "4. Deploy your apps to run on:"
echo "   - Landing: port 8082"
echo "   - Dashboard: port 8081"
echo "   - Backend: port 8080"
echo ""
