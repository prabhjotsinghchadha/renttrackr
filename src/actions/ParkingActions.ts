'use server';

import { and, eq, inArray, sql } from 'drizzle-orm';
import { requireAuth } from '@/helpers/AuthHelper';
import { db } from '@/libs/DB';
import {
  parkingActivitySchema,
  parkingPermitSchema,
  propertySchema,
  tenantSchema,
  unitSchema,
} from '@/models/Schema';

/**
 * Get all parking permits for the current user's properties
 */
export async function getUserParkingPermits() {
  try {
    const user = await requireAuth();

    // Get all user's property IDs
    const properties = await db
      .select({ id: propertySchema.id })
      .from(propertySchema)
      .where(eq(propertySchema.userId, user.id));

    if (properties.length === 0) {
      return { success: true, permits: [] };
    }

    const propertyIds = properties.map((p) => p.id);

    // Get all parking permits for these properties
    const permits = await db
      .select()
      .from(parkingPermitSchema)
      .where(inArray(parkingPermitSchema.propertyId, propertyIds))
      .orderBy(sql`${parkingPermitSchema.issuedAt} DESC`);

    return { success: true, permits };
  } catch (error) {
    console.error('Error fetching parking permits:', error);
    return { success: false, permits: [], error: 'Failed to fetch parking permits' };
  }
}

/**
 * Get all parking permits with property and tenant information
 */
export async function getParkingPermitsWithDetails() {
  try {
    const user = await requireAuth();

    // Get all user's properties
    const properties = await db
      .select()
      .from(propertySchema)
      .where(eq(propertySchema.userId, user.id));

    if (properties.length === 0) {
      return { success: true, permits: [] };
    }

    const propertyIds = properties.map((p) => p.id);

    // Get all units for these properties
    const units = await db
      .select()
      .from(unitSchema)
      .where(inArray(unitSchema.propertyId, propertyIds));

    // Get all tenants for these units
    const tenants = await db
      .select()
      .from(tenantSchema)
      .where(
        inArray(
          tenantSchema.unitId,
          units.map((u) => u.id),
        ),
      );

    // Get all parking permits for these properties
    const permits = await db
      .select()
      .from(parkingPermitSchema)
      .where(inArray(parkingPermitSchema.propertyId, propertyIds))
      .orderBy(sql`${parkingPermitSchema.issuedAt} DESC`);

    // Combine permit, property, and tenant information
    const permitsWithDetails = permits.map((permit) => {
      const property = properties.find((p) => p.id === permit.propertyId);
      const tenant = permit.tenantId ? tenants.find((t) => t.id === permit.tenantId) : null;
      const unit = tenant ? units.find((u) => u.id === tenant.unitId) : null;

      return {
        ...permit,
        propertyAddress: property?.address || 'Unknown',
        tenantName: tenant?.name || null,
        unitNumber: unit?.unitNumber || null,
      };
    });

    return { success: true, permits: permitsWithDetails };
  } catch (error) {
    console.error('Error fetching parking permits with details:', error);
    return { success: false, permits: [], error: 'Failed to fetch parking permits' };
  }
}

/**
 * Get a single parking permit by ID
 */
export async function getParkingPermitById(permitId: string) {
  try {
    const user = await requireAuth();

    const [permit] = await db
      .select()
      .from(parkingPermitSchema)
      .where(eq(parkingPermitSchema.id, permitId))
      .limit(1);

    if (!permit) {
      return { success: false, permit: null, error: 'Parking permit not found' };
    }

    // Verify ownership
    const [property] = await db
      .select()
      .from(propertySchema)
      .where(and(eq(propertySchema.id, permit.propertyId), eq(propertySchema.userId, user.id)))
      .limit(1);

    if (!property) {
      return { success: false, permit: null, error: 'Unauthorized' };
    }

    return { success: true, permit };
  } catch (error) {
    console.error('Error fetching parking permit:', error);
    return { success: false, permit: null, error: 'Failed to fetch parking permit' };
  }
}

/**
 * Create a new parking permit
 */
export async function createParkingPermit(data: {
  propertyId: string;
  tenantId?: string;
  building?: string;
  permitNumber: string;
  status?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  vehicleColor?: string;
  licensePlate?: string;
  comments?: string;
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
      return { success: false, permit: null, error: 'Property not found or unauthorized' };
    }

    // If tenantId is provided, verify it belongs to the user's properties
    if (data.tenantId) {
      const [tenant] = await db
        .select()
        .from(tenantSchema)
        .where(eq(tenantSchema.id, data.tenantId))
        .limit(1);

      if (!tenant) {
        return { success: false, permit: null, error: 'Tenant not found' };
      }

      const [unit] = await db
        .select()
        .from(unitSchema)
        .where(eq(unitSchema.id, tenant.unitId))
        .limit(1);

      if (!unit) {
        return { success: false, permit: null, error: 'Unit not found' };
      }

      const [tenantProperty] = await db
        .select()
        .from(propertySchema)
        .where(and(eq(propertySchema.id, unit.propertyId), eq(propertySchema.userId, user.id)))
        .limit(1);

      if (!tenantProperty) {
        return { success: false, permit: null, error: 'Tenant does not belong to your properties' };
      }
    }

    const [permit] = await db
      .insert(parkingPermitSchema)
      .values({
        propertyId: data.propertyId,
        tenantId: data.tenantId || null,
        building: data.building || null,
        permitNumber: data.permitNumber,
        status: data.status || 'Active',
        vehicleMake: data.vehicleMake || null,
        vehicleModel: data.vehicleModel || null,
        vehicleYear: data.vehicleYear || null,
        vehicleColor: data.vehicleColor || null,
        licensePlate: data.licensePlate || null,
        comments: data.comments || null,
      })
      .returning();

    return { success: true, permit };
  } catch (error) {
    console.error('Error creating parking permit:', error);
    return { success: false, permit: null, error: 'Failed to create parking permit' };
  }
}

