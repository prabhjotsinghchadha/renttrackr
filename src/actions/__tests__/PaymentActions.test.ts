import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as AuthHelper from '@/helpers/AuthHelper';
import { db } from '@/libs/DB';
import {
  createPayment,
  getPaymentMetrics,
  getPendingAndOverdueDetails,
  getUserPayments,
} from '../PaymentActions';

// Mock dependencies
vi.mock('@/helpers/AuthHelper');
vi.mock('@/libs/DB', () => ({
  db: {
    select: vi.fn(),
    from: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('PaymentActions', () => {
  const mockUser = {
    id: 'user_123',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AuthHelper.requireAuth).mockResolvedValue(mockUser);
  });

  describe('getUserPayments', () => {
    it('should return empty array when user has no payments', async () => {
      const mockProperties = [{ id: 'prop_1', userId: 'user_123' }];
      const propertiesChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockProperties),
      };

      const emptyChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(propertiesChain as any)
        .mockReturnValueOnce(emptyChain as any)
        .mockReturnValueOnce(emptyChain as any)
        .mockReturnValueOnce(emptyChain as any);

      const result = await getUserPayments();

      expect(result.success).toBe(true);
      expect(result.payments).toEqual([]);
    });

    it('should return payments for user leases', async () => {
      const mockProperties = [{ id: 'prop_1', userId: 'user_123' }];
      const mockUnits = [{ id: 'unit_1', propertyId: 'prop_1' }];
      const mockTenants = [{ id: 'tenant_1', unitId: 'unit_1', propertyId: 'prop_1' }];
      const mockLeases = [{ id: 'lease_1', tenantId: 'tenant_1' }];
      const mockPayments = [
        {
          id: 'pay_1',
          leaseId: 'lease_1',
          amount: 1500,
          date: new Date('2024-01-15'),
          lateFee: null,
        },
      ];

      const propertiesChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockProperties),
      };

      const unitsChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockUnits),
      };

      const tenantsChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockTenants),
      };

      const leasesChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockLeases),
      };

      const paymentsChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockPayments),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(propertiesChain as any)
        .mockReturnValueOnce(unitsChain as any)
        .mockReturnValueOnce(tenantsChain as any)
        .mockReturnValueOnce(leasesChain as any)
        .mockReturnValueOnce(paymentsChain as any);

      const result = await getUserPayments();

      expect(result.success).toBe(true);
      expect(result.payments).toHaveLength(1);
      expect(result.payments?.[0]?.amount).toBe(1500);
    });
  });

  describe('createPayment', () => {
    it('should create payment for user lease', async () => {
      const mockLease = { id: 'lease_1', tenantId: 'tenant_1' };
      const mockTenant = { id: 'tenant_1', unitId: 'unit_1', propertyId: 'prop_1' };
      const mockUnit = { id: 'unit_1', propertyId: 'prop_1' };
      const mockProperty = { id: 'prop_1', userId: 'user_123' };

      const leaseChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockLease]),
      };

      const tenantChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockTenant]),
      };

      const unitChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockUnit]),
      };

      const propertyChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockProperty]),
      };

      const insertChain = {
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([
          {
            id: 'pay_1',
            leaseId: 'lease_1',
            amount: 1500,
            date: new Date('2024-01-15'),
            lateFee: null,
          },
        ]),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(leaseChain as any)
        .mockReturnValueOnce(tenantChain as any)
        .mockReturnValueOnce(unitChain as any)
        .mockReturnValueOnce(propertyChain as any);
      vi.mocked(db.insert).mockReturnValue(insertChain as any);

      const result = await createPayment({
        leaseId: 'lease_1',
        amount: 1500,
        date: new Date('2024-01-15'),
      });

      expect(result.success).toBe(true);
      expect(result.payment).toBeDefined();
    });

    it('should return error when lease not found or unauthorized', async () => {
      const leaseChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(leaseChain as any);

      const result = await createPayment({
        leaseId: 'nonexistent',
        amount: 1500,
        date: new Date(),
      });

      expect(result.success).toBe(false);
      expect(result.payment).toBeNull();
    });
  });

  describe('getPendingAndOverdueDetails', () => {
    it('should calculate pending payments correctly', async () => {
      const now = new Date('2024-01-15');
      vi.useFakeTimers();
      vi.setSystemTime(now);

      const mockProperties = [{ id: 'prop_1', userId: 'user_123' }];
      const mockUnits = [{ id: 'unit_1', propertyId: 'prop_1' }];
      const mockTenants = [{ id: 'tenant_1', unitId: 'unit_1', propertyId: 'prop_1' }];
      const mockLeases = [
        {
          id: 'lease_1',
          tenantId: 'tenant_1',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          rent: 1500,
        },
      ];
      const mockPayments: any[] = []; // No payments made

      const propertiesChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockProperties),
      };

      const unitsChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockUnits),
      };

      const tenantsChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockTenants),
      };

      const leasesChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockLeases),
      };

      const paymentsChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockPayments),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(propertiesChain as any)
        .mockReturnValueOnce(unitsChain as any)
        .mockReturnValueOnce(tenantsChain as any)
        .mockReturnValueOnce(leasesChain as any)
        .mockReturnValueOnce(paymentsChain as any);

      const result = await getPendingAndOverdueDetails();

      expect(result.success).toBe(true);
      // Should have pending payment for January 2024
      expect(result.pending.length + result.overdue.length).toBeGreaterThan(0);

      vi.useRealTimers();
    });
  });

  describe('getPaymentMetrics', () => {
    it('should calculate metrics correctly', async () => {
      const now = new Date('2024-01-15');
      vi.useFakeTimers();
      vi.setSystemTime(now);

      const mockProperties = [{ id: 'prop_1', userId: 'user_123' }];
      const mockUnits = [{ id: 'unit_1', propertyId: 'prop_1' }];
      const mockTenants = [{ id: 'tenant_1', unitId: 'unit_1', propertyId: 'prop_1' }];
      const mockLeases = [
        {
          id: 'lease_1',
          tenantId: 'tenant_1',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          rent: 1500,
        },
      ];
      const mockPayments = [
        {
          id: 'pay_1',
          leaseId: 'lease_1',
          amount: 1500,
          date: new Date('2024-01-10'),
          lateFee: 50,
        },
      ];

      const propertiesChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockProperties),
      };

      const unitsChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockUnits),
      };

      const tenantsChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockTenants),
      };

      const leasesChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockLeases),
      };

      const paymentsChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockPayments),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(propertiesChain as any)
        .mockReturnValueOnce(unitsChain as any)
        .mockReturnValueOnce(tenantsChain as any)
        .mockReturnValueOnce(leasesChain as any)
        .mockReturnValueOnce(paymentsChain as any)
        // For getPendingAndOverdueDetails
        .mockReturnValueOnce(propertiesChain as any)
        .mockReturnValueOnce(unitsChain as any)
        .mockReturnValueOnce(tenantsChain as any)
        .mockReturnValueOnce(leasesChain as any)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockResolvedValue([]),
        } as any);

      const result = await getPaymentMetrics();

      expect(result.totalCollected).toBe(1500);
      expect(result.lateFees).toBe(50);
      expect(result).toHaveProperty('pending');
      expect(result).toHaveProperty('overdue');

      vi.useRealTimers();
    });
  });
});
