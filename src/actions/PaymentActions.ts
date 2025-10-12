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
 * Calculate pending and overdue payments for a user
 */
async function calculatePendingAndOverduePayments(userId: string) {
  try {
    // Get all user's properties
    const properties = await db
      .select({ id: propertySchema.id })
      .from(propertySchema)
      .where(eq(propertySchema.userId, userId));

    if (properties.length === 0) {
      return { pending: 0, overdue: 0 };
    }

    const propertyIds = properties.map((p) => p.id);

    // Get all units for these properties
    const units = await db
      .select()
      .from(unitSchema)
      .where(inArray(unitSchema.propertyId, propertyIds));

    if (units.length === 0) {
      return { pending: 0, overdue: 0 };
    }

    const unitIds = units.map((u) => u.id);

    // Get all tenants for these units
    const tenants = await db
      .select()
      .from(tenantSchema)
      .where(inArray(tenantSchema.unitId, unitIds));

    if (tenants.length === 0) {
      return { pending: 0, overdue: 0 };
    }

    const tenantIds = tenants.map((t) => t.id);

    // Get all active leases for these tenants
    const leases = await db
      .select()
      .from(leaseSchema)
      .where(inArray(leaseSchema.tenantId, tenantIds));

    if (leases.length === 0) {
      return { pending: 0, overdue: 0 };
    }

    const leaseIds = leases.map((l) => l.id);

    // Get all payments for these leases
    const payments = await db
      .select()
      .from(paymentSchema)
      .where(inArray(paymentSchema.leaseId, leaseIds));

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const currentDate = now.getDate();

    let pending = 0;
    let overdue = 0;

    // Calculate for each lease
    for (const lease of leases) {
      const leaseStartDate = new Date(lease.startDate);
      const leaseEndDate = new Date(lease.endDate);

      // Skip if lease hasn't started yet or has ended
      if (now < leaseStartDate || now > leaseEndDate) {
        continue;
      }

      // Calculate how many months have passed since lease start
      const monthsSinceStart =
        (currentYear - leaseStartDate.getFullYear()) * 12 +
        (currentMonth - leaseStartDate.getMonth());

      // For each month of the lease, check if rent is due/overdue
      for (let monthOffset = 0; monthOffset <= monthsSinceStart; monthOffset++) {
        const rentDueDate = new Date(leaseStartDate);
        rentDueDate.setMonth(rentDueDate.getMonth() + monthOffset);

        // Skip if this month's rent is in the future
        if (
          rentDueDate.getMonth() > currentMonth ||
          (rentDueDate.getMonth() === currentMonth && rentDueDate.getDate() > currentDate)
        ) {
          continue;
        }

        // Check if rent for this month has been paid
        const monthPayments = payments.filter((p) => {
          const paymentDate = new Date(p.date);
          return (
            p.leaseId === lease.id &&
            paymentDate.getMonth() === rentDueDate.getMonth() &&
            paymentDate.getFullYear() === rentDueDate.getFullYear()
          );
        });

        const totalPaidForMonth = monthPayments.reduce((sum, p) => sum + p.amount, 0);
        const rentAmount = lease.rent;

        if (totalPaidForMonth < rentAmount) {
          const unpaidAmount = rentAmount - totalPaidForMonth;

          // Determine if it's pending or overdue
          const daysPastDue = Math.floor(
            (now.getTime() - rentDueDate.getTime()) / (1000 * 60 * 60 * 24),
          );

          if (daysPastDue > 0) {
            // Overdue (past due date)
            overdue += unpaidAmount;
          } else {
            // Pending (due date hasn't passed yet)
            pending += unpaidAmount;
          }
        }
      }
    }

    return { pending, overdue };
  } catch (error) {
    console.error('Error calculating pending and overdue payments:', error);
    return { pending: 0, overdue: 0 };
  }
}

/**
 * Get detailed pending and overdue payment information
 */
