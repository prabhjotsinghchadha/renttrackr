import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as AuthHelper from '@/helpers/AuthHelper';
import { db } from '@/libs/DB';
import {
  generateCashFlowAnalysis,
  generateIncomeStatement,
  generateTaxSummary,
  getFinancialMetrics,
} from '../FinancialActions';

// Mock dependencies
vi.mock('@/helpers/AuthHelper');
vi.mock('@/libs/DB', () => ({
  db: {
    select: vi.fn(),
    from: vi.fn(),
  },
}));

describe('FinancialActions', () => {
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

  describe('getFinancialMetrics', () => {
    it('should return zero metrics when user has no properties', async () => {
      const propertiesChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(propertiesChain as any);

      const result = await getFinancialMetrics();

      expect(result.totalRevenue).toBe(0);
      expect(result.totalExpenses).toBe(0);
      expect(result.netIncome).toBe(0);
      expect(result.monthlyRevenue).toBe(0);
      expect(result.annualRevenue).toBe(0);
    });

    it('should calculate financial metrics correctly', async () => {
      const now = new Date('2024-06-15');
      vi.useFakeTimers();
      vi.setSystemTime(now);

      const mockProperties = [{ id: 'prop_1', userId: 'user_123' }];
      const mockUnits = [{ id: 'unit_1', propertyId: 'prop_1' }];
      const mockTenants = [{ id: 'tenant_1', unitId: 'unit_1', propertyId: 'prop_1' }];
      const mockLeases = [{ id: 'lease_1', tenantId: 'tenant_1' }];
      const mockPayments = [
        {
          id: 'pay_1',
          leaseId: 'lease_1',
          amount: 1500,
          date: new Date('2024-06-10'),
        },
        {
          id: 'pay_2',
          leaseId: 'lease_1',
          amount: 1500,
          date: new Date('2024-05-10'),
        },
      ];
      const mockExpenses = [
        {
          id: 'exp_1',
          propertyId: 'prop_1',
          type: 'Maintenance',
          amount: 500,
          date: new Date('2024-06-05'),
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
        where: vi.fn().mockResolvedValue(mockPayments),
      };

      const expensesChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockExpenses),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(propertiesChain as any)
        .mockReturnValueOnce(unitsChain as any)
        .mockReturnValueOnce(tenantsChain as any)
        .mockReturnValueOnce(leasesChain as any)
        .mockReturnValueOnce(paymentsChain as any)
        .mockReturnValueOnce(expensesChain as any);

      const result = await getFinancialMetrics();

      expect(result.totalRevenue).toBe(3000);
      expect(result.totalExpenses).toBe(500);
      expect(result.annualRevenue).toBe(3000); // Payments in 2024
      expect(result.monthlyRevenue).toBe(1500); // June payment only
      expect(result.monthlyExpenses).toBe(500); // June expense only
      expect(result.netIncome).toBe(2500); // 3000 - 500

      vi.useRealTimers();
    });
  });

  describe('generateIncomeStatement', () => {
    it('should generate income statement with correct data structure', async () => {
      const now = new Date('2024-06-15');
      vi.useFakeTimers();
      vi.setSystemTime(now);

      const mockProperties = [{ id: 'prop_1', userId: 'user_123' }];
      const mockUnits = [{ id: 'unit_1', propertyId: 'prop_1' }];
      const mockTenants = [{ id: 'tenant_1', unitId: 'unit_1', propertyId: 'prop_1' }];
      const mockLeases = [{ id: 'lease_1', tenantId: 'tenant_1' }];
      const mockPayments = [
        {
          id: 'pay_1',
          leaseId: 'lease_1',
          amount: 1500,
          date: new Date('2024-06-10'),
          tenantName: 'John Doe',
          unitNumber: 'A1',
          propertyAddress: '123 Main St',
        },
      ];
      const mockExpenses = [
        {
          id: 'exp_1',
          propertyId: 'prop_1',
          type: 'Maintenance',
          amount: 500,
          date: new Date('2024-06-05'),
          propertyAddress: '123 Main St',
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

      const expensesChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockExpenses),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(propertiesChain as any)
        .mockReturnValueOnce(unitsChain as any)
        .mockReturnValueOnce(tenantsChain as any)
        .mockReturnValueOnce(leasesChain as any)
        .mockReturnValueOnce(paymentsChain as any)
        .mockReturnValueOnce(expensesChain as any);

      const result = await generateIncomeStatement();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.year).toBe(2024);
      expect(result.data?.totalRevenue).toBe(1500);
      expect(result.data?.totalExpenses).toBe(500);
      expect(result.data?.netIncome).toBe(1000);
      expect(result.data?.monthlyRevenue).toBeDefined();
      expect(result.data?.expensesByCategory).toBeDefined();

      vi.useRealTimers();
    });
  });

  describe('generateCashFlowAnalysis', () => {
    it('should generate cash flow analysis with monthly breakdown', async () => {
      const now = new Date('2024-06-15');
      vi.useFakeTimers();
      vi.setSystemTime(now);

      const mockProperties = [{ id: 'prop_1', userId: 'user_123' }];
      const mockUnits = [{ id: 'unit_1', propertyId: 'prop_1' }];
      const mockTenants = [{ id: 'tenant_1', unitId: 'unit_1', propertyId: 'prop_1' }];
      const mockLeases = [{ id: 'lease_1', tenantId: 'tenant_1' }];
      const mockPayments = [
        {
          id: 'pay_1',
          leaseId: 'lease_1',
          amount: 1500,
          date: new Date('2024-06-10'),
        },
      ];
      const mockExpenses = [
        {
          id: 'exp_1',
          propertyId: 'prop_1',
          type: 'Maintenance',
          amount: 500,
          date: new Date('2024-06-05'),
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

      const expensesChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockExpenses),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(propertiesChain as any)
        .mockReturnValueOnce(unitsChain as any)
        .mockReturnValueOnce(tenantsChain as any)
        .mockReturnValueOnce(leasesChain as any)
        .mockReturnValueOnce(paymentsChain as any)
        .mockReturnValueOnce(expensesChain as any);

      const result = await generateCashFlowAnalysis();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.year).toBe(2024);
      expect(result.data?.monthlyData).toBeDefined();
      expect(result.data?.monthlyData).toHaveLength(12);
      expect(result.data?.totalNetCashFlow).toBe(1000); // 1500 - 500

      vi.useRealTimers();
    });
  });

  describe('generateTaxSummary', () => {
    it('should categorize expenses for tax purposes', async () => {
      const now = new Date('2024-06-15');
      vi.useFakeTimers();
      vi.setSystemTime(now);

      const mockProperties = [{ id: 'prop_1', userId: 'user_123' }];
      const mockUnits = [{ id: 'unit_1', propertyId: 'prop_1' }];
      const mockTenants = [{ id: 'tenant_1', unitId: 'unit_1', propertyId: 'prop_1' }];
      const mockLeases = [{ id: 'lease_1', tenantId: 'tenant_1' }];
      const mockPayments = [
        {
          id: 'pay_1',
          leaseId: 'lease_1',
          amount: 1500,
          date: new Date('2024-06-10'),
        },
      ];
      const mockExpenses = [
        {
          id: 'exp_1',
          propertyId: 'prop_1',
          type: 'Maintenance',
          amount: 300,
          date: new Date('2024-06-05'),
          propertyAddress: '123 Main St',
        },
        {
          id: 'exp_2',
          propertyId: 'prop_1',
          type: 'Association Fee',
          amount: 200,
          date: new Date('2024-06-05'),
          propertyAddress: '123 Main St',
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

      const expensesChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockExpenses),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(propertiesChain as any)
        .mockReturnValueOnce(unitsChain as any)
        .mockReturnValueOnce(tenantsChain as any)
        .mockReturnValueOnce(leasesChain as any)
        .mockReturnValueOnce(paymentsChain as any)
        .mockReturnValueOnce(expensesChain as any);

      const result = await generateTaxSummary();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.categorizedExpenses).toBeDefined();
      expect(result.data?.taxableIncome).toBe(1000); // 1500 - 500
      expect(result.data?.categorizedExpenses.length).toBeGreaterThan(0);

      vi.useRealTimers();
    });
  });
});
