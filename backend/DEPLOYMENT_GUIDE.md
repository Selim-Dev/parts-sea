# Deployment Guide - Spare Parts System Backend

This guide provides step-by-step instructions for deploying the backend to production.

## Pre-Deployment Checklist

### 1. Environment Setup

- [ ] Production MongoDB Atlas cluster created
- [ ] Database user created with readWrite permissions
- [ ] IP whitelist configured in MongoDB Atlas
- [ ] Strong JWT_SECRET generated (minimum 32 characters)
- [ ] .env file configured with production values
- [ ] NODE_ENV set to "production"

### 2. Database Preparation

- [ ] SQLite backup created (if migrating)
- [ ] MongoDB database is empty (for first-time migration)
- [ ] Migration script tested in staging environment
- [ ] Database indexes planned

### 3. Security Review

- [ ] All sensitive data in environment variables (not in code)
- [ ] CORS configured for production frontend domains
- [ ] Rate limiting configured
- [ ] File upload limits verified
- [ ] MongoDB connection string secured

### 4. Code Preparation

- [ ] All tests passing
- [ ] Code linted and formatted
- [ ] Dependencies updated to stable versions
- [ ] Build process verified
- [ ] Production build tested locally

## Phase 8.3: Deployment Preparation Tasks

### Task 8.3.1: Run Migration Script on Production Data

**Prerequisites**:
- SQLite database file available at `./data/spare-parts.db`
- MongoDB connection string configured in `.env`
- Production MongoDB database is empty

**Steps**:

1. **Backup SQLite Database**
   ```bash
   # Create backup directory
   mkdir -p backups
   
   # Copy SQLite database with timestamp
   cp ./data/spare-parts.db ./backups/spare-parts-$(date +%Y%m%d-%H%M%S).db
   
   # Verify backup
   ls -lh ./backups/
   ```

2. **Configure Production Environment**
   ```bash
   # Edit .env file
   nano .env
   
   # Ensure these variables are set:
   # MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/?appName=App
   # MONGODB_DB_NAME=spare-parts-system
   ```

3. **Build the Application**
   ```bash
   npm run build
   ```

4. **Run Migration Script**
   ```bash
   npm run migrate
   ```

5. **Review Migration Output**
   - Check console output for migration summary
   - Note the counts: users, parts, orders, order items
   - Review any errors reported
   - Verify exit code (0 = success, 1 = errors)

**Expected Output**:
```
🚀 Starting migration from SQLite to MongoDB...

📂 Connecting to SQLite database...
✅ SQLite connection established

🍃 Connecting to MongoDB...
✅ MongoDB connection established

👥 Migrating users...
  ✓ Migrated user: admin
  ✓ Migrated user: shop1
✅ Users migrated: 2/2

🔧 Migrating parts (excluding imageUrl)...
  ✓ Migrated part: PART-001 - فلتر زيت
  ✓ Migrated part: PART-002 - بطارية
✅ Parts migrated: 150/150

📦 Migrating orders with order items...
  ✓ Migrated order: ORD-001 (3 items)
  ✓ Migrated order: ORD-002 (5 items)
✅ Orders migrated: 50/50
✅ Order items migrated: 200

============================================================
📊 MIGRATION SUMMARY
============================================================
Users migrated:       2
Parts migrated:       150
Orders migrated:      50
Order items migrated: 200
Errors encountered:   0
============================================================

✅ Migration completed successfully! Total records: 402
```

**Troubleshooting**:
- If migration fails, check MongoDB connection string
- Verify SQLite database file exists and is readable
- Ensure MongoDB database is empty (drop collections if needed)
- Check logs for specific error messages

---

### Task 8.3.2: Verify All Data Migrated Correctly

**Steps**:

1. **Run Verification Script**
   ```bash
   npm run verify-migration
   ```

2. **Manual Verification Queries**

   Connect to MongoDB using MongoDB Compass or mongosh:

   ```javascript
   // Connect to database
   use spare-parts-system
   
   // Count documents
   db.users.countDocuments()
   db.parts.countDocuments()
   db.orders.countDocuments()
   
   // Sample users
   db.users.find().limit(5)
   
   // Sample parts (verify imageUrl is not present)
   db.parts.find().limit(5)
   
   // Sample orders with items
   db.orders.find().limit(5)
   
   // Verify no imageUrl field exists
   db.parts.find({ imageUrl: { $exists: true } }).count()
   // Should return 0
   ```

