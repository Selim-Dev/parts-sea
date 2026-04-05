# Post-Deployment Monitoring & Maintenance Guide

This guide provides detailed instructions for monitoring and maintaining the Spare Parts System after deployment.

## Table of Contents

1. [MongoDB Performance Monitoring](#mongodb-performance-monitoring)
2. [Error Log Monitoring](#error-log-monitoring)
3. [User Feedback Collection](#user-feedback-collection)
4. [Issue Management](#issue-management)
5. [Maintenance Tasks](#maintenance-tasks)
6. [Performance Optimization](#performance-optimization)

---

## MongoDB Performance Monitoring

### Daily Monitoring Tasks

#### 1. Check Connection Health

**MongoDB Atlas Dashboard**:
- Navigate to: Clusters > Your Cluster > Metrics
- Check "Connections" graph
- **Normal**: 5-50 connections
- **Warning**: 50-80 connections
- **Critical**: > 80 connections

**Action if Critical**:
```javascript
// Check for connection leaks in application
// Verify connection pool settings in database.module.ts
MongooseModule.forRoot(process.env.MONGODB_URI, {
  maxPoolSize: 10,  // Adjust if needed
  minPoolSize: 5,
  socketTimeoutMS: 45000,
})
```

#### 2. Monitor Query Performance

**Check Slow Queries**:
```javascript
// Connect to MongoDB
use spare-parts-system

// Enable profiling (if not already enabled)
db.setProfilingLevel(1, { slowms: 100 })

// View slow queries
db.system.profile.find({ millis: { $gt: 100 } })
  .sort({ millis: -1 })
  .limit(10)
  .pretty()
```

**Common Slow Query Patterns**:
- Full collection scans (missing indexes)
- Large aggregation pipelines
- Unoptimized regex searches

**Solutions**:
```javascript
// Add indexes for frequently queried fields
db.parts.createIndex({ partNumber: 1 })
db.parts.createIndex({ name: "text", brand: "text" })
db.orders.createIndex({ status: 1, createdAt: -1 })
db.orders.createIndex({ userId: 1, createdAt: -1 })
```

#### 3. Monitor Disk Usage

**MongoDB Atlas**:
- Check "Disk" metrics
- **Normal**: < 60% usage
- **Warning**: 60-80% usage
- **Critical**: > 80% usage

**Action if High**:
- Review data retention policies
- Archive old orders (> 1 year)
- Compress old data
- Consider upgrading cluster tier

#### 4. Check Operation Metrics

**Key Metrics to Monitor**:
- **Operations per second**: Should be stable
- **Network traffic**: Monitor for spikes
- **CPU usage**: Should be < 70% average
- **Memory usage**: Should be < 80%

**MongoDB Atlas Alerts Setup**:
```
1. Go to Alerts tab
2. Create alerts for:
   - Connections > 80
   - CPU > 80%
   - Disk > 80%
   - Query execution time > 1000ms
3. Set notification email/SMS
```

### Weekly Monitoring Tasks

#### 1. Review Index Usage

```javascript
// Check index statistics
db.parts.aggregate([{ $indexStats: {} }])
db.orders.aggregate([{ $indexStats: {} }])
db.users.aggregate([{ $indexStats: {} }])

// Look for:
// - Unused indexes (accesses.ops = 0)
// - Missing indexes (high collection scan count)
```

#### 2. Analyze Query Patterns

```javascript
// Most frequent queries
db.system.profile.aggregate([
  { $group: {
    _id: "$command.filter",
    count: { $sum: 1 },
    avgTime: { $avg: "$millis" }
  }},
  { $sort: { count: -1 } },
  { $limit: 10 }
])
```

#### 3. Database Size Analysis

```javascript
// Check collection sizes
db.stats()
db.parts.stats()
db.orders.stats()
db.users.stats()

// Check document counts
db.parts.countDocuments()
db.orders.countDocuments()
db.users.countDocuments()
```

### Monthly Monitoring Tasks

#### 1. Performance Baseline Review

- Compare current metrics with previous month
- Identify performance trends
- Plan capacity upgrades if needed

#### 2. Backup Verification

```bash
# Test backup restoration
mongorestore --uri="mongodb+srv://..." \
  --nsInclude="spare-parts-system.*" \
  --drop \
  ./backups/test-restore/
```

#### 3. Security Audit

- Review database user permissions
- Check IP whitelist
- Verify SSL/TLS configuration
- Review audit logs

---

## Error Log Monitoring

### Application Error Monitoring

#### 1. PM2 Logs (if using PM2)

```bash
# View all logs
pm2 logs spare-parts-api

# View only errors
pm2 logs spare-parts-api --err

# View logs with timestamp
pm2 logs spare-parts-api --timestamp

# Save logs to file
pm2 logs spare-parts-api --out /var/log/spare-parts/app.log
```

#### 2. Docker Logs (if using Docker)

```bash
# View logs
docker logs spare-parts-api

# Follow logs in real-time
docker logs -f spare-parts-api

# View last 100 lines
docker logs --tail 100 spare-parts-api

# View logs with timestamps
docker logs -t spare-parts-api
```

#### 3. Nginx Logs

```bash
# Access logs
tail -f /var/log/nginx/access.log

# Error logs
tail -f /var/log/nginx/error.log

# Filter for errors only
grep "error" /var/log/nginx/error.log

# Count errors by type
awk '{print $9}' /var/log/nginx/access.log | sort | uniq -c | sort -rn
```

### Error Categories and Actions

#### Critical Errors (Immediate Action Required)

**1. MongoDB Connection Errors**
```
Error: MongooseServerSelectionError: connect ECONNREFUSED
```
**Actions**:
- Check MongoDB Atlas status
- Verify connection string
- Check IP whitelist
- Verify network connectivity

**2. Authentication Failures**
```
Error: Authentication failed
```
**Actions**:
- Verify database user credentials
- Check user permissions
- Review JWT secret configuration

**3. Out of Memory Errors**
```
Error: JavaScript heap out of memory
```
**Actions**:
- Increase Node.js memory limit: `NODE_OPTIONS=--max-old-space-size=4096`
- Review memory leaks
- Optimize large data operations

#### High Priority Errors (Action within 24h)

**1. File Upload Errors**
```
Error: File too large
Error: Invalid file type
```
**Actions**:
- Review file size limits
- Check file type validation
- Verify disk space

**2. Validation Errors**
```
Error: Validation failed
```
**Actions**:
- Review validation rules
- Check data integrity
- Update error messages

#### Medium Priority Errors (Action within 1 week)

**1. Deprecation Warnings**
```
Warning: DeprecationWarning: ...
```
**Actions**:
- Update dependencies
- Refactor deprecated code
- Test thoroughly

**2. Performance Warnings**
```
Warning: Query took longer than 1000ms
```
**Actions**:
- Add indexes
- Optimize queries
- Review data volume

### Error Tracking Setup

#### Option 1: Sentry Integration

```bash
npm install @sentry/node @sentry/tracing
```

```typescript
// main.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

#### Option 2: Custom Error Logger

```typescript
// logger.service.ts
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LoggerService {
  private readonly logger = new Logger('Application');

  logError(error: Error, context?: string) {
    this.logger.error(
      `${error.message}\nStack: ${error.stack}`,
      context
    );
    
    // Send to external service
    // this.sendToExternalService(error);
  }
}
```

### Error Alert Configuration

**Email Alerts**:
```bash
# Setup email alerts for critical errors
# Using sendmail or SMTP service

# Example: Send email on critical error
echo "Critical error occurred" | mail -s "Alert: Spare Parts API" admin@example.com
```

**Slack Alerts** (Optional):
```bash
# Send Slack notification
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Critical error in Spare Parts API"}' \
  YOUR_SLACK_WEBHOOK_URL
```

---

## User Feedback Collection

### Excel Import Feedback

#### Feedback Form Template

Create a feedback form with these questions:

**Usability Questions**:
1. How easy was it to download the Excel template? (1-5 scale)
2. Were the column names (in Arabic) clear and understandable? (Yes/No)
3. How easy was it to fill in the data? (1-5 scale)
4. Did you encounter any errors during import? (Yes/No)
5. If yes, were the error messages helpful? (1-5 scale)

**Performance Questions**:
6. How long did the import take? (< 10s, 10-30s, > 30s)
7. How many rows did you import? (< 100, 100-500, 500-1000, > 1000)
8. Was the import speed acceptable? (Yes/No)

**Feature Questions**:
9. What features are missing from Excel import?
10. What improvements would you suggest?

#### Usage Analytics

**Track These Metrics**:
```javascript
// In excel.service.ts
async importParts(validRows: ParsedRow[]): Promise<ImportSummary> {
  const startTime = Date.now();
  
  // ... import logic ...
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  // Log metrics
  this.logger.log({
    event: 'excel_import',
    rowCount: validRows.length,
    duration: duration,
    successRate: (imported + updated) / validRows.length,
  });
  
  return summary;
}
```

**Analyze Metrics**:
- Average import time per row
- Success rate (imported + updated / total)
- Common validation errors
- File size distribution

### UI Feedback Collection

#### Shop Portal Feedback

**Key Areas to Evaluate**:
1. **Product Cards**
   - Are product details clear?
   - Is pricing visible?
   - Is stock status helpful?

2. **Search Functionality**
   - Does search return relevant results?
   - Is search speed acceptable?
   - Are filters useful?

3. **Navigation**
   - Is navigation intuitive?
   - Can users find what they need?
   - Is mobile experience good?

4. **Cart & Checkout**
   - Is cart management easy?
   - Is checkout process smooth?
   - Are order confirmations clear?

#### Admin Dashboard Feedback

**Key Areas to Evaluate**:
1. **Analytics Display**
   - Are KPIs useful?
   - Is data visualization clear?
   - Is information actionable?

2. **Parts Management**
   - Is parts list easy to navigate?
   - Are filters effective?
   - Is editing intuitive?

3. **Order Management**
   - Is order list clear?
   - Is status update easy?
   - Are order details complete?

#### Feedback Collection Methods

**1. In-App Feedback Widget**
```typescript
// Add feedback button to UI
<button onClick={openFeedbackForm}>
  إرسال ملاحظات
</button>
```

**2. User Surveys**
- Send monthly surveys via email
- Use Google Forms or Typeform
- Offer incentives for completion

**3. User Interviews**
- Schedule 30-minute calls
- Ask open-ended questions
- Record and analyze responses

**4. Usage Analytics**
- Google Analytics
- Hotjar (heatmaps, recordings)
- Mixpanel (event tracking)

---

## Issue Management

### Issue Tracking System

#### GitHub Issues Template

**Bug Report Template**:
```markdown
## Bug Description
[Clear description of the bug]

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Environment
- Browser: [e.g., Chrome 120]
- OS: [e.g., Windows 11]
- User Role: [Admin/Shop]

## Screenshots
[If applicable]

## Additional Context
[Any other relevant information]
```

**Feature Request Template**:
```markdown
## Feature Description
[Clear description of the feature]

## Use Case
[Why is this feature needed?]

## Proposed Solution
[How should it work?]

## Alternatives Considered
[Other approaches considered]

## Priority
[Low/Medium/High]
```

### Issue Prioritization

**Priority Levels**:

**P0 - Critical** (Fix immediately):
- System down
- Data loss
- Security vulnerability
- Cannot process orders

**P1 - High** (Fix within 24h):
- Major feature broken
- Performance severely degraded
- Affects multiple users
- Workaround exists but difficult

**P2 - Medium** (Fix within 1 week):
- Minor feature broken
- Affects few users
- Easy workaround exists
- UI/UX issues

**P3 - Low** (Fix when possible):
- Nice-to-have features
- Minor UI improvements
- Documentation updates
- Optimization opportunities

### Issue Resolution Process

**1. Triage** (Daily):
- Review new issues
- Assign priority
- Assign owner
- Add labels

**2. Investigation**:
- Reproduce issue
- Identify root cause
- Estimate effort
- Plan fix

**3. Development**:
- Create branch
- Implement fix
- Write tests
- Code review

**4. Testing**:
- Test in staging
- Verify fix works
- Check for regressions
- Get user confirmation

**5. Deployment**:
- Deploy to production
- Monitor for issues
- Update documentation
- Close issue

### Common Issues and Solutions

#### Issue: Excel Import Fails with Large Files

**Symptoms**:
- Timeout errors
- Memory errors
- Slow performance

**Solutions**:
```typescript
// Implement streaming for large files
async importPartsStreaming(file: Express.Multer.File) {
  const stream = XLSX.stream.read(file.buffer);
  const batchSize = 100;
  let batch = [];
  
  for await (const row of stream) {
    batch.push(row);
    
    if (batch.length >= batchSize) {
      await this.processBatch(batch);
      batch = [];
    }
  }
  
  if (batch.length > 0) {
    await this.processBatch(batch);
  }
}
```

#### Issue: MongoDB Connection Timeouts

**Symptoms**:
- Intermittent connection errors
- Slow queries
- Connection pool exhaustion

**Solutions**:
```typescript
// Increase timeout and pool size
MongooseModule.forRoot(process.env.MONGODB_URI, {
  maxPoolSize: 20,
  minPoolSize: 5,
  socketTimeoutMS: 60000,
  connectTimeoutMS: 30000,
  serverSelectionTimeoutMS: 30000,
})
```

#### Issue: Dashboard Loads Slowly

**Symptoms**:
- Dashboard takes > 5 seconds to load
- High CPU usage
- Slow aggregation queries

**Solutions**:
```typescript
// Implement caching
import { CACHE_MANAGER } from '@nestjs/cache-manager';

async getDashboard() {
  const cacheKey = 'dashboard_analytics';
  const cached = await this.cacheManager.get(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  const data = await this.computeDashboard();
  await this.cacheManager.set(cacheKey, data, 300); // 5 min cache
  
  return data;
}
```

---

## Maintenance Tasks

### Daily Tasks

- [ ] Check application logs for errors
- [ ] Monitor MongoDB connection health
- [ ] Review API response times
- [ ] Check disk space
- [ ] Verify backups completed

### Weekly Tasks

- [ ] Review slow queries
- [ ] Analyze error patterns
- [ ] Check index usage
- [ ] Review user feedback
- [ ] Update issue tracker
- [ ] Test backup restoration
- [ ] Review security logs

### Monthly Tasks

- [ ] Update dependencies
- [ ] Performance baseline review
- [ ] Security audit
- [ ] Database optimization
- [ ] Documentation updates
- [ ] User satisfaction survey
- [ ] Capacity planning review

### Quarterly Tasks

- [ ] Major dependency updates
- [ ] Security penetration testing
- [ ] Disaster recovery drill
- [ ] Performance optimization
- [ ] Feature roadmap review
- [ ] User training sessions

---

## Performance Optimization

### Database Optimization

**1. Index Optimization**
```javascript
// Review and optimize indexes
db.parts.getIndexes()
db.orders.getIndexes()

// Add compound indexes for common queries
db.orders.createIndex({ userId: 1, status: 1, createdAt: -1 })
db.parts.createIndex({ category: 1, brand: 1, stock: 1 })
```

**2. Query Optimization**
```typescript
// Use projection to limit returned fields
const parts = await this.partModel
  .find({ category: 'محركات' })
  .select('partNumber name price stock')
  .lean(); // Use lean() for read-only queries

// Use aggregation for complex queries
const topSelling = await this.orderModel.aggregate([
  { $unwind: '$items' },
  { $group: {
    _id: '$items.partNumber',
    totalQuantity: { $sum: '$items.quantity' },
    totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.unitPrice'] } }
  }},
  { $sort: { totalQuantity: -1 } },
  { $limit: 10 }
]);
```

**3. Connection Pool Tuning**
```typescript
// Adjust based on load
MongooseModule.forRoot(process.env.MONGODB_URI, {
  maxPoolSize: 50,  // Increase for high traffic
  minPoolSize: 10,
  maxIdleTimeMS: 30000,
})
```

### Application Optimization

**1. Caching Strategy**
```typescript
// Cache frequently accessed data
@Injectable()
export class CacheService {
  async getCachedParts(category: string) {
    const cacheKey = `parts_${category}`;
    let parts = await this.cache.get(cacheKey);
    
    if (!parts) {
      parts = await this.partModel.find({ category });
      await this.cache.set(cacheKey, parts, 600); // 10 min
    }
    
    return parts;
  }
}
```

**2. Pagination**
```typescript
// Always paginate large result sets
async findAll(page: number, limit: number) {
  const skip = (page - 1) * limit;
  
  const [data, total] = await Promise.all([
    this.partModel.find().skip(skip).limit(limit),
    this.partModel.countDocuments()
  ]);
  
  return { data, total, page, limit };
}
```

**3. Compression**
```typescript
// Enable gzip compression
import * as compression from 'compression';

app.use(compression());
```

### Frontend Optimization

**1. Code Splitting**
```typescript
// Lazy load routes
const PartsPage = lazy(() => import('./pages/PartsPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
```

**2. Image Optimization**
- Use WebP format
- Implement lazy loading
- Use CDN for static assets

**3. Bundle Size Reduction**
```bash
# Analyze bundle size
npm run build -- --analyze

# Remove unused dependencies
npm prune
```

---

## Monitoring Dashboard Setup

### Recommended Tools

**1. Grafana + Prometheus**
- Monitor application metrics
- Create custom dashboards
- Set up alerts

**2. MongoDB Atlas Charts**
- Visualize database metrics
- Create custom reports
- Share with team

**3. Uptime Monitoring**
- UptimeRobot (free tier available)
- Pingdom
- StatusCake

### Key Metrics to Track

**Application Metrics**:
- Request rate (requests/second)
- Response time (average, p95, p99)
- Error rate (errors/total requests)
- Active users

**Database Metrics**:
- Query execution time
- Connection count
- Operations per second
- Disk usage

**Business Metrics**:
- Orders per day
- Revenue per day
- Active shops
- Parts inventory turnover

---

## Emergency Response

### Critical Issue Response Plan

**1. Identify Severity**
- P0: System down, data loss
- P1: Major feature broken
- P2: Minor issue

**2. Immediate Actions**
- Notify team
- Check monitoring dashboards
- Review recent changes
- Check error logs

**3. Mitigation**
- Rollback if recent deployment
- Apply hotfix if possible
- Enable maintenance mode if needed

**4. Communication**
- Notify affected users
- Provide status updates
- Set expectations for resolution

**5. Resolution**
- Fix root cause
- Test thoroughly
- Deploy fix
- Verify resolution

**6. Post-Mortem**
- Document incident
- Identify root cause
- Implement preventive measures
- Update runbooks

---

## Contact Information

**Escalation Path**:
1. On-call developer
2. Team lead
3. CTO/Technical director

**External Support**:
- MongoDB Atlas Support: support.mongodb.com
- Hosting Provider Support: [Your provider]
- Security Issues: security@yourcompany.com

---

**Document Version**: 1.0
**Last Updated**: 2024
**Review Schedule**: Quarterly
