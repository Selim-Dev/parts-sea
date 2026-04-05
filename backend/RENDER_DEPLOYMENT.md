# 🚀 Render Deployment Guide

Complete step-by-step guide to deploy your NestJS backend to Render.

## Prerequisites

- ✅ GitHub account
- ✅ Render account (free tier available at https://render.com)
- ✅ MongoDB Atlas database (already configured)
- ✅ Your code pushed to GitHub

---

## Step 1: Prepare Your Repository

### 1.1 Ensure .env is in .gitignore
Your `.env` file should NOT be committed to GitHub. Verify it's in `.gitignore`:

```bash
# Check if .env is ignored
git check-ignore backend/.env
```

If it returns nothing, add it to `.gitignore`:
```
.env
```

### 1.2 Push to GitHub
Make sure all your code is pushed:

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

---

## Step 2: Create Render Web Service

### 2.1 Sign in to Render
1. Go to https://render.com
2. Sign in with GitHub
3. Click "New +" → "Web Service"

### 2.2 Connect Repository
1. Click "Connect a repository"
2. Find and select your repository
3. Click "Connect"

### 2.3 Configure Service

Fill in the following settings:

**Basic Settings:**
- **Name:** `spare-parts-backend` (or your preferred name)
- **Region:** Choose closest to your users (e.g., Oregon, Frankfurt)
- **Branch:** `main` (or your default branch)
- **Root Directory:** `backend`
- **Runtime:** `Node`

**Build & Deploy:**
- **Build Command:** 
  ```
  npm install && npm run build
  ```
- **Start Command:**
  ```
  npm run start:prod
  ```

**Instance Type:**
- Select **Free** (or paid plan if needed)

---

## Step 3: Configure Environment Variables

Click "Advanced" → "Add Environment Variable" and add these:

### Required Variables:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Sets Node environment |
| `PORT` | `10000` | Render uses port 10000 |
| `MONGODB_URI` | `mongodb+srv://alislimaly_db_user:JxJ.3mhmPx3WnLW@cluster0.tzqlsui.mongodb.net/?appName=Cluster0` | Your MongoDB connection string |
| `MONGODB_DB_NAME` | `spare-parts-system` | Your database name |
| `JWT_SECRET` | `your-super-secret-jwt-key-change-this-in-production` | Generate a strong secret |

### Generate Strong JWT Secret:

Run this in your terminal to generate a secure secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and use it as your `JWT_SECRET`.

---

## Step 4: Deploy

1. Click "Create Web Service"
2. Render will start building and deploying
3. Wait for the build to complete (usually 2-5 minutes)
4. You'll see "Live" status when ready

Your backend will be available at:
```
https://spare-parts-backend.onrender.com
```

---

## Step 5: Verify Deployment

### 5.1 Check Health
Visit your service URL:
```
https://your-service-name.onrender.com/api
```

You should see a response (might be 404, but server is running).

### 5.2 Test API Endpoints

Test the parts endpoint:
```bash
curl https://your-service-name.onrender.com/api/parts
```

Test login:
```bash
curl -X POST https://your-service-name.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## Step 6: Update Frontend Configuration

Update your frontend API URLs to point to Render:

### Dashboard (dashbaord/src/api/client.ts):
```typescript
const client = axios.create({
  baseURL: 'https://your-service-name.onrender.com/api',
});
```

### Landing Page (landing/src/lib/api.ts):
```typescript
const api = axios.create({
  baseURL: 'https://your-service-name.onrender.com/api',
});
```

### Update CORS in backend/src/main.ts:
Add your frontend URLs to the allowed origins:
```typescript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3002', 
  'http://localhost:5173',
  'http://localhost:5174',
  'https://your-landing-page.onrender.com',
  'https://your-dashboard.onrender.com',
];
```

---

## Step 7: Seed Database (Optional)

If you need to seed the database with default data:

### Option 1: Using Render Shell
1. Go to your service in Render dashboard
2. Click "Shell" tab
3. Run:
```bash
npm run seed-fresh
```

### Option 2: Using Local Script
From your local machine:
```bash
cd backend
MONGODB_URI="your-production-mongodb-uri" npm run seed-fresh
```

---

## Troubleshooting

### Build Fails

**Problem:** Build fails with "Cannot find module"
- **Solution:** Ensure all dependencies are in `package.json`, not just `devDependencies`

**Problem:** TypeScript errors during build
- **Solution:** Run `npm run build` locally first to catch errors

### Deployment Issues

**Problem:** Service shows "Deploy failed"
- **Solution:** Check the logs in Render dashboard
- Verify all environment variables are set correctly

**Problem:** 502 Bad Gateway
- **Solution:** Check if MongoDB connection string is correct
- Verify MongoDB Atlas allows connections from anywhere (0.0.0.0/0)

### MongoDB Connection Issues

**Problem:** "MongoServerError: Authentication failed"
- **Solution:** 
  1. Check MongoDB Atlas username/password
  2. Verify user has read/write permissions
  3. Check database name is correct

**Problem:** "MongooseServerSelectionError"
- **Solution:**
  1. Go to MongoDB Atlas → Network Access
  2. Add IP: `0.0.0.0/0` (allow from anywhere)
  3. Wait 2-3 minutes for changes to propagate

### CORS Issues

**Problem:** Frontend gets CORS errors
- **Solution:** 
  1. Add frontend URL to `allowedOrigins` in `main.ts`
  2. Commit and push changes
  3. Render will auto-redeploy

---

## Monitoring & Logs

### View Logs
1. Go to Render dashboard
2. Select your service
3. Click "Logs" tab
4. View real-time logs

### Monitor Performance
- Check "Metrics" tab for CPU/Memory usage
- Free tier has limited resources
- Consider upgrading if needed

---

## Auto-Deploy Setup

Render automatically deploys when you push to GitHub:

1. Make changes locally
2. Commit and push:
```bash
git add .
git commit -m "Update backend"
git push origin main
```
3. Render detects changes and redeploys automatically

### Disable Auto-Deploy (Optional)
1. Go to service settings
2. Scroll to "Auto-Deploy"
3. Toggle off if you want manual deploys

---

## Production Checklist

Before going live, ensure:

- [ ] Strong JWT_SECRET is set (not the default)
- [ ] MongoDB Atlas has proper IP whitelist
- [ ] Environment variables are all set correctly
- [ ] CORS includes all frontend URLs
- [ ] Database is seeded with initial data
- [ ] Admin password is changed from default
- [ ] SSL/HTTPS is enabled (automatic on Render)
- [ ] Logs are monitored for errors
- [ ] Backup strategy for MongoDB is in place

---

## Useful Commands

### View Service Info
```bash
# Get service URL
echo "https://your-service-name.onrender.com"
```

### Test Endpoints
```bash
# Health check
curl https://your-service-name.onrender.com/api

