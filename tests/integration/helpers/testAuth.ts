import type { InferSelectModel } from 'drizzle-orm';
import type { userSchema } from '@/models/Schema';
import { vi } from 'vitest';
import * as AuthHelper from '@/helpers/AuthHelper';

type User = InferSelectModel<typeof userSchema>;

/**
 * Mock Clerk authentication for integration tests
 * Sets up a test user that will be used by requireAuth()
 */
export function setupTestAuth(testUser: User) {
  // Mock requireAuth to return the test user
  vi.spyOn(AuthHelper, 'requireAuth').mockResolvedValue(testUser);
  vi.spyOn(AuthHelper, 'getCurrentUser').mockResolvedValue(testUser);
  vi.spyOn(AuthHelper, 'getCurrentUserId').mockResolvedValue(testUser.id);
}

/**
 * Clear auth mocks
 */
export function clearTestAuth() {
  vi.restoreAllMocks();
}
