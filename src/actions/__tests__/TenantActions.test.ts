import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as AuthHelper from '@/helpers/AuthHelper';
import { db } from '@/libs/DB';
import {
  createTenant,
  deleteTenant,
  getTenantById,
  getTenantCount,
  getUserTenants,
  updateTenant,
} from '../TenantActions';

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

describe('TenantActions', () => {
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

  describe('getUserTenants', () => {
    it('should return empty array when user has no tenants', async () => {
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
        .mockReturnValueOnce(emptyChain as any);

      const result = await getUserTenants();

      expect(result.success).toBe(true);
      expect(result.tenants).toEqual([]);
    });

    it('should return tenants for user properties', async () => {
      const mockProperties = [{ id: 'prop_1', userId: 'user_123' }];
      const mockTenants = [
        {
          id: 'tenant_1',
          propertyId: 'prop_1',
          unitId: 'unit_1',
          name: 'John Doe',
          email: 'john@example.com',
        },
      ];

      const propertiesChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockProperties),
      };

      const tenantsChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockTenants),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(propertiesChain as any)
        .mockReturnValueOnce(tenantsChain as any);

      const result = await getUserTenants();

      expect(result.success).toBe(true);
      expect(result.tenants).toHaveLength(1);
      expect(result.tenants?.[0]?.name).toBe('John Doe');
    });
  });

  describe('getTenantById', () => {
    it('should return tenant when user owns the property', async () => {
      const mockTenant = {
        id: 'tenant_1',
        propertyId: 'prop_1',
        unitId: 'unit_1',
        name: 'John Doe',
      };
      const mockUnit = { id: 'unit_1', propertyId: 'prop_1' };
      const mockProperty = { id: 'prop_1', userId: 'user_123' };

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

      vi.mocked(db.select)
        .mockReturnValueOnce(tenantChain as any)
        .mockReturnValueOnce(unitChain as any)
        .mockReturnValueOnce(propertyChain as any);

      const result = await getTenantById('tenant_1');

      expect(result.success).toBe(true);
      expect(result.tenant).toEqual(mockTenant);
    });

    it('should return error when tenant not found', async () => {
      const tenantChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(tenantChain as any);

      const result = await getTenantById('nonexistent');

      expect(result.success).toBe(false);
      expect(result.tenant).toBeNull();
    });
  });

  describe('createTenant', () => {
    it('should create tenant with unitId', async () => {
      const mockUnit = { id: 'unit_1', propertyId: 'prop_1' };
      const mockProperty = { id: 'prop_1', userId: 'user_123' };

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
            id: 'tenant_1',
            propertyId: 'prop_1',
            unitId: 'unit_1',
            name: 'John Doe',
            email: 'john@example.com',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(unitChain as any)
        .mockReturnValueOnce(propertyChain as any);
      vi.mocked(db.insert).mockReturnValue(insertChain as any);

      const result = await createTenant({
        unitId: 'unit_1',
        name: 'John Doe',
        email: 'john@example.com',
      });

      expect(result.success).toBe(true);
      expect(result.tenant).toBeDefined();
      expect(result.tenant?.name).toBe('John Doe');
    });

    it('should create tenant with propertyId for single-family', async () => {
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
            id: 'tenant_1',
            propertyId: 'prop_1',
            unitId: null,
            name: 'Jane Smith',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]),
      };

      vi.mocked(db.select).mockReturnValue(propertyChain as any);
      vi.mocked(db.insert).mockReturnValue(insertChain as any);

      const result = await createTenant({
        propertyId: 'prop_1',
        name: 'Jane Smith',
      });

      expect(result.success).toBe(true);
      expect(result.tenant).toBeDefined();
    });

    it('should return error when neither propertyId nor unitId provided', async () => {
      const result = await createTenant({
        name: 'John Doe',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('propertyId or unitId');
    });
  });

  describe('updateTenant', () => {
    it('should update tenant information', async () => {
      const mockTenant = {
        id: 'tenant_1',
        propertyId: 'prop_1',
        unitId: 'unit_1',
        name: 'John Doe',
      };
      const mockUnit = { id: 'unit_1', propertyId: 'prop_1' };
      const mockProperty = { id: 'prop_1', userId: 'user_123' };

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

      const updateChain = {
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi
          .fn()
          .mockResolvedValue([{ ...mockTenant, name: 'John Updated', updatedAt: new Date() }]),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(tenantChain as any)
        .mockReturnValueOnce(unitChain as any)
        .mockReturnValueOnce(propertyChain as any);
      vi.mocked(db.update).mockReturnValue(updateChain as any);

      const result = await updateTenant('tenant_1', { name: 'John Updated' });

      expect(result.success).toBe(true);
      expect(result.tenant?.name).toBe('John Updated');
    });
  });

  describe('deleteTenant', () => {
    it('should delete tenant when user owns it', async () => {
      const mockTenant = {
        id: 'tenant_1',
        propertyId: 'prop_1',
        unitId: 'unit_1',
      };
      const mockUnit = { id: 'unit_1', propertyId: 'prop_1' };
      const mockProperty = { id: 'prop_1', userId: 'user_123' };

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

      const deleteChain = {
        delete: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(tenantChain as any)
        .mockReturnValueOnce(unitChain as any)
        .mockReturnValueOnce(propertyChain as any);
      vi.mocked(db.delete).mockReturnValue(deleteChain as any);

      const result = await deleteTenant('tenant_1');

      expect(result.success).toBe(true);
    });
  });

  describe('getTenantCount', () => {
    it('should return count of user tenants', async () => {
      const mockProperties = [{ id: 'prop_1', userId: 'user_123' }];
      const mockTenants = [
        { id: 'tenant_1', propertyId: 'prop_1' },
        { id: 'tenant_2', propertyId: 'prop_1' },
      ];

      const propertiesChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockProperties),
      };

      const tenantsChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockTenants),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(propertiesChain as any)
        .mockReturnValueOnce(tenantsChain as any);

      const count = await getTenantCount();

      expect(count).toBe(2);
    });
  });
});
