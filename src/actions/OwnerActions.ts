'use server';

import { and, eq, inArray } from 'drizzle-orm';
import { requireAuth } from '@/helpers/AuthHelper';
import { db } from '@/libs/DB';
import {
  invitationSchema,
  ownerSchema,
  propertyOwnerSchema,
  userOwnerSchema,
  userSchema,
} from '@/models/Schema';

/**
 * Get all owners that the current user has access to
 */
export async function getUserOwners() {
  try {
    const user = await requireAuth();

    // Get all user-owner relationships for this user
    const userOwners = await db
      .select()
      .from(userOwnerSchema)
      .where(eq(userOwnerSchema.userId, user.id));

    if (userOwners.length === 0) {
      return { success: true, owners: [] };
    }

    const ownerIds = userOwners.map((uo) => uo.ownerId);

    // Get owner details
    const owners = await db
      .select()
      .from(ownerSchema)
      .where(inArray(ownerSchema.id, ownerIds));

    // Combine with role information
    const ownersWithRoles = owners.map((owner) => {
      const userOwner = userOwners.find((uo) => uo.ownerId === owner.id);
      return {
        ...owner,
        role: userOwner?.role || 'viewer',
      };
    });

    return { success: true, owners: ownersWithRoles };
  } catch (error) {
    console.error('Error fetching user owners:', error);
    return { success: false, owners: [], error: 'Failed to fetch owners' };
  }
}

/**
 * Create a new owner and link it to the current user as admin
 */
export async function createOwner(data: {
  name: string;
  type: 'individual' | 'llc';
  email?: string;
  phone?: string;
  taxId?: string;
  address?: string;
  notes?: string;
}) {
  try {
    const user = await requireAuth();

    // Create the owner
    const [owner] = await db
      .insert(ownerSchema)
      .values({
        name: data.name,
        type: data.type,
        email: data.email,
        phone: data.phone,
        taxId: data.taxId,
        address: data.address,
        notes: data.notes,
      })
      .returning();

    if (!owner) {
      return { success: false, owner: null, error: 'Failed to create owner' };
    }

    // Link the owner to the current user with admin role
    await db.insert(userOwnerSchema).values({
      userId: user.id,
      ownerId: owner.id,
      role: 'admin',
    });

    return { success: true, owner };
  } catch (error) {
    console.error('Error creating owner:', error);
    return { success: false, owner: null, error: 'Failed to create owner' };
  }
}

/**
 * Update an owner (only if user is admin)
 */
export async function updateOwner(
  ownerId: string,
  data: {
    name?: string;
    type?: 'individual' | 'llc';
    email?: string;
    phone?: string;
    taxId?: string;
    address?: string;
    notes?: string;
  },
) {
  try {
    const user = await requireAuth();

    // Check if user has admin role for this owner
    const [userOwner] = await db
      .select()
      .from(userOwnerSchema)
      .where(and(eq(userOwnerSchema.userId, user.id), eq(userOwnerSchema.ownerId, ownerId)))
      .limit(1);

    if (!userOwner || userOwner.role !== 'admin') {
      return { success: false, owner: null, error: 'Unauthorized' };
    }

    const [owner] = await db
      .update(ownerSchema)
      .set({
        name: data.name,
        type: data.type,
        email: data.email,
        phone: data.phone,
        taxId: data.taxId,
        address: data.address,
        notes: data.notes,
        updatedAt: new Date(),
      })
      .where(eq(ownerSchema.id, ownerId))
      .returning();

    return { success: true, owner };
  } catch (error) {
    console.error('Error updating owner:', error);
    return { success: false, owner: null, error: 'Failed to update owner' };
  }
}

/**
 * Add a property-owner relationship with ownership percentage
 */
export async function addPropertyOwner(data: {
  propertyId: string;
  ownerId: string;
  ownershipPercentage: number;
}) {
  try {
    const user = await requireAuth();

    // Check if user has admin role for this owner
    const [userOwner] = await db
      .select()
      .from(userOwnerSchema)
      .where(and(eq(userOwnerSchema.userId, user.id), eq(userOwnerSchema.ownerId, data.ownerId)))
      .limit(1);

    if (!userOwner || (userOwner.role !== 'admin' && userOwner.role !== 'editor')) {
      return { success: false, error: 'Unauthorized' };
    }

    const [propertyOwner] = await db
      .insert(propertyOwnerSchema)
      .values({
        propertyId: data.propertyId,
        ownerId: data.ownerId,
        ownershipPercentage: data.ownershipPercentage,
      })
      .returning();

    return { success: true, propertyOwner };
  } catch (error) {
    console.error('Error adding property owner:', error);
    return { success: false, propertyOwner: null, error: 'Failed to add property owner' };
  }
}

/**
 * Update ownership percentage for a property-owner relationship
 */
