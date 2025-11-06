/**
 * Migration script to apply database migrations to Neon DB
 * 
 * Usage:
 *   npm run migrate:apply
 *   or
 *   npx tsx scripts/migrate.ts
 */

import path from 'node:path';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as schema from '../src/models/Schema';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Also check .env if .env.local doesn't exist
if (!process.env.DATABASE_URL) {
  config({ path: '.env' });
}

async function runMigrations() {
  console.log('🔄 Starting database migrations...');
  console.log(`📁 Migrations folder: ${path.join(process.cwd(), 'migrations')}`);
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set!');
    console.error('💡 Please set DATABASE_URL in your .env.local file');
    process.exit(1);
  }

  console.log(`🔗 Database URL: ${process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@')}`);

  // Create database connection directly (bypassing Env validation)
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1,
  });

  const db = drizzle({
    client: pool,
    schema,
  });

  try {
    await migrate(db, {
      migrationsFolder: path.join(process.cwd(), 'migrations'),
    });
    console.log('✅ Database migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCause = error && typeof error === 'object' && 'cause' in error ? error.cause : null;
    const causeMessage =
      errorCause && typeof errorCause === 'object' && 'message' in errorCause
        ? String(errorCause.message)
        : '';

    // Check if this is a "relation already exists" error
    const isAlreadyExistsError =
      errorMessage.includes('already exists') ||
      causeMessage.includes('already exists') ||
      (errorCause &&
        typeof errorCause === 'object' &&
        'code' in errorCause &&
        errorCause.code === '42P07');

    if (isAlreadyExistsError) {
      console.warn('⚠️  Some tables already exist. This might be normal if migrations were partially applied.');
      console.warn('💡 If you want to start fresh, drop the tables in Neon SQL Editor first.');
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();

