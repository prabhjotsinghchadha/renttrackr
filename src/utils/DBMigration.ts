import path from 'node:path';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Env } from '@/libs/Env';
import { createDbConnection } from './DBConnection';

// Skip migrations in production runtime - they should run during build/deployment
// In serverless environments like Vercel, migrations should not run on every function invocation
(async () => {
  // Skip migrations in production on Vercel
  if (Env.NODE_ENV === 'production' && process.env.VERCEL === '1') {
    console.warn(
      '⚠️  Skipping migrations in production runtime. Migrations should run during build.',
    );
    return;
  }

  // Create a new and dedicated database connection for running migrations
  const db = createDbConnection();

  try {
    await migrate(db, {
      migrationsFolder: path.join(process.cwd(), 'migrations'),
    });
    console.warn('✅ Database migrations completed successfully');
  } catch (error) {
    // Check if the error is about tables already existing
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCause = error && typeof error === 'object' && 'cause' in error ? error.cause : null;
    const causeMessage =
      errorCause && typeof errorCause === 'object' && 'message' in errorCause
        ? String(errorCause.message)
        : '';

    // Check if this is a "relation already exists" error (PostgreSQL error code 42P07)
    const isAlreadyExistsError =
      errorMessage.includes('already exists') ||
      causeMessage.includes('already exists') ||
      (errorCause &&
        typeof errorCause === 'object' &&
        'code' in errorCause &&
        errorCause.code === '42P07');

    // Check if this is a schema creation error (common with Neon DB which doesn't allow custom schemas)
    const isSchemaCreationError =
      errorMessage.includes('CREATE SCHEMA') ||
      causeMessage.includes('CREATE SCHEMA') ||
      errorMessage.includes('Control plane request failed') ||
      causeMessage.includes('Control plane request failed') ||
      (errorCause &&
        typeof errorCause === 'object' &&
        'code' in errorCause &&
        errorCause.code === 'XX000');

    if (isAlreadyExistsError) {
      console.warn(
        "⚠️  Tables already exist, skipping migration. This is normal if you've already run migrations.",
      );
      console.warn('💡 Tip: If you want a fresh start, delete the local.db file and restart.');
    } else if (isSchemaCreationError) {
      console.warn(
        '⚠️  Schema creation error detected (likely Neon DB restriction). Migrations should run during build/deployment, not at runtime.',
      );
      console.warn(
        '💡 Tip: Run migrations manually or during build process using: npm run db:migrate',
      );
      // Don't throw - this is expected in production with Neon DB
    } else {
      // Re-throw other errors
      console.error('❌ Migration failed:', error);
      throw error;
    }
  } finally {
    await db.$client.end();
  }
})();
