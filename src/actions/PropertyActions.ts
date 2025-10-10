'use server';

import { and, eq } from 'drizzle-orm';
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
      .where(and(
        eq(propertySchema.id, propertyId),
        eq(propertySchema.userId, user.id)
      ))
      .limit(1);
    
    if (!property) {
      return { success: false, property: null, error: 'Property not found' };
    }
    
    // Get units for this property
    const units = await db
      .select()
      .from(unitSchema)
      .where(eq(unitSchema.propertyId, propertyId));
    
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
}) {
  try {
    const user = await requireAuth();
    
    const [property] = await db
      .insert(propertySchema)
      .values({
        userId: user.id,
        address: data.address,
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
  }
) {
  try {
    const user = await requireAuth();
    
    const [property] = await db
      .update(propertySchema)
      .set({
        address: data.address,
        updatedAt: new Date(),
      })
      .where(and(
        eq(propertySchema.id, propertyId),
        eq(propertySchema.userId, user.id)
      ))
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
      .where(and(
        eq(propertySchema.id, propertyId),
        eq(propertySchema.userId, user.id)
      ));
    
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

