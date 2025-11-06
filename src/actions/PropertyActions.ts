'use server';

import { and, eq, inArray } from 'drizzle-orm';
import { requireAuth } from '@/helpers/AuthHelper';
import { db } from '@/libs/DB';
import {
  ownerSchema,
  propertyOwnerSchema,
  propertySchema,
  unitSchema,
  userOwnerSchema,
} from '@/models/Schema';

/**
 * Get all properties for the current user (via ownership relationships)
 * This queries properties through the user_owners and property_owners relationships
 */
export async function getUserProperties() {
  try {
    const user = await requireAuth();

    // Get all owners linked to this user
    const userOwners = await db
      .select()
      .from(userOwnerSchema)
      .where(eq(userOwnerSchema.userId, user.id));

    if (userOwners.length === 0) {
      // Fallback to legacy direct userId relationship for backward compatibility
      const legacyProperties = await db
        .select()
        .from(propertySchema)
        .where(eq(propertySchema.userId, user.id));

      return { success: true, properties: legacyProperties };
    }

    const ownerIds = userOwners.map((uo) => uo.ownerId);

    // Get all property-owner relationships for these owners
    const propertyOwners = await db
      .select()
      .from(propertyOwnerSchema)
      .where(inArray(propertyOwnerSchema.ownerId, ownerIds));

    if (propertyOwners.length === 0) {
      return { success: true, properties: [] };
    }

    const propertyIds = propertyOwners.map((po) => po.propertyId);

    // Get property details
    const properties = await db
      .select()
      .from(propertySchema)
      .where(inArray(propertySchema.id, propertyIds));

    return { success: true, properties };
  } catch (error) {
    console.error('Error fetching properties:', error);
    return { success: false, properties: [], error: 'Failed to fetch properties' };
  }
}

/**
 * Get a single property by ID (with units and ownership info)
 * Checks access via user_owners and property_owners relationships
 */
export async function getPropertyById(propertyId: string) {
  try {
    const user = await requireAuth();

    // Get all owners linked to this user
    const userOwners = await db
      .select()
      .from(userOwnerSchema)
      .where(eq(userOwnerSchema.userId, user.id));

    const ownerIds = userOwners.map((uo) => uo.ownerId);

    // Check if user has access to this property via ownership
    let hasAccess = false;

    if (ownerIds.length > 0) {
      const propertyOwners = await db
        .select()
        .from(propertyOwnerSchema)
        .where(and(eq(propertyOwnerSchema.propertyId, propertyId), inArray(propertyOwnerSchema.ownerId, ownerIds)));

      hasAccess = propertyOwners.length > 0;
    }

    // Fallback to legacy direct userId relationship
    if (!hasAccess) {
      const [legacyCheck] = await db
        .select()
        .from(propertySchema)
        .where(and(eq(propertySchema.id, propertyId), eq(propertySchema.userId, user.id)))
        .limit(1);

      hasAccess = !!legacyCheck;
    }

    if (!hasAccess) {
      return { success: false, property: null, units: [], error: 'Property not found or unauthorized' };
    }

    // Get property details
    const [property] = await db
      .select()
      .from(propertySchema)
      .where(eq(propertySchema.id, propertyId))
      .limit(1);

    if (!property) {
      return { success: false, property: null, units: [], error: 'Property not found' };
    }

    // Get units for this property
    const units = await db.select().from(unitSchema).where(eq(unitSchema.propertyId, propertyId));

    // Get ownership information
    const propertyOwners = await db
      .select()
      .from(propertyOwnerSchema)
      .where(eq(propertyOwnerSchema.propertyId, propertyId));

    const owners = [];
    if (propertyOwners.length > 0) {
      const ownerDetails = await db
        .select()
        .from(ownerSchema)
        .where(inArray(ownerSchema.id, propertyOwners.map((po) => po.ownerId)));

      for (const owner of ownerDetails) {
        const po = propertyOwners.find((p) => p.ownerId === owner.id);
        owners.push({
          ...owner,
          ownershipPercentage: po?.ownershipPercentage || 0,
          propertyOwnerId: po?.id,
        });
      }
    }

    return { success: true, property, units, owners };
  } catch (error) {
    console.error('Error fetching property:', error);
    return { success: false, property: null, units: [], error: 'Failed to fetch property' };
  }
}

