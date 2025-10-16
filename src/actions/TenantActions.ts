'use server';

import { and, eq, inArray } from 'drizzle-orm';
import { requireAuth } from '@/helpers/AuthHelper';
import { db } from '@/libs/DB';
import { propertySchema, tenantSchema, unitSchema } from '@/models/Schema';

/**
 * Get all tenants for the current user's properties
 */
export async function getUserTenants() {
  try {
    const user = await requireAuth();

    // Get all user's property IDs
    const properties = await db
      .select({ id: propertySchema.id })
      .from(propertySchema)
      .where(eq(propertySchema.userId, user.id));

    if (properties.length === 0) {
      return { success: true, tenants: [] };
    }

    const propertyIds = properties.map((p) => p.id);

    // Get all tenants for these properties (both with and without units)
    const tenants = await db
      .select()
      .from(tenantSchema)
      .where(inArray(tenantSchema.propertyId, propertyIds));

    return { success: true, tenants };
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return { success: false, tenants: [], error: 'Failed to fetch tenants' };
  }
}

/**
 * Get a single tenant by ID
 */
export async function getTenantById(tenantId: string) {
  try {
    const user = await requireAuth();

    const [tenant] = await db
      .select()
      .from(tenantSchema)
      .where(eq(tenantSchema.id, tenantId))
      .limit(1);

    if (!tenant) {
      return { success: false, tenant: null, error: 'Tenant not found' };
    }

    // Verify the tenant belongs to the user's property
    // For tenants with units, check through unit -> property
    // For tenants without units, check directly through property
    if (tenant.unitId) {
      const [unit] = await db
        .select()
        .from(unitSchema)
        .where(eq(unitSchema.id, tenant.unitId))
        .limit(1);

      if (!unit) {
        return { success: false, tenant: null, error: 'Unit not found' };
      }

      const [property] = await db
        .select()
        .from(propertySchema)
        .where(and(eq(propertySchema.id, unit.propertyId), eq(propertySchema.userId, user.id)))
        .limit(1);

      if (!property) {
        return { success: false, tenant: null, error: 'Unauthorized' };
      }
    } else {
      // For tenants without units (single-family properties), check directly through property
      const [property] = await db
        .select()
        .from(propertySchema)
        .where(and(eq(propertySchema.id, tenant.propertyId), eq(propertySchema.userId, user.id)))
        .limit(1);

      if (!property) {
        return { success: false, tenant: null, error: 'Unauthorized' };
      }
    }

    return { success: true, tenant };
  } catch (error) {
    console.error('Error fetching tenant:', error);
    return { success: false, tenant: null, error: 'Failed to fetch tenant' };
  }
}

/**
 * Create a new tenant
 */
export async function createTenant(data: {
  propertyId?: string;
  unitId?: string;
  name: string;
  phone?: string;
  email?: string;
}) {
  try {
    const user = await requireAuth();

    let propertyId = data.propertyId;

    // If unitId is provided, get the propertyId from the unit and verify ownership
    if (data.unitId) {
      const [unit] = await db
        .select()
        .from(unitSchema)
        .where(eq(unitSchema.id, data.unitId))
        .limit(1);

      if (!unit) {
        return { success: false, tenant: null, error: 'Unit not found' };
      }

      propertyId = unit.propertyId;

      const [property] = await db
        .select()
        .from(propertySchema)
        .where(and(eq(propertySchema.id, unit.propertyId), eq(propertySchema.userId, user.id)))
        .limit(1);

      if (!property) {
        return { success: false, tenant: null, error: 'Unauthorized' };
      }
    } else if (propertyId) {
      // If propertyId is provided directly (for single-family properties), verify ownership
      const [property] = await db
        .select()
        .from(propertySchema)
        .where(and(eq(propertySchema.id, propertyId), eq(propertySchema.userId, user.id)))
        .limit(1);

      if (!property) {
        return { success: false, tenant: null, error: 'Property not found or unauthorized' };
      }
    } else {
      return {
        success: false,
        tenant: null,
        error: 'Either propertyId or unitId must be provided',
      };
    }

    const [tenant] = await db
      .insert(tenantSchema)
      .values({
        propertyId: propertyId!,
        unitId: data.unitId || null,
        name: data.name,
        phone: data.phone || null,
        email: data.email || null,
      })
      .returning();

    return { success: true, tenant };
  } catch (error) {
    console.error('Error creating tenant:', error);
    return { success: false, tenant: null, error: 'Failed to create tenant' };
  }
}

/**
 * Update a tenant
 */
export async function updateTenant(
  tenantId: string,
  data: {
    name?: string;
    phone?: string;
    email?: string;
  },
) {
  try {
    await requireAuth();

    // Verify ownership
    const tenantCheck = await getTenantById(tenantId);
    if (!tenantCheck.success) {
      return { success: false, tenant: null, error: tenantCheck.error };
    }

    const [tenant] = await db
      .update(tenantSchema)
      .set({
        name: data.name,
        phone: data.phone,
        email: data.email,
        updatedAt: new Date(),
      })
      .where(eq(tenantSchema.id, tenantId))
      .returning();

    return { success: true, tenant };
  } catch (error) {
    console.error('Error updating tenant:', error);
    return { success: false, tenant: null, error: 'Failed to update tenant' };
  }
}

/**
 * Delete a tenant
 */
export async function deleteTenant(tenantId: string) {
  try {
    await requireAuth();

    // Verify ownership
    const tenantCheck = await getTenantById(tenantId);
    if (!tenantCheck.success) {
      return { success: false, error: tenantCheck.error };
    }

    await db.delete(tenantSchema).where(eq(tenantSchema.id, tenantId));

    return { success: true };
  } catch (error) {
    console.error('Error deleting tenant:', error);
    return { success: false, error: 'Failed to delete tenant' };
  }
}

/**
 * Get tenant count for the current user
 */
export async function getTenantCount() {
  try {
    const result = await getUserTenants();
    return result.tenants?.length || 0;
  } catch (error) {
    console.error('Error counting tenants:', error);
    return 0;
  }
}
