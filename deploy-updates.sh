#!/bin/bash

# Quick deployment script for bahr-alqeta3.store
# Run from Git Bash: bash deploy-updates.sh
# Uses tar + ssh (no rsync needed — works on Windows Git Bash)

set -e

SERVER="root@178.18.246.104"
PROJECT_DIR="~/bahr-alqeta3"

echo "🚀 Deploying updates to bahr-alqeta3.store..."
echo ""

echo "📦 Syncing files to server (excluding node_modules, .env, etc.)..."
tar \
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
  --exclude='*/.DS_Store' \
  --exclude='*/.vscode' \
  --exclude='*/.idea' \
  --exclude='*/coverage' \
  --exclude='*/.cache' \
  -czf - \
  backend dashbaord landing docker-compose.production.yml \
  | ssh $SERVER "cd $PROJECT_DIR && tar -xzf -"

echo ""
echo "✅ Files synced successfully!"
echo ""
echo "🔨 Rebuilding containers on server..."
echo ""

# SSH and rebuild
ssh $SERVER << 'ENDSSH'
cd ~/bahr-alqeta3

echo "🔄 Rebuilding and restarting containers (no cache)..."
docker compose -f docker-compose.production.yml build --no-cache
docker compose -f docker-compose.production.yml up -d

echo ""
echo "📊 Container status:"
docker compose -f docker-compose.production.yml ps

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your sites:"
echo "   Landing:   https://bahr-alqeta3.store"
echo "   Dashboard: https://admin.bahr-alqeta3.store"
echo "   API:       https://api.bahr-alqeta3.store/health"
echo ""
ENDSSH

echo ""
echo "🎉 All done! Check your sites:"
echo "   Landing:   https://bahr-alqeta3.store"
echo "   Dashboard: https://admin.bahr-alqeta3.store"
echo ""
