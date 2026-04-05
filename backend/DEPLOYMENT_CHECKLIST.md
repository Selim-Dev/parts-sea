# 📋 Render Deployment Checklist

Quick checklist to ensure smooth deployment.

## Pre-Deployment

- [ ] Code is committed and pushed to GitHub
- [ ] `.env` file is in `.gitignore` (not committed)
- [ ] MongoDB Atlas is set up and accessible
- [ ] MongoDB Atlas Network Access allows `0.0.0.0/0`
- [ ] All tests pass locally: `npm test`
- [ ] Build succeeds locally: `npm run build`
- [ ] App runs in production mode locally: `npm run start:prod`

## Render Setup

- [ ] Render account created
- [ ] GitHub repository connected to Render
- [ ] Web Service created with correct settings:
  - [ ] Root Directory: `backend`
  - [ ] Build Command: `npm install && npm run build`
  - [ ] Start Command: `npm run start:prod`
  - [ ] Instance Type: Free (or paid)

## Environment Variables

Set these in Render dashboard:

- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `10000`
- [ ] `MONGODB_URI` = Your MongoDB connection string
- [ ] `MONGODB_DB_NAME` = `spare-parts-system`
- [ ] `JWT_SECRET` = Strong random secret (64+ characters)

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Post-Deployment

- [ ] Service shows "Live" status in Render
- [ ] Health check works: `https://your-service.onrender.com/api/health`
- [ ] API endpoints respond: `https://your-service.onrender.com/api/parts`
- [ ] Login works with test credentials
- [ ] Database is seeded (if needed): `npm run seed-fresh`
- [ ] Logs show no errors

## Frontend Updates

- [ ] Update dashboard API URL in `dashbaord/src/api/client.ts`
- [ ] Update landing API URL in `landing/src/lib/api.ts`
- [ ] Add frontend URLs to CORS in `backend/src/main.ts`
- [ ] Commit and push CORS changes
- [ ] Wait for auto-redeploy

## Security

- [ ] Change default admin password from `admin123`
- [ ] JWT_SECRET is strong and unique
- [ ] MongoDB credentials are secure
- [ ] No sensitive data in logs
- [ ] CORS only allows your frontend domains

## Monitoring

- [ ] Check Render logs for errors
- [ ] Monitor MongoDB Atlas metrics
- [ ] Set up UptimeRobot (optional, to prevent spin-down)
- [ ] Test all critical endpoints

## Final Verification

Test these endpoints:

```bash
# Health check
curl https://your-service.onrender.com/api/health

# Get parts
curl https://your-service.onrender.com/api/parts

# Login
curl -X POST https://your-service.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Get analytics (requires auth token)
curl https://your-service.onrender.com/api/analytics/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

If something doesn't work:

1. Check Render logs
2. Verify environment variables
3. Check MongoDB Atlas Network Access
4. Test MongoDB connection string locally
5. Review CORS configuration
6. Check build logs for errors

## Success Criteria

✅ Service is live and accessible
✅ Health endpoint returns 200 OK
✅ Can login and get JWT token
✅ Can fetch parts list
✅ Can create orders
✅ Frontend can communicate with backend
✅ No errors in logs

---

**🎉 Ready to deploy? Follow the detailed guide in RENDER_DEPLOYMENT.md**