3. **Data Integrity Checks**

   ```javascript
   // Check for required fields in parts
   db.parts.find({
     $or: [
       { partNumber: { $exists: false } },
       { name: { $exists: false } },
       { price: { $exists: false } },
       { stock: { $exists: false } }
     ]
   }).count()
   // Should return 0
   
   // Check for required fields in orders
   db.orders.find({
     $or: [
       { orderNumber: { $exists: false } },
       { userId: { $exists: false } },
       { status: { $exists: false } },
       { items: { $exists: false } }
     ]
   }).count()
   // Should return 0
   
   // Check for required fields in users
   db.users.find({
     $or: [
       { username: { $exists: false } },
       { passwordHash: { $exists: false } },
       { role: { $exists: false } }
     ]
   }).count()
   // Should return 0
   ```

4. **Compare Counts with SQLite**

   ```bash
   # Count records in SQLite
   sqlite3 ./data/spare-parts.db "SELECT COUNT(*) FROM user;"
   sqlite3 ./data/spare-parts.db "SELECT COUNT(*) FROM part;"
   sqlite3 ./data/spare-parts.db "SELECT COUNT(*) FROM 'order';"
   sqlite3 ./data/spare-parts.db "SELECT COUNT(*) FROM order_item;"
   ```

   Compare these counts with MongoDB counts from step 2.

**Verification Checklist**:
- [ ] User count matches SQLite
- [ ] Part count matches SQLite
- [ ] Order count matches SQLite
- [ ] Order items count matches SQLite
- [ ] No parts have imageUrl field
- [ ] All required fields are present
- [ ] Sample data looks correct

---

### Task 8.3.3: Test Production MongoDB Connection

**Steps**:

1. **Test Connection from Application**
   ```bash
   # Start application in production mode
   NODE_ENV=production npm run start:prod
   ```

2. **Check Startup Logs**
   Look for successful MongoDB connection message:
   ```
   [Nest] INFO [MongooseModule] Mongoose connected to MongoDB
   ```

3. **Test API Endpoints**

   ```bash
   # Health check (if implemented)
   curl http://localhost:3000/
   
   # Test authentication
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"your-password"}'
   
   # Test parts endpoint (with token)
   curl http://localhost:3000/parts \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

4. **Monitor Connection Pool**

   In MongoDB Atlas:
   - Go to Metrics tab
   - Check "Connections" graph
   - Verify connections are established
   - Monitor for connection spikes or errors

**Connection Checklist**:
- [ ] Application starts without errors
- [ ] MongoDB connection established
- [ ] API endpoints respond correctly
- [ ] No connection timeout errors
- [ ] Connection pool is stable

---

### Task 8.3.4: Create Database Backup Before Deployment

**Steps**:

1. **MongoDB Atlas Backup (Recommended)**

   In MongoDB Atlas Dashboard:
   - Navigate to your cluster
   - Click "Backup" tab
   - Click "Take Snapshot Now"
   - Add description: "Pre-deployment backup - [DATE]"
   - Wait for snapshot to complete

2. **Manual Backup Using mongodump**

   ```bash
   # Install MongoDB Database Tools if not installed
   # https://www.mongodb.com/try/download/database-tools
   
   # Create backup directory
   mkdir -p backups/mongodb
   
   # Run mongodump
   mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/spare-parts-system" \
     --out=./backups/mongodb/backup-$(date +%Y%m%d-%H%M%S)
   
   # Verify backup
   ls -lh ./backups/mongodb/
   ```

3. **Backup Verification**

   ```bash
   # Check backup size
   du -sh ./backups/mongodb/backup-*
   
   # List collections in backup
   ls ./backups/mongodb/backup-*/spare-parts-system/
   ```

4. **Document Backup Location**

   Create a backup log:
   ```bash
   echo "Backup created: $(date)" >> backups/backup-log.txt
   echo "Location: ./backups/mongodb/backup-$(date +%Y%m%d)" >> backups/backup-log.txt
   echo "Collections: users, parts, orders" >> backups/backup-log.txt
   ```

**Backup Checklist**:
- [ ] MongoDB Atlas snapshot created
- [ ] Manual backup created (optional)
- [ ] Backup verified and accessible
- [ ] Backup location documented
- [ ] Backup size is reasonable

**Restore Instructions** (if needed):
```bash
# Restore from mongodump backup
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/spare-parts-system" \
  --drop \
  ./backups/mongodb/backup-YYYYMMDD-HHMMSS/spare-parts-system
