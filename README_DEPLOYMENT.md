# bahr-alqeta3.store Deployment

Quick reference for deploying your spare parts system to Contabo server.

## 📦 What You Have

- **Domain**: bahr-alqeta3.store (from Spaceship)
- **Server**: 178.18.246.104 (Contabo)
- **Services**: Backend API, Admin Dashboard, Landing Page

## 🚀 Quick Start

### Step 1: Configure DNS (Do This First!)

Go to Spaceship and add 4 A records. See detailed guide:
- **Quick visual guide**: `DNS_QUICK_GUIDE.txt`
- **Detailed instructions**: `SPACESHIP_DNS_SETUP.md`

Add these records:
- `@` → 178.18.246.104
- `www` → 178.18.246.104
- `admin` → 178.18.246.104
- `api` → 178.18.246.104

Wait 5-10 minutes for DNS to propagate.

### Step 2: Deploy to Server

```bash
# 1. Deploy from local machine
chmod +x quick-deploy.sh && ./quick-deploy.sh

# 2. SSH to server and setup
ssh root@178.18.246.104
cd ~/bahr-alqeta3 && bash check-ports.sh && bash deploy-to-server.sh

# 3. Start services
docker-compose -f docker-compose.production.yml up -d --build
```

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `DNS_QUICK_GUIDE.txt` | Visual DNS setup guide (START HERE) |
| `SPACESHIP_DNS_SETUP.md` | Detailed Spaceship DNS instructions |
| `DEPLOYMENT_CHECKLIST.md` | Step-by-step checklist |
| `DEPLOYMENT_GUIDE.md` | Complete detailed guide |
| `PORT_MANAGEMENT.md` | Port conflict solutions |
| `check-ports.sh` | Check port availability |
| `deploy-to-server.sh` | Setup nginx on server |
| `quick-deploy.sh` | Deploy from local machine |

## 🔌 Port Configuration

**Default ports (avoiding 3000, 5173, etc.):**
- Backend API: 8080
- Dashboard: 8081
- Landing: 8082

**Alternative ports (if defaults are taken):**
- Use `docker-compose.alternative-ports.yml`
- Ports: 9090, 9091, 9092

## ⚠️ Important Notes

1. **Port Conflicts**: Your server has PM2 apps on common ports (3000, 5173). This setup uses 8080-8082 to avoid conflicts.

2. **Existing Services**: You have PostgreSQL (5432) and Redis (6379) running. You can either:
   - Use existing services (recommended)
   - Use different ports (5433, 6380)
   - See `PORT_MANAGEMENT.md`

3. **DNS Setup**: Add these A records in Spaceship:
   - `@` → 178.18.246.104
   - `www` → 178.18.246.104
   - `admin` → 178.18.246.104
   - `api` → 178.18.246.104

## 🔒 SSL Setup

After DNS propagates (5-10 minutes):

```bash
certbot --nginx \
  -d bahr-alqeta3.store \
  -d www.bahr-alqeta3.store \
  -d admin.bahr-alqeta3.store \
  -d api.bahr-alqeta3.store \
  --email your@email.com \
  --agree-tos
```

## 🎯 Access Your Sites

After deployment:
- Landing: https://bahr-alqeta3.store
- Dashboard: https://admin.bahr-alqeta3.store
- API: https://api.bahr-alqeta3.store/health

## 🆘 Troubleshooting

**Port conflicts?**
```bash
bash check-ports.sh
# See PORT_MANAGEMENT.md for solutions
```

**Service not starting?**
```bash
docker-compose logs -f [service-name]
```

**Nginx errors?**
```bash
nginx -t
tail -f /var/log/nginx/error.log
```

**DNS not working?**
```bash
nslookup bahr-alqeta3.store
# Wait 5-10 minutes for propagation
```

## 📞 Quick Commands

```bash
# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Restart service
docker-compose restart backend

# Stop all
docker-compose down

# Rebuild
docker-compose up -d --build

# Check ports
netstat -tuln | grep -E ':(8080|8081|8082)'
```

## 🔄 Updates

To update your deployment:

```bash
# On local machine
./quick-deploy.sh

# On server
cd ~/bahr-alqeta3
docker-compose down
docker-compose up -d --build
```

## 📖 Need More Help?

1. Start with `DEPLOYMENT_CHECKLIST.md`
2. Read `DEPLOYMENT_GUIDE.md` for details
3. Check `PORT_MANAGEMENT.md` for port issues
4. View logs: `docker-compose logs -f`
