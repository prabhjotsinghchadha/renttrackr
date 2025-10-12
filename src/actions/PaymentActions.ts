'use server';

import { and, eq, inArray, sql } from 'drizzle-orm';
import { requireAuth } from '@/helpers/AuthHelper';
import { db } from '@/libs/DB';
import {
  leaseSchema,
  paymentSchema,
  propertySchema,
  tenantSchema,
  unitSchema,
} from '@/models/Schema';

/**
 * Get all payments for the current user's properties
 */
export async function getUserPayments() {
  try {
    const user = await requireAuth();

    // Get all user's property IDs
    const properties = await db
      .select({ id: propertySchema.id })
      .from(propertySchema)
      .where(eq(propertySchema.userId, user.id));

    if (properties.length === 0) {
      return { success: true, payments: [] };
    }

    const propertyIds = properties.map((p) => p.id);

    // Get all units for these properties
    const units = await db
      .select({ id: unitSchema.id })
      .from(unitSchema)
      .where(inArray(unitSchema.propertyId, propertyIds));

    if (units.length === 0) {
      return { success: true, payments: [] };
    }

    const unitIds = units.map((u) => u.id);

    // Get all tenants for these units
    const tenants = await db
      .select({ id: tenantSchema.id })
      .from(tenantSchema)
      .where(inArray(tenantSchema.unitId, unitIds));

    if (tenants.length === 0) {
      return { success: true, payments: [] };
    }

    const tenantIds = tenants.map((t) => t.id);

    // Get all leases for these tenants
    const leases = await db
      .select({ id: leaseSchema.id })
      .from(leaseSchema)
      .where(inArray(leaseSchema.tenantId, tenantIds));

    if (leases.length === 0) {
      return { success: true, payments: [] };
    }

    const leaseIds = leases.map((l) => l.id);

    // Get all payments for these leases
    const payments = await db
      .select()
      .from(paymentSchema)
      .where(inArray(paymentSchema.leaseId, leaseIds))
      .orderBy(sql`${paymentSchema.date} DESC`);

    return { success: true, payments };
  } catch (error) {
    console.error('Error fetching payments:', error);
    return { success: false, payments: [], error: 'Failed to fetch payments' };
  }
}

/**
 * Create a new payment
 */
export async function createPayment(data: {
  leaseId: string;
  amount: number;
  date: Date;
  lateFee?: number;
}) {
  try {
    const user = await requireAuth();

    // Verify the lease belongs to the user
    const [lease] = await db
      .select()
      .from(leaseSchema)
      .where(eq(leaseSchema.id, data.leaseId))
      .limit(1);

    if (!lease) {
      return { success: false, payment: null, error: 'Lease not found' };
    }

    // Verify ownership through tenant -> unit -> property chain
    const [tenant] = await db
      .select()
      .from(tenantSchema)
      .where(eq(tenantSchema.id, lease.tenantId))
      .limit(1);

    if (!tenant) {
      return { success: false, payment: null, error: 'Tenant not found' };
    }

    const [unit] = await db
      .select()
      .from(unitSchema)
      .where(eq(unitSchema.id, tenant.unitId))
      .limit(1);

    if (!unit) {
      return { success: false, payment: null, error: 'Unit not found' };
    }

    const [property] = await db
      .select()
      .from(propertySchema)
      .where(and(eq(propertySchema.id, unit.propertyId), eq(propertySchema.userId, user.id)))
      .limit(1);

    if (!property) {
      return { success: false, payment: null, error: 'Unauthorized' };
    }

    const [payment] = await db
      .insert(paymentSchema)
      .values({
        leaseId: data.leaseId,
        amount: data.amount,
        date: data.date,
        lateFee: data.lateFee || null,
      })
      .returning();

    return { success: true, payment };
  } catch (error) {
    console.error('Error creating payment:', error);
    return { success: false, payment: null, error: 'Failed to create payment' };
  }
}

/**
 * Get all payments with detailed information (tenant, unit, property)
 */
export async function getPaymentsWithDetails() {
  try {
    const user = await requireAuth();

    // Get all user's properties
    const properties = await db
      .select()
      .from(propertySchema)
      .where(eq(propertySchema.userId, user.id));

    if (properties.length === 0) {
      return { success: true, payments: [] };
    }

    const propertyIds = properties.map((p) => p.id);

    // Get all units for these properties
    const units = await db
      .select()
      .from(unitSchema)
      .where(inArray(unitSchema.propertyId, propertyIds));

    if (units.length === 0) {
      return { success: true, payments: [] };
    }

    const unitIds = units.map((u) => u.id);

    // Get all tenants for these units
    const tenants = await db
      .select()
      .from(tenantSchema)
      .where(inArray(tenantSchema.unitId, unitIds));

    if (tenants.length === 0) {
      return { success: true, payments: [] };
    }

    const tenantIds = tenants.map((t) => t.id);

    // Get all leases for these tenants
    const leases = await db
      .select()
      .from(leaseSchema)
      .where(inArray(leaseSchema.tenantId, tenantIds));

    if (leases.length === 0) {
      return { success: true, payments: [] };
    }

    const leaseIds = leases.map((l) => l.id);

    // Get all payments for these leases
    const payments = await db
      .select()
      .from(paymentSchema)
      .where(inArray(paymentSchema.leaseId, leaseIds))
      .orderBy(sql`${paymentSchema.date} DESC`);

    // Combine payment, lease, tenant, unit, and property information
    const paymentsWithDetails = payments.map((payment) => {
      const lease = leases.find((l) => l.id === payment.leaseId);
      const tenant = tenants.find((t) => t.id === lease?.tenantId);
      const unit = units.find((u) => u.id === tenant?.unitId);
      const property = properties.find((p) => p.id === unit?.propertyId);

      return {
        ...payment,
        tenantName: tenant?.name || 'Unknown',
        tenantId: tenant?.id || '',
        unitNumber: unit?.unitNumber || 'Unknown',
        unitId: unit?.id || '',
        propertyAddress: property?.address || 'Unknown',
        propertyId: property?.id || '',
      };
    });

    return { success: true, payments: paymentsWithDetails };
  } catch (error) {
    console.error('Error fetching payments with details:', error);
    return { success: false, payments: [], error: 'Failed to fetch payments' };
  }
}

