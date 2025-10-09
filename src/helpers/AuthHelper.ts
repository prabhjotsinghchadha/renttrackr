import { auth, currentUser as clerkCurrentUser } from '@clerk/nextjs/server';
import { createUser, getUserById } from '@/actions/UserActions';

/**
 * Get the current authenticated user from the database
 * If the user doesn't exist in the database yet, create them
 * This is useful as a fallback in case the webhook hasn't fired yet
 */
export async function getCurrentUser() {
  // Get the Clerk user ID
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  // Try to get the user from our database
  let user = await getUserById(userId);

  // If user doesn't exist in our database, create them
  // This handles cases where the webhook hasn't fired yet
  if (!user) {
    const clerkUser = await clerkCurrentUser();

    if (clerkUser) {
      const primaryEmail = clerkUser.emailAddresses.find(
        (email) => email.id === clerkUser.primaryEmailAddressId,
      );

      if (primaryEmail) {
        const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null;

        const result = await createUser({
          id: clerkUser.id,
          email: primaryEmail.emailAddress,
          name,
        });

        if (result.success && result.user) {
          user = result.user;
        }
      }
    }
  }

  return user;
}

/**
 * Require authentication - throws an error if user is not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

/**
 * Get the current user ID from Clerk
 */
export async function getCurrentUserId() {
  const { userId } = await auth();
  return userId;
}

