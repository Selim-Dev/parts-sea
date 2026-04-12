# Port Management Guide

## Default Port Configuration

This deployment uses the following ports to avoid conflicts with common development ports (3000, 5173, etc.):

| Service    | Internal Port | External Port | Purpose                    |
|------------|---------------|---------------|----------------------------|
| Landing    | 3000          | 8082          | Customer-facing website    |
| Dashboard  | 80            | 8081          | Admin panel                |
| Backend    | 3000          | 8080          | API server                 |
| PostgreSQL | 5432          | 5432          | Database                   |
| Redis      | 6379          | 6379          | Cache                      |

## Checking Port Availability

Before deployment, run:

```bash
bash check-ports.sh
```

This will check if ports 8080, 8081, 8082, 5432, and 6379 are available.

## If Ports Are In Use

### Option 1: Stop Conflicting Services

**For PM2 processes:**
```bash
# List all PM2 processes
pm2 list

# Stop specific process
pm2 stop <app-name>

# Or stop all
pm2 stop all
```

**For regular processes:**
```bash
# Find process using port
netstat -tulpn | grep :8080

# Kill the process
kill -9 <PID>

# Or use fuser
fuser -k 8080/tcp
```

**For Docker containers:**
```bash
# List running containers
docker ps

# Stop specific container
docker stop <container-name>

# Stop all containers
docker stop $(docker ps -q)
```

### Option 2: Use Alternative Ports

If you can't stop the conflicting services, use the alternative configuration:

**Ports 9090-9092 (Alternative Set 1):**
```bash
# Use alternative docker-compose
docker-compose -f docker-compose.alternative-ports.yml up -d --build
```

Then update nginx configs:
```bash
# Edit the nginx configs to use 9090, 9091, 9092
nano /etc/nginx/sites-available/bahr-backend
nano /etc/nginx/sites-available/bahr-dashboard
nano /etc/nginx/sites-available/bahr-landing
```

Change `proxy_pass` lines:
- Backend: `http://localhost:9090`
- Dashboard: `http://localhost:9091`
- Landing: `http://localhost:9092`

**Custom Ports:**

Edit `docker-compose.production.yml` and change the port mappings:

```yaml
services:
  backend:
    ports:
      - "YOUR_PORT:3000"  # Change YOUR_PORT
```

### Option 3: Use Docker Network Only

If you want to avoid port conflicts entirely, don't expose ports to host:

```yaml
services:
  backend:
    # Remove ports section entirely
    # ports:
    #   - "8080:3000"
```

Then configure nginx to connect to Docker network:
```nginx
location / {
    proxy_pass http://bahr-backend:3000;  # Use container name
}
```

## Database Port Conflicts

If PostgreSQL port 5432 is already in use (you have existing postgres):

**Option A: Use existing PostgreSQL**
```bash
# Remove postgres service from docker-compose
# Update DATABASE_URL to point to existing postgres
DATABASE_URL=postgresql://user:pass@localhost:5432/spare_parts
```

**Option B: Use different port**
```yaml
postgres:
  ports:
    - "5433:5432"  # Use 5433 on host
```

Update connection string:
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/spare_parts
```

## Redis Port Conflicts

If Redis port 6379 is already in use:

**Option A: Use existing Redis**
```bash
# Remove redis service from docker-compose
# Update REDIS_URL if needed
REDIS_URL=redis://localhost:6379
```

**Option B: Use different port**
```yaml
redis:
  ports:
    - "6380:6379"  # Use 6380 on host
```

## Quick Port Reference

Common ports to avoid (likely in use):
- 3000, 3001, 3002 (Node.js defaults)
- 5173, 5174 (Vite defaults)
- 8000, 8001 (Python/Django)
- 4200 (Angular)
- 8888 (Jupyter)

Safe port ranges:
- 8080-8089 (Web servers)
- 9090-9099 (Alternative web)
- 10000+ (High ports, usually free)

## Troubleshooting

**Port still showing as in use after stopping service:**
```bash
# Wait a few seconds for port to be released
sleep 5

# Force kill anything on port
fuser -k 8080/tcp

# Check again
netstat -tuln | grep :8080
```

**Docker says port is in use but netstat shows nothing:**
```bash
# Stop all Docker containers
docker stop $(docker ps -q)

# Remove all containers
docker rm $(docker ps -aq)

# Try again
docker-compose up -d
```

**Can't connect to service even though port is open:**
```bash
# Check if service is listening on correct interface
netstat -tuln | grep :8080

# Should show 0.0.0.0:8080 or :::8080
# If it shows 127.0.0.1:8080, it's only listening locally

# Check Docker logs
docker logs bahr-backend
```

## Recommended Setup

For a server with existing services, I recommend:

1. Use ports 8080-8082 for your apps (as configured)
2. Keep existing PostgreSQL/Redis if they exist
3. Use Docker networks for internal communication
4. Only expose necessary ports to host
5. Use nginx as reverse proxy (ports 80/443 only)

This way:
- No conflicts with PM2 apps on 3000, 5173, etc.
- Existing databases can be reused
- Clean separation between services
- Easy to manage with nginx
