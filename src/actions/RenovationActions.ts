'use server';

import { and, eq, inArray, sql } from 'drizzle-orm';
import { requireAuth } from '@/helpers/AuthHelper';
import { db } from '@/libs/DB';
import {
  propertySchema,
  renovationItemSchema,
  renovationSchema,
  unitSchema,
} from '@/models/Schema';

/**
 * Get all renovations for the current user's properties
 */
export async function getUserRenovations() {
  try {
    const user = await requireAuth();

    // Get all user's property IDs
    const properties = await db
      .select({ id: propertySchema.id })
      .from(propertySchema)
      .where(eq(propertySchema.userId, user.id));

    if (properties.length === 0) {
      return { success: true, renovations: [] };
    }

    const propertyIds = properties.map((p) => p.id);

    // Get all renovations for these properties
    const renovations = await db
      .select()
      .from(renovationSchema)
      .where(inArray(renovationSchema.propertyId, propertyIds))
      .orderBy(sql`${renovationSchema.createdAt} DESC`);

    return { success: true, renovations };
  } catch (error) {
    console.error('Error fetching renovations:', error);
    return { success: false, renovations: [], error: 'Failed to fetch renovations' };
  }
}

/**
 * Get all renovations with property and unit information
 */
export async function getRenovationsWithDetails() {
  try {
    const user = await requireAuth();

    // Get all user's properties
    const properties = await db
      .select()
      .from(propertySchema)
      .where(eq(propertySchema.userId, user.id));

    if (properties.length === 0) {
      return { success: true, renovations: [] };
    }

    const propertyIds = properties.map((p) => p.id);

    // Get all units for these properties
    const units = await db
      .select()
      .from(unitSchema)
      .where(inArray(unitSchema.propertyId, propertyIds));

    // Get all renovations for these properties
    const renovations = await db
      .select()
      .from(renovationSchema)
      .where(inArray(renovationSchema.propertyId, propertyIds))
      .orderBy(sql`${renovationSchema.createdAt} DESC`);

    // Combine renovation, property, and unit information
    const renovationsWithDetails = renovations.map((renovation) => {
      const property = properties.find((p) => p.id === renovation.propertyId);
      const unit = renovation.unitId ? units.find((u) => u.id === renovation.unitId) : null;

      return {
        ...renovation,
        propertyAddress: property?.address || 'Unknown',
        unitNumber: unit?.unitNumber || null,
      };
    });

    return { success: true, renovations: renovationsWithDetails };
  } catch (error) {
    console.error('Error fetching renovations with details:', error);
    return { success: false, renovations: [], error: 'Failed to fetch renovations' };
  }
}

/**
 * Get a single renovation by ID
 */
export async function getRenovationById(renovationId: string) {
  try {
    const user = await requireAuth();

    const [renovation] = await db
      .select()
      .from(renovationSchema)
      .where(eq(renovationSchema.id, renovationId))
      .limit(1);

    if (!renovation) {
      return { success: false, renovation: null, error: 'Renovation not found' };
    }

    // Verify ownership
    const [property] = await db
      .select()
      .from(propertySchema)
      .where(and(eq(propertySchema.id, renovation.propertyId), eq(propertySchema.userId, user.id)))
      .limit(1);

    if (!property) {
      return { success: false, renovation: null, error: 'Unauthorized' };
    }

    return { success: true, renovation };
  } catch (error) {
    console.error('Error fetching renovation:', error);
    return { success: false, renovation: null, error: 'Failed to fetch renovation' };
  }
}

/**
 * Create a new renovation
 */
export async function createRenovation(data: {
  propertyId: string;
  unitId?: string;
  title: string;
  startDate?: Date;
  endDate?: Date;
  totalCost?: number;
  notes?: string;
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
      return { success: false, renovation: null, error: 'Property not found or unauthorized' };
    }

    // If unitId is provided, verify it belongs to the property
    if (data.unitId) {
      const [unit] = await db
        .select()
        .from(unitSchema)
        .where(and(eq(unitSchema.id, data.unitId), eq(unitSchema.propertyId, data.propertyId)))
        .limit(1);

      if (!unit) {
        return {
          success: false,
          renovation: null,
          error: 'Unit not found or does not belong to property',
        };
      }
    }

    const [renovation] = await db
      .insert(renovationSchema)
      .values({
        propertyId: data.propertyId,
        unitId: data.unitId || null,
        title: data.title,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
        totalCost: data.totalCost || 0,
        notes: data.notes || null,
      })
      .returning();

    return { success: true, renovation };
  } catch (error) {
    console.error('Error creating renovation:', error);
    return { success: false, renovation: null, error: 'Failed to create renovation' };
  }
}

/**
 * Update a renovation
 */
export async function updateRenovation(
  renovationId: string,
  data: {
    title?: string;
    startDate?: Date;
    endDate?: Date;
    totalCost?: number;
    notes?: string;
  },
) {
  try {
    await requireAuth();

    // Verify ownership
    const renovationCheck = await getRenovationById(renovationId);
    if (!renovationCheck.success) {
      return { success: false, renovation: null, error: renovationCheck.error };
    }

    const [renovation] = await db
      .update(renovationSchema)
      .set({
        title: data.title,
        startDate: data.startDate,
        endDate: data.endDate,
        totalCost: data.totalCost,
        notes: data.notes,
        updatedAt: new Date(),
      })
      .where(eq(renovationSchema.id, renovationId))
      .returning();

    return { success: true, renovation };
  } catch (error) {
    console.error('Error updating renovation:', error);
    return { success: false, renovation: null, error: 'Failed to update renovation' };
  }
}

/**
 * Delete a renovation
 */
