# Neon DB Migration Guide

## Situation

You're using **Neon DB** (remote PostgreSQL) which already has tables with the old schema (UUID user IDs). We need to migrate the existing database to support Clerk user IDs (varchar).

## Important: Check Your Data First

Before proceeding, check if you have any important data in your Neon database:

```bash
# Open Drizzle Studio to view your data
npm run db:studio
```

If you have important data, **back it up first!**

---

## Option 1: Fresh Start (If No Important Data) ⭐ RECOMMENDED

If your Neon database doesn't have important data yet, the easiest approach is to drop and recreate:

### Steps:

1. **Go to Neon Dashboard** (https://console.neon.tech/)
2. **Select your project**
3. **Go to SQL Editor**
4. **Run this SQL:**

```sql
-- Drop all tables (this deletes all data!)
DROP TABLE IF EXISTS "appliances" CASCADE;
DROP TABLE IF EXISTS "payments" CASCADE;
DROP TABLE IF EXISTS "leases" CASCADE;
DROP TABLE IF EXISTS "tenants" CASCADE;
DROP TABLE IF EXISTS "units" CASCADE;
DROP TABLE IF EXISTS "expenses" CASCADE;
DROP TABLE IF EXISTS "properties" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "counter" CASCADE;
DROP TABLE IF EXISTS "__drizzle_migrations" CASCADE;
```

5. **Run migrations from your local machine:**

```bash
npm run db:migrate
```

6. **Start your dev server:**

```bash
npm run dev
```

Done! ✅

---

## Option 2: Alter Existing Tables (If You Have Data)

If you have important data and want to keep it, you need to alter the existing tables.

### ⚠️ Warning:

This will only work if:
- You don't have any users yet (users table is empty)
- OR you're okay with deleting all users and starting fresh with user authentication

### Steps:

1. **Go to Neon Dashboard** (https://console.neon.tech/)
2. **Select your project**
3. **Go to SQL Editor**
4. **Run this SQL:**

```sql
-- Check if you have any users
SELECT COUNT(*) FROM users;

-- If count is 0 or you're okay deleting users, proceed:

-- Step 1: Delete all users (if any exist with UUID format)
DELETE FROM users;

-- Step 2: Drop foreign key constraint
ALTER TABLE "properties" DROP CONSTRAINT IF EXISTS "properties_user_id_users_id_fk";

-- Step 3: Alter user_id column in properties
ALTER TABLE "properties" ALTER COLUMN "user_id" TYPE varchar(255);

-- Step 4: Alter id column in users
ALTER TABLE "users" ALTER COLUMN "id" TYPE varchar(255);

-- Step 5: Re-add foreign key constraint
ALTER TABLE "properties" ADD CONSTRAINT "properties_user_id_users_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") 
  ON DELETE cascade ON UPDATE no action;

-- Step 6: Update migration tracking
INSERT INTO "__drizzle_migrations" (hash, created_at)
VALUES ('0001_alter_user_id_to_varchar', 1760040000000)
ON CONFLICT DO NOTHING;
```

5. **Verify the changes:**

```sql
-- Check the column types
SELECT 
  column_name, 
  data_type, 
  character_maximum_length
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'id';

-- Should show: varchar with length 255
```

6. **Start your dev server:**

```bash
npm run dev
```

---

## Option 3: Use Migration Script (Automated)

I've created a migration file that you can run:

```bash
# This will run the migration against your Neon DB
npm run db:migrate
```

**However**, this might fail if:
- The first migration (0000_aberrant_sway) was already applied
- Tables already exist

If it fails, use **Option 1** or **Option 2** above.

---

## Verification

After completing any of the above options:

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Sign in** at http://localhost:3000

3. **Check your dashboard** - should show "Welcome back, [Your Name]!"

4. **Verify in Neon Dashboard:**
   ```sql
   SELECT * FROM users;
   ```
   You should see your user with a Clerk ID like `user_xxxxx`

---

## What About Local Development?

For local development with PGLite:

```bash
# Just delete and restart
rm -rf local.db && npm run dev
```

The local database is separate from Neon and will be recreated automatically.

---

## Recommended Workflow

1. **For Neon (Production/Staging):** Use Option 1 (Fresh Start) if no important data
2. **For Local (Development):** Always use `rm -rf local.db && npm run dev`

---

## Environment Variables

Make sure your `.env.local` has:

```bash
# For Neon DB
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/dbname

# For local development, the boilerplate uses PGLite by default
# No DATABASE_URL needed for local dev
```

---

## Summary

**Easiest approach for Neon:**
1. Go to Neon SQL Editor
2. Drop all tables (run the DROP TABLE commands from Option 1)
3. Run `npm run db:migrate` locally
4. Run `npm run dev`
5. Sign in and verify!

**For local development:**
```bash
rm -rf local.db && npm run dev
```

🎉 Done!