/**
 * Create a new property with multiple owners
 * If no owners specified, creates with the user's default owner or legacy userId
 */
export async function createProperty(data: {
  address: string;
  propertyType?: string;
  acquiredOn?: Date;
  principalAmount?: number;
  rateOfInterest?: number;
  owners?: Array<{ ownerId: string; ownershipPercentage: number }>;
}) {
  try {
    const user = await requireAuth();

    // Create the property (keep userId for backward compatibility)
    const [property] = await db
      .insert(propertySchema)
      .values({
        userId: user.id,
        address: data.address,
        propertyType: data.propertyType,
        acquiredOn: data.acquiredOn,
        principalAmount: data.principalAmount,
        rateOfInterest: data.rateOfInterest,
      })
      .returning();

    if (!property) {
      return { success: false, property: null, error: 'Failed to create property' };
    }

    // Handle ownership relationships
    if (data.owners && data.owners.length > 0) {
      // Add all specified owners
      for (const owner of data.owners) {
        await db.insert(propertyOwnerSchema).values({
          propertyId: property.id,
          ownerId: owner.ownerId,
          ownershipPercentage: owner.ownershipPercentage,
        });
      }
    } else {
      // Get user's owners and create with first admin owner, or skip if none
      const userOwners = await db
        .select()
        .from(userOwnerSchema)
        .where(eq(userOwnerSchema.userId, user.id));

      const adminOwner = userOwners.find((uo) => uo.role === 'admin');

      if (adminOwner) {
        await db.insert(propertyOwnerSchema).values({
          propertyId: property.id,
          ownerId: adminOwner.ownerId,
          ownershipPercentage: 100,
        });
      }
      // If no admin owner, property will rely on legacy userId field
    }

    return { success: true, property };
  } catch (error) {
    console.error('Error creating property:', error);
    return { success: false, property: null, error: 'Failed to create property' };
  }
}

/**
 * Update a property (checks access via ownership)
 */
export async function updateProperty(
  propertyId: string,
  data: {
    address?: string;
    propertyType?: string;
    acquiredOn?: Date;
    principalAmount?: number;
    rateOfInterest?: number;
  },
) {
  try {
    const user = await requireAuth();

    // Check if user has access to this property via ownership
    const userOwners = await db
      .select()
      .from(userOwnerSchema)
      .where(eq(userOwnerSchema.userId, user.id));

    const ownerIds = userOwners.map((uo) => uo.ownerId);
    let hasAccess = false;

    if (ownerIds.length > 0) {
      const propertyOwners = await db
        .select()
        .from(propertyOwnerSchema)
        .where(and(eq(propertyOwnerSchema.propertyId, propertyId), inArray(propertyOwnerSchema.ownerId, ownerIds)));

      // Check if user has admin or editor role
      for (const po of propertyOwners) {
        const userOwner = userOwners.find((uo) => uo.ownerId === po.ownerId);
        if (userOwner && (userOwner.role === 'admin' || userOwner.role === 'editor')) {
          hasAccess = true;
          break;
        }
      }
    }

    // Fallback to legacy direct userId relationship
    if (!hasAccess) {
      const [legacyCheck] = await db
        .select()
        .from(propertySchema)
        .where(and(eq(propertySchema.id, propertyId), eq(propertySchema.userId, user.id)))
        .limit(1);

      hasAccess = !!legacyCheck;
    }

    if (!hasAccess) {
      return { success: false, property: null, error: 'Unauthorized' };
    }

    const [property] = await db
      .update(propertySchema)
      .set({
        address: data.address,
        propertyType: data.propertyType,
        acquiredOn: data.acquiredOn,
        principalAmount: data.principalAmount,
        rateOfInterest: data.rateOfInterest,
        updatedAt: new Date(),
      })
      .where(eq(propertySchema.id, propertyId))
      .returning();

    if (!property) {
      return { success: false, property: null, error: 'Property not found' };
    }

    return { success: true, property };
  } catch (error) {
    console.error('Error updating property:', error);
    return { success: false, property: null, error: 'Failed to update property' };
  }
}

