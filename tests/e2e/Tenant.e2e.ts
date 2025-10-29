import { test } from '@playwright/test';

test.describe('Tenant CRUD', () => {
  // eslint-disable-next-line playwright/expect-expect, playwright/no-skipped-test
  test.skip('should create a new tenant', async ({ page: _page }) => {
    // TODO: Set up authentication helper and seed data
    // 1. Sign in
    // 2. Navigate to tenants page
    // 3. Click "Add Tenant"
    // 4. Fill in tenant form (name, property/unit selection)
    // 5. Submit form
    // 6. Verify tenant appears in list
  });

  // eslint-disable-next-line playwright/expect-expect, playwright/no-skipped-test
  test.skip('should assign tenant to property/unit', async ({ page: _page }) => {
    // TODO: Set up authentication helper and seed data
    // 1. Sign in
    // 2. Create tenant
    // 3. Select property/unit during tenant creation
    // 4. Verify tenant is associated with selected property/unit
  });

  // eslint-disable-next-line playwright/expect-expect, playwright/no-skipped-test
  test.skip('should display tenant list', async ({ page: _page }) => {
    // TODO: Set up authentication helper and seed data
    // 1. Sign in
    // 2. Navigate to tenants page
    // 3. Verify tenants are displayed
    // 4. Verify tenant information (name, property, unit) is visible
  });

  // eslint-disable-next-line playwright/expect-expect, playwright/no-skipped-test
  test.skip('should view tenant details', async ({ page: _page }) => {
    // TODO: Set up authentication helper and seed data
    // 1. Sign in
    // 2. Navigate to tenants page
    // 3. Click on a tenant
    // 4. Verify tenant details page loads
    // 5. Verify tenant information and associated lease/payments are displayed
  });

  // eslint-disable-next-line playwright/expect-expect, playwright/no-skipped-test
  test.skip('should edit tenant', async ({ page: _page }) => {
    // TODO: Set up authentication helper and seed data
    // 1. Sign in
    // 2. Navigate to tenant details
    // 3. Click edit button
    // 4. Modify tenant information
    // 5. Save changes
    // 6. Verify changes are reflected
  });

  // eslint-disable-next-line playwright/expect-expect, playwright/no-skipped-test
  test.skip('should delete tenant', async ({ page: _page }) => {
    // TODO: Set up authentication helper and seed data
    // 1. Sign in
    // 2. Navigate to tenant details
    // 3. Click delete button
    // 4. Confirm deletion
    // 5. Verify tenant is removed from list
  });
});