/**
 * Update an existing payment
 */
export async function updatePayment(
  paymentId: string,
  data: {
    amount: number;
    date: Date;
    lateFee?: number;
  },
) {
  try {
    const user = await requireAuth();

    // First, verify the payment exists and belongs to the user
    const [payment] = await db
      .select()
      .from(paymentSchema)
      .where(eq(paymentSchema.id, paymentId))
      .limit(1);

    if (!payment) {
      return { success: false, payment: null, error: 'Payment not found' };
    }

    // Verify ownership through lease -> tenant -> unit -> property chain
    const [lease] = await db
      .select()
      .from(leaseSchema)
      .where(eq(leaseSchema.id, payment.leaseId))
      .limit(1);

    if (!lease) {
      return { success: false, payment: null, error: 'Lease not found' };
    }

    const [tenant] = await db
      .select()
      .from(tenantSchema)
      .where(eq(tenantSchema.id, lease.tenantId))
      .limit(1);

    if (!tenant) {
      return { success: false, payment: null, error: 'Tenant not found' };
    }

    const [unit] = await db
      .select()
      .from(unitSchema)
      .where(eq(unitSchema.id, tenant.unitId))
      .limit(1);

    if (!unit) {
      return { success: false, payment: null, error: 'Unit not found' };
    }

    const [property] = await db
      .select()
      .from(propertySchema)
      .where(and(eq(propertySchema.id, unit.propertyId), eq(propertySchema.userId, user.id)))
      .limit(1);

    if (!property) {
      return { success: false, payment: null, error: 'Unauthorized' };
    }

    // Update the payment
    const [updatedPayment] = await db
      .update(paymentSchema)
      .set({
        amount: data.amount,
        date: data.date,
        lateFee: data.lateFee || null,
      })
      .where(eq(paymentSchema.id, paymentId))
      .returning();

    return { success: true, payment: updatedPayment };
  } catch (error) {
    console.error('Error updating payment:', error);
    return { success: false, payment: null, error: 'Failed to update payment' };
  }
}

/**
 * Delete a payment
 */
export async function deletePayment(paymentId: string) {
  try {
    const user = await requireAuth();

    // First, verify the payment exists and belongs to the user
    const [payment] = await db
      .select()
      .from(paymentSchema)
      .where(eq(paymentSchema.id, paymentId))
      .limit(1);

    if (!payment) {
      return { success: false, error: 'Payment not found' };
    }

    // Verify ownership through lease -> tenant -> unit -> property chain
    const [lease] = await db
      .select()
      .from(leaseSchema)
      .where(eq(leaseSchema.id, payment.leaseId))
      .limit(1);

    if (!lease) {
      return { success: false, error: 'Lease not found' };
    }

    const [tenant] = await db
      .select()
      .from(tenantSchema)
      .where(eq(tenantSchema.id, lease.tenantId))
      .limit(1);

    if (!tenant) {
      return { success: false, error: 'Tenant not found' };
    }

    const [unit] = await db
      .select()
      .from(unitSchema)
      .where(eq(unitSchema.id, tenant.unitId))
      .limit(1);

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

    // Delete the payment
    await db.delete(paymentSchema).where(eq(paymentSchema.id, paymentId));

    return { success: true };
  } catch (error) {
    console.error('Error deleting payment:', error);
    return { success: false, error: 'Failed to delete payment' };
  }
}

/**
 * Get payment metrics for the current user
 */
export async function getPaymentMetrics() {
  try {
    const result = await getUserPayments();

    if (!result.success || !result.payments) {
      return {
        totalCollected: 0,
        pending: 0,
        overdue: 0,
        lateFees: 0,
      };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const totalCollected = result.payments
      .filter((p) => {
        const paymentDate = new Date(p.date);
        return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
      })
      .reduce((sum, p) => sum + p.amount, 0);

    const lateFees = result.payments
      .filter((p) => {
        const paymentDate = new Date(p.date);
        return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
      })
      .reduce((sum, p) => sum + (p.lateFee || 0), 0);

    // TODO: Calculate pending and overdue based on lease rent amounts and due dates
    // For now, return placeholder values

    return {
      totalCollected,
      pending: 0,
      overdue: 0,
      lateFees,
    };
  } catch (error) {
    console.error('Error calculating payment metrics:', error);
    return {
      totalCollected: 0,
      pending: 0,
      overdue: 0,
      lateFees: 0,
    };
  }
}
