# Backend Setup Guide

This guide explains how the backend is configured to sync Clerk users with your PostgreSQL database.

## Overview

The application uses:
- **Clerk** for authentication
- **PostgreSQL** (via Neon) for data storage
- **Drizzle ORM** for database operations
- **Webhooks** to sync user data between Clerk and your database

## How It Works

1. **User Signs Up/In**: User authenticates through Clerk
2. **Webhook Triggered**: Clerk sends a webhook event to your API
3. **Database Sync**: User data is automatically saved to your PostgreSQL database
4. **Dashboard Access**: User can now access their dashboard with persisted data

## Files Created

### 1. User Actions (`src/actions/UserActions.ts`)
Server actions for CRUD operations on users:
- `createUser()` - Create a new user
- `updateUser()` - Update user information
- `deleteUser()` - Delete a user
- `getUserById()` - Fetch user by ID
- `getUserByEmail()` - Fetch user by email
- `userExists()` - Check if user exists

### 2. Webhook Handler (`src/app/api/webhooks/clerk/route.ts`)
Handles Clerk webhook events:
- `user.created` - Creates user in database
- `user.updated` - Updates user information
- `user.deleted` - Removes user from database

### 3. Auth Helper (`src/helpers/AuthHelper.ts`)
Helper functions for authentication:
- `getCurrentUser()` - Get current user from database (with fallback)
- `requireAuth()` - Require authentication (throws error if not authenticated)
- `getCurrentUserId()` - Get current Clerk user ID

## Setup Instructions

### 1. Configure Environment Variables

Add the following to your `.env.local` file:

```bash
# Clerk Webhook Secret (get this from Clerk Dashboard)
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 2. Set Up Clerk Webhook

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your application
3. Navigate to **Webhooks** in the sidebar
4. Click **Add Endpoint**
5. Enter your webhook URL:
   - Development: `https://your-ngrok-url.ngrok.io/api/webhooks/clerk`
   - Production: `https://your-domain.com/api/webhooks/clerk`
6. Subscribe to these events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
7. Copy the **Signing Secret** and add it to your `.env.local` as `CLERK_WEBHOOK_SECRET`

### 3. Test Locally with ngrok

For local development, you need to expose your localhost to the internet:

```bash
# Install ngrok (if not already installed)
npm install -g ngrok

# Start your Next.js dev server
npm run dev

# In another terminal, start ngrok
ngrok http 3000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Use this URL in Clerk webhook settings: https://abc123.ngrok.io/api/webhooks/clerk
```

### 4. Generate and Run Database Migration

The user schema is already defined in `src/models/Schema.ts`. Generate and run the migration:

```bash
# Generate migration
npm run db:generate

# Apply migration
npm run db:migrate
```

### 5. Test the Integration

1. Sign up for a new account in your app
2. Check your database - the user should be automatically created
3. Check the console logs for webhook events
4. Visit the dashboard - you should see your name in the welcome message

## Usage Examples

### Get Current User in a Server Component

```typescript
import { getCurrentUser } from '@/helpers/AuthHelper';

export default async function MyPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return <div>Please sign in</div>;
  }
  
  return <div>Hello, {user.name}!</div>;
}
```

### Require Authentication

```typescript
import { requireAuth } from '@/helpers/AuthHelper';

export default async function ProtectedPage() {
  // Throws error if not authenticated
  const user = await requireAuth();
  
  return <div>Welcome, {user.name}!</div>;
}
```

### Create User Manually (if needed)

```typescript
import { createUser } from '@/actions/UserActions';

const result = await createUser({
  id: 'user_123',
  email: 'user@example.com',
  name: 'John Doe',
});

if (result.success) {
  console.log('User created:', result.user);
}
```

## Troubleshooting

### Webhook Not Firing

1. Check that your webhook URL is correct in Clerk Dashboard
2. Verify `CLERK_WEBHOOK_SECRET` is set correctly
3. Check ngrok is running (for local development)
4. Look for errors in your Next.js console

### User Not Created in Database

1. Check the API route logs: `/api/webhooks/clerk`
2. Verify database connection is working
3. Check that migrations have been run
4. Ensure the user schema exists in your database

### Database Connection Issues

1. Verify `DATABASE_URL` is set correctly in `.env.local`
2. Check that your Neon database is running
3. Test connection with `npm run db:studio`

## Next Steps

Now that user authentication is set up, you can:

1. Create actions for properties, tenants, leases, etc.
2. Build forms to create and manage data
3. Add data fetching to dashboard pages
4. Implement user-specific data filtering

## Security Notes

- Never commit `.env.local` to version control
- Keep your `CLERK_WEBHOOK_SECRET` private
- Webhook signature verification is automatically handled
- All user actions are server-side only ('use server')

