# Deployment Checklist for bahr-alqeta3.store

## Pre-Deployment

- [ ] Domain purchased: bahr-alqeta3.store ✅
- [ ] Server access: root@178.18.246.104 ✅
- [ ] Nginx installed on server ✅
- [ ] Docker installed on server (check with `docker --version`)

## DNS Configuration (Spaceship)

📖 **See detailed guide**: `DNS_QUICK_GUIDE.txt` or `SPACESHIP_DNS_SETUP.md`

Go to Spaceship DNS settings and add:

- [ ] A record: `@` → `178.18.246.104`
- [ ] A record: `www` → `178.18.246.104`
- [ ] A record: `admin` → `178.18.246.104`
- [ ] A record: `api` → `178.18.246.104`
- [ ] Wait 5-10 minutes for DNS propagation
- [ ] Verify with: `nslookup bahr-alqeta3.store` (should return 178.18.246.104)

## Server Setup

### Option A: Quick Deploy (Easiest)

From your local machine:
```bash
chmod +x quick-deploy.sh
./quick-deploy.sh
```

Then SSH into server:
```bash
ssh root@178.18.246.104
cd ~/bahr-alqeta3
```

### Option B: Manual Upload

```bash
# From local machine
scp -r backend dashbaord landing docker-compose.production.yml root@178.18.246.104:~/bahr-alqeta3/
```

## On Server

- [ ] Navigate to project: `cd ~/bahr-alqeta3`
- [ ] Check port availability: `bash check-ports.sh`
- [ ] If ports conflict, see `PORT_MANAGEMENT.md` for solutions
- [ ] Run nginx setup: `bash deploy-to-server.sh`
- [ ] Create `.env` file with your secrets
- [ ] Install Docker if needed: `curl -fsSL https://get.docker.com | sh`
- [ ] Start services: `docker-compose -f docker-compose.production.yml up -d --build`
- [ ] Check services: `docker-compose -f docker-compose.production.yml ps`

## SSL Setup

- [ ] Run certbot (replace YOUR_EMAIL):
```bash
certbot --nginx \
  -d bahr-alqeta3.store \
  -d www.bahr-alqeta3.store \
  -d admin.bahr-alqeta3.store \
  -d api.bahr-alqeta3.store \
  --email YOUR_EMAIL \
  --agree-tos \
  --non-interactive
```

## Verification

- [ ] Test API: `curl https://api.bahr-alqeta3.store/health`
- [ ] Visit: https://bahr-alqeta3.store
- [ ] Visit: https://admin.bahr-alqeta3.store
- [ ] Check logs: `docker-compose -f docker-compose.production.yml logs -f`

## Post-Deployment

- [ ] Change JWT_SECRET in .env
- [ ] Set up database backups
- [ ] Configure monitoring
- [ ] Test all functionality
- [ ] Set up firewall (optional): `ufw enable`

## Quick Commands Reference

```bash
# View logs
docker-compose -f docker-compose.production.yml logs -f

# Restart services
docker-compose -f docker-compose.production.yml restart

# Stop services
docker-compose -f docker-compose.production.yml down

# Rebuild
docker-compose -f docker-compose.production.yml up -d --build

# Check nginx
nginx -t && systemctl reload nginx
```

## Troubleshooting

If something doesn't work:

1. Check DNS: `nslookup bahr-alqeta3.store`
2. Check Docker: `docker ps`
3. Check nginx: `systemctl status nginx`
4. Check logs: `tail -f /var/log/nginx/error.log`
5. Check ports: `netstat -tulpn | grep -E ':(80|443|8080|8081|8082)'`

## Support

- Full guide: See `DEPLOYMENT_GUIDE.md`
- Server: 178.18.246.104
- Domain: bahr-alqeta3.store
