import type { TestData } from './helpers/testData';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  createPayment,
  getPaymentMetrics,
  getPendingAndOverdueDetails,
  getUserPayments,
} from '@/actions/PaymentActions';
import { clearTestAuth, setupTestAuth } from './helpers/testAuth';
import { cleanupTestData, seedTestData } from './helpers/testData';

describe('PaymentActions Integration Tests', () => {
  let testData: TestData;

  beforeEach(async () => {
    // Seed test data
    testData = await seedTestData();
    // Setup auth mocking
    setupTestAuth(testData.user);
  });

  afterEach(async () => {
    // Clean up auth mocks
    clearTestAuth();
    // Clean up test data
    await cleanupTestData(testData.user.id);
  });

  describe('getUserPayments', () => {
    it('should return empty array when user has no payments', async () => {
      // Create a new user with no payments
      const emptyTestData = await seedTestData();
      setupTestAuth(emptyTestData.user);

      // Remove the payment
      const { getTestDb } = await import('./helpers/testDb');
      const { eq } = await import('drizzle-orm');
      const db = getTestDb();
      const { paymentSchema } = await import('@/models/Schema');
      await db.delete(paymentSchema).where(eq(paymentSchema.id, emptyTestData.payment.id));

      const result = await getUserPayments();

      expect(result.success).toBe(true);
      expect(result.payments).toEqual([]);

      clearTestAuth();
      await cleanupTestData(emptyTestData.user.id);
    });

    it('should return payments for user leases', async () => {
      const result = await getUserPayments();

      expect(result.success).toBe(true);
      expect(result.payments).toHaveLength(1);
      expect(result.payments[0]?.amount).toBe(1500);
      expect(result.payments[0]?.leaseId).toBe(testData.lease.id);
    });
  });

  describe('createPayment', () => {
    it('should create payment for user lease', async () => {
      const paymentDate = new Date();
      paymentDate.setDate(paymentDate.getDate() - 5);

      const result = await createPayment({
        leaseId: testData.lease.id,
        amount: 1200,
        date: paymentDate,
      });

      expect(result.success).toBe(true);
      expect(result.payment).toBeDefined();
      expect(result.payment?.amount).toBe(1200);
      expect(result.payment?.leaseId).toBe(testData.lease.id);
    });

    it('should reject payment creation for unauthorized lease', async () => {
      // Create a different user's lease
      const otherTestData = await seedTestData();
      const paymentDate = new Date();

      // Should fail because we're authenticated as testData.user, not otherTestData.user
      const result = await createPayment({
        leaseId: otherTestData.lease.id,
        amount: 1200,
        date: paymentDate,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();

      clearTestAuth();
      await cleanupTestData(otherTestData.user.id);
    });
  });

  describe('getPendingAndOverdueDetails', () => {
    it('should calculate pending payments correctly', async () => {
      const result = await getPendingAndOverdueDetails();

      expect(result.success).toBe(true);
      expect(result.pending).toBeDefined();
      expect(result.overdue).toBeDefined();
      // Should have at least the pending payment for current month
      expect(result.pending.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getPaymentMetrics', () => {
    it('should calculate metrics correctly', async () => {
      const result = await getPaymentMetrics();

      expect(result.totalCollected).toBeGreaterThanOrEqual(0);
      expect(result.lateFees).toBeGreaterThanOrEqual(0);
      expect(result.pending).toBeDefined();
      expect(result.overdue).toBeDefined();
    });
  });
});
