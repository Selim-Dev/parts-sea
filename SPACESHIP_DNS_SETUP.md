# Spaceship DNS Setup Guide for bahr-alqeta3.store

## Step-by-Step Instructions

You're currently in the right place! Here's exactly what to do:

### 1. Click "+ Add record" button (top right)

### 2. Add the following 4 A records:

#### Record 1: Main Domain
- **Type**: A
- **Name**: `@` (or leave empty)
- **Content/Value**: `178.18.246.104`
- **TTL**: 3600 (or Auto)
- Click "Save" or "Add"

#### Record 2: WWW Subdomain
- **Type**: A
- **Name**: `www`
- **Content/Value**: `178.18.246.104`
- **TTL**: 3600 (or Auto)
- Click "Save" or "Add"

#### Record 3: Admin Subdomain
- **Type**: A
- **Name**: `admin`
- **Content/Value**: `178.18.246.104`
- **TTL**: 3600 (or Auto)
- Click "Save" or "Add"

#### Record 4: API Subdomain
- **Type**: A
- **Name**: `api`
- **Content/Value**: `178.18.246.104`
- **TTL**: 3600 (or Auto)
- Click "Save" or "Add"

## Visual Reference

```
┌─────────────────────────────────────────────────────┐
│ Type │ Name  │ Content          │ TTL  │ Actions   │
├─────────────────────────────────────────────────────┤
│  A   │  @    │ 178.18.246.104   │ 3600 │ [Edit]    │
│  A   │  www  │ 178.18.246.104   │ 3600 │ [Edit]    │
│  A   │ admin │ 178.18.246.104   │ 3600 │ [Edit]    │
│  A   │  api  │ 178.18.246.104   │ 3600 │ [Edit]    │
└─────────────────────────────────────────────────────┘
```

## What Each Record Does

| Record | Full Domain | Purpose |
|--------|-------------|---------|
| `@` | bahr-alqeta3.store | Main landing page (customer site) |
| `www` | www.bahr-alqeta3.store | WWW version of main site |
| `admin` | admin.bahr-alqeta3.store | Admin dashboard |
| `api` | api.bahr-alqeta3.store | Backend API |

## After Adding Records

### ✅ Checklist:
- [ ] Added A record: `@` → `178.18.246.104`
- [ ] Added A record: `www` → `178.18.246.104`
- [ ] Added A record: `admin` → `178.18.246.104`
- [ ] Added A record: `api` → `178.18.246.104`
- [ ] Wait 5-10 minutes for DNS propagation

### Check DNS Propagation

After 5-10 minutes, verify the records are working:

**From your local machine:**
```bash
# Check main domain
nslookup bahr-alqeta3.store

# Check subdomains
nslookup www.bahr-alqeta3.store
nslookup admin.bahr-alqeta3.store
nslookup api.bahr-alqeta3.store

# Or use dig
dig bahr-alqeta3.store +short
```

**Expected output:**
```
178.18.246.104
```

**Online tools:**
- https://dnschecker.org/#A/bahr-alqeta3.store
- https://www.whatsmydns.net/#A/bahr-alqeta3.store

### Troubleshooting

**Records not showing up?**
- Wait a bit longer (can take up to 24 hours, usually 5-10 minutes)
- Clear your DNS cache: `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (Mac)
- Try from a different network or use online DNS checkers

**Wrong IP showing?**
- Double-check you entered `178.18.246.104` correctly
- Edit the record in Spaceship and save again

**Can't add record?**
- Make sure you're on the "DNS Records" tab
- Check if a conflicting record exists (delete old ones)
- Contact Spaceship support if issues persist

## Next Steps

Once DNS is propagated (all 4 domains resolve to 178.18.246.104):

1. ✅ DNS configured
2. ➡️ Run deployment on server (see DEPLOYMENT_CHECKLIST.md)
3. ➡️ Setup SSL certificates with certbot
4. ➡️ Access your sites!

## Quick Reference

**Your Server IP:** `178.18.246.104`

**Your Domains:**
- Main: `bahr-alqeta3.store`
- WWW: `www.bahr-alqeta3.store`
- Admin: `admin.bahr-alqeta3.store`
- API: `api.bahr-alqeta3.store`

**All point to:** `178.18.246.104`
