# Deployment Using Docker — Reusable Guide

A step-by-step guide for deploying any Dockerized project (backend + frontends) to a Linux VPS using Docker Compose + Nginx (host) + Certbot SSL. This was distilled from the `bahr-alqeta3.store` deployment in this repo and is meant as a template for future projects.

**Stack assumed on the server:**
- Ubuntu / Debian VPS with root SSH access
- Nginx installed on the **host** (acts as reverse proxy + SSL terminator)
- Docker + Docker Compose
- Certbot (for Let's Encrypt SSL)

**Pattern:** each app runs in its own container on a high port (8080, 8081, 8082, …). The host's Nginx terminates SSL on 443 and proxies to those container ports. This lets you run multiple unrelated projects on the same server without port collisions.

---

## 0. One-time server prep (skip if already done)

SSH in:
```bash
ssh root@YOUR_SERVER_IP
```

Install Docker + Compose:
```bash
curl -fsSL https://get.docker.com | sh
docker --version
docker compose version
```

Install Nginx + Certbot:
```bash
apt update
apt install -y nginx certbot python3-certbot-nginx
systemctl enable --now nginx
```

(Optional) Firewall:
```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw enable
```

---

## 1. Pick your domain + port plan

For each new project, decide:

| Purpose            | Subdomain example          | Container port (host) |
|--------------------|----------------------------|-----------------------|
| Landing / public   | `myproject.com`            | `9080`                |
| Admin dashboard    | `admin.myproject.com`      | `9081`                |
| Backend API        | `api.myproject.com`        | `9082`                |

**Important:** before picking ports, check what's already in use on the server:
```bash
ss -tuln | grep -E ':(8080|8081|8082|9080|9081|9082)'
```
Pick a free range so you don't conflict with existing projects (this repo uses 8080–8082; use 9080–9082 or similar for the next project).

---

## 2. Configure DNS

In your DNS provider (Spaceship, Cloudflare, etc.), add A records:

| Type | Name  | Value             | TTL  |
|------|-------|-------------------|------|
| A    | @     | YOUR_SERVER_IP    | 3600 |
| A    | www   | YOUR_SERVER_IP    | 3600 |
| A    | admin | YOUR_SERVER_IP    | 3600 |
| A    | api   | YOUR_SERVER_IP    | 3600 |

Wait 5–10 minutes, then verify:
```bash
nslookup myproject.com
```

---

## 3. Project layout

Each service needs its own folder with a `Dockerfile`. Repo root holds the compose file:

```
my-project/
├── backend/                       # NestJS / Node / etc.
│   ├── Dockerfile
│   └── ...
├── dashboard/                     # Vite / React SPA
│   ├── Dockerfile
│   ├── nginx.conf                 # SPA fallback inside the container
│   └── ...
├── landing/                       # Next.js
│   ├── Dockerfile
│   └── ...
├── docker-compose.production.yml
├── .env.production.example
└── deploy-updates.sh
```

### 3.1 Backend Dockerfile (Node API — multi-stage)

See [backend/Dockerfile](backend/Dockerfile) for the working example. Pattern:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main"]
```

### 3.2 SPA Dockerfile (Vite/React served by Nginx in-container)

See [dashbaord/Dockerfile](dashbaord/Dockerfile). Build args bake the API URL into the bundle at build time (Vite/React inline env vars at build, not runtime):

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

And [dashbaord/nginx.conf](dashbaord/nginx.conf) for SPA routing fallback:
```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
}
```

### 3.3 Next.js Dockerfile

See [landing/Dockerfile](landing/Dockerfile). `NEXT_PUBLIC_*` vars must be passed as build args because they're inlined at build time:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache git
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY package*.json ./
RUN npm install --legacy-peer-deps --ignore-scripts
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps --ignore-scripts
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.* ./
EXPOSE 3000
CMD ["npm", "start"]
```

> **Why `--ignore-scripts`:** skips Husky `prepare` hook which fails inside Docker (no `.git`).

### 3.4 docker-compose.production.yml

Mirror of [docker-compose.production.yml](docker-compose.production.yml). Replace the names, ports, and image tags for the new project:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: myproject-backend
    restart: unless-stopped
    ports:
      - "9082:3000"                # host:container
    environment:
      - NODE_ENV=production
      - PORT=3000
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
    networks: [myproject-network]

  dashboard:
    build:
      context: ./dashboard
      dockerfile: Dockerfile
      args:
        VITE_API_URL: https://api.myproject.com/api
    container_name: myproject-dashboard
    restart: unless-stopped
    ports:
      - "9081:80"
    networks: [myproject-network]

  landing:
    build:
      context: ./landing
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_API_URL: https://api.myproject.com/api
    container_name: myproject-landing
    restart: unless-stopped
    ports:
      - "9080:3000"
    networks: [myproject-network]

networks:
  myproject-network:
    driver: bridge
```

### 3.5 .env on the server (NOT in git)

Create `.env` next to the compose file. Compose auto-loads it for `${VAR}` substitution:
```bash
MONGODB_URI=mongodb://...
MONGODB_DB_NAME=myproject
JWT_SECRET=<generate with: openssl rand -base64 48>
NODE_ENV=production
```

Commit only `.env.production.example` as a template.

---

## 4. Initial deploy (from your local machine)

This is the **first-time** upload. Future updates use the faster script in section 5.

> Works on Windows Git Bash, Linux, macOS — no rsync needed (uses `tar | ssh`).

```bash
SERVER="root@YOUR_SERVER_IP"
PROJECT_DIR="~/myproject"

# 1. Create project dir on server
ssh $SERVER "mkdir -p $PROJECT_DIR"

