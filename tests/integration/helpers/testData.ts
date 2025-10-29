import type { InferSelectModel } from 'drizzle-orm';
import { eq, inArray } from 'drizzle-orm';
import {
  leaseSchema,
  paymentSchema,
  propertySchema,
  tenantSchema,
  unitSchema,
  userSchema,
} from '@/models/Schema';
import { getTestDb } from './testDb';

type Property = InferSelectModel<typeof propertySchema>;
type Unit = InferSelectModel<typeof unitSchema>;
type Tenant = InferSelectModel<typeof tenantSchema>;
type Lease = InferSelectModel<typeof leaseSchema>;
type Payment = InferSelectModel<typeof paymentSchema>;
type User = InferSelectModel<typeof userSchema>;

export type TestData = {
  user: User;
  property: Property;
  unit: Unit;
  tenant: Tenant;
  lease: Lease;
  payment: Payment;
};

/**
 * Seed test data for integration tests
 * Creates a complete test scenario: User -> Property -> Unit -> Tenant -> Lease -> Payment
 */
export async function seedTestData(userId?: string): Promise<TestData> {
  const db = getTestDb();
  const testUserId = userId || `test_user_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  // Create test user
  const [user] = await db
    .insert(userSchema)
    .values({
      id: testUserId,
      email: `test_${Date.now()}@example.com`,
      name: 'Test User',
    })
    .returning();

  if (!user) {
    throw new Error('Failed to create test user');
  }

  // Create property
  const [property] = await db
    .insert(propertySchema)
    .values({
      userId: user.id,
      address: '123 Test St, Test City, TC 12345',
      propertyType: 'multiunit',
    })
    .returning();

  if (!property) {
    throw new Error('Failed to create test property');
  }

  // Create unit
  const [unit] = await db
    .insert(unitSchema)
    .values({
      propertyId: property.id,
      unitNumber: 'A1',
      rentAmount: 1500,
    })
    .returning();

  if (!unit) {
    throw new Error('Failed to create test unit');
  }

  // Create tenant
  const [tenant] = await db
    .insert(tenantSchema)
    .values({
      propertyId: property.id,
      unitId: unit.id,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '555-1234',
    })
    .returning();

  if (!tenant) {
    throw new Error('Failed to create test tenant');
  }

  // Create lease
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 1);
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 11);

  const [lease] = await db
    .insert(leaseSchema)
    .values({
      tenantId: tenant.id,
      startDate,
      endDate,
      deposit: 1500,
      securityDeposit: 1500,
      rent: 1500,
    })
    .returning();

  if (!lease) {
    throw new Error('Failed to create test lease');
  }

  // Create payment
  const paymentDate = new Date();
  paymentDate.setDate(paymentDate.getDate() - 15);

  const [payment] = await db
    .insert(paymentSchema)
    .values({
      leaseId: lease.id,
      amount: 1500,
      date: paymentDate,
      lateFee: null,
    })
    .returning();

  if (!payment) {
    throw new Error('Failed to create test payment');
  }

  return {
    user,
    property,
    unit,
    tenant,
    lease,
    payment,
  };
}

/**
 * Clean up test data by userId
 */
export async function cleanupTestData(userId: string) {
  const db = getTestDb();

  // Get all properties for this user
  const properties = await db
    .select({ id: propertySchema.id })
    .from(propertySchema)
    .where(eq(propertySchema.userId, userId));

  if (properties.length === 0) {
    // Just delete the user if no properties
    await db.delete(userSchema).where(eq(userSchema.id, userId));
    return;
  }

  const propertyIds = properties.map((p) => p.id);

  // Get all units for these properties
  const units = await db
    .select({ id: unitSchema.id })
    .from(unitSchema)
    .where(inArray(unitSchema.propertyId, propertyIds));

  const unitIds = units.map((u) => u.id);

  // Get all tenants for these properties
  const tenants = await db
    .select({ id: tenantSchema.id })
    .from(tenantSchema)
    .where(inArray(tenantSchema.propertyId, propertyIds));

  const tenantIds = tenants.map((t) => t.id);

  // Get all leases for these tenants
  const leases = await db
    .select({ id: leaseSchema.id })
    .from(leaseSchema)
    .where(inArray(leaseSchema.tenantId, tenantIds));

  const leaseIds = leases.map((l) => l.id);

  // Delete in order (respecting foreign key constraints)
  if (leaseIds.length > 0) {
    await db.delete(paymentSchema).where(inArray(paymentSchema.leaseId, leaseIds));
    await db.delete(leaseSchema).where(inArray(leaseSchema.id, leaseIds));
  }

  if (tenantIds.length > 0) {
    await db.delete(tenantSchema).where(inArray(tenantSchema.id, tenantIds));
  }

  if (unitIds.length > 0) {
    await db.delete(unitSchema).where(inArray(unitSchema.id, unitIds));
  }

  await db.delete(propertySchema).where(inArray(propertySchema.id, propertyIds));
  await db.delete(userSchema).where(eq(userSchema.id, userId));
}

/**
 * Clean up all test data (nuclear option - be careful!)
 */
export async function cleanupAllTestData() {
  // Note: This function is a placeholder for future bulk cleanup functionality
  // Better: delete by timestamp in ID or use a test prefix
  // For now, we'll clean up manually by userId
}
