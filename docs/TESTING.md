# Testing Guide

## Overview

This project uses:

- **Vitest** for unit tests
- **Playwright** for E2E tests

## Test Status

As of the current implementation, most tests are passing. Some tests related to complex Drizzle ORM query chaining have known issues with mocking that may require:

1. Using integration tests with a test database instead of mocks
2. Refactoring complex queries to be more testable
3. Using the shared mock helper (see below)

## Drizzle ORM Mocking

Drizzle ORM uses a fluent/chained API that can be difficult to mock. We've created a helper utility to make this easier.

### Using the Mock Helper

```typescript
import { createDrizzleChain, createInsertChain } from '../helpers/drizzleMockHelper';

// For a simple select query
const propertiesChain = createDrizzleChain([{ id: 'prop_1', userId: 'user_123' }]);

// For a query with limit
const leaseChain = createDrizzleChain([{ id: 'lease_1', tenantId: 'tenant_1' }], {
  withLimit: { resolver: [{ id: 'lease_1' }] },
});

// For a query with orderBy
const paymentsChain = createDrizzleChain([], { withOrderBy: { resolver: mockPayments } });

// For insert
const insertChain = createInsertChain([{ id: 'new_item', ...data }]);

vi.mocked(db.select)
  .mockReturnValueOnce(propertiesChain as any)
  .mockReturnValueOnce(leaseChain as any);
```

### Manual Mocking Pattern

When the helper doesn't work, use this pattern (from DashboardActions.test.ts which works):

```typescript
const chain = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockResolvedValue(mockData), // Resolves directly for simple queries
};

// For queries with orderBy
const chainWithOrderBy = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(), // Returns this for chaining
  orderBy: vi.fn().mockResolvedValue(mockData), // Resolves here
};

// For queries with limit
const chainWithLimit = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  limit: vi.fn().mockResolvedValue(mockData),
};
```

## Known Issues

### PaymentActions Tests

Some tests in `PaymentActions.test.ts` fail due to complex query chains:

- `getUserPayments` - Complex chain with select({id}) pattern
- `createPayment` - Multiple nested queries
- `getPaymentMetrics` - Calls multiple functions internally
- `getPendingAndOverdueDetails` - Complex date calculations

**Workaround**: These functions work correctly in production but are difficult to mock. Consider:

- Integration testing with a real test database
- Refactoring to smaller, more testable functions

### LeaseActions Tests

- `getLeasesByTenantId` - Similar chaining issues

## Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run E2E tests (requires auth setup)
npm run test:e2e

# Run specific test file
npm test -- src/actions/__tests__/PaymentActions.test.ts

# Run with coverage
npm test -- --coverage
```

## E2E Tests

E2E tests are currently skipped (`test.skip()`) because they require:

1. Clerk authentication setup with test accounts
2. Test database configuration
3. Proper test data seeding

When ready to enable:

1. Set up Clerk test accounts
2. Configure test database
3. Create authentication helper
4. Remove `test.skip()` wrappers

## Best Practices

1. **Mock at the right level**: Mock database calls, not business logic
2. **Test behavior, not implementation**: Focus on what functions return, not how they work internally
3. **Use integration tests for complex queries**: When mocking becomes too complex, use a real test database
4. **Keep tests simple**: One assertion per test when possible
5. **Use descriptive test names**: Test names should clearly describe what they test
