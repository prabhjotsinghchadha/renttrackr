# Reset Database - Quick Guide

## The Issue

You're seeing "relation already exists" errors because the old tables (with wrong schema) are still in the database.

## Solution: Fresh Start (Recommended)

### Option 1: Delete Database & Auto-Migrate on Dev Start

This is the **easiest** and **recommended** approach:

```bash
# 1. Stop your dev server if it's running (Ctrl+C)

# 2. Delete the database directory
rm -rf local.db

# 3. Start dev server (will auto-create database with correct schema)
npm run dev
```

That's it! The migration will run automatically when the dev server starts.

---

### Option 2: Manual Migration (If you prefer)

If you want to manually run migrations:

```bash
# 1. Stop your dev server if it's running (Ctrl+C)

# 2. Delete the database directory
rm -rf local.db

# 3. Run migration manually
npm run db:migrate

# 4. Start dev server
npm run dev
```

---

## What Happens Next

After deleting the database and starting the server:

1. ✅ PGLite creates a fresh `local.db` directory
2. ✅ Migration runs automatically (via `instrumentation.ts`)
3. ✅ All tables created with **correct schema** (varchar user IDs)
4. ✅ Server starts successfully
5. ✅ You can sign in and your user will be saved correctly

## Verification Steps

After the server starts:

1. **Sign in** to your app at http://localhost:3000
2. **Check the dashboard** - should show "Welcome back, [Your Name]!"
3. **Open Drizzle Studio** (in another terminal):
   ```bash
   npm run db:studio
   ```
4. **Check the users table** - should see your user with Clerk ID (e.g., `user_xxxxx`)

## Why This Happened

The old database had:
- `users.id` as `uuid` type
- `properties.user_id` as `uuid` type

The new schema has:
- `users.id` as `varchar(255)` (for Clerk user IDs)
- `properties.user_id` as `varchar(255)`

Since the table structures are incompatible, we need a fresh database.

## For Production

In production (with Neon or another PostgreSQL service), you would:

1. Either drop and recreate the database
2. Or run a migration that alters the column types

But for local development, it's easier to just start fresh!

---

## Quick Command

Just run this:

```bash
rm -rf local.db && npm run dev
```

Done! 🎉

