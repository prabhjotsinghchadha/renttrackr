# Schema Fix - Clerk User ID Compatibility

## Problem Fixed

The original schema used `uuid` type for the user ID, but Clerk uses string IDs like `user_33mrSTbtV3yuvqBBLpTnEYsPCLp`. This caused database query failures.

## Changes Made

### 1. Updated User Schema
Changed the `id` field from `uuid` to `varchar(255)` to support Clerk user IDs:

```typescript
// Before
id: uuid('id').defaultRandom().primaryKey()

// After
id: varchar('id', { length: 255 }).primaryKey() // Clerk user ID
```

### 2. Updated Property Schema
Changed the `userId` foreign key to match:

```typescript
// Before
userId: uuid('user_id')

// After
userId: varchar('user_id', { length: 255 })
```

### 3. Fresh Database & Migration
- Deleted old `local.db` directory
- Deleted old migrations
- Generated new migration with correct schema: `0000_aberrant_sway.sql`

## What You Need to Do

**Just start your dev server:**

```bash
npm run dev
```

The migration will run automatically and create all tables with the correct schema!

## Expected Behavior

When you start the server, you should see:
```
✅ Database migrations completed successfully
```

Then:
1. ✅ Visit http://localhost:3000
2. ✅ Sign up or sign in with Clerk
3. ✅ Your user data will be saved to the database
4. ✅ Dashboard will show "Welcome back, [Your Name]!"

## Verification

After signing in, you can verify the user was created:

```bash
# Open Drizzle Studio
npm run db:studio

# Check the users table - you should see your user with Clerk ID
```

## Why This Happened

Clerk uses custom string IDs (format: `user_xxxxx`) instead of standard UUIDs. The schema needed to be updated to accommodate this format.

## Going Forward

All new users will be automatically:
1. Created via Clerk webhook when they sign up
2. Stored in your database with their Clerk ID
3. Linked to their properties, tenants, leases, etc.

The cascade delete is configured, so if a user is deleted from Clerk, all their data will be automatically removed from your database.

---

**Status**: ✅ Schema is now compatible with Clerk user IDs!