export async function getPendingAndOverdueDetails() {
  try {
    const user = await requireAuth();

    // Get all user's properties
    const properties = await db
      .select()
      .from(propertySchema)
      .where(eq(propertySchema.userId, user.id));

    if (properties.length === 0) {
      return { success: true, pending: [], overdue: [] };
    }

    const propertyIds = properties.map((p) => p.id);

    // Get all units for these properties
    const units = await db
      .select()
      .from(unitSchema)
      .where(inArray(unitSchema.propertyId, propertyIds));

    if (units.length === 0) {
      return { success: true, pending: [], overdue: [] };
    }

    const unitIds = units.map((u) => u.id);

    // Get all tenants for these units
    const tenants = await db
      .select()
      .from(tenantSchema)
      .where(inArray(tenantSchema.unitId, unitIds));

    if (tenants.length === 0) {
      return { success: true, pending: [], overdue: [] };
    }

    const tenantIds = tenants.map((t) => t.id);

    // Get all active leases for these tenants
    const leases = await db
      .select()
      .from(leaseSchema)
      .where(inArray(leaseSchema.tenantId, tenantIds));

    if (leases.length === 0) {
      return { success: true, pending: [], overdue: [] };
    }

    const leaseIds = leases.map((l) => l.id);

    // Get all payments for these leases
    const payments = await db
      .select()
      .from(paymentSchema)
      .where(inArray(paymentSchema.leaseId, leaseIds));

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const currentDate = now.getDate();

    const pending: Array<{
      tenantName: string;
      unitNumber: string;
      propertyAddress: string;
      amount: number;
      dueDate: Date;
      daysUntilDue: number;
    }> = [];

    const overdue: Array<{
      tenantName: string;
      unitNumber: string;
      propertyAddress: string;
      amount: number;
      dueDate: Date;
      daysOverdue: number;
    }> = [];

    // Calculate for each lease
    for (const lease of leases) {
      const leaseStartDate = new Date(lease.startDate);
      const leaseEndDate = new Date(lease.endDate);

      // Skip if lease hasn't started yet or has ended
      if (now < leaseStartDate || now > leaseEndDate) {
        continue;
      }

      // Find tenant and unit info
      const tenant = tenants.find((t) => t.id === lease.tenantId);
      const unit = units.find((u) => u.id === tenant?.unitId);
      const property = properties.find((p) => p.id === unit?.propertyId);

      if (!tenant || !unit || !property) {
        continue;
      }

      // Calculate how many months have passed since lease start
      const monthsSinceStart =
        (currentYear - leaseStartDate.getFullYear()) * 12 +
        (currentMonth - leaseStartDate.getMonth());

      // For each month of the lease, check if rent is due/overdue
      for (let monthOffset = 0; monthOffset <= monthsSinceStart; monthOffset++) {
        const rentDueDate = new Date(leaseStartDate);
        rentDueDate.setMonth(rentDueDate.getMonth() + monthOffset);

        // Skip if this month's rent is in the future
        if (
          rentDueDate.getMonth() > currentMonth ||
          (rentDueDate.getMonth() === currentMonth && rentDueDate.getDate() > currentDate)
        ) {
          continue;
        }

        // Check if rent for this month has been paid
        const monthPayments = payments.filter((p) => {
          const paymentDate = new Date(p.date);
          return (
            p.leaseId === lease.id &&
            paymentDate.getMonth() === rentDueDate.getMonth() &&
            paymentDate.getFullYear() === rentDueDate.getFullYear()
          );
        });

        const totalPaidForMonth = monthPayments.reduce((sum, p) => sum + p.amount, 0);
        const rentAmount = lease.rent;

        if (totalPaidForMonth < rentAmount) {
          const unpaidAmount = rentAmount - totalPaidForMonth;
          const daysPastDue = Math.floor(
            (now.getTime() - rentDueDate.getTime()) / (1000 * 60 * 60 * 24),
          );

          const baseInfo = {
            tenantName: tenant.name,
            unitNumber: unit.unitNumber,
            propertyAddress: property.address,
            amount: unpaidAmount,
            dueDate: rentDueDate,
          };

          if (daysPastDue > 0) {
            // Overdue
            overdue.push({
              ...baseInfo,
              daysOverdue: daysPastDue,
            });
          } else {
            // Pending
            pending.push({
              ...baseInfo,
              daysUntilDue: Math.abs(daysPastDue),
            });
          }
        }
      }
    }

    // Sort pending by days until due (ascending)
    pending.sort((a, b) => a.daysUntilDue - b.daysUntilDue);

    // Sort overdue by days overdue (descending - most overdue first)
    overdue.sort((a, b) => b.daysOverdue - a.daysOverdue);

    return { success: true, pending, overdue };
  } catch (error) {
    console.error('Error getting pending and overdue details:', error);
    return { success: false, pending: [], overdue: [], error: 'Failed to get payment details' };
  }
}

/**
 * Get payment metrics for the current user
 */
export async function getPaymentMetrics() {
  try {
    const user = await requireAuth();
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

    // Calculate pending and overdue based on lease rent amounts and due dates
    const { pending, overdue } = await calculatePendingAndOverduePayments(user.id);

    return {
      totalCollected,
      pending,
      overdue,
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
