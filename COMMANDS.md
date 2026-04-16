# Quick Command Reference

## You Are Here: Server Setup Complete ✅

Files uploaded to: `~/bahr-alqeta3`
Ports checked: All available ✅

## Next: Run These Commands on Server

```bash
# 1. Setup nginx (run this now)
cd ~/bahr-alqeta3
bash simple-deploy.sh

# 2. Create environment file
cp .env.production.example .env
nano .env
# Change JWT_SECRET to something secure like: your-super-secret-key-min-32-characters-long

# 3. Start all services
docker-compose -f docker-compose.production.yml up -d --build

# 4. Check if services are running
docker-compose -f docker-compose.production.yml ps

# Should show:
# bahr-backend    running
# bahr-dashboard  running
# bahr-landing    running
# bahr-postgres   running
# bahr-redis      running

# 5. View logs (optional, to see if everything is working)
docker-compose -f docker-compose.production.yml logs -f

# Press Ctrl+C to exit logs

# 6. Setup SSL certificates (replace your@email.com)
sudo certbot --nginx \
  -d bahr-alqeta3.store \
  -d www.bahr-alqeta3.store \
  -d admin.bahr-alqeta3.store \
  -d api.bahr-alqeta3.store \
  --email your@email.com \
  --agree-tos \
  --non-interactive

# 7. Test your sites
curl https://api.bahr-alqeta3.store/health
# Should return: {"status":"ok"}
```

## Verification

Visit these URLs in your browser:

- Landing: https://bahr-alqeta3.store
- Dashboard: https://admin.bahr-alqeta3.store
- API: https://api.bahr-alqeta3.store/health

## Useful Commands

```bash
# View all services
docker-compose ps

# View logs (all services)
docker-compose logs -f

# View logs (specific service)
docker-compose logs -f backend

# Restart a service
docker-compose restart backend

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Check nginx status
sudo systemctl status nginx

# Reload nginx config
sudo nginx -t && sudo systemctl reload nginx

# Check what's running on ports
ss -tulpn | grep -E ':(8080|8081|8082)'
```

## If Something Goes Wrong

```bash
# Check Docker logs
docker-compose logs backend
docker-compose logs dashboard
docker-compose logs landing

# Check nginx logs
sudo tail -f /var/log/nginx/error.log

# Restart everything
docker-compose down
docker-compose up -d --build

# Check if ports are in use
bash check-ports.sh
```

## Environment Variables (.env file)

Minimum required in `.env`:

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/spare_parts

# JWT Secret (CHANGE THIS!)
JWT_SECRET=your-super-secret-key-change-this-to-something-random-min-32-chars

# Node
NODE_ENV=production
```

## Complete Deployment Checklist

- [x] Files uploaded to server
- [x] Ports checked and available
- [ ] Run: `bash simple-deploy.sh`
- [ ] Create `.env` file
- [ ] Start Docker: `docker-compose -f docker-compose.production.yml up -d --build`
- [ ] Check services: `docker-compose ps`
- [ ] Setup SSL: `sudo certbot --nginx ...`
- [ ] Test sites in browser

## Need More Help?

- Full guide: `cat DEPLOYMENT_GUIDE.md`
- Port issues: `cat PORT_MANAGEMENT.md`
- DNS setup: `cat SPACESHIP_DNS_SETUP.md`
