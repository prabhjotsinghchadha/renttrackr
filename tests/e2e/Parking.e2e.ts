import { test } from '@playwright/test';

test.describe('Parking Permits', () => {

  // eslint-disable-next-line playwright/expect-expect, playwright/no-skipped-test
  test.skip('should create a new parking permit', async ({ page: _page }) => {
    // TODO: Set up authentication helper and seed data
    // 1. Sign in
    // 2. Navigate to parking page
    // 3. Click "Add Permit"
    // 4. Fill in permit form (property, tenant, vehicle info, permit number)
    // 5. Submit form
    // 6. Verify permit appears in list
  });


  // eslint-disable-next-line playwright/expect-expect, playwright/no-skipped-test
  test.skip('should assign permit to tenant', async ({ page: _page }) => {
    // TODO: Set up authentication helper and seed data
    // 1. Sign in
    // 2. Create parking permit
    // 3. Select tenant from dropdown
    // 4. Verify permit is associated with tenant
  });


  // eslint-disable-next-line playwright/expect-expect, playwright/no-skipped-test
  test.skip('should display parking permit list', async ({ page: _page }) => {
    // TODO: Set up authentication helper and seed data
    // 1. Sign in
    // 2. Navigate to parking page
    // 3. Verify permits are displayed
    // 4. Verify permit details (permit number, tenant, vehicle, status) are visible
  });


  // eslint-disable-next-line playwright/expect-expect, playwright/no-skipped-test
  test.skip('should update permit status', async ({ page: _page }) => {
    // TODO: Set up authentication helper and seed data
    // 1. Sign in
    // 2. Navigate to permit details
    // 3. Change status to "Cancelled"
    // 4. Verify status update is saved
  });


  // eslint-disable-next-line playwright/expect-expect, playwright/no-skipped-test
  test.skip('should add activity notes to permit', async ({ page: _page }) => {
    // TODO: Set up authentication helper and seed data
    // 1. Sign in
    // 2. Navigate to permit details
    // 3. Add activity note
    // 4. Verify note appears in activity history
  });


  // eslint-disable-next-line playwright/expect-expect, playwright/no-skipped-test
  test.skip('should filter permits by status', async ({ page: _page }) => {
    // TODO: Set up authentication helper and seed data
    // 1. Sign in
    // 2. Navigate to parking page
    // 3. Filter by "Active" status
    // 4. Verify only active permits are shown
  });
});