# 2. Tar + ship the source (skipping junk)
tar \
  --exclude='*/node_modules' \
  --exclude='*/.git' \
  --exclude='*/dist' \
  --exclude='*/build' \
  --exclude='*/.next' \
  --exclude='*/.env*' \
  --exclude='*.log' \
  -czf - backend dashboard landing docker-compose.production.yml \
  | ssh $SERVER "cd $PROJECT_DIR && tar -xzf -"

# 3. SSH in and create .env
ssh $SERVER
cd ~/myproject
nano .env       # paste real secrets

# 4. Build + start
docker compose -f docker-compose.production.yml up -d --build
docker compose -f docker-compose.production.yml ps
```

---

## 5. Reusable update script

Save as `deploy-updates.sh` in the project root (mirrors [deploy-updates.sh](deploy-updates.sh)). Edit the two variables at the top per project:

```bash
#!/bin/bash
set -e

SERVER="root@YOUR_SERVER_IP"
PROJECT_DIR="~/myproject"

echo "Syncing files..."
tar \
  --exclude='*/node_modules' --exclude='*/.git' --exclude='*/dist' \
  --exclude='*/build' --exclude='*/.next' --exclude='*/.env*' \
  --exclude='*.log' --exclude='*/.DS_Store' \
  -czf - backend dashboard landing docker-compose.production.yml \
  | ssh $SERVER "cd $PROJECT_DIR && tar -xzf -"

echo "Rebuilding on server..."
ssh $SERVER << 'ENDSSH'
cd ~/myproject
docker compose -f docker-compose.production.yml build --no-cache
docker compose -f docker-compose.production.yml up -d
docker compose -f docker-compose.production.yml ps
ENDSSH
```

Run from your local repo:
```bash
bash deploy-updates.sh
```

For per-service rebuilds (faster), see [deploy-fast.sh](deploy-fast.sh) — same pattern but takes `backend|dashboard|landing` as an argument and only rebuilds that one image.

---

## 6. Configure host Nginx (one block per subdomain)

On the server, create one config file per subdomain that proxies to the corresponding container port. Pattern from [deploy-to-server.sh](deploy-to-server.sh):

```bash
# /etc/nginx/sites-available/myproject-landing
cat > /etc/nginx/sites-available/myproject-landing << 'EOF'
server {
    listen 80;
    server_name myproject.com www.myproject.com;
    location / {
        proxy_pass http://localhost:9080;
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
```

Repeat for `admin.myproject.com` → `localhost:9081` and `api.myproject.com` → `localhost:9082`. Then:

```bash
ln -sf /etc/nginx/sites-available/myproject-landing   /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/myproject-dashboard /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/myproject-api       /etc/nginx/sites-enabled/

nginx -t && systemctl reload nginx
```

---

## 7. SSL with Certbot

```bash
certbot --nginx \
  -d myproject.com \
  -d www.myproject.com \
  -d admin.myproject.com \
  -d api.myproject.com \
  --email you@example.com \
  --agree-tos --non-interactive
```

Certbot rewrites the nginx configs to add 443 + auto-redirect from 80. Auto-renewal is set up via `certbot.timer`. Verify:
```bash
certbot renew --dry-run
systemctl status certbot.timer
```

---

## 8. Verify

```bash
curl -I https://myproject.com
curl -I https://admin.myproject.com
curl https://api.myproject.com/health
docker compose -f docker-compose.production.yml ps
```

---

## 9. Day-to-day commands

Run on the server, in `~/myproject`:

```bash
# Live logs (all or one)
docker compose -f docker-compose.production.yml logs -f
docker compose -f docker-compose.production.yml logs -f backend

# Restart
docker compose -f docker-compose.production.yml restart
docker compose -f docker-compose.production.yml restart backend

# Stop / start
docker compose -f docker-compose.production.yml down
docker compose -f docker-compose.production.yml up -d

# Rebuild everything fresh
docker compose -f docker-compose.production.yml build --no-cache
docker compose -f docker-compose.production.yml up -d

# Free disk
docker system prune -a
```

---

## 10. Troubleshooting cheatsheet

| Symptom                                | Check                                                                 |
|----------------------------------------|-----------------------------------------------------------------------|
| Site not loading                       | `nslookup myproject.com` — DNS pointed at server?                     |
| 502 Bad Gateway                        | Container down: `docker compose ps`, then `logs -f <service>`         |
| 404 from Nginx                         | Site enabled? `ls /etc/nginx/sites-enabled/`                          |
| Port already in use                    | `ss -tulpn \| grep :PORT` — kill or pick a different host port        |
| SSL renewal failed                     | `certbot renew --dry-run`, check `/var/log/letsencrypt/`              |
| Frontend env var not applied           | Vite/Next inline at build — rebuild with `--no-cache`                 |
| `npm install` fails on Husky `prepare` | Add `--ignore-scripts` in the Dockerfile                              |
| Nginx config error                     | `nginx -t` then `tail -f /var/log/nginx/error.log`                    |

---

## 11. Per-project checklist (copy this for each new project)

- [ ] Pick subdomain plan + free host ports (`ss -tuln`)
- [ ] DNS A records added + propagated (`nslookup`)
- [ ] Each service has a `Dockerfile`
- [ ] `docker-compose.production.yml` with correct ports + build args
- [ ] `.env.production.example` committed; real `.env` only on server
- [ ] Initial upload via `tar | ssh`
- [ ] `.env` filled in on server
- [ ] `docker compose up -d --build` succeeds
- [ ] Nginx site files created + enabled
- [ ] `nginx -t && systemctl reload nginx`
- [ ] Certbot SSL issued for all subdomains
- [ ] Smoke-tested over HTTPS
- [ ] `deploy-updates.sh` adapted with new SERVER/PROJECT_DIR
