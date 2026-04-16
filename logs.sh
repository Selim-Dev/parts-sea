#!/bin/bash

# View logs from server
# Usage: bash logs.sh [backend|dashboard|landing|all]

SERVER="root@178.18.246.104"
SERVICE="${1:-all}"

echo "📋 Viewing logs for: $SERVICE"
echo ""

if [ "$SERVICE" = "all" ]; then
  ssh -t $SERVER "cd ~/bahr-alqeta3 && docker compose logs -f"
else
  ssh -t $SERVER "cd ~/bahr-alqeta3 && docker compose logs -f $SERVICE"
fi