export async function updatePropertyOwner(propertyOwnerId: string, ownershipPercentage: number) {
  try {
    const user = await requireAuth();

    // Get the property-owner relationship
    const [propertyOwner] = await db
      .select()
      .from(propertyOwnerSchema)
      .where(eq(propertyOwnerSchema.id, propertyOwnerId))
      .limit(1);

    if (!propertyOwner) {
      return { success: false, error: 'Property owner relationship not found' };
    }

    // Check if user has admin role for this owner
    const [userOwner] = await db
      .select()
      .from(userOwnerSchema)
      .where(and(eq(userOwnerSchema.userId, user.id), eq(userOwnerSchema.ownerId, propertyOwner.ownerId)))
      .limit(1);

    if (!userOwner || (userOwner.role !== 'admin' && userOwner.role !== 'editor')) {
      return { success: false, error: 'Unauthorized' };
    }

    const [updated] = await db
      .update(propertyOwnerSchema)
      .set({
        ownershipPercentage,
        updatedAt: new Date(),
      })
      .where(eq(propertyOwnerSchema.id, propertyOwnerId))
      .returning();

    return { success: true, propertyOwner: updated };
  } catch (error) {
    console.error('Error updating property owner:', error);
    return { success: false, error: 'Failed to update property owner' };
  }
}

/**
 * Remove a property-owner relationship
 */
export async function removePropertyOwner(propertyOwnerId: string) {
  try {
    const user = await requireAuth();

    // Get the property-owner relationship
    const [propertyOwner] = await db
      .select()
      .from(propertyOwnerSchema)
      .where(eq(propertyOwnerSchema.id, propertyOwnerId))
      .limit(1);

    if (!propertyOwner) {
      return { success: false, error: 'Property owner relationship not found' };
    }

    // Check if user has admin role for this owner
    const [userOwner] = await db
      .select()
      .from(userOwnerSchema)
      .where(and(eq(userOwnerSchema.userId, user.id), eq(userOwnerSchema.ownerId, propertyOwner.ownerId)))
      .limit(1);

    if (!userOwner || userOwner.role !== 'admin') {
      return { success: false, error: 'Unauthorized' };
    }

    await db.delete(propertyOwnerSchema).where(eq(propertyOwnerSchema.id, propertyOwnerId));

    return { success: true };
  } catch (error) {
    console.error('Error removing property owner:', error);
    return { success: false, error: 'Failed to remove property owner' };
  }
}

/**
 * Get owners for a specific property
 */
export async function getPropertyOwners(propertyId: string) {
  try {
    await requireAuth();

    // Get property-owner relationships
    const propertyOwners = await db
      .select()
      .from(propertyOwnerSchema)
      .where(eq(propertyOwnerSchema.propertyId, propertyId));

    if (propertyOwners.length === 0) {
      return { success: true, owners: [] };
    }

    const ownerIds = propertyOwners.map((po) => po.ownerId);

    // Get owner details
    const owners = await db.select().from(ownerSchema).where(inArray(ownerSchema.id, ownerIds));

    // Combine with ownership percentage
    const ownersWithPercentage = owners.map((owner) => {
      const propertyOwner = propertyOwners.find((po) => po.ownerId === owner.id);
      return {
        ...owner,
        ownershipPercentage: propertyOwner?.ownershipPercentage || 0,
        propertyOwnerId: propertyOwner?.id,
      };
    });

    return { success: true, owners: ownersWithPercentage };
  } catch (error) {
    console.error('Error fetching property owners:', error);
    return { success: false, owners: [], error: 'Failed to fetch property owners' };
  }
}

/**
 * Invite a user to an owner entity
 */
export async function inviteUserToOwner(data: {
  ownerId: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}) {
  try {
    const user = await requireAuth();

    // Check if user has admin role for this owner
    const [userOwner] = await db
      .select()
      .from(userOwnerSchema)
      .where(and(eq(userOwnerSchema.userId, user.id), eq(userOwnerSchema.ownerId, data.ownerId)))
      .limit(1);

    if (!userOwner || userOwner.role !== 'admin') {
      return { success: false, error: 'Unauthorized' };
    }

    // Generate a unique token
    const token = crypto.randomUUID();

    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const [invitation] = await db
      .insert(invitationSchema)
      .values({
        ownerId: data.ownerId,
        email: data.email,
        role: data.role,
        invitedBy: user.id,
        token,
        status: 'pending',
        expiresAt,
      })
      .returning();

    return { success: true, invitation };
  } catch (error) {
    console.error('Error inviting user to owner:', error);
    return { success: false, invitation: null, error: 'Failed to invite user' };
  }
}

/**
 * Accept an invitation
 */