```

---

### Task 8.3.5: Deploy Backend with MongoDB

**Deployment Options**:

#### Option A: Traditional Server Deployment

1. **Prepare Server**
   ```bash
   # SSH into production server
   ssh user@your-server.com
   
   # Install Node.js 20+
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Verify installation
   node --version
   npm --version
   ```

2. **Deploy Application**
   ```bash
   # Clone or copy application
   git clone <your-repo-url> /var/www/spare-parts-backend
   cd /var/www/spare-parts-backend
   
   # Install dependencies
   npm ci --only=production
   
   # Create .env file
   nano .env
   # Add production environment variables
   
   # Build application
   npm run build
   ```

3. **Setup Process Manager (PM2)**
   ```bash
   # Install PM2 globally
   sudo npm install -g pm2
   
   # Start application
   pm2 start npm --name "spare-parts-api" -- run start:prod
   
   # Save PM2 configuration
   pm2 save
   
   # Setup PM2 to start on boot
   pm2 startup
   ```

4. **Configure Nginx Reverse Proxy**
   ```nginx
   # /etc/nginx/sites-available/spare-parts-api
   server {
       listen 80;
       server_name api.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
   }
   ```

   ```bash
   # Enable site
   sudo ln -s /etc/nginx/sites-available/spare-parts-api /etc/nginx/sites-enabled/
   
   # Test configuration
   sudo nginx -t
   
   # Reload Nginx
   sudo systemctl reload nginx
   ```

5. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.yourdomain.com
   ```

#### Option B: Docker Deployment

1. **Build Docker Image**
   ```bash
   docker build -t spare-parts-backend:latest .
   ```

2. **Run Container**
   ```bash
   docker run -d \
     --name spare-parts-api \
     -p 3000:3000 \
     --env-file .env \
     --restart unless-stopped \
     spare-parts-backend:latest
   ```

3. **Verify Container**
   ```bash
   docker ps
   docker logs spare-parts-api
   ```

#### Option C: Cloud Platform Deployment

**Heroku**:
```bash
heroku create spare-parts-api
heroku config:set MONGODB_URI="your-connection-string"
heroku config:set JWT_SECRET="your-secret"
git push heroku main
```

**AWS Elastic Beanstalk**:
```bash
eb init -p node.js spare-parts-api
eb create production
eb setenv MONGODB_URI="your-connection-string" JWT_SECRET="your-secret"
eb deploy
```

**Deployment Checklist**:
- [ ] Application deployed to server
- [ ] Environment variables configured
- [ ] Application starts successfully
- [ ] Process manager configured (PM2 or equivalent)
- [ ] Reverse proxy configured (Nginx)
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Application accessible via domain

---

### Task 8.3.6: Deploy Updated Dashboard

**Prerequisites**:
- Backend API deployed and accessible
- Dashboard repository ready

**Steps**:

1. **Update API Endpoint**
   ```bash
   cd dashbaord
   
   # Update .env or config file
   echo "VITE_API_URL=https://api.yourdomain.com" > .env.production
   ```

2. **Build Dashboard**
   ```bash
   npm install
   npm run build
   ```

3. **Deploy to Static Hosting**

   **Option A: Nginx**
   ```bash
   # Copy build files to web server
   sudo cp -r dist/* /var/www/dashboard/
   
   # Nginx configuration
   # /etc/nginx/sites-available/dashboard
   server {
       listen 80;
       server_name dashboard.yourdomain.com;
       root /var/www/dashboard;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

   **Option B: Vercel**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

   **Option C: Netlify**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=dist
   ```

4. **Verify Deployment**
   - Open dashboard URL in browser
   - Test login functionality
   - Verify data loads from API
   - Test Excel import feature

**Dashboard Deployment Checklist**:
- [ ] API endpoint configured correctly
- [ ] Build completed successfully
- [ ] Files deployed to hosting
- [ ] Dashboard accessible via URL
- [ ] Login works
- [ ] Data loads from backend
- [ ] All features functional

---

### Task 8.3.7: Deploy Updated Shop Portal

**Steps**:

1. **Update API Endpoint**
   ```bash
   cd landing
   
   # Update .env.local or .env.production
   echo "NEXT_PUBLIC_API_URL=https://api.yourdomain.com" > .env.production
   ```

2. **Build Shop Portal**
   ```bash
   npm install
   npm run build
   ```

