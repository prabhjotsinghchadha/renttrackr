'use server';

import { and, eq, inArray } from 'drizzle-orm';
import { requireAuth } from '@/helpers/AuthHelper';
import { db } from '@/libs/DB';
import { leaseSchema, propertySchema, tenantSchema, unitSchema } from '@/models/Schema';

/**
 * Get all leases for the current user's properties
 */
export async function getUserLeases() {
  try {
    const user = await requireAuth();

    // Get all user's property IDs
    const properties = await db
      .select({ id: propertySchema.id })
      .from(propertySchema)
      .where(eq(propertySchema.userId, user.id));

    if (properties.length === 0) {
      return { success: true, leases: [] };
    }

    const propertyIds = properties.map((p) => p.id);

    // Get all tenants for these properties (both with and without units)
    const tenants = await db
      .select({ id: tenantSchema.id })
      .from(tenantSchema)
      .where(inArray(tenantSchema.propertyId, propertyIds));

    if (tenants.length === 0) {
      return { success: true, leases: [] };
    }

    const tenantIds = tenants.map((t) => t.id);

    // Get all leases for these tenants
    const leases = await db
      .select()
      .from(leaseSchema)
      .where(inArray(leaseSchema.tenantId, tenantIds));

    return { success: true, leases };
  } catch (error) {
    console.error('Error fetching leases:', error);
    return { success: false, leases: [], error: 'Failed to fetch leases' };
  }
}

/**
 * Get all leases with tenant information (for dropdowns)
 */
export async function getLeasesWithTenantInfo() {
  try {
    const user = await requireAuth();

    // Get all user's property IDs
    const properties = await db
      .select({ id: propertySchema.id })
      .from(propertySchema)
      .where(eq(propertySchema.userId, user.id));

    if (properties.length === 0) {
      return { success: true, leases: [] };
    }

    const propertyIds = properties.map((p) => p.id);

    // Get all units for these properties
    const units = await db
      .select()
      .from(unitSchema)
      .where(inArray(unitSchema.propertyId, propertyIds));

    // Get all tenants for these properties (both with and without units)
    const tenants = await db
      .select()
      .from(tenantSchema)
      .where(inArray(tenantSchema.propertyId, propertyIds));

    if (tenants.length === 0) {
      return { success: true, leases: [] };
    }

    const tenantIds = tenants.map((t) => t.id);

    // Get all leases for these tenants
    const leases = await db
      .select()
      .from(leaseSchema)
      .where(inArray(leaseSchema.tenantId, tenantIds));

    // Combine lease, tenant, and unit information
    const leasesWithInfo = leases.map((lease) => {
      const tenant = tenants.find((t) => t.id === lease.tenantId);
      const unit = units.find((u) => u.id === tenant?.unitId);

      return {
        ...lease,
        tenantName: tenant?.name || 'Unknown',
        tenantId: tenant?.id || '',
        unitId: unit?.id || null,
        unitNumber: unit?.unitNumber || null,
      };
    });

    return { success: true, leases: leasesWithInfo };
  } catch (error) {
    console.error('Error fetching leases with tenant info:', error);
    return { success: false, leases: [], error: 'Failed to fetch leases' };
  }
}

/**
 * Get leases for a specific tenant
 */
export async function getLeasesByTenantId(tenantId: string) {
  try {
    const user = await requireAuth();

    // Get the tenant
    const [tenant] = await db
      .select()
      .from(tenantSchema)
      .where(eq(tenantSchema.id, tenantId))
      .limit(1);

    if (!tenant) {
      return { success: false, leases: [], error: 'Tenant not found' };
    }

    // Verify ownership
    // For tenants with units, check through unit -> property
    // For tenants without units, check directly through property
    if (tenant.unitId) {
      const [unit] = await db
        .select()
        .from(unitSchema)
        .where(eq(unitSchema.id, tenant.unitId))
        .limit(1);

      if (!unit) {
        return { success: false, leases: [], error: 'Unit not found' };
      }

      const [property] = await db
        .select()
        .from(propertySchema)
        .where(and(eq(propertySchema.id, unit.propertyId), eq(propertySchema.userId, user.id)))
        .limit(1);

      if (!property) {
        return { success: false, leases: [], error: 'Unauthorized' };
      }
    } else {
      // For tenants without units (single-family properties), check directly through property
      const [property] = await db
        .select()
        .from(propertySchema)
        .where(and(eq(propertySchema.id, tenant.propertyId), eq(propertySchema.userId, user.id)))
        .limit(1);

      if (!property) {
        return { success: false, leases: [], error: 'Unauthorized' };
      }
    }

    // Get all leases for this tenant
    const leases = await db.select().from(leaseSchema).where(eq(leaseSchema.tenantId, tenantId));

    return { success: true, leases };
  } catch (error) {
    console.error('Error fetching leases for tenant:', error);
    return { success: false, leases: [], error: 'Failed to fetch leases' };
  }
}

/**
 * Get a single lease by ID
 */