export async function acceptInvitation(token: string) {
  try {
    const user = await requireAuth();

    // Find the invitation
    const [invitation] = await db
      .select()
      .from(invitationSchema)
      .where(eq(invitationSchema.token, token))
      .limit(1);

    if (!invitation) {
      return { success: false, error: 'Invitation not found' };
    }

    if (invitation.status !== 'pending') {
      return { success: false, error: 'Invitation is no longer valid' };
    }

    if (new Date() > invitation.expiresAt) {
      // Mark as expired
      await db
        .update(invitationSchema)
        .set({ status: 'expired' })
        .where(eq(invitationSchema.id, invitation.id));
      return { success: false, error: 'Invitation has expired' };
    }

    // Check if user-owner relationship already exists
    const [existingUserOwner] = await db
      .select()
      .from(userOwnerSchema)
      .where(and(eq(userOwnerSchema.userId, user.id), eq(userOwnerSchema.ownerId, invitation.ownerId)))
      .limit(1);

    if (existingUserOwner) {
      return { success: false, error: 'You already have access to this owner' };
    }

    // Create user-owner relationship
    await db.insert(userOwnerSchema).values({
      userId: user.id,
      ownerId: invitation.ownerId,
      role: invitation.role,
    });

    // Mark invitation as accepted
    await db
      .update(invitationSchema)
      .set({ status: 'accepted', acceptedAt: new Date() })
      .where(eq(invitationSchema.id, invitation.id));

    return { success: true };
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return { success: false, error: 'Failed to accept invitation' };
  }
}

/**
 * Get users linked to an owner (with full user details)
 */
export async function getOwnerUsers(ownerId: string) {
  try {
    const user = await requireAuth();

    // Check if user has access to this owner
    const [userOwner] = await db
      .select()
      .from(userOwnerSchema)
      .where(and(eq(userOwnerSchema.userId, user.id), eq(userOwnerSchema.ownerId, ownerId)))
      .limit(1);

    if (!userOwner) {
      return { success: false, users: [], error: 'Unauthorized' };
    }

    // Get all users linked to this owner
    const userOwners = await db
      .select()
      .from(userOwnerSchema)
      .where(eq(userOwnerSchema.ownerId, ownerId));

    // Get full user details
    const userIds = userOwners.map((uo) => uo.userId);
    const users = await db
      .select()
      .from(userSchema)
      .where(inArray(userSchema.id, userIds));

    // Combine user details with role
    const usersWithRoles = users.map((u) => {
      const userOwnerRel = userOwners.find((uo) => uo.userId === u.id);
      return {
        ...u,
        role: userOwnerRel?.role || 'viewer',
        userOwnerId: userOwnerRel?.id,
      };
    });

    return { success: true, users: usersWithRoles };
  } catch (error) {
    console.error('Error fetching owner users:', error);
    return { success: false, users: [], error: 'Failed to fetch owner users' };
  }
}

/**
 * Update a user's role for an owner (admin only)
 */
export async function updateUserRole(ownerId: string, userId: string, role: 'admin' | 'editor' | 'viewer') {
  try {
    const currentUser = await requireAuth();

    // Check if current user has admin role for this owner
    const [currentUserOwner] = await db
      .select()
      .from(userOwnerSchema)
      .where(and(eq(userOwnerSchema.userId, currentUser.id), eq(userOwnerSchema.ownerId, ownerId)))
      .limit(1);

    if (!currentUserOwner || currentUserOwner.role !== 'admin') {
      return { success: false, error: 'Unauthorized - Admin access required' };
    }

    // Prevent removing the last admin
    if (role !== 'admin' && currentUser.id === userId) {
      const allUserOwners = await db
        .select()
        .from(userOwnerSchema)
        .where(eq(userOwnerSchema.ownerId, ownerId));
      const adminCount = allUserOwners.filter((uo) => uo.role === 'admin').length;
      if (adminCount <= 1) {
        return { success: false, error: 'Cannot remove the last admin' };
      }
    }

    // Update the role
    const [updated] = await db
      .update(userOwnerSchema)
      .set({
        role,
        updatedAt: new Date(),
      })
      .where(and(eq(userOwnerSchema.ownerId, ownerId), eq(userOwnerSchema.userId, userId)))
      .returning();

    return { success: true, userOwner: updated };
  } catch (error) {
    console.error('Error updating user role:', error);
    return { success: false, error: 'Failed to update user role' };
  }
}

/**
 * Remove a user from an owner (admin only)
 */
export async function removeUserFromOwner(ownerId: string, userId: string) {
  try {
    const currentUser = await requireAuth();

    // Check if current user has admin role for this owner
    const [currentUserOwner] = await db
      .select()
      .from(userOwnerSchema)
      .where(and(eq(userOwnerSchema.userId, currentUser.id), eq(userOwnerSchema.ownerId, ownerId)))
      .limit(1);

    if (!currentUserOwner || currentUserOwner.role !== 'admin') {
      return { success: false, error: 'Unauthorized - Admin access required' };
    }

    // Prevent removing the last admin
    if (currentUser.id === userId) {
      const allUserOwners = await db
        .select()
        .from(userOwnerSchema)
        .where(eq(userOwnerSchema.ownerId, ownerId));
      const adminCount = allUserOwners.filter((uo) => uo.role === 'admin').length;
      if (adminCount <= 1) {
        return { success: false, error: 'Cannot remove the last admin' };
      }
    }

    // Remove the user-owner relationship
    await db
      .delete(userOwnerSchema)
      .where(and(eq(userOwnerSchema.ownerId, ownerId), eq(userOwnerSchema.userId, userId)));

    return { success: true };
  } catch (error) {
    console.error('Error removing user from owner:', error);
    return { success: false, error: 'Failed to remove user from owner' };
  }
}

