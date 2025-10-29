import * as Clerk from '@clerk/nextjs/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as UserActions from '@/actions/UserActions';
import * as AuthHelper from '@/helpers/AuthHelper';

// Mock dependencies
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}));
vi.mock('@/actions/UserActions');

describe('AuthHelper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCurrentUser', () => {
    it('should return null when user is not authenticated', async () => {
      vi.mocked(Clerk.auth).mockResolvedValue({ userId: null } as any);

      const result = await AuthHelper.getCurrentUser();

      expect(result).toBeNull();
      expect(UserActions.getUserById).not.toHaveBeenCalled();
    });

    it('should return user when user exists in database', async () => {
      const mockUserId = 'user_123';
      const mockUser = {
        id: mockUserId,
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(Clerk.auth).mockResolvedValue({ userId: mockUserId } as any);
      vi.mocked(UserActions.getUserById).mockResolvedValue(mockUser);

      const result = await AuthHelper.getCurrentUser();

      expect(result).toEqual(mockUser);
      expect(UserActions.getUserById).toHaveBeenCalledWith(mockUserId);
      expect(UserActions.createUser).not.toHaveBeenCalled();
    });

    it('should create user if not found in database but exists in Clerk', async () => {
      const mockUserId = 'user_123';
      const mockClerkUser = {
        id: mockUserId,
        firstName: 'John',
        lastName: 'Doe',
        emailAddresses: [
          {
            id: 'email_1',
            emailAddress: 'john@example.com',
          },
        ],
        primaryEmailAddressId: 'email_1',
      };

      const mockCreatedUser = {
        id: mockUserId,
        email: 'john@example.com',
        name: 'John Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(Clerk.auth).mockResolvedValue({ userId: mockUserId } as any);
      vi.mocked(UserActions.getUserById).mockResolvedValue(null);
      vi.mocked(Clerk.currentUser).mockResolvedValue(mockClerkUser as any);
      vi.mocked(UserActions.createUser).mockResolvedValue({
        success: true,
        user: mockCreatedUser,
      });

      const result = await AuthHelper.getCurrentUser();

      expect(result).toEqual(mockCreatedUser);
      expect(UserActions.createUser).toHaveBeenCalledWith({
        id: mockUserId,
        email: 'john@example.com',
        name: 'John Doe',
      });
    });

    it('should return null if Clerk user has no primary email', async () => {
      const mockUserId = 'user_123';
      const mockClerkUser = {
        id: mockUserId,
        firstName: 'John',
        lastName: 'Doe',
        emailAddresses: [],
        primaryEmailAddressId: null,
      };

      vi.mocked(Clerk.auth).mockResolvedValue({ userId: mockUserId } as any);
      vi.mocked(UserActions.getUserById).mockResolvedValue(null);
      vi.mocked(Clerk.currentUser).mockResolvedValue(mockClerkUser as any);

      const result = await AuthHelper.getCurrentUser();

      expect(result).toBeNull();
      expect(UserActions.createUser).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(Clerk.auth).mockRejectedValue(new Error('Clerk error'));

      await expect(AuthHelper.getCurrentUser()).rejects.toThrow();
    });
  });

  describe('requireAuth', () => {
    it('should return user when authenticated', async () => {
      const mockUserId = 'user_123';
      const mockUser = {
        id: mockUserId,
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(Clerk.auth).mockResolvedValue({ userId: mockUserId } as any);
      vi.mocked(UserActions.getUserById).mockResolvedValue(mockUser);

      const result = await AuthHelper.requireAuth();

      expect(result).toEqual(mockUser);
    });

    it('should throw error when user is not authenticated', async () => {
      vi.mocked(Clerk.auth).mockResolvedValue({ userId: null } as any);

      await expect(AuthHelper.requireAuth()).rejects.toThrow('Unauthorized');
    });

    it('should throw error when user creation fails', async () => {
      const mockUserId = 'user_123';

      vi.mocked(Clerk.auth).mockResolvedValue({ userId: mockUserId } as any);
      vi.mocked(UserActions.getUserById).mockResolvedValue(null);
      vi.mocked(Clerk.currentUser).mockResolvedValue(null);

      await expect(AuthHelper.requireAuth()).rejects.toThrow('Unauthorized');
    });
  });
});
