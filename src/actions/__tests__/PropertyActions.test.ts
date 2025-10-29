import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as AuthHelper from '@/helpers/AuthHelper';
import { db } from '@/libs/DB';
import {
  createProperty,
  createUnit,
  deleteProperty,
  deleteUnit,
  getPropertyById,
  getPropertyCount,
  getUserProperties,
  getUserUnits,
  updateProperty,
  updateUnit,
} from '../PropertyActions';

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

describe('PropertyActions', () => {
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

  describe('getUserProperties', () => {
    it('should return empty array when user has no properties', async () => {
      const mockDbChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockDbChain as any);

      const result = await getUserProperties();

      expect(result.success).toBe(true);
      expect(result.properties).toEqual([]);
    });

    it('should return only user own properties', async () => {
      const mockProperties = [
        { id: 'prop_1', userId: 'user_123', address: '123 Main St' },
        { id: 'prop_2', userId: 'user_123', address: '456 Oak Ave' },
      ];

      const mockDbChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockProperties),
      };

      vi.mocked(db.select).mockReturnValue(mockDbChain as any);

      const result = await getUserProperties();

      expect(result.success).toBe(true);
      expect(result.properties).toHaveLength(2);
      expect(result.properties.every((p) => p.userId === 'user_123')).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(AuthHelper.requireAuth).mockRejectedValue(new Error('Auth failed'));

      const result = await getUserProperties();

      expect(result.success).toBe(false);
      expect(result.properties).toEqual([]);
      expect(result.error).toBeDefined();
    });
  });

  describe('getPropertyById', () => {
    it('should return property when user owns it', async () => {
      const mockProperty = {
        id: 'prop_1',
        userId: 'user_123',
        address: '123 Main St',
        propertyType: 'single_family',
      };

      const mockUnits = [
        { id: 'unit_1', propertyId: 'prop_1', unitNumber: 'A1', rentAmount: 1500 },
      ];

      const propertyChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockProperty]),
      };

      const unitsChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockUnits),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(propertyChain as any)
        .mockReturnValueOnce(unitsChain as any);

      const result = await getPropertyById('prop_1');

      expect(result.success).toBe(true);
      expect(result.property).toEqual(mockProperty);
      expect(result.units).toEqual(mockUnits);
    });

    it('should return error when property not found', async () => {
      const propertyChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(propertyChain as any);

      const result = await getPropertyById('nonexistent');

      expect(result.success).toBe(false);
      expect(result.property).toBeNull();
      expect(result.error).toContain('not found');
    });
  });

  describe('createProperty', () => {
    it('should create property successfully', async () => {
      const propertyData = {
        address: '123 Main St',
        propertyType: 'single_family',
        acquiredOn: new Date('2020-01-01'),
        principalAmount: 200000,
        rateOfInterest: 3.5,
      };

      const mockCreatedProperty = {
        id: 'prop_1',
        userId: 'user_123',
        ...propertyData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const insertChain = {
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockCreatedProperty]),
      };

      vi.mocked(db.insert).mockReturnValue(insertChain as any);

      const result = await createProperty(propertyData);

      expect(result.success).toBe(true);
      expect(result.property).toEqual(mockCreatedProperty);
      expect(result.property?.userId).toBe('user_123');
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(db.insert).mockImplementation(() => {
        throw new Error('Database error');
      });

      const result = await createProperty({ address: '123 Main St' });

      expect(result.success).toBe(false);
      expect(result.property).toBeNull();
      expect(result.error).toBeDefined();
    });
  });

  describe('updateProperty', () => {
    it('should update property when user owns it', async () => {
      const mockProperty = {
        id: 'prop_1',
        userId: 'user_123',
        address: '123 Main St',
      };

      const updatedData = {
        address: '456 Updated St',
        propertyType: 'condo',
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
          .mockResolvedValue([{ ...mockProperty, ...updatedData, updatedAt: new Date() }]),
      };

      vi.mocked(db.select).mockReturnValue(propertyChain as any);
      vi.mocked(db.update).mockReturnValue(updateChain as any);

      const result = await updateProperty('prop_1', updatedData);

      expect(result.success).toBe(true);
      expect(result.property?.address).toBe('456 Updated St');
    });

    it('should return error when property not found', async () => {
      const propertyChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(propertyChain as any);

      const result = await updateProperty('nonexistent', { address: 'New Address' });

      expect(result.success).toBe(false);
      expect(result.property).toBeNull();
    });
  });

  describe('deleteProperty', () => {
    it('should delete property when user owns it', async () => {
      const deleteChain = {
        delete: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      };

      vi.mocked(db.delete).mockReturnValue(deleteChain as any);

      const result = await deleteProperty('prop_1');

      expect(result.success).toBe(true);
      expect(deleteChain.where).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(db.delete).mockImplementation(() => {
        throw new Error('Database error');
      });

      const result = await deleteProperty('prop_1');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getPropertyCount', () => {
    it('should return count of user properties', async () => {
      const mockProperties = [
        { id: 'prop_1', userId: 'user_123' },
        { id: 'prop_2', userId: 'user_123' },
      ];

      const mockDbChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockProperties),
      };

      vi.mocked(db.select).mockReturnValue(mockDbChain as any);

      const count = await getPropertyCount();

      expect(count).toBe(2);
    });
  });

  describe('getUserUnits', () => {
    it('should return units for user properties', async () => {
      const mockProperties = [{ id: 'prop_1', userId: 'user_123', address: '123 Main St' }];
      const mockUnits = [
        { id: 'unit_1', propertyId: 'prop_1', unitNumber: 'A1', rentAmount: 1500 },
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

      vi.mocked(db.select)
        .mockReturnValueOnce(propertiesChain as any)
        .mockReturnValueOnce(unitsChain as any);

      const result = await getUserUnits();

      expect(result.success).toBe(true);
      expect(result.units).toHaveLength(1);
      expect(result.units?.[0]?.propertyAddress).toBe('123 Main St');
    });
  });

  describe('createUnit', () => {
    it('should create unit for user property', async () => {
      const mockProperty = { id: 'prop_1', userId: 'user_123' };
      const unitData = {
        propertyId: 'prop_1',
        unitNumber: 'A1',
        rentAmount: 1500,
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
            id: 'unit_1',
            ...unitData,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]),
      };

      vi.mocked(db.select).mockReturnValue(propertyChain as any);
      vi.mocked(db.insert).mockReturnValue(insertChain as any);

      const result = await createUnit(unitData);

      expect(result.success).toBe(true);
      expect(result.unit).toBeDefined();
      expect(result.unit?.id).toBe('unit_1');
    });

    it('should return error when property not found or unauthorized', async () => {
      const propertyChain = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(propertyChain as any);

      const result = await createUnit({
        propertyId: 'nonexistent',
        unitNumber: 'A1',
        rentAmount: 1500,
      });

      expect(result.success).toBe(false);
      expect(result.unit).toBeNull();
    });
  });

  describe('updateUnit', () => {
    it('should update unit when user owns the property', async () => {
      const mockUnit = { id: 'unit_1', propertyId: 'prop_1', unitNumber: 'A1', rentAmount: 1500 };
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

      const updateChain = {
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi
          .fn()
          .mockResolvedValue([{ ...mockUnit, rentAmount: 1800, updatedAt: new Date() }]),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(unitChain as any)
        .mockReturnValueOnce(propertyChain as any);
      vi.mocked(db.update).mockReturnValue(updateChain as any);

      const result = await updateUnit('unit_1', { rentAmount: 1800 });

      expect(result.success).toBe(true);
      expect(result.unit?.rentAmount).toBe(1800);
    });
  });

  describe('deleteUnit', () => {
    it('should delete unit when user owns the property', async () => {
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

      const deleteChain = {
        delete: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(unitChain as any)
        .mockReturnValueOnce(propertyChain as any);
      vi.mocked(db.delete).mockReturnValue(deleteChain as any);

      const result = await deleteUnit('unit_1');

      expect(result.success).toBe(true);
    });
  });
});