/**
 * Delete a property (checks admin access via ownership)
 */
export async function deleteProperty(propertyId: string) {
  try {
    const user = await requireAuth();

    // Check if user has admin access to this property
    const userOwners = await db
      .select()
      .from(userOwnerSchema)
      .where(eq(userOwnerSchema.userId, user.id));

    const ownerIds = userOwners.map((uo) => uo.ownerId);
    let hasAdminAccess = false;

    if (ownerIds.length > 0) {
      const propertyOwners = await db
        .select()
        .from(propertyOwnerSchema)
        .where(and(eq(propertyOwnerSchema.propertyId, propertyId), inArray(propertyOwnerSchema.ownerId, ownerIds)));

      // Check if user has admin role
      for (const po of propertyOwners) {
        const userOwner = userOwners.find((uo) => uo.ownerId === po.ownerId);
        if (userOwner && userOwner.role === 'admin') {
          hasAdminAccess = true;
          break;
        }
      }
    }

    // Fallback to legacy direct userId relationship
    if (!hasAdminAccess) {
      const [legacyCheck] = await db
        .select()
        .from(propertySchema)
        .where(and(eq(propertySchema.id, propertyId), eq(propertySchema.userId, user.id)))
        .limit(1);

      hasAdminAccess = !!legacyCheck;
    }

    if (!hasAdminAccess) {
      return { success: false, error: 'Unauthorized' };
    }

    await db.delete(propertySchema).where(eq(propertySchema.id, propertyId));

    return { success: true };
  } catch (error) {
    console.error('Error deleting property:', error);
    return { success: false, error: 'Failed to delete property' };
  }
}

/**
 * Get property count for the current user (via ownership)
 */
export async function getPropertyCount() {
  try {
    const user = await requireAuth();

    // Get all owners linked to this user
    const userOwners = await db
      .select()
      .from(userOwnerSchema)
      .where(eq(userOwnerSchema.userId, user.id));

    if (userOwners.length === 0) {
      // Fallback to legacy direct userId relationship
      const properties = await db
        .select()
        .from(propertySchema)
        .where(eq(propertySchema.userId, user.id));

      return properties.length;
    }

    const ownerIds = userOwners.map((uo) => uo.ownerId);

    // Get all property-owner relationships for these owners
    const propertyOwners = await db
      .select()
      .from(propertyOwnerSchema)
      .where(inArray(propertyOwnerSchema.ownerId, ownerIds));

    // Get unique property IDs
    const uniquePropertyIds = [...new Set(propertyOwners.map((po) => po.propertyId))];

    return uniquePropertyIds.length;
  } catch (error) {
    console.error('Error counting properties:', error);
    return 0;
  }
}

/**
 * Get all units for the current user's properties (via ownership)
 */
