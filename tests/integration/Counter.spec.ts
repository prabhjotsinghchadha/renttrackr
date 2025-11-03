/**
 * Counter integration tests
 *
 * NOTE: This file contains Playwright E2E tests that require a running server.
 * These tests should be run via Playwright E2E test suite, not Vitest integration tests.
 *
 * The Counter API tests require:
 * - A running Next.js server
 * - HTTP request capabilities (page.request from Playwright)
 *
 * To run these tests, use: npm run test:e2e
 */
import { describe } from 'vitest';

// eslint-disable-next-line playwright/no-skipped-test
describe.skip('Counter - Move to E2E tests', () => {
  // All tests moved to Playwright E2E suite
  // See: tests/e2e/Counter.e2e.ts or create similar E2E test file
});