/**
 * Update a parking permit
 */
export async function updateParkingPermit(
  permitId: string,
  data: {
    building?: string;
    permitNumber?: string;
    status?: string;
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleYear?: string;
    vehicleColor?: string;
    licensePlate?: string;
    comments?: string;
  },
) {
  try {
    await requireAuth();

    // Verify ownership
    const permitCheck = await getParkingPermitById(permitId);
    if (!permitCheck.success) {
      return { success: false, permit: null, error: permitCheck.error };
    }

    const [permit] = await db
      .update(parkingPermitSchema)
      .set({
        building: data.building,
        permitNumber: data.permitNumber,
        status: data.status,
        vehicleMake: data.vehicleMake,
        vehicleModel: data.vehicleModel,
        vehicleYear: data.vehicleYear,
        vehicleColor: data.vehicleColor,
        licensePlate: data.licensePlate,
        comments: data.comments,
        updatedAt: new Date(),
      })
      .where(eq(parkingPermitSchema.id, permitId))
      .returning();

    return { success: true, permit };
  } catch (error) {
    console.error('Error updating parking permit:', error);
    return { success: false, permit: null, error: 'Failed to update parking permit' };
  }
}

/**
 * Delete a parking permit
 */
export async function deleteParkingPermit(permitId: string) {
  try {
    await requireAuth();

    // Verify ownership
    const permitCheck = await getParkingPermitById(permitId);
    if (!permitCheck.success) {
      return { success: false, error: permitCheck.error };
    }

    await db.delete(parkingPermitSchema).where(eq(parkingPermitSchema.id, permitId));

    return { success: true };
  } catch (error) {
    console.error('Error deleting parking permit:', error);
    return { success: false, error: 'Failed to delete parking permit' };
  }
}

/**
 * Get parking activity for a specific permit
 */
export async function getParkingActivity(permitId: string) {
  try {
    await requireAuth();

    // Verify ownership through permit
    const permitCheck = await getParkingPermitById(permitId);
    if (!permitCheck.success) {
      return { success: false, activities: [], error: permitCheck.error };
    }

    const activities = await db
      .select()
      .from(parkingActivitySchema)
      .where(eq(parkingActivitySchema.parkingPermitId, permitId))
      .orderBy(sql`${parkingActivitySchema.createdAt} DESC`);

    return { success: true, activities };
  } catch (error) {
    console.error('Error fetching parking activity:', error);
    return { success: false, activities: [], error: 'Failed to fetch parking activity' };
  }
}

/**
 * Add activity note to a parking permit
 */
export async function addParkingActivity(data: { parkingPermitId: string; note: string }) {
  try {
    await requireAuth();

    // Verify ownership through permit
    const permitCheck = await getParkingPermitById(data.parkingPermitId);
    if (!permitCheck.success) {
      return { success: false, activity: null, error: permitCheck.error };
    }

    const [activity] = await db
      .insert(parkingActivitySchema)
      .values({
        parkingPermitId: data.parkingPermitId,
        note: data.note,
      })
      .returning();

    return { success: true, activity };
  } catch (error) {
    console.error('Error adding parking activity:', error);
    return { success: false, activity: null, error: 'Failed to add parking activity' };
  }
}

/**
 * Get parking permit metrics for the current user
 */
export async function getParkingMetrics() {
  try {
    const result = await getUserParkingPermits();

    if (!result.success || !result.permits) {
      return {
        totalPermits: 0,
        activePermits: 0,
        cancelledPermits: 0,
        expiringSoon: 0,
      };
    }

    const totalPermits = result.permits.length;
    const activePermits = result.permits.filter((p) => p.status === 'Active').length;
    const cancelledPermits = result.permits.filter((p) => p.status === 'Cancelled').length;

    // For now, expiringSoon is 0 since we don't have expiration dates
    // This can be enhanced later with expiration date tracking
    const expiringSoon = 0;

    return {
      totalPermits,
      activePermits,
      cancelledPermits,
      expiringSoon,
    };
  } catch (error) {
    console.error('Error calculating parking metrics:', error);
    return {
      totalPermits: 0,
      activePermits: 0,
      cancelledPermits: 0,
      expiringSoon: 0,
    };
  }
}
