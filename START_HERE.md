# 🚀 START HERE - Deploy bahr-alqeta3.store

Welcome! This guide will walk you through deploying your spare parts system to your Contabo server.

## 📋 What You Need

- ✅ Domain: bahr-alqeta3.store (purchased from Spaceship)
- ✅ Server: 178.18.246.104 (Contabo)
- ✅ SSH access: `ssh root@178.18.246.104`
- ✅ This codebase

## 🎯 Deployment Process (3 Main Steps)

### STEP 1: Configure DNS (15 minutes)
**Status**: ⏳ DO THIS FIRST

1. Open `DNS_QUICK_GUIDE.txt` for visual instructions
2. Or read `SPACESHIP_DNS_SETUP.md` for detailed steps
3. Add 4 A records in Spaceship pointing to `178.18.246.104`
4. Wait 5-10 minutes for DNS propagation
5. Verify with: `nslookup bahr-alqeta3.store`

**Expected result**: Should return `178.18.246.104`

---

### STEP 2: Deploy Code to Server (10 minutes)
**Status**: ⏳ After DNS is configured

#### Option A: Quick Deploy (Recommended)
```bash
# From your local machine
chmod +x quick-deploy.sh
./quick-deploy.sh
```

#### Option B: Manual Upload
```bash
# From your local machine
scp -r backend dashbaord landing *.yml *.sh *.md root@178.18.246.104:~/bahr-alqeta3/
```

---

### STEP 3: Setup Server (20 minutes)
**Status**: ⏳ After code is uploaded

```bash
# SSH into server
ssh root@178.18.246.104

# Navigate to project
cd ~/bahr-alqeta3

# Check if ports are available
bash check-ports.sh

# If ports conflict, see PORT_MANAGEMENT.md
# Otherwise, continue...

# Setup nginx and SSL
bash deploy-to-server.sh

# Create environment file
cp .env.production.example .env
nano .env  # Add your secrets (JWT_SECRET, etc.)

# Start all services
docker-compose -f docker-compose.production.yml up -d --build

# Check if services are running
docker-compose ps

# Setup SSL certificates (replace YOUR_EMAIL)
certbot --nginx \
  -d bahr-alqeta3.store \
  -d www.bahr-alqeta3.store \
  -d admin.bahr-alqeta3.store \
  -d api.bahr-alqeta3.store \
  --email YOUR_EMAIL \
  --agree-tos
```

---

## ✅ Verification

After deployment, test your sites:

```bash
# Test API
curl https://api.bahr-alqeta3.store/health

# Should return: {"status":"ok"}
```

Visit in browser:
- 🌐 Landing: https://bahr-alqeta3.store
- 🔧 Dashboard: https://admin.bahr-alqeta3.store
- 🔌 API: https://api.bahr-alqeta3.store/health

---

## 📚 Documentation Reference

| When You Need... | Read This File |
|------------------|----------------|
| DNS setup instructions | `DNS_QUICK_GUIDE.txt` or `SPACESHIP_DNS_SETUP.md` |
| Step-by-step checklist | `DEPLOYMENT_CHECKLIST.md` |
| Detailed deployment guide | `DEPLOYMENT_GUIDE.md` |
| Port conflict help | `PORT_MANAGEMENT.md` |
| Quick reference | `README_DEPLOYMENT.md` |

---

## 🆘 Common Issues

### DNS not working?
```bash
# Check DNS propagation
nslookup bahr-alqeta3.store

# Or use online tool
# https://dnschecker.org/#A/bahr-alqeta3.store

# Wait longer (can take up to 24 hours, usually 5-10 min)
```

### Port conflicts?
```bash
# Check which ports are in use
bash check-ports.sh

# See solutions
cat PORT_MANAGEMENT.md
```

### Docker not installed?
```bash
# Install Docker
curl -fsSL https://get.docker.com | sh
```

### Services not starting?
```bash
# Check logs
docker-compose logs -f

# Check specific service
docker-compose logs backend
```

### SSL certificate fails?
```bash
# Make sure DNS is working first
nslookup bahr-alqeta3.store

# Check nginx config
nginx -t

# Try again
certbot --nginx -d bahr-alqeta3.store --email YOUR_EMAIL
```

---

## 🎯 Quick Commands

```bash
# View all services status
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
systemctl status nginx

# Reload nginx
nginx -t && systemctl reload nginx
```

---

## 📞 Need Help?

1. **Port issues?** → Read `PORT_MANAGEMENT.md`
2. **DNS issues?** → Read `SPACESHIP_DNS_SETUP.md`
3. **Deployment issues?** → Read `DEPLOYMENT_GUIDE.md`
4. **Quick reference?** → Read `README_DEPLOYMENT.md`

---

## 🎉 Success Checklist

- [ ] DNS configured and propagated
- [ ] Code deployed to server
- [ ] Ports checked and available
- [ ] Nginx configured
- [ ] Docker services running
- [ ] SSL certificates installed
- [ ] All 3 sites accessible (landing, admin, api)
- [ ] Can login to dashboard
- [ ] API health check returns OK

---

## 🔄 What's Next?

After successful deployment:

1. **Test all functionality**
   - Create a test order
   - Add/edit parts
   - Check analytics

2. **Set up monitoring**
   - Check logs regularly: `docker-compose logs -f`
   - Monitor server resources: `htop`

3. **Configure backups**
   - Database backups
   - Code backups

4. **Security hardening**
   - Change default passwords
   - Set up firewall: `ufw enable`
   - Regular updates: `apt update && apt upgrade`

---

## 📖 Full Documentation

For complete details, see:
- `DEPLOYMENT_GUIDE.md` - Complete deployment guide
- `DEPLOYMENT_CHECKLIST.md` - Step-by-step checklist
- `PORT_MANAGEMENT.md` - Port configuration
- `SPACESHIP_DNS_SETUP.md` - DNS setup

---

**Ready to start? Begin with DNS configuration!**

Open `DNS_QUICK_GUIDE.txt` or `SPACESHIP_DNS_SETUP.md` 🚀
