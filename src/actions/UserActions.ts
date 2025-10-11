'use server';

import { eq } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { userSchema } from '@/models/Schema';

/**
 * Create a new user in the database
 */
export async function createUser(data: { id: string; email: string; name?: string | null }) {
  try {
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
