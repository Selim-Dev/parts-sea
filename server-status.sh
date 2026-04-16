#!/bin/bash

# Check server status
# Usage: bash server-status.sh

SERVER="root@178.18.246.104"

echo "🔍 Checking server status..."
echo ""

ssh $SERVER << 'ENDSSH'
cd ~/bahr-alqeta3

echo "📊 Container Status:"
docker compose ps
echo ""

echo "💾 Disk Usage:"
df -h / | tail -1
echo ""

echo "🧠 Memory Usage:"
free -h | grep Mem
echo ""

echo "🌐 Service Health:"
echo -n "Backend:   "
curl -s http://localhost:8080/api/health > /dev/null && echo "✅ OK" || echo "❌ Down"
echo -n "Dashboard: "
curl -s http://localhost:8081 > /dev/null && echo "✅ OK" || echo "❌ Down"
echo -n "Landing:   "
curl -s http://localhost:8082 > /dev/null && echo "✅ OK" || echo "❌ Down"
ENDSSH
