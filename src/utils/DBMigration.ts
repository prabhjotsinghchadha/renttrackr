import path from 'node:path';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { createDbConnection } from './DBConnection';

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

  if (isAlreadyExistsError) {
    console.warn(
      "⚠️  Tables already exist, skipping migration. This is normal if you've already run migrations.",
    );
    console.warn('💡 Tip: If you want a fresh start, delete the local.db file and restart.');
  } else {
    // Re-throw other errors
    console.error('❌ Migration failed:', error);
    throw error;
  }
} finally {
  await db.$client.end();
}
