import { vi } from 'vitest';

/**
 * Helper function to create properly chained Drizzle ORM mocks
 * This ensures the chaining works correctly with Vitest's mockReturnThis()
 */
export function createDrizzleChain<T = any>(
  resolver: T | (() => Promise<T>),
  options?: {
    withLimit?: { resolver: T[] | (() => Promise<T[]>) };
    withOrderBy?: { resolver: T[] | (() => Promise<T[]>) };
    withOrderByAndLimit?: {
      orderByResolver: T[] | (() => Promise<T[]>);
      limitResolver: T[] | (() => Promise<T[]>);
    };
  },
) {
  const chain: any = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
  };

  if (options?.withLimit) {
    chain.where = vi.fn().mockReturnThis();
    chain.limit =
      typeof options.withLimit.resolver === 'function'
        ? vi.fn().mockImplementation(options.withLimit.resolver)
        : vi.fn().mockResolvedValue(options.withLimit.resolver);
    return chain;
  }

  if (options?.withOrderBy) {
    chain.where = vi.fn().mockReturnThis();
    chain.orderBy =
      typeof options.withOrderBy.resolver === 'function'
        ? vi.fn().mockImplementation(options.withOrderBy.resolver)
        : vi.fn().mockResolvedValue(options.withOrderBy.resolver);
    return chain;
  }

  if (options?.withOrderByAndLimit) {
    chain.where = vi.fn().mockReturnThis();
    chain.orderBy = vi.fn().mockReturnThis();
    chain.limit =
      typeof options.withOrderByAndLimit.limitResolver === 'function'
        ? vi.fn().mockImplementation(options.withOrderByAndLimit.limitResolver)
        : vi.fn().mockResolvedValue(options.withOrderByAndLimit.limitResolver);
    return chain;
  }

  // Simple where chain that resolves directly
  if (typeof resolver === 'function') {
    chain.where = vi.fn().mockImplementation(resolver as any);
  } else {
    chain.where = vi.fn().mockResolvedValue(resolver);
  }

  return chain;
}

/**
 * Helper to create an insert chain mock
 */
export function createInsertChain<T = any>(returningValue: T[]) {
  return {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue(returningValue),
  };
}

/**
 * Helper to create an update chain mock
 */
export function createUpdateChain<T = any>(returningValue: T[] = []) {
  return {
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue(returningValue),
  };
}

/**
 * Helper to create a delete chain mock
 */
export function createDeleteChain() {
  return {
    delete: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue(undefined),
  };
}