# Get parts
curl https://your-service-name.onrender.com/api/parts

# Login
curl -X POST https://your-service-name.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## Cost Optimization

### Free Tier Limitations
- Service spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- 750 hours/month free (enough for 1 service 24/7)

### Keep Service Alive (Optional)
Use a service like UptimeRobot to ping your API every 10 minutes:
```
https://your-service-name.onrender.com/api/parts
```

### Upgrade to Paid Plan
- $7/month for always-on service
- No spin-down delays
- Better performance

---

## Support

- **Render Docs:** https://render.com/docs
- **Render Community:** https://community.render.com
- **MongoDB Atlas Docs:** https://docs.atlas.mongodb.com

---

## Quick Reference

**Service URL Format:**
```
https://[service-name].onrender.com
```

**API Base URL:**
```
https://[service-name].onrender.com/api
```

**Default Credentials:**
- Admin: `admin` / `admin123`
- Shop: `shop1` / `shop123`

**Important Files:**
- `render.yaml` - Render configuration
- `.env` - Local environment variables (not committed)
- `src/main.ts` - CORS and port configuration
- `package.json` - Build scripts

---

## Next Steps

After backend is deployed:

1. ✅ Deploy frontend (landing page) to Vercel/Netlify
2. ✅ Deploy dashboard to Vercel/Netlify  
3. ✅ Update API URLs in both frontends
4. ✅ Test end-to-end functionality
5. ✅ Change default admin password
6. ✅ Set up monitoring/alerts
7. ✅ Configure custom domain (optional)

---

**🎉 Congratulations! Your backend is now live on Render!**