3. **Deploy to Hosting**

   **Option A: Vercel (Recommended for Next.js)**
   ```bash
   vercel --prod
   ```

   **Option B: Traditional Server**
   ```bash
   # Copy to server
   scp -r .next package.json package-lock.json user@server:/var/www/shop-portal/
   
   # On server
   cd /var/www/shop-portal
   npm ci --only=production
   
   # Start with PM2
   pm2 start npm --name "shop-portal" -- start
   ```

4. **Verify Deployment**
   - Open shop portal URL
   - Test product catalog
   - Test search and filters
   - Test cart functionality
   - Test order placement

**Shop Portal Deployment Checklist**:
- [ ] API endpoint configured
- [ ] Build completed
- [ ] Deployed to hosting
- [ ] Portal accessible
- [ ] Catalog loads correctly
- [ ] Search works
- [ ] Cart functionality works
- [ ] Orders can be placed

---

### Task 8.3.8: Verify All Features Work in Production

**Comprehensive Testing Checklist**:

#### Authentication
- [ ] Admin can log in
- [ ] Shop user can log in
- [ ] Invalid credentials are rejected
- [ ] JWT tokens are issued correctly
- [ ] Protected routes require authentication

#### Parts Management (Admin)
- [ ] View parts list
- [ ] Search parts
- [ ] Filter by category/brand
- [ ] Create new part
- [ ] Update existing part
- [ ] Delete part (if implemented)

#### Excel Import (Admin)
- [ ] Download template button works
- [ ] Template file downloads correctly
- [ ] Upload Excel file
- [ ] Valid data imports successfully
- [ ] Invalid data shows errors
- [ ] Import summary displays correctly
- [ ] Duplicate parts are updated

#### Analytics Dashboard (Admin)
- [ ] Total orders displays correctly
- [ ] Pending orders count is accurate
- [ ] Total revenue calculates correctly
- [ ] Total parts count is correct
- [ ] Status breakdown shows all statuses
- [ ] Top selling parts displays
- [ ] Category breakdown works
- [ ] Low stock alerts show

#### Shop Portal
- [ ] Product catalog displays
- [ ] Product cards show correct info
- [ ] Search functionality works
- [ ] Category filters work
- [ ] Brand filters work
- [ ] Add to cart works
- [ ] Cart updates correctly
- [ ] Checkout process works
- [ ] Order confirmation displays

#### Orders Management
- [ ] View orders list
- [ ] Filter orders by status
- [ ] View order details
- [ ] Update order status
- [ ] Print order (if implemented)

#### Performance
- [ ] Dashboard loads in < 2 seconds
- [ ] Catalog loads in < 2 seconds
- [ ] Search responds in < 500ms
- [ ] Excel import (1000 rows) < 10 seconds
- [ ] No memory leaks
- [ ] No connection timeouts

#### Security
- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] File upload limits enforced
- [ ] SQL/NoSQL injection prevented
- [ ] XSS protection enabled
- [ ] Rate limiting works

---

## Phase 8.4: Post-Deployment Monitoring

### Task 8.4.1: Monitor MongoDB Performance

**Monitoring Tools**:

1. **MongoDB Atlas Metrics**
   - Navigate to Atlas Dashboard > Metrics
   - Monitor these metrics:
     - Connections (should be stable)
     - Operations per second
     - Query execution time
     - Network traffic
     - Disk usage

2. **Application Logs**
   ```bash
   # PM2 logs
   pm2 logs spare-parts-api
   
   # Docker logs
   docker logs -f spare-parts-api
   
   # System logs
   tail -f /var/log/nginx/access.log
   tail -f /var/log/nginx/error.log
   ```

3. **Performance Queries**
   ```javascript
   // Connect to MongoDB
   use spare-parts-system
   
   // Check slow queries
   db.system.profile.find().sort({ millis: -1 }).limit(10)
   
   // Check index usage
   db.parts.aggregate([{ $indexStats: {} }])
   db.orders.aggregate([{ $indexStats: {} }])
   ```

**Performance Checklist**:
- [ ] Connection count is stable (< 100)
- [ ] Query response time < 100ms average
- [ ] No slow queries (> 1 second)
- [ ] Indexes are being used
- [ ] No connection pool exhaustion
- [ ] Disk usage is reasonable

**Alert Thresholds**:
- Connections > 80: Warning
- Connections > 100: Critical
- Query time > 1s: Warning
- Query time > 5s: Critical
- Disk usage > 80%: Warning

