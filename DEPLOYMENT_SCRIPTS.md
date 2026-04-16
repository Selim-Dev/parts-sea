# Deployment Scripts for bahr-alqeta3.store

Quick deployment and management scripts for Git Bash.

## 🚀 Quick Start

### Option 1: Interactive Menu (Recommended)
```bash
bash manage.sh
```

This opens an interactive menu with all options.

### Option 2: Direct Commands

```bash
# Full deployment (sync everything + rebuild)
bash deploy-updates.sh

# Fast deploy specific service
bash deploy-fast.sh backend
bash deploy-fast.sh dashboard
bash deploy-fast.sh landing
bash deploy-fast.sh all

# View logs
bash logs.sh all
bash logs.sh backend
bash logs.sh dashboard
bash logs.sh landing

# Check server status
bash server-status.sh
```

## 📋 Available Scripts

| Script | Description | Usage |
|--------|-------------|-------|
| `manage.sh` | Interactive menu for all operations | `bash manage.sh` |
| `deploy-updates.sh` | Full deployment (sync + rebuild all) | `bash deploy-updates.sh` |
| `deploy-fast.sh` | Fast deploy specific service | `bash deploy-fast.sh [service]` |
| `logs.sh` | View container logs | `bash logs.sh [service]` |
| `server-status.sh` | Check server health | `bash server-status.sh` |

## 🔧 What Gets Synced

The scripts sync:
- ✅ All source code (backend, dashboard, landing)
- ✅ Dockerfiles
- ✅ docker-compose files
- ✅ Configuration files

The scripts EXCLUDE:
- ❌ node_modules/
- ❌ .env files (keeps your server secrets safe)
- ❌ dist/, build/, .next/ (rebuilt on server)
- ❌ .git/ (no need to sync)
- ❌ logs and cache files

## 💡 Common Workflows

### After changing code:
```bash
# If you changed only one service:
bash deploy-fast.sh dashboard

# If you changed multiple services:
bash deploy-updates.sh
```

### Debugging issues:
```bash
# Check if services are running
bash server-status.sh

# View logs
bash logs.sh backend
```

### Quick restart:
```bash
bash manage.sh
# Then select option 9 (Restart Services)
```

## ⚡ Performance Tips

1. **Use `deploy-fast.sh`** when you only changed one service
2. **Use `deploy-updates.sh`** when you changed multiple services
3. **Use `manage.sh`** for interactive management

## 🔐 Security Notes

- `.env` files are NEVER synced to protect your secrets
- Always keep your `.env` file on the server separate
- The scripts use rsync with `--delete` to keep server in sync

## 🆘 Troubleshooting

### "Permission denied" error:
```bash
chmod +x *.sh
```

### Services not starting:
```bash
bash logs.sh all
# Check the error messages
```

### Need to update .env on server:
```bash
ssh root@178.18.246.104
cd ~/bahr-alqeta3
nano .env
# Make changes, then restart:
docker compose restart
```

## 📞 Quick Reference

**Server:** root@178.18.246.104  
**Project Path:** ~/bahr-alqeta3  
**Sites:**
- Landing: https://bahr-alqeta3.store
- Dashboard: https://admin.bahr-alqeta3.store
- API: https://api.bahr-alqeta3.store

**Credentials:**
- Admin: username=`admin`, password=`admin123`
- Shop: username=`shop1`, password=`shop123`
