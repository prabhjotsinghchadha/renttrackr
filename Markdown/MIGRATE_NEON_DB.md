# How to Apply Migrations to Neon DB

## Problem

When you run `npm run db:migrate`, it runs `drizzle-kit migrate`, which **generates** migration files but doesn't **apply** them to your database. This is why your new tables aren't appearing in Neon DB.

**Important:** `drizzle-kit migrate` is a command that generates migrations, not applies them. To actually apply migrations to your Neon database, you need to use the `migrate:apply` script.

## Solution

Use the new `migrate:apply` script that actually applies migrations to your database.

### Step 1: Make sure DATABASE_URL is set

Check your `.env.local` file has the correct Neon DB connection string:

```bash
DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require"
```

### Step 2: Apply migrations

Run the migration script:

```bash
npm run migrate:apply
```

This will:
- Connect to your Neon DB using `DATABASE_URL`
- Apply all pending migrations from the `migrations/` folder
- Create the `__drizzle_migrations` table to track applied migrations
- Create all new tables (owners, property_owners, user_owners, invitations)

### Step 3: Verify

1. **Check in Neon Dashboard SQL Editor:**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```

   You should see:
   - `owners`
   - `property_owners`
   - `user_owners`
   - `invitations`
   - `__drizzle_migrations`

2. **Or use Drizzle Studio:**
   ```bash
   npm run db:studio
   ```

## Alternative: Manual SQL Application

If the script doesn't work, you can manually apply the migration SQL:

1. **Go to Neon Dashboard** → SQL Editor
2. **Copy the contents** of `migrations/0006_good_titania.sql`
3. **Paste and run** in the SQL Editor
4. **Update migration tracking:**
   ```sql
   INSERT INTO "__drizzle_migrations" (hash, created_at)
   VALUES ('0006_good_titania', 1762426805088)
   ON CONFLICT DO NOTHING;
   ```

## Troubleshooting

### Error: "relation already exists"
- Some tables might already exist
- Check which tables exist in Neon
- If you want a fresh start, drop all tables first (see Option 1 in NEON_DB_MIGRATION.md)

### Error: "DATABASE_URL not set"
- Make sure `.env.local` exists and has `DATABASE_URL`
- The script reads from `process.env.DATABASE_URL`

### Error: Connection timeout
- Check your Neon DB connection string
- Make sure the database is accessible
- Try connecting via `npm run db:studio` first

## What's the difference?

- **`npm run db:migrate`** (drizzle-kit migrate) = Generates migration files (doesn't apply)
- **`npm run migrate:apply`** (new script) = Actually applies migrations to database

## For Future Migrations

1. **Generate migration:** `npm run db:generate` (when schema changes)
2. **Apply migration:** `npm run migrate:apply` (to apply to Neon DB)

