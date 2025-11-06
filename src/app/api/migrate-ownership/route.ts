import { NextResponse } from 'next/server';
import { checkMigrationStatus, migratePropertiesToOwnershipModel } from '@/actions/MigrationHelper';

export async function GET() {
  try {
    // Check status first
    const status = await checkMigrationStatus();

    if (!status.success) {
      return NextResponse.json({ error: status.error }, { status: 500 });
    }

    if (status.needsMigration === 0) {
      return NextResponse.json({
        message: 'No properties need migration',
        ...status,
      });
    }

    // Run migration
    const result = await migratePropertiesToOwnershipModel();

    return NextResponse.json(result);
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Migration failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}

