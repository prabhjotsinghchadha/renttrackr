import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as AuthHelper from '@/helpers/AuthHelper';
import { db } from '@/libs/DB';
import {
  createExpense,
  getExpenseMetrics,
  getUserExpenses,
  updateExpense,
} from '../ExpenseActions';

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

describe('ExpenseActions', () => {
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

  describe('getUserExpenses', () => {
    it('should return empty array when user has no expenses', async () => {
      const mockProperties = [{ id: 'prop_1', userId: 'user_123' }];
      const propertiesChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockProperties),
      };

      const emptyChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(propertiesChain as any)
        .mockReturnValueOnce(emptyChain as any);

      const result = await getUserExpenses();

      expect(result.success).toBe(true);
      expect(result.expenses).toEqual([]);
    });

    it('should return expenses for user properties', async () => {
      const mockProperties = [{ id: 'prop_1', userId: 'user_123' }];
      const mockExpenses = [
        {
          id: 'exp_1',
          propertyId: 'prop_1',
          type: 'Maintenance',
          amount: 500,
          date: new Date('2024-01-15'),
        },
      ];

      const propertiesChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockProperties),
      };

      const expensesChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockExpenses),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(propertiesChain as any)
        .mockReturnValueOnce(expensesChain as any);

      const result = await getUserExpenses();

      expect(result.success).toBe(true);
      expect(result.expenses).toHaveLength(1);
      expect(result.expenses?.[0]?.type).toBe('Maintenance');
    });
  });

  describe('createExpense', () => {
    it('should create expense for user property', async () => {
      const mockProperty = { id: 'prop_1', userId: 'user_123' };

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
            id: 'exp_1',
            propertyId: 'prop_1',
            type: 'Maintenance',
            amount: 500,
            date: new Date('2024-01-15'),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]),
      };

      vi.mocked(db.select).mockReturnValue(propertyChain as any);
      vi.mocked(db.insert).mockReturnValue(insertChain as any);

      const result = await createExpense({
        propertyId: 'prop_1',
        type: 'Maintenance',
        amount: 500,
        date: new Date('2024-01-15'),
      });

      expect(result.success).toBe(true);
      expect(result.expense).toBeDefined();
      expect(result.expense?.amount).toBe(500);
    });

    it('should return error when property not found or unauthorized', async () => {
      const propertyChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(propertyChain as any);

      const result = await createExpense({
        propertyId: 'nonexistent',
        type: 'Maintenance',
        amount: 500,
        date: new Date(),
      });

      expect(result.success).toBe(false);
      expect(result.expense).toBeNull();
    });
  });

  describe('updateExpense', () => {
    it('should update expense when user owns the property', async () => {
      const mockExpense = {
        id: 'exp_1',
        propertyId: 'prop_1',
        type: 'Maintenance',
        amount: 500,
      };
      const mockProperty = { id: 'prop_1', userId: 'user_123' };

      const expenseChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockExpense]),
      };

      const propertyChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockProperty]),
      };

      const updateChain = {
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi
          .fn()
          .mockResolvedValue([{ ...mockExpense, amount: 750, updatedAt: new Date() }]),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(expenseChain as any)
        .mockReturnValueOnce(propertyChain as any);
      vi.mocked(db.update).mockReturnValue(updateChain as any);

      const result = await updateExpense('exp_1', { amount: 750 });

      expect(result.success).toBe(true);
      expect(result.expense?.amount).toBe(750);
    });
  });

  describe('getExpenseMetrics', () => {
    it('should calculate expense metrics correctly', async () => {
      const now = new Date('2024-06-15');
      vi.useFakeTimers();
      vi.setSystemTime(now);

      const mockProperties = [{ id: 'prop_1', userId: 'user_123' }];
      const mockExpenses = [
        {
          id: 'exp_1',
          propertyId: 'prop_1',
          type: 'Maintenance',
          amount: 500,
          date: new Date('2024-06-10'),
        },
        {
          id: 'exp_2',
          propertyId: 'prop_1',
          type: 'Association Fee',
          amount: 200,
          date: new Date('2024-05-15'),
        },
        {
          id: 'exp_3',
          propertyId: 'prop_1',
          type: 'Repair',
          amount: 300,
          date: new Date('2024-01-20'),
        },
      ];

      const propertiesChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockProperties),
      };

      const expensesChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockExpenses),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(propertiesChain as any)
        .mockReturnValueOnce(expensesChain as any);

      const result = await getExpenseMetrics();

      expect(result.totalThisMonth).toBe(500); // June expense only
      expect(result.totalThisYear).toBe(1000); // All 2024 expenses
      expect(result.maintenance).toBe(800); // Maintenance + Repair (2024)

      vi.useRealTimers();
    });
  });
});