export async function getUserUnits() {
  try {
    const user = await requireAuth();

    // Get all owners linked to this user
    const userOwners = await db
      .select()
      .from(userOwnerSchema)
      .where(eq(userOwnerSchema.userId, user.id));

    let propertyIds: string[] = [];

    if (userOwners.length === 0) {
      // Fallback to legacy direct userId relationship
      const legacyProperties = await db
        .select({ id: propertySchema.id })
        .from(propertySchema)
        .where(eq(propertySchema.userId, user.id));

      propertyIds = legacyProperties.map((p) => p.id);
    } else {
      const ownerIds = userOwners.map((uo) => uo.ownerId);

      // Get all property-owner relationships for these owners
      const propertyOwners = await db
        .select()
        .from(propertyOwnerSchema)
        .where(inArray(propertyOwnerSchema.ownerId, ownerIds));

      propertyIds = propertyOwners.map((po) => po.propertyId);
    }

    if (propertyIds.length === 0) {
      return { success: true, units: [] };
    }

    // Get property details for enrichment
    const properties = await db
      .select({ id: propertySchema.id, address: propertySchema.address })
      .from(propertySchema)
      .where(inArray(propertySchema.id, propertyIds));

    // Get all units for these properties
    const allUnits = await db
      .select()
      .from(unitSchema)
      .where(inArray(unitSchema.propertyId, propertyIds));

    // Enrich units with property address
    const enrichedUnits = allUnits.map((unit) => {
      const property = properties.find((p) => p.id === unit.propertyId);
      return {
        ...unit,
        propertyAddress: property?.address || 'Unknown',
      };
    });

    return { success: true, units: enrichedUnits };
  } catch (error) {
    console.error('Error fetching units:', error);
    return { success: false, units: [], error: 'Failed to fetch units' };
  }
}

/**
 * Create a new unit for a property
 */
export async function createUnit(data: {
  propertyId: string;
  unitNumber: string;
  rentAmount: number;
}) {
  try {
    const user = await requireAuth();

    // Verify the property belongs to the user
    const [property] = await db
      .select()
      .from(propertySchema)
      .where(and(eq(propertySchema.id, data.propertyId), eq(propertySchema.userId, user.id)))
      .limit(1);

    if (!property) {
      return { success: false, unit: null, error: 'Property not found or unauthorized' };
    }

    const [unit] = await db
      .insert(unitSchema)
      .values({
        propertyId: data.propertyId,
        unitNumber: data.unitNumber,
        rentAmount: data.rentAmount,
      })
      .returning();

    return { success: true, unit };
  } catch (error) {
    console.error('Error creating unit:', error);
    return { success: false, unit: null, error: 'Failed to create unit' };
  }
}

/**
 * Update a unit
 */
export async function updateUnit(
  unitId: string,
  data: {
    unitNumber?: string;
    rentAmount?: number;
  },
) {
  try {
    const user = await requireAuth();

    // Verify the unit belongs to the user's property
    const [existingUnit] = await db
      .select()
      .from(unitSchema)
      .where(eq(unitSchema.id, unitId))
      .limit(1);

    if (!existingUnit) {
      return { success: false, unit: null, error: 'Unit not found' };
    }

    const [property] = await db
      .select()
      .from(propertySchema)
      .where(
        and(eq(propertySchema.id, existingUnit.propertyId), eq(propertySchema.userId, user.id)),
      )
      .limit(1);

    if (!property) {
      return { success: false, unit: null, error: 'Unauthorized' };
    }

    const [unit] = await db
      .update(unitSchema)
      .set({
        unitNumber: data.unitNumber,
        rentAmount: data.rentAmount,
        updatedAt: new Date(),
      })
      .where(eq(unitSchema.id, unitId))
      .returning();

    return { success: true, unit };
  } catch (error) {
    console.error('Error updating unit:', error);
    return { success: false, unit: null, error: 'Failed to update unit' };
  }
}

/**
 * Delete a unit
 */
export async function deleteUnit(unitId: string) {
  try {
    const user = await requireAuth();

    // Verify the unit belongs to the user's property
    const [unit] = await db.select().from(unitSchema).where(eq(unitSchema.id, unitId)).limit(1);

    if (!unit) {
      return { success: false, error: 'Unit not found' };
    }

    const [property] = await db
      .select()
      .from(propertySchema)
      .where(and(eq(propertySchema.id, unit.propertyId), eq(propertySchema.userId, user.id)))
      .limit(1);

    if (!property) {
      return { success: false, error: 'Unauthorized' };
    }

    await db.delete(unitSchema).where(eq(unitSchema.id, unitId));

    return { success: true };
  } catch (error) {
    console.error('Error deleting unit:', error);
    return { success: false, error: 'Failed to delete unit' };
  }
}
