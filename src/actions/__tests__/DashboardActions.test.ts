import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as AuthHelper from '@/helpers/AuthHelper';
import { db } from '@/libs/DB';

import { getDashboardActivity, getRecentPayments, getUpcomingTasks } from '../DashboardActions';

// Mock dependencies
vi.mock('@/helpers/AuthHelper');
vi.mock('@/libs/DB', () => ({
  db: {
    select: vi.fn(),
    from: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
  },
}));

describe('DashboardActions', () => {
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

  describe('getRecentPayments', () => {
    it('should return empty payments array when user has no properties', async () => {
      // Mock: No properties found
      const mockDbChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockDbChain as any);
      vi.mocked(mockDbChain.from).mockReturnValue(mockDbChain);
      vi.mocked(mockDbChain.where).mockResolvedValue([]);

      const result = await getRecentPayments(5);

      expect(result.success).toBe(true);
      expect(result.payments).toEqual([]);
      expect(AuthHelper.requireAuth).toHaveBeenCalled();
    });

    it('should return recent payments with tenant and property details', async () => {
      const mockProperties = [{ id: 'prop_1', userId: 'user_123', address: '123 Main St' }];
      const mockUnits = [{ id: 'unit_1', propertyId: 'prop_1', unitNumber: 'A1' }];
      const mockTenants = [
        { id: 'tenant_1', unitId: 'unit_1', name: 'John Doe', propertyId: 'prop_1' },
      ];
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

      // Setup mock chain for properties
      const propertiesChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockProperties),
      };

      // Setup mock chain for units
      const unitsChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockUnits),
      };

      // Setup mock chain for tenants
      const tenantsChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockTenants),
      };

      // Setup mock chain for leases
      const leasesChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockLeases),
      };

      // Setup mock chain for payments
      const paymentsChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(mockPayments),
      };

      // Mock sequential db calls
      vi.mocked(db.select)
        .mockReturnValueOnce(propertiesChain as any)
        .mockReturnValueOnce(unitsChain as any)
        .mockReturnValueOnce(tenantsChain as any)
        .mockReturnValueOnce(leasesChain as any)
        .mockReturnValueOnce(paymentsChain as any);

      const result = await getRecentPayments(5);

      expect(result.success).toBe(true);
      expect(result.payments).toHaveLength(1);
      expect(result.payments[0]).toMatchObject({
        id: 'pay_1',
        amount: 1500,
        tenantName: 'John Doe',
        unitNumber: 'A1',
        propertyAddress: '123 Main St',
      });
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(AuthHelper.requireAuth).mockRejectedValue(new Error('Auth failed'));

      const result = await getRecentPayments(5);

      expect(result.success).toBe(false);
      expect(result.payments).toEqual([]);
      expect(result.error).toBeDefined();
    });
  });

  describe('getUpcomingTasks', () => {
    it('should return empty tasks array when user has no properties', async () => {
      const mockDbChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockDbChain as any);

      const result = await getUpcomingTasks(5);

      expect(result.success).toBe(true);
      expect(result.tasks).toEqual([]);
    });

    it('should return upcoming renovations as tasks', async () => {
      const mockProperties = [{ id: 'prop_1', userId: 'user_123', address: '123 Main St' }];
      const mockUnits = [{ id: 'unit_1', propertyId: 'prop_1', unitNumber: 'A1' }];
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);

      const mockRenovations = [
        {
          id: 'renov_1',
          propertyId: 'prop_1',
          unitId: 'unit_1',
          title: 'Kitchen Renovation',
          startDate: futureDate,
          endDate: null,
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

      const renovationsChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue(mockRenovations),
          }),
        }),
      };

      const tenantsChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      };

      const leasesChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(propertiesChain as any)
        .mockReturnValueOnce(renovationsChain as any)
        .mockReturnValueOnce(unitsChain as any)
        .mockReturnValueOnce(tenantsChain as any)
        .mockReturnValueOnce(leasesChain as any);

      const result = await getUpcomingTasks(5);

      expect(result.success).toBe(true);
      expect(result.tasks.length).toBeGreaterThan(0);
      expect(result.tasks[0]).toMatchObject({
        type: 'renovation',
        title: 'Kitchen Renovation',
      });
    });

    it('should return upcoming lease renewals as tasks', async () => {
      const mockProperties = [{ id: 'prop_1', userId: 'user_123', address: '123 Main St' }];
      const mockUnits = [{ id: 'unit_1', propertyId: 'prop_1', unitNumber: 'A1' }];
      const mockTenants = [
        { id: 'tenant_1', unitId: 'unit_1', name: 'John Doe', propertyId: 'prop_1' },
      ];

      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 20);

      const mockLeases = [
        {
          id: 'lease_1',
          tenantId: 'tenant_1',
          startDate: new Date('2023-01-01'),
          endDate: thirtyDaysFromNow,
          rent: 1500,
          deposit: 1500,
        },
      ];

      const propertiesChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockProperties),
      };

      const renovationsChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
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
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue(mockLeases),
          }),
        }),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(propertiesChain as any)
        .mockReturnValueOnce(renovationsChain as any)
        .mockReturnValueOnce(unitsChain as any)
        .mockReturnValueOnce(tenantsChain as any)
        .mockReturnValueOnce(leasesChain as any);

      const result = await getUpcomingTasks(5);

      expect(result.success).toBe(true);

      const renewalTasks = result.tasks.filter((t) => t.type === 'lease_renewal');

      expect(renewalTasks.length).toBeGreaterThan(0);
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(AuthHelper.requireAuth).mockRejectedValue(new Error('Auth failed'));

      const result = await getUpcomingTasks(5);

      expect(result.success).toBe(false);
      expect(result.tasks).toEqual([]);
      expect(result.error).toBeDefined();
    });
  });

  describe('getDashboardActivity', () => {
    it('should combine recent payments and upcoming tasks', async () => {
      const mockProperties = [{ id: 'prop_1', userId: 'user_123', address: '123 Main St' }];
      const mockUnits = [{ id: 'unit_1', propertyId: 'prop_1', unitNumber: 'A1' }];
      const mockTenants = [
        { id: 'tenant_1', unitId: 'unit_1', name: 'John Doe', propertyId: 'prop_1' },
      ];
      const mockLeases = [{ id: 'lease_1', tenantId: 'tenant_1' }];
      const mockPayments = [
        {
          id: 'pay_1',
          leaseId: 'lease_1',
          amount: 1500,
          date: new Date('2024-01-15'),
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
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(mockPayments),
      };

      // Mock for getRecentPayments
      vi.mocked(db.select)
        .mockReturnValueOnce(propertiesChain as any)
        .mockReturnValueOnce(unitsChain as any)
        .mockReturnValueOnce(tenantsChain as any)
        .mockReturnValueOnce(leasesChain as any)
        .mockReturnValueOnce(paymentsChain as any)
        // Mock for getUpcomingTasks - empty results
        .mockReturnValueOnce(propertiesChain as any)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          orderBy: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue([]),
        } as any) // renovations
        .mockReturnValueOnce(unitsChain as any)
        .mockReturnValueOnce(tenantsChain as any)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockResolvedValue([]),
        } as any); // leases

      const result = await getDashboardActivity();

      expect(result.success).toBe(true);
      expect(result.recentPayments).toBeDefined();
      expect(result.upcomingTasks).toBeDefined();
    });

    it('should handle errors from child functions', async () => {
      const mockProperties = [{ id: 'prop_1', userId: 'user_123', address: '123 Main St' }];
      const propertiesChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockProperties),
      };

      vi.mocked(db.select).mockReturnValueOnce(propertiesChain as any);
      // Make getRecentPayments fail
      vi.mocked(db.select).mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const result = await getDashboardActivity();

      expect(result.success).toBe(true); // Still succeeds, but with empty arrays
      expect(result.recentPayments).toEqual([]);
      expect(result.upcomingTasks).toEqual([]);
    });
  });
});
