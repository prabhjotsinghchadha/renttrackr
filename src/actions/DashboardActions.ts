'use server';

import { and, eq, inArray, sql } from 'drizzle-orm';
import { requireAuth } from '@/helpers/AuthHelper';
import { db } from '@/libs/DB';
import {
  leaseSchema,
  paymentSchema,
  propertySchema,
  renovationSchema,
  tenantSchema,
  unitSchema,
} from '@/models/Schema';

/**
 * Get recent payments for dashboard
 */
export async function getRecentPayments(limit: number = 5) {
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

    // Get all leases for these tenants
    const leases = await db
      .select()
      .from(leaseSchema)
      .where(
        inArray(
          leaseSchema.tenantId,
          tenants.map((t) => t.id),
        ),
      );

    // Get recent payments for these leases
    const payments = await db
      .select()
      .from(paymentSchema)
      .where(
        inArray(
          paymentSchema.leaseId,
          leases.map((l) => l.id),
        ),
      )
      .orderBy(sql`${paymentSchema.date} DESC`)
      .limit(limit);

    // Combine payment data with tenant and property information
    const paymentsWithDetails = payments.map((payment) => {
      const lease = leases.find((l) => l.id === payment.leaseId);
      const tenant = tenants.find((t) => t.id === lease?.tenantId);
      const unit = units.find((u) => u.id === tenant?.unitId);
      const property = properties.find((p) => p.id === unit?.propertyId);

      return {
        ...payment,
        tenantName: tenant?.name || 'Unknown',
        unitNumber: unit?.unitNumber || 'Unknown',
        propertyAddress: property?.address || 'Unknown',
      };
    });

    return { success: true, payments: paymentsWithDetails };
  } catch (error) {
    console.error('Error fetching recent payments:', error);
    return { success: false, payments: [], error: 'Failed to fetch recent payments' };
  }
}

/**
 * Get upcoming tasks for dashboard
 */
export async function getUpcomingTasks(limit: number = 5) {
  try {
    const user = await requireAuth();

    // Get all user's properties
    const properties = await db
      .select()
      .from(propertySchema)
      .where(eq(propertySchema.userId, user.id));

    if (properties.length === 0) {
      return { success: true, tasks: [] };
    }

    const propertyIds = properties.map((p) => p.id);

    // Get upcoming renovations
    const renovations = await db
      .select()
      .from(renovationSchema)
      .where(inArray(renovationSchema.propertyId, propertyIds))
      .orderBy(sql`${renovationSchema.startDate} ASC`)
      .limit(limit);

    // Get upcoming lease renewals (leases ending in next 30 days)
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    const units = await db
      .select()
      .from(unitSchema)
      .where(inArray(unitSchema.propertyId, propertyIds));

    const tenants = await db
      .select()
      .from(tenantSchema)
      .where(
        inArray(
          tenantSchema.unitId,
          units.map((u) => u.id),
        ),
      );

    const upcomingLeaseRenewals = await db
      .select()
      .from(leaseSchema)
      .where(
        and(
          inArray(
            leaseSchema.tenantId,
            tenants.map((t) => t.id),
          ),
          sql`${leaseSchema.endDate} BETWEEN ${now} AND ${thirtyDaysFromNow}`,
        ),
      )
      .orderBy(sql`${leaseSchema.endDate} ASC`)
      .limit(limit);

    // Combine all tasks
    const tasks: Array<{
      id: string;
      type: string;
      title: string;
      description: string;
      dueDate: Date | null;
      priority: string;
      status: string;
    }> = [];

    // Add upcoming renovations
    renovations.forEach((renovation) => {
      const property = properties.find((p) => p.id === renovation.propertyId);
      const unit = units.find((u) => u.id === renovation.unitId);

      tasks.push({
        id: renovation.id,
        type: 'renovation',
        title: renovation.title,
        description: `Renovation at ${property?.address || 'Unknown'}${unit ? ` - Unit ${unit.unitNumber}` : ''}`,
        dueDate: renovation.startDate,
        priority: 'medium',
        status: renovation.startDate ? 'scheduled' : 'pending',
      });
    });

    // Add upcoming lease renewals
    upcomingLeaseRenewals.forEach((lease) => {
      const tenant = tenants.find((t) => t.id === lease.tenantId);
      const unit = units.find((u) => u.id === tenant?.unitId);
      const property = properties.find((p) => p.id === unit?.propertyId);

      tasks.push({
        id: lease.id,
        type: 'lease_renewal',
        title: 'Lease Renewal',
        description: `Lease renewal for ${tenant?.name || 'Unknown'} at ${property?.address || 'Unknown'}${unit ? ` - Unit ${unit.unitNumber}` : ''}`,
        dueDate: lease.endDate,
        priority: 'high',
        status: 'upcoming',
      });
    });

    // Sort by due date and limit
    const sortedTasks = tasks
      .sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      })
      .slice(0, limit);

    return { success: true, tasks: sortedTasks };
  } catch (error) {
    console.error('Error fetching upcoming tasks:', error);
    return { success: false, tasks: [], error: 'Failed to fetch upcoming tasks' };
  }
}

/**
 * Get dashboard activity summary
 */
export async function getDashboardActivity() {
  try {
    const [recentPaymentsResult, upcomingTasksResult] = await Promise.all([
      getRecentPayments(5),
      getUpcomingTasks(5),
    ]);

    return {
      success: true,
      recentPayments: recentPaymentsResult.success ? recentPaymentsResult.payments : [],
      upcomingTasks: upcomingTasksResult.success ? upcomingTasksResult.tasks : [],
    };
  } catch (error) {
    console.error('Error fetching dashboard activity:', error);
    return {
      success: false,
      recentPayments: [],
      upcomingTasks: [],
      error: 'Failed to fetch dashboard activity',
    };
  }
}
