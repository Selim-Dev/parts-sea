#!/bin/bash

# Port availability checker
# Run this on your server before deployment

echo "🔍 Checking port availability for bahr-alqeta3.store deployment..."
echo ""

PORTS=(8080 8081 8082 5432 6379)
PORT_NAMES=("Backend API" "Dashboard" "Landing Page" "PostgreSQL" "Redis")
ALL_CLEAR=true

for i in "${!PORTS[@]}"; do
    PORT=${PORTS[$i]}
    NAME=${PORT_NAMES[$i]}
    
    if netstat -tuln | grep -q ":$PORT "; then
        echo "❌ Port $PORT ($NAME) is IN USE"
        echo "   Process using it:"
        netstat -tulpn | grep ":$PORT " | head -1
        ALL_CLEAR=false
    else
        echo "✅ Port $PORT ($NAME) is available"
    fi
done

echo ""

if [ "$ALL_CLEAR" = true ]; then
    echo "✅ All ports are available! You can proceed with deployment."
    exit 0
else
    echo "⚠️  Some ports are in use. Options:"
    echo ""
    echo "1. Stop the conflicting services:"
    echo "   - Find process: netstat -tulpn | grep :<PORT>"
    echo "   - Stop it: kill -9 <PID>"
    echo "   - Or if it's PM2: pm2 stop <app-name>"
    echo ""
    echo "2. Change ports in docker-compose.production.yml"
    echo ""
    echo "3. Use different ports for this deployment"
    exit 1
fi