export async function deleteRenovation(renovationId: string) {
  try {
    await requireAuth();

    // Verify ownership
    const renovationCheck = await getRenovationById(renovationId);
    if (!renovationCheck.success) {
      return { success: false, error: renovationCheck.error };
    }

    await db.delete(renovationSchema).where(eq(renovationSchema.id, renovationId));

    return { success: true };
  } catch (error) {
    console.error('Error deleting renovation:', error);
    return { success: false, error: 'Failed to delete renovation' };
  }
}

/**
 * Get renovation items for a specific renovation
 */
export async function getRenovationItems(renovationId: string) {
  try {
    await requireAuth();

    // Verify ownership through renovation
    const renovationCheck = await getRenovationById(renovationId);
    if (!renovationCheck.success) {
      return { success: false, items: [], error: renovationCheck.error };
    }

    const items = await db
      .select()
      .from(renovationItemSchema)
      .where(eq(renovationItemSchema.renovationId, renovationId))
      .orderBy(sql`${renovationItemSchema.createdAt} DESC`);

    return { success: true, items };
  } catch (error) {
    console.error('Error fetching renovation items:', error);
    return { success: false, items: [], error: 'Failed to fetch renovation items' };
  }
}

/**
 * Create a new renovation item
 */
export async function createRenovationItem(data: {
  renovationId: string;
  category: string;
  description?: string;
  vendor?: string;
  quantity?: number;
  unitCost?: number;
  totalCost?: number;
  purchaseDate?: Date;
  notes?: string;
}) {
  try {
    await requireAuth();

    // Verify ownership through renovation
    const renovationCheck = await getRenovationById(data.renovationId);
    if (!renovationCheck.success) {
      return { success: false, item: null, error: renovationCheck.error };
    }

    const [item] = await db
      .insert(renovationItemSchema)
      .values({
        renovationId: data.renovationId,
        category: data.category,
        description: data.description || null,
        vendor: data.vendor || null,
        quantity: data.quantity || 1,
        unitCost: data.unitCost || null,
        totalCost: data.totalCost || null,
        purchaseDate: data.purchaseDate || null,
        notes: data.notes || null,
      })
      .returning();

    return { success: true, item };
  } catch (error) {
    console.error('Error creating renovation item:', error);
    return { success: false, item: null, error: 'Failed to create renovation item' };
  }
}

/**
 * Update a renovation item
 */
export async function updateRenovationItem(
  itemId: string,
  data: {
    category?: string;
    description?: string;
    vendor?: string;
    quantity?: number;
    unitCost?: number;
    totalCost?: number;
    purchaseDate?: Date;
    notes?: string;
  },
) {
  try {
    await requireAuth();

    // Get the item to verify ownership through renovation
    const [item] = await db
      .select()
      .from(renovationItemSchema)
      .where(eq(renovationItemSchema.id, itemId))
      .limit(1);

    if (!item) {
      return { success: false, item: null, error: 'Renovation item not found' };
    }

    // Verify ownership through renovation
    const renovationCheck = await getRenovationById(item.renovationId);
    if (!renovationCheck.success) {
      return { success: false, item: null, error: renovationCheck.error };
    }

    const [updatedItem] = await db
      .update(renovationItemSchema)
      .set({
        category: data.category,
        description: data.description,
        vendor: data.vendor,
        quantity: data.quantity,
        unitCost: data.unitCost,
        totalCost: data.totalCost,
        purchaseDate: data.purchaseDate,
        notes: data.notes,
        updatedAt: new Date(),
      })
      .where(eq(renovationItemSchema.id, itemId))
      .returning();

    return { success: true, item: updatedItem };
  } catch (error) {
    console.error('Error updating renovation item:', error);
    return { success: false, item: null, error: 'Failed to update renovation item' };
  }
}

/**
 * Delete a renovation item
 */
export async function deleteRenovationItem(itemId: string) {
  try {
    await requireAuth();

    // Get the item to verify ownership through renovation
    const [item] = await db
      .select()
      .from(renovationItemSchema)
      .where(eq(renovationItemSchema.id, itemId))
      .limit(1);

    if (!item) {
      return { success: false, error: 'Renovation item not found' };
    }

    // Verify ownership through renovation
    const renovationCheck = await getRenovationById(item.renovationId);
    if (!renovationCheck.success) {
      return { success: false, error: renovationCheck.error };
    }

    await db.delete(renovationItemSchema).where(eq(renovationItemSchema.id, itemId));

    return { success: true };
  } catch (error) {
    console.error('Error deleting renovation item:', error);
    return { success: false, error: 'Failed to delete renovation item' };
  }
}

/**
 * Get renovation metrics for the current user
 */
export async function getRenovationMetrics() {
  try {
    const result = await getUserRenovations();

    if (!result.success || !result.renovations) {
      return {
        pending: 0,
        inProgress: 0,
        completed: 0,
        totalCost: 0,
      };
    }

    const now = new Date();
    const pending = result.renovations.filter((r) => !r.startDate).length;
    const inProgress = result.renovations.filter(
      (r) => r.startDate && (!r.endDate || new Date(r.endDate) >= now),
    ).length;
    const completed = result.renovations.filter(
      (r) => r.endDate && new Date(r.endDate) < now,
    ).length;
    const totalCost = result.renovations.reduce((sum, r) => sum + (r.totalCost || 0), 0);

    return {
      pending,
      inProgress,
      completed,
      totalCost,
    };
  } catch (error) {
    console.error('Error calculating renovation metrics:', error);
    return {
      pending: 0,
      inProgress: 0,
      completed: 0,
      totalCost: 0,
    };
  }
}
