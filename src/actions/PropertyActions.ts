'use server';

import { and, eq, inArray } from 'drizzle-orm';
import { requireAuth } from '@/helpers/AuthHelper';
import { db } from '@/libs/DB';
import { propertySchema, unitSchema } from '@/models/Schema';

/**
 * Get all properties for the current user
 */
export async function getUserProperties() {
  try {
    const user = await requireAuth();

    const properties = await db
      .select()
      .from(propertySchema)
      .where(eq(propertySchema.userId, user.id));

    return { success: true, properties };
  } catch (error) {
    console.error('Error fetching properties:', error);
    return { success: false, properties: [], error: 'Failed to fetch properties' };
  }
}

/**
 * Get a single property by ID (with units)
 */
export async function getPropertyById(propertyId: string) {
  try {
    const user = await requireAuth();

    const [property] = await db
      .select()
      .from(propertySchema)
      .where(and(eq(propertySchema.id, propertyId), eq(propertySchema.userId, user.id)))
      .limit(1);

    if (!property) {
      return { success: false, property: null, error: 'Property not found' };
    }

    // Get units for this property
    const units = await db.select().from(unitSchema).where(eq(unitSchema.propertyId, propertyId));

    return { success: true, property, units };
  } catch (error) {
    console.error('Error fetching property:', error);
    return { success: false, property: null, units: [], error: 'Failed to fetch property' };
  }
}

/**
 * Create a new property
 */
export async function createProperty(data: {
  address: string;
  propertyType?: string;
  acquiredOn?: Date;
  principalAmount?: number;
  rateOfInterest?: number;
}) {
  try {
    const user = await requireAuth();

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

    return { success: true, property };
  } catch (error) {
    console.error('Error creating property:', error);
    return { success: false, property: null, error: 'Failed to create property' };
  }
}

/**
 * Update a property
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
      .where(and(eq(propertySchema.id, propertyId), eq(propertySchema.userId, user.id)))
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
 * Delete a property
 */
export async function deleteProperty(propertyId: string) {
  try {
    const user = await requireAuth();

    await db
      .delete(propertySchema)
      .where(and(eq(propertySchema.id, propertyId), eq(propertySchema.userId, user.id)));

    return { success: true };
  } catch (error) {
    console.error('Error deleting property:', error);
    return { success: false, error: 'Failed to delete property' };
  }
}

/**
 * Get property count for the current user
 */
export async function getPropertyCount() {
  try {
    const user = await requireAuth();

    const properties = await db
      .select()
      .from(propertySchema)
      .where(eq(propertySchema.userId, user.id));

    return properties.length;
  } catch (error) {
    console.error('Error counting properties:', error);
    return 0;
  }
}

/**
 * Get all units for the current user's properties
 */
export async function getUserUnits() {
  try {
    const user = await requireAuth();

    // Get all user's property IDs
    const properties = await db
      .select({ id: propertySchema.id, address: propertySchema.address })
      .from(propertySchema)
      .where(eq(propertySchema.userId, user.id));

    if (properties.length === 0) {
      return { success: true, units: [] };
    }

    const propertyIds = properties.map((p) => p.id);

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
