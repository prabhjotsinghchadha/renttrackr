import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@/models/Schema';

/**
 * Create a test database connection
 * Uses the same DATABASE_URL as development (Neon dev branch)
 */
export function createTestDbConnection() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required for integration tests');
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1,
  });

  return drizzle({
    client: pool,
    schema,
  });
}

/**
 * Get a test database instance
 */
let testDb: ReturnType<typeof createTestDbConnection> | null = null;

export function getTestDb() {
  if (!testDb) {
    testDb = createTestDbConnection();
  }
  return testDb;
}

/**
 * Close test database connection
 */
export async function closeTestDb() {
  if (testDb) {
    // Get the underlying pool and close it
    const pool = (testDb as any).client as Pool;
    await pool.end();
    testDb = null;
  }
}