---

### Task 8.4.2: Monitor Error Logs

**Error Monitoring Setup**:

1. **Application Error Logging**
   ```bash
   # Check PM2 error logs
   pm2 logs spare-parts-api --err
   
   # Check application logs
   tail -f /var/log/spare-parts-api/error.log
   ```

2. **Common Errors to Monitor**:
   - MongoDB connection errors
   - Authentication failures
   - File upload errors
   - Validation errors
   - Unhandled exceptions

3. **Error Tracking Service** (Optional)
   - Setup Sentry, LogRocket, or similar
   - Configure error alerts
   - Set up error grouping

**Error Monitoring Checklist**:
- [ ] Error logs are accessible
- [ ] Critical errors trigger alerts
- [ ] Error rates are tracked
- [ ] Stack traces are captured
- [ ] Error patterns identified

---

### Task 8.4.3: Collect User Feedback on Excel Import

**Feedback Collection Methods**:

1. **Direct User Interviews**
   - Schedule calls with admin users
   - Ask about Excel import experience
   - Document pain points and suggestions

2. **Feedback Questions**:
   - Is the template easy to understand?
   - Are error messages clear?
   - Is the import process fast enough?
   - Are there any missing features?
   - What improvements would you suggest?

3. **Usage Analytics**
   - Track Excel import frequency
   - Monitor success/failure rates
   - Analyze common validation errors
   - Measure import file sizes

**Feedback Checklist**:
- [ ] Feedback form created
- [ ] User interviews scheduled
- [ ] Usage metrics tracked
- [ ] Common issues documented
- [ ] Improvement suggestions collected

---

### Task 8.4.4: Collect User Feedback on UI Changes

**Feedback Areas**:

1. **Shop Portal UI**
   - Card-based product display
   - Search functionality
   - Navigation improvements
   - Filter usability
   - Mobile responsiveness

2. **Admin Dashboard**
   - Analytics display
   - Excel import interface
   - Parts management
   - Order management

3. **Feedback Collection**:
   - In-app feedback button
   - User surveys
   - Usage heatmaps (Hotjar, etc.)
   - A/B testing results

**UI Feedback Checklist**:
- [ ] User satisfaction survey sent
- [ ] Usability issues documented
- [ ] Feature requests collected
- [ ] UI improvements prioritized

---

### Task 8.4.5: Address Any Issues or Bugs

**Issue Tracking Process**:

1. **Create Issue Tracker**
   - Use GitHub Issues, Jira, or similar
   - Categorize issues: Bug, Enhancement, Question
   - Set priority levels: Critical, High, Medium, Low

2. **Bug Triage**
   - Review reported issues daily
   - Reproduce bugs in staging
   - Assign priority and owner
   - Set target resolution date

3. **Common Post-Deployment Issues**:
   - MongoDB connection timeouts
   - Excel import validation errors
   - Authentication token expiration
   - CORS errors
   - Performance degradation

4. **Hotfix Process**:
   ```bash
   # Create hotfix branch
   git checkout -b hotfix/issue-description
   
   # Make fix
   # Test thoroughly
   
   # Deploy hotfix
   git push origin hotfix/issue-description
   # Follow deployment process
   ```

**Issue Resolution Checklist**:
- [ ] Issue tracking system setup
- [ ] All reported issues logged
- [ ] Critical issues resolved within 24h
- [ ] High priority issues resolved within 1 week
- [ ] Users notified of fixes
- [ ] Fixes verified in production

---

## Rollback Plan

If deployment fails or critical issues arise:

1. **Database Rollback**
   ```bash
   # Restore from backup
   mongorestore --uri="mongodb+srv://..." --drop ./backups/mongodb/backup-YYYYMMDD
   ```

2. **Application Rollback**
   ```bash
   # PM2
   pm2 stop spare-parts-api
   # Restore previous version
   pm2 start spare-parts-api
   
   # Docker
   docker stop spare-parts-api
   docker run -d --name spare-parts-api spare-parts-backend:previous-tag
   ```

3. **Frontend Rollback**
   - Revert to previous deployment in Vercel/Netlify
   - Or restore previous build files

## Support Contacts

- **Database Issues**: MongoDB Atlas Support
- **Hosting Issues**: Your hosting provider support
- **Application Issues**: Development team
- **Security Issues**: Security team (escalate immediately)

---

**Document Version**: 1.0
**Last Updated**: 2024
