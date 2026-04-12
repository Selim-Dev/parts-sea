# Deployment Guide for bahr-alqeta3.store

## Overview
This guide will help you deploy your spare parts system to your Contabo server.

**Domain Structure:**
- `bahr-alqeta3.store` → Landing page (customer-facing) - Port 8082
- `admin.bahr-alqeta3.store` → Dashboard (admin panel) - Port 8081
- `api.bahr-alqeta3.store` → Backend API - Port 8080

## Step 1: Configure DNS in Spaceship

Log into your Spaceship account and add these DNS records:

| Type | Name  | Value            | TTL  |
|------|-------|------------------|------|
| A    | @     | 178.18.246.104   | 3600 |
| A    | www   | 178.18.246.104   | 3600 |
| A    | admin | 178.18.246.104   | 3600 |
| A    | api   | 178.18.246.104   | 3600 |

**Wait 5-10 minutes for DNS propagation.**

## Step 2: Prepare Your Server

SSH into your server:
```bash
ssh root@178.18.246.104
```

Install Docker if not already installed:
```bash
# Check if docker is installed
docker --version

# If not, install it
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

## Step 3: Upload Your Code

From your local machine, upload the project to the server:

```bash
# Create a tar of your project (excluding node_modules)
tar -czf bahr-project.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='dist' \
  backend/ dashbaord/ landing/ docker-compose.production.yml

# Upload to server
scp bahr-project.tar.gz root@178.18.246.104:~/

# On server, extract
ssh root@178.18.246.104
cd ~
mkdir -p bahr-alqeta3
cd bahr-alqeta3
tar -xzf ../bahr-project.tar.gz
```

## Step 4: Configure Environment Variables

First, check if ports are available:

```bash
cd ~/bahr-alqeta3
bash check-ports.sh
```

If ports 8080-8082 are in use, you have two options:

**Option A: Stop conflicting services**
```bash
# Find what's using the port
netstat -tulpn | grep :8080

# If it's PM2
pm2 list
pm2 stop <app-name>

# If it's a regular process
kill -9 <PID>
```

**Option B: Use alternative ports (9090-9092)**
```bash
# Use the alternative docker-compose file
# Update nginx configs to use ports 9090-9092 instead
```

Create `.env` file on the server:

```bash
cd ~/bahr-alqeta3
cat > .env << 'EOF'
# Database
MONGODB_URI=mongodb://localhost:27017/spare-parts
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/spare_parts

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this

# Node
NODE_ENV=production
EOF
```

## Step 5: Setup Nginx

Run the deployment script:

```bash
cd ~/bahr-alqeta3
bash deploy-to-server.sh
```

## Step 6: Get SSL Certificates

Replace `your@email.com` with your actual email:

```bash
certbot --nginx \
  -d bahr-alqeta3.store \
  -d www.bahr-alqeta3.store \
  -d admin.bahr-alqeta3.store \
  -d api.bahr-alqeta3.store \
  --email your@email.com \
  --agree-tos \
  --non-interactive
```

## Step 7: Start Your Applications

```bash
cd ~/bahr-alqeta3

# Build and start all services
docker-compose -f docker-compose.production.yml up -d --build

# Check if everything is running
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f
```

## Step 8: Verify Deployment

Test each service:

```bash
# Test backend API
curl https://api.bahr-alqeta3.store/health

# Check if sites are accessible
curl -I https://bahr-alqeta3.store
curl -I https://admin.bahr-alqeta3.store
```

Visit in browser:
- https://bahr-alqeta3.store (Landing page)
- https://admin.bahr-alqeta3.store (Dashboard)
- https://api.bahr-alqeta3.store/health (API health check)

## Useful Commands

```bash
# View logs
docker-compose -f docker-compose.production.yml logs -f [service-name]

# Restart a service
docker-compose -f docker-compose.production.yml restart [service-name]

# Stop all services
docker-compose -f docker-compose.production.yml down

# Rebuild and restart
docker-compose -f docker-compose.production.yml up -d --build

# Check nginx status
systemctl status nginx

# Reload nginx config
nginx -t && systemctl reload nginx

# Renew SSL certificates (auto-renews, but manual command)
certbot renew
```

## Troubleshooting

### DNS not resolving
```bash
# Check DNS propagation
nslookup bahr-alqeta3.store
dig bahr-alqeta3.store
```

### Port already in use
```bash
# Check what's using the port
netstat -tulpn | grep -E ':(8080|8081|8082)'

# Stop the process
kill -9 <PID>
```

### Docker issues
```bash
# Clean up Docker
docker system prune -a

# Restart Docker
systemctl restart docker
```

### Nginx errors
```bash
# Check nginx error logs
tail -f /var/log/nginx/error.log

# Test nginx config
nginx -t
```

## Security Checklist

- [ ] Change default JWT_SECRET in .env
- [ ] Set strong database passwords
- [ ] Enable firewall (ufw)
- [ ] Set up automatic SSL renewal
- [ ] Configure backup strategy
- [ ] Set up monitoring

## Firewall Setup (Optional but Recommended)

```bash
# Install and configure UFW
apt install ufw
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw enable
```

## Automatic SSL Renewal

Certbot automatically sets up renewal. Verify:

```bash
# Test renewal
certbot renew --dry-run

# Check renewal timer
systemctl status certbot.timer
```

## Need Help?

- Check logs: `docker-compose logs -f`
- Nginx logs: `/var/log/nginx/`
- Server status: `systemctl status nginx`
