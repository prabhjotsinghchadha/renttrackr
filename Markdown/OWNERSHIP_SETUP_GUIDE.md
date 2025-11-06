# Property Ownership System - Setup Guide 🚀

## Quick Start

Follow these steps to deploy the new ownership system to your application.

---

## Step 1: Apply Database Migrations

The migration has already been generated. It will be automatically applied when you start your Next.js server.

### Option A: Automatic (Recommended)
```bash
# Simply restart your Next.js development server
npm run dev
```

The migration will be applied automatically via `instrumentation.ts`.

### Option B: Manual
```bash
# Apply migrations manually (if needed)
npm run db:migrate
```

---

## Step 2: Verify Migration

Check that the new tables were created:

1. Start your server: `npm run dev`
2. Open Drizzle Studio: `npm run db:studio`
3. Verify these tables exist:
   - `owners`
   - `property_owners`
   - `user_owners`
   - `invitations`

---

## Step 3: Migrate Existing Data

If you have existing properties, run the migration helper to convert them to the new ownership model.

### Create a migration endpoint (temporary)

Create `/src/app/api/migrate-ownership/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { migratePropertiesToOwnershipModel, checkMigrationStatus } from '@/actions/MigrationHelper';

export async function GET() {
  // Check status first
  const status = await checkMigrationStatus();
  
  if (!status.success) {
    return NextResponse.json({ error: status.error }, { status: 500 });
  }

  if (status.needsMigration === 0) {
    return NextResponse.json({ 
      message: 'No properties need migration',
      ...status
    });
  }

  // Run migration
  const result = await migratePropertiesToOwnershipModel();
  
  return NextResponse.json(result);
}
```

### Run the migration

1. Visit: `http://localhost:3000/api/migrate-ownership`
2. Review the output
3. **Delete the migration endpoint** after successful migration

**Alternative**: Call the migration function directly in a server action or script.

---

## Step 4: Add Owner Management Page (Optional)

Create a new page to manage owners: `/src/app/[locale]/(auth)/dashboard/owners/page.tsx`

```typescript
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { OwnerManagement } from '@/components/OwnerManagement';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Owners',
  });

  return {
    title: 'Owner Management',
    description: 'Manage property owners and ownership entities',
  };
}

export default async function OwnersPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <div className="container mx-auto py-8 md:py-12">
      <OwnerManagement locale={locale} />
    </div>
  );
}
```

### Add navigation link

Add to your dashboard navigation:

```tsx
<Link href="/dashboard/owners">
  Owners
</Link>
```

---

## Step 5: Test the System

### Test 1: Create an Owner
1. Go to `/dashboard/owners`
2. Click "Add Owner"
3. Create an individual owner with your name
4. Verify it appears in the list

### Test 2: Create Property with Owner
1. Go to `/dashboard/properties/new`
2. Fill in property details
3. Select your owner with 100% ownership
4. Create the property
5. View the property detail page
6. Verify ownership section shows correct information

### Test 3: Create Multi-Owner Property
1. Create another owner (or use existing)
2. Create a new property
3. Add multiple owners
4. Set ownership percentages (e.g., 50% / 50%)
5. Verify total equals 100%
6. Create and view the property

### Test 4: Invite a User (if you have multiple users)
1. Create a test owner or use existing
2. In `OwnerActions`, call `inviteUserToOwner()`
3. Use the invitation token to accept (implement UI as needed)

---

## Step 6: Clean Up (Optional)

### Remove or Update Old References

If you had any old owner fields (like `ownerName`, `additional_owner`, etc.), you can now safely:

1. Remove those columns from the schema (in a future migration)
2. Update any remaining references to use the new system

---

## 📋 Verification Checklist

- [ ] Database migration applied successfully
- [ ] New tables created (`owners`, `property_owners`, `user_owners`, `invitations`)
- [ ] Existing properties migrated to new ownership model
- [ ] Can create new owners (individual and LLC)
- [ ] Can create properties with single owner
- [ ] Can create properties with multiple owners
- [ ] Ownership percentages validated (must equal 100%)
- [ ] Property detail page shows ownership information
- [ ] Can view all properties across owned entities
- [ ] Access control working (admin/editor/viewer roles)

---

## 🔧 Troubleshooting

### Issue: Migration not applying automatically

**Solution**: Run manually:
```bash
npm run db:migrate
```

### Issue: Existing properties not showing up

**Solution**: 
1. Check if data migration ran successfully
2. Verify user has owner entities linked
3. Check browser console for errors

### Issue: "Total ownership must equal 100%" error

**Solution**: 
- Make sure all owner percentages add up to exactly 100
- Check for decimal precision issues

### Issue: Cannot see invited properties

**Solution**:
- Verify invitation was accepted
- Check that user-owner link was created
- Ensure property-owner relationship exists

---

## 🎯 What's Next?

The core system is now complete. Consider these enhancements:

### Immediate
1. Add owner management page to navigation
2. Create invitation acceptance UI
3. Add owner filter to property list

### Short-term
1. Ownership transfer functionality
2. View/manage user-owner relationships
3. Invitation management UI (resend, cancel, etc.)

### Long-term
1. Audit logs for ownership changes
2. Ownership reports and analytics
3. Bulk ownership operations
4. Owner-specific dashboards

---

## 📚 Documentation

For detailed information, see:
- **OWNERSHIP_SYSTEM_COMPLETE.md** - Full system documentation
- **src/actions/OwnerActions.ts** - Owner management API
- **src/actions/PropertyActions.ts** - Updated property queries
- **src/actions/MigrationHelper.ts** - Data migration utilities

---

## 🆘 Need Help?

If you encounter issues:
1. Check the console for error messages
2. Verify database schema matches expectations
3. Review the code comments in action files
4. Test with simple scenarios first

---

**Setup complete! You now have a powerful multi-owner property management system. 🎉**

