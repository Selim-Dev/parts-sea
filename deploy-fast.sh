#!/bin/bash

# Fast deployment - only rebuild changed services
# Usage: bash deploy-fast.sh [backend|dashboard|landing|all]
# Uses tar + ssh (no rsync needed — works on Windows Git Bash)

set -e

SERVER="root@178.18.246.104"
PROJECT_DIR="~/bahr-alqeta3"
SERVICE="${1:-all}"

echo "🚀 Fast deploy: $SERVICE"
echo ""

TAR_EXCLUDES="\
  --exclude='*/node_modules' \
  --exclude='*/.git' \
  --exclude='*/dist' \
  --exclude='*/build' \
  --exclude='*/.next' \
  --exclude='*/.env' \
  --exclude='*/.env.local' \
  --exclude='*/.env.production' \
  --exclude='*/.env.development' \
  --exclude='*.log' \
  --exclude='*/.DS_Store'"

case $SERVICE in
  backend)
    echo "📦 Syncing backend..."
    tar \
      --exclude='*/node_modules' --exclude='*/.git' --exclude='*/dist' \
      --exclude='*/build' --exclude='*/.env' --exclude='*.log' \
      -czf - backend \
      | ssh $SERVER "cd $PROJECT_DIR && tar -xzf -"
    ;;
  dashboard)
    echo "📦 Syncing dashboard..."
    tar \
      --exclude='*/node_modules' --exclude='*/.git' --exclude='*/dist' \
      --exclude='*/build' --exclude='*/.env' --exclude='*.log' \
      -czf - dashbaord \
      | ssh $SERVER "cd $PROJECT_DIR && tar -xzf -"
    ;;
  landing)
    echo "📦 Syncing landing..."
    tar \
      --exclude='*/node_modules' --exclude='*/.git' --exclude='*/dist' \
      --exclude='*/build' --exclude='*/.next' --exclude='*/.env' --exclude='*.log' \
      -czf - landing \
      | ssh $SERVER "cd $PROJECT_DIR && tar -xzf -"
    ;;
  all)
    echo "📦 Syncing all services..."
    tar \
      --exclude='*/node_modules' --exclude='*/.git' --exclude='*/dist' \
      --exclude='*/build' --exclude='*/.next' --exclude='*/.env' \
      --exclude='*/.env.local' --exclude='*/.env.production' \
      --exclude='*/.env.development' --exclude='*.log' --exclude='*/.DS_Store' \
      -czf - backend dashbaord landing docker-compose.production.yml \
      | ssh $SERVER "cd $PROJECT_DIR && tar -xzf -"
    ;;
  *)
    echo "❌ Invalid service. Use: backend, dashboard, landing, or all"
    exit 1
    ;;
esac

echo ""
echo "🔨 Rebuilding $SERVICE on server..."

ssh $SERVER << ENDSSH
cd ~/bahr-alqeta3
if [ "$SERVICE" = "all" ]; then
  docker compose -f docker-compose.production.yml build --no-cache
  docker compose -f docker-compose.production.yml up -d
else
  docker compose -f docker-compose.production.yml build --no-cache $SERVICE
  docker compose -f docker-compose.production.yml up -d
fi
echo ""
echo "✅ Done! Status:"
docker compose -f docker-compose.production.yml ps
ENDSSH

echo ""
echo "🎉 Deployment complete!"
