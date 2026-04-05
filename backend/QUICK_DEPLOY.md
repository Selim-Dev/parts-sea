# ⚡ Quick Deploy to Render

**5-minute deployment guide** - For detailed instructions, see [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)

## Step 1: Verify Configuration (30 seconds)

```bash
cd backend
npm run verify-deploy
```

Fix any errors before proceeding.

## Step 2: Push to GitHub (1 minute)

```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

## Step 3: Create Render Service (2 minutes)

1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name:** `spare-parts-backend`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start:prod`
   - **Plan:** Free

## Step 4: Set Environment Variables (1 minute)

Click "Advanced" and add:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://alislimaly_db_user:JxJ.3mhmPx3WnLW@cluster0.tzqlsui.mongodb.net/?appName=Cluster0
MONGODB_DB_NAME=spare-parts-system
JWT_SECRET=<generate-with-command-below>
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Step 5: Deploy (1 minute)

1. Click **"Create Web Service"**
2. Wait for build to complete
3. Service will be live at: `https://your-service-name.onrender.com`

## Step 6: Verify (30 seconds)

Test your deployment:

```bash
# Replace with your actual service URL
curl https://your-service-name.onrender.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-04-05T...",
  "service": "spare-parts-backend",
  "version": "1.0.0"
}
```

## Step 7: Seed Database (Optional)

If you need default data:

1. Go to Render dashboard → Your service → **Shell**
2. Run: `npm run seed-fresh`

Or from local:
```bash
MONGODB_URI="your-production-uri" npm run seed-fresh
```

---

## ✅ Done!

Your backend is now live. Next steps:

1. Update frontend API URLs to point to your Render URL
2. Add frontend URLs to CORS in `src/main.ts`
3. Test login and API endpoints
4. Change default admin password

---

## 🆘 Need Help?

- **Detailed Guide:** [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)
- **Checklist:** [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- **Render Docs:** https://render.com/docs
- **Troubleshooting:** Check Render logs in dashboard

---

## 📝 Your Service Info

After deployment, save this info:

- **Service URL:** `https://_____________________.onrender.com`
- **API Base:** `https://_____________________.onrender.com/api`
- **Health Check:** `https://_____________________.onrender.com/api/health`
- **Admin Login:** `admin` / `admin123` (change this!)
