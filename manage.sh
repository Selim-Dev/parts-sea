#!/bin/bash

# Master management script for bahr-alqeta3.store
# Run from Git Bash: bash manage.sh

SERVER="root@178.18.246.104"

show_menu() {
  clear
  echo "╔════════════════════════════════════════════════════════╗"
  echo "║     bahr-alqeta3.store - Management Console           ║"
  echo "╚════════════════════════════════════════════════════════╝"
  echo ""
  echo "  1) 🚀 Deploy All (Full sync + rebuild)"
  echo "  2) ⚡ Fast Deploy Backend"
  echo "  3) ⚡ Fast Deploy Dashboard"
  echo "  4) ⚡ Fast Deploy Landing"
  echo "  5) 📋 View Logs (All)"
  echo "  6) 📋 View Backend Logs"
  echo "  7) 📋 View Dashboard Logs"
  echo "  8) 📋 View Landing Logs"
  echo "  9) 🔄 Restart Services"
  echo " 10) 📊 Server Status"
  echo " 11) 🔌 SSH to Server"
  echo " 12) 🛑 Stop All Services"
  echo "  0) ❌ Exit"
  echo ""
  echo -n "Select option: "
}

while true; do
  show_menu
  read -r choice
  
  case $choice in
    1)
      echo ""
      bash deploy-updates.sh
      echo ""
      read -p "Press Enter to continue..."
      ;;
    2)
      echo ""
      bash deploy-fast.sh backend
      echo ""
      read -p "Press Enter to continue..."
      ;;
    3)
      echo ""
      bash deploy-fast.sh dashboard
      echo ""
      read -p "Press Enter to continue..."
      ;;
    4)
      echo ""
      bash deploy-fast.sh landing
      echo ""
      read -p "Press Enter to continue..."
      ;;
    5)
      echo ""
      bash logs.sh all
      ;;
    6)
      echo ""
      bash logs.sh backend
      ;;
    7)
      echo ""
      bash logs.sh dashboard
      ;;
    8)
      echo ""
      bash logs.sh landing
      ;;
    9)
      echo ""
      echo "🔄 Restarting services..."
      ssh $SERVER "cd ~/bahr-alqeta3 && docker compose restart"
      echo "✅ Services restarted"
      read -p "Press Enter to continue..."
      ;;
    10)
      echo ""
      bash server-status.sh
      echo ""
      read -p "Press Enter to continue..."
      ;;
    11)
      echo ""
      echo "🔌 Connecting to server..."
      ssh $SERVER
      ;;
    12)
      echo ""
      echo "🛑 Stopping all services..."
      ssh $SERVER "cd ~/bahr-alqeta3 && docker compose down"
      echo "✅ Services stopped"
      read -p "Press Enter to continue..."
      ;;
    0)
      echo ""
      echo "👋 Goodbye!"
      exit 0
      ;;
    *)
      echo ""
      echo "❌ Invalid option"
      sleep 1
      ;;
  esac
done
