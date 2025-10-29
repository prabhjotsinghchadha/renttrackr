import { test } from '@playwright/test';

test.describe('Lease and Payment Flow', () => {

  // eslint-disable-next-line playwright/expect-expect, playwright/no-skipped-test
  test.skip('should create lease for tenant', async ({ page: _page }) => {
    // TODO: Set up authentication helper and seed data
    // 1. Sign in
    // 2. Navigate to tenant details
    // 3. Click "Add Lease"
    // 4. Fill in lease form (start date, end date, rent, deposits)
    // 5. Submit form
    // 6. Verify lease appears in tenant's lease history
  });


  // eslint-disable-next-line playwright/expect-expect, playwright/no-skipped-test
  test.skip('should record payment for lease', async ({ page: _page }) => {
    // TODO: Set up authentication helper and seed data
    // 1. Sign in
    // 2. Navigate to rents/payments page
    // 3. Click "Record Payment"
    // 4. Select lease
    // 5. Fill in payment amount and date
    // 6. Submit form
    // 7. Verify payment appears in payment list
  });


  // eslint-disable-next-line playwright/expect-expect, playwright/no-skipped-test
  test.skip('should display payment in dashboard', async ({ page: _page }) => {
    // TODO: Set up authentication helper and seed data
    // 1. Sign in
    // 2. Record a payment
    // 3. Navigate to dashboard
    // 4. Verify payment appears in "Recent Payments" section
  });


  // eslint-disable-next-line playwright/expect-expect, playwright/no-skipped-test
  test.skip('should calculate payment metrics correctly', async ({ page: _page }) => {
    // TODO: Set up authentication helper and seed data
    // 1. Sign in
    // 2. Create lease with rent amount
    // 3. Record multiple payments
    // 4. Navigate to dashboard
    // 5. Verify monthly revenue reflects payments
    // 6. Verify pending/overdue calculations are correct
  });


  // eslint-disable-next-line playwright/expect-expect, playwright/no-skipped-test
  test.skip('should show pending payments for unpaid rent', async ({ page: _page }) => {
    // TODO: Set up authentication helper and seed data
    // 1. Sign in
    // 2. Create active lease
    // 3. Navigate to dashboard
    // 4. Verify pending payments amount is calculated correctly
    // 5. Verify it appears in dashboard metrics
  });


  // eslint-disable-next-line playwright/expect-expect, playwright/no-skipped-test
  test.skip('should show overdue payments for late rent', async ({ page: _page }) => {
    // TODO: Set up authentication helper and seed data
    // 1. Sign in
    // 2. Create lease with past due date
    // 3. Do not record payment
    // 4. Navigate to dashboard
    // 5. Verify overdue payments amount is calculated correctly
    // 6. Verify it appears in dashboard metrics
  });


  // eslint-disable-next-line playwright/expect-expect, playwright/no-skipped-test
  test.skip('should allow adding late fee to payment', async ({ page: _page }) => {
    // TODO: Set up authentication helper and seed data
    // 1. Sign in
    // 2. Record payment for overdue lease
    // 3. Add late fee amount
    // 4. Verify late fee is included in payment total
    // 5. Verify late fee appears in dashboard metrics
  });


  // eslint-disable-next-line playwright/expect-expect, playwright/no-skipped-test
  test.skip('should display payment history for tenant', async ({ page: _page }) => {
    // TODO: Set up authentication helper and seed data
    // 1. Sign in
    // 2. Record multiple payments for a tenant's lease
    // 3. Navigate to tenant details
    // 4. Verify payment history is displayed
    // 5. Verify payments are ordered by date
  });
});
