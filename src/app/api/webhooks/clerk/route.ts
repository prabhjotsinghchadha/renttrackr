import type { WebhookEvent } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { createUser, deleteUser, updateUser } from '@/actions/UserActions';
import { Env } from '@/libs/Env';

/**
 * Clerk Webhook Handler
 * This endpoint receives webhooks from Clerk to sync user data with our database
 *
 * Setup Instructions:
 * 1. Go to Clerk Dashboard > Webhooks
 * 2. Add endpoint: https://your-domain.com/api/webhooks/clerk
 * 3. Subscribe to events: user.created, user.updated, user.deleted
 * 4. Copy the signing secret and add it to your .env as CLERK_WEBHOOK_SECRET
 */
export async function POST(req: Request) {
  // Get the Clerk webhook secret from environment variables
  const WEBHOOK_SECRET = Env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the webhook signature
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle the webhook event
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data;

    // Get the primary email
    const primaryEmail = email_addresses.find(
      (email) => email.id === evt.data.primary_email_address_id,
    );

    if (!primaryEmail) {
      console.error('No primary email found for user:', id);
      return NextResponse.json({ error: 'No primary email found' }, { status: 400 });
    }

    // Create the user in our database
    const name = [first_name, last_name].filter(Boolean).join(' ') || null;
    const result = await createUser({
      id,
      email: primaryEmail.email_address,
      name,
    });

    if (!result.success) {
      console.error('Failed to create user in database:', result.error);
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    console.warn('User created:', result.user);
  } else if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data;

    // Get the primary email
    const primaryEmail = email_addresses.find(
      (email) => email.id === evt.data.primary_email_address_id,
    );

    if (!primaryEmail) {
      console.error('No primary email found for user:', id);
      return NextResponse.json({ error: 'No primary email found' }, { status: 400 });
    }

    // Update the user in our database
    const name = [first_name, last_name].filter(Boolean).join(' ') || null;
    const result = await updateUser(id, {
      email: primaryEmail.email_address,
      name,
    });

    if (!result.success) {
      console.error('Failed to update user in database:', result.error);
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

    console.warn('User updated:', result.user);
  } else if (eventType === 'user.deleted') {
    const { id } = evt.data;

    if (!id) {
      console.error('No user ID found in delete event');
      return NextResponse.json({ error: 'No user ID found' }, { status: 400 });
    }

    // Delete the user from our database
    const result = await deleteUser(id);

    if (!result.success) {
      console.error('Failed to delete user from database:', result.error);
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }

    console.warn('User deleted:', id);
  }

  return NextResponse.json({ success: true });
}
