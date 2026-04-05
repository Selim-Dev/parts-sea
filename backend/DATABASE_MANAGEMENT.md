# Database Management Scripts

Quick reference for managing your MongoDB database.

## Available Scripts

### Clear Orders Only
Removes all orders while keeping users and parts intact.

```bash
npm run clear-orders
```

**Use when:** You want to start fresh with orders but keep your inventory and user accounts.

---

### Clear Entire Database
Drops all collections (users, parts, orders, everything).

```bash
npm run clear-db
```

**Use when:** You want to completely reset the database.

⚠️ **Warning:** This will delete ALL data including admin accounts!

---

### Seed Fresh Data
Clears everything and creates fresh default data:
- Admin user (username: `admin`, password: `admin123`)
- Shop user (username: `shop1`, password: `shop123`)
- 10 sample spare parts

```bash
npm run seed-fresh
```

**Use when:** You want a clean slate with default test data.

---

### Migration Scripts
For migrating from SQLite to MongoDB (one-time use).

```bash
# Run migration
npm run migrate

# Verify migration
npm run verify-migration
```

---

## Quick Reset Workflow

To completely reset and start fresh:

```bash
# Option 1: Clear and seed in one command
npm run clear-db && npm run seed-fresh

# Option 2: Just clear orders
npm run clear-orders
```

---

## Default Credentials

After running `seed-fresh`, use these credentials:

**Admin Account:**
- Username: `admin`
- Password: `admin123`
- Access: Full system access

**Shop Account:**
- Username: `shop1`
- Password: `shop123`
- Access: Can browse parts and place orders

---

## Notes

- All scripts connect to the MongoDB instance specified in `.env`
- Scripts will build the project before running
- Always backup important data before running clear scripts
- The database name is taken from `MONGODB_DB_NAME` in `.env`
