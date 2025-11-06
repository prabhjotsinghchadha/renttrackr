'use server';

import { eq } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { userSchema } from '@/models/Schema';

/**
 * Create a new user in the database
 * Handles cases where user already exists (by ID or email)
 */
export async function createUser(data: { id: string; email: string; name?: string | null }) {
  try {
    // First, check if user exists by ID
    const existingUserById = await getUserById(data.id);
    if (existingUserById) {
      // User already exists with this ID, return it
      return { success: true, user: existingUserById };
    }

    // Check if user exists by email (might have different ID)
    const existingUserByEmail = await getUserByEmail(data.email);
    if (existingUserByEmail) {
      // User exists with this email
      // If the ID matches, return it
      if (existingUserByEmail.id === data.id) {
        return { success: true, user: existingUserByEmail };
      }
      // If ID doesn't match, this is an edge case (shouldn't happen with Clerk)
      // Log a warning and return the existing user
      console.warn(
        `User with email ${data.email} exists with different ID: ${existingUserByEmail.id} vs ${data.id}. Returning existing user.`,
      );
      return { success: true, user: existingUserByEmail };
    }

    // User doesn't exist, create new one
    const [user] = await db
      .insert(userSchema)
      .values({
        id: data.id,
        email: data.email,
        name: data.name || null,
      })
      .returning();

    return { success: true, user };
  } catch (error) {
    // Handle duplicate key error gracefully
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('duplicate key') || errorMessage.includes('23505')) {
      // User already exists, try to fetch it
      const existingUser = await getUserByEmail(data.email);
      if (existingUser) {
        return { success: true, user: existingUser };
      }
      // Fallback: try by ID
      const existingUserById = await getUserById(data.id);
      if (existingUserById) {
        return { success: true, user: existingUserById };
      }
    }
    console.error('Error creating user:', error);
    return { success: false, error: 'Failed to create user' };
  }
}

/**
 * Update an existing user in the database
 */
export async function updateUser(
  userId: string,
  data: {
    email?: string;
    name?: string | null;
  },
) {
  try {
    const [user] = await db
      .update(userSchema)
      .set({
        email: data.email,
        name: data.name,
        updatedAt: new Date(),
      })
      .where(eq(userSchema.id, userId))
      .returning();

    return { success: true, user };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error: 'Failed to update user' };
  }
}

/**
 * Delete a user from the database
 */
export async function deleteUser(userId: string) {
  try {
    await db.delete(userSchema).where(eq(userSchema.id, userId));

    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: 'Failed to delete user' };
  }
}

/**
 * Get a user by their ID
 */
export async function getUserById(userId: string) {
  try {
    const [user] = await db.select().from(userSchema).where(eq(userSchema.id, userId)).limit(1);

    return user || null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

/**
 * Get a user by their email
 */
export async function getUserByEmail(email: string) {
  try {
    const [user] = await db.select().from(userSchema).where(eq(userSchema.email, email)).limit(1);

    return user || null;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
}

/**
 * Check if a user exists in the database
 */
export async function userExists(userId: string): Promise<boolean> {
  try {
    const user = await getUserById(userId);
    return user !== null;
  } catch (error) {
    console.error('Error checking if user exists:', error);
    return false;
  }
}
