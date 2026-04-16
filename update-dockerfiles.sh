#!/bin/bash

# Quick script to update just the Dockerfiles on server

SERVER="root@178.18.246.104"

echo "📤 Uploading fixed Dockerfiles..."

scp backend/Dockerfile $SERVER:~/bahr-alqeta3/backend/
scp dashbaord/Dockerfile $SERVER:~/bahr-alqeta3/dashbaord/
scp dashbaord/nginx.conf $SERVER:~/bahr-alqeta3/dashbaord/
scp landing/Dockerfile $SERVER:~/bahr-alqeta3/landing/

echo "✅ Dockerfiles updated!"
echo ""
echo "Now on server, run:"
echo "  cd ~/bahr-alqeta3"
echo "  docker compose -f docker-compose.production.yml up -d --build"
