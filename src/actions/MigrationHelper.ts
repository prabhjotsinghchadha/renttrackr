'use server';

import { eq } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { ownerSchema, propertyOwnerSchema, propertySchema, userOwnerSchema, userSchema } from '@/models/Schema';

/**
 * Migration helper to convert existing properties to the new ownership model
 * This should be run once to migrate existing data
 * 
 * For each existing property:
 * 1. Check if the user has an owner entity
 * 2. If not, create an individual owner for the user
 * 3. Link the property to that owner with 100% ownership
 * 4. Link the user to that owner as admin
 */
export async function migratePropertiesToOwnershipModel() {
  try {
    console.warn('🔄 Starting property ownership migration...');

    // Get all properties
    const properties = await db.select().from(propertySchema);
    console.warn(`📊 Found ${properties.length} properties to migrate`);

    // Get all users
    const users = await db.select().from(userSchema);
    console.warn(`👥 Found ${users.length} users`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      // Check if user already has an owner entity
      const existingUserOwners = await db
        .select()
        .from(userOwnerSchema)
        .where(eq(userOwnerSchema.userId, user.id));

      let ownerId: string;

      if (existingUserOwners.length === 0) {
        // Create an individual owner for this user
        const [newOwner] = await db
          .insert(ownerSchema)
          .values({
            name: user.name || user.email,
            type: 'individual',
            email: user.email,
          })
          .returning();

        if (!newOwner) {
          console.error(`❌ Failed to create owner for user ${user.email}`);
          continue;
        }

        ownerId = newOwner.id;
        console.warn(`✅ Created owner for user: ${user.email}`);

        // Link user to owner as admin
        await db.insert(userOwnerSchema).values({
          userId: user.id,
          ownerId,
          role: 'admin',
        });

        console.warn(`🔗 Linked user ${user.email} to owner as admin`);
      } else {
        // Use the first existing owner (assuming admin role)
        const firstOwner = existingUserOwners[0];
        if (!firstOwner) {
          console.error(`❌ No owner found for user ${user.email}`);
          continue;
        }
        ownerId = firstOwner.ownerId;
        console.warn(`♻️  Using existing owner for user: ${user.email}`);
      }

      // Get all properties for this user
      const userProperties = properties.filter((p) => p.userId === user.id);

      for (const property of userProperties) {
        // Check if property already has ownership records
        const existingPropertyOwners = await db
          .select()
          .from(propertyOwnerSchema)
          .where(eq(propertyOwnerSchema.propertyId, property.id));

        if (existingPropertyOwners.length > 0) {
          console.warn(`⏭️  Property ${property.address} already has ownership records, skipping`);
          skippedCount++;
          continue;
        }

        // Create property-owner relationship
        await db.insert(propertyOwnerSchema).values({
          propertyId: property.id,
          ownerId,
          ownershipPercentage: 100,
        });

        console.warn(`✅ Migrated property: ${property.address} to owner ${ownerId}`);
        migratedCount++;
      }
    }

    console.warn(`
🎉 Migration Complete!
📊 Statistics:
   - Properties migrated: ${migratedCount}
   - Properties skipped: ${skippedCount}
   - Total users processed: ${users.length}
    `);

    return {
      success: true,
      migratedCount,
      skippedCount,
      totalUsers: users.length,
    };
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check migration status - see how many properties need migration
 */
export async function checkMigrationStatus() {
  try {
    const properties = await db.select().from(propertySchema);
    
    let needsMigration = 0;
    let alreadyMigrated = 0;

    for (const property of properties) {
      const existingPropertyOwners = await db
        .select()
        .from(propertyOwnerSchema)
        .where(eq(propertyOwnerSchema.propertyId, property.id));

      if (existingPropertyOwners.length === 0) {
        needsMigration++;
      } else {
        alreadyMigrated++;
      }
    }

    return {
      success: true,
      totalProperties: properties.length,
      needsMigration,
      alreadyMigrated,
    };
  } catch (error) {
    console.error('Error checking migration status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