export async function getLeaseById(leaseId: string) {
  try {
    const user = await requireAuth();

    const [lease] = await db.select().from(leaseSchema).where(eq(leaseSchema.id, leaseId)).limit(1);

    if (!lease) {
      return { success: false, lease: null, error: 'Lease not found' };
    }

    // Verify the lease belongs to the user's property
    const [tenant] = await db
      .select()
      .from(tenantSchema)
      .where(eq(tenantSchema.id, lease.tenantId))
      .limit(1);

    if (!tenant) {
      return { success: false, lease: null, error: 'Tenant not found' };
    }

    // For tenants with units, check through unit -> property
    // For tenants without units, check directly through property
    if (tenant.unitId) {
      const [unit] = await db
        .select()
        .from(unitSchema)
        .where(eq(unitSchema.id, tenant.unitId))
        .limit(1);

      if (!unit) {
        return { success: false, lease: null, error: 'Unit not found' };
      }

      const [property] = await db
        .select()
        .from(propertySchema)
        .where(and(eq(propertySchema.id, unit.propertyId), eq(propertySchema.userId, user.id)))
        .limit(1);

      if (!property) {
        return { success: false, lease: null, error: 'Unauthorized' };
      }
    } else {
      // For tenants without units (single-family properties), check directly through property
      const [property] = await db
        .select()
        .from(propertySchema)
        .where(and(eq(propertySchema.id, tenant.propertyId), eq(propertySchema.userId, user.id)))
        .limit(1);

      if (!property) {
        return { success: false, lease: null, error: 'Unauthorized' };
      }
    }

    return { success: true, lease };
  } catch (error) {
    console.error('Error fetching lease:', error);
    return { success: false, lease: null, error: 'Failed to fetch lease' };
  }
}

/**
 * Create a new lease
 */
export async function createLease(data: {
  tenantId: string;
  startDate: Date;
  endDate: Date;
  deposit: number;
  securityDeposit?: number;
  petDeposit?: number;
  rent: number;
}) {
  try {
    const user = await requireAuth();

    // Verify the tenant belongs to the user
    const [tenant] = await db
      .select()
      .from(tenantSchema)
      .where(eq(tenantSchema.id, data.tenantId))
      .limit(1);

    if (!tenant) {
      return { success: false, lease: null, error: 'Tenant not found' };
    }

    // For tenants with units, check through unit -> property
    // For tenants without units, check directly through property
    if (tenant.unitId) {
      const [unit] = await db
        .select()
        .from(unitSchema)
        .where(eq(unitSchema.id, tenant.unitId))
        .limit(1);

      if (!unit) {
        return { success: false, lease: null, error: 'Unit not found' };
      }

      const [property] = await db
        .select()
        .from(propertySchema)
        .where(and(eq(propertySchema.id, unit.propertyId), eq(propertySchema.userId, user.id)))
        .limit(1);

      if (!property) {
        return { success: false, lease: null, error: 'Unauthorized' };
      }
    } else {
      // For tenants without units (single-family properties), check directly through property
      const [property] = await db
        .select()
        .from(propertySchema)
        .where(and(eq(propertySchema.id, tenant.propertyId), eq(propertySchema.userId, user.id)))
        .limit(1);

      if (!property) {
        return { success: false, lease: null, error: 'Unauthorized' };
      }
    }

    const [lease] = await db
      .insert(leaseSchema)
      .values({
        tenantId: data.tenantId,
        startDate: data.startDate,
        endDate: data.endDate,
        deposit: data.deposit,
        securityDeposit: data.securityDeposit,
        petDeposit: data.petDeposit,
        rent: data.rent,
      })
      .returning();

    return { success: true, lease };
  } catch (error) {
    console.error('Error creating lease:', error);
    return { success: false, lease: null, error: 'Failed to create lease' };
  }
}

/**
 * Update a lease
 */
export async function updateLease(
  leaseId: string,
  data: {
    startDate?: Date;
    endDate?: Date;
    deposit?: number;
    securityDeposit?: number;
    petDeposit?: number;
    rent?: number;
  },
) {
  try {
    await requireAuth();

    // Verify ownership
    const leaseCheck = await getLeaseById(leaseId);
    if (!leaseCheck.success) {
      return { success: false, lease: null, error: leaseCheck.error };
    }

    const [lease] = await db
      .update(leaseSchema)
      .set({
        startDate: data.startDate,
        endDate: data.endDate,
        deposit: data.deposit,
        securityDeposit: data.securityDeposit,
        petDeposit: data.petDeposit,
        rent: data.rent,
        updatedAt: new Date(),
      })
      .where(eq(leaseSchema.id, leaseId))
      .returning();

    return { success: true, lease };
  } catch (error) {
    console.error('Error updating lease:', error);
    return { success: false, lease: null, error: 'Failed to update lease' };
  }
}

/**
 * Delete a lease
 */
export async function deleteLease(leaseId: string) {
  try {
    await requireAuth();

    // Verify ownership
    const leaseCheck = await getLeaseById(leaseId);
    if (!leaseCheck.success) {
      return { success: false, error: leaseCheck.error };
    }

    await db.delete(leaseSchema).where(eq(leaseSchema.id, leaseId));

    return { success: true };
  } catch (error) {
    console.error('Error deleting lease:', error);
    return { success: false, error: 'Failed to delete lease' };
  }
}
