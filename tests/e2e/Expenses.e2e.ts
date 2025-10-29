import { test } from '@playwright/test';

test.describe('Expenses', () => {

  // eslint-disable-next-line playwright/expect-expect, playwright/no-skipped-test
  test.skip('should create a new expense', async ({ page: _page }) => {
    // TODO: Set up authentication helper and seed data
    // 1. Sign in
    // 2. Navigate to expenses page
    // 3. Click "Add Expense"
    // 4. Fill in expense form (property, type, amount, date)
    // 5. Submit form
    // 6. Verify expense appears in list
  });


  // eslint-disable-next-line playwright/expect-expect, playwright/no-skipped-test
  test.skip('should display expense list', async ({ page: _page }) => {
    // TODO: Set up authentication helper and seed data
    // 1. Sign in
    // 2. Navigate to expenses page
    // 3. Verify expenses are displayed
    // 4. Verify expense details (property, type, amount, date) are visible
  });


  // eslint-disable-next-line playwright/expect-expect, playwright/no-skipped-test
  test.skip('should filter expenses by property', async ({ page: _page }) => {
    // TODO: Set up authentication helper and seed data
    // 1. Sign in
    // 2. Navigate to expenses page
    // 3. Select property filter
    // 4. Verify only expenses for that property are shown
  });


  // eslint-disable-next-line playwright/expect-expect, playwright/no-skipped-test
  test.skip('should edit expense', async ({ page: _page }) => {
    // TODO: Set up authentication helper and seed data
    // 1. Sign in
    // 2. Navigate to expenses page
    // 3. Click edit on an expense
    // 4. Modify expense information
    // 5. Save changes
    // 6. Verify changes are reflected
  });


  // eslint-disable-next-line playwright/expect-expect, playwright/no-skipped-test
  test.skip('should delete expense', async ({ page: _page }) => {
    // TODO: Set up authentication helper and seed data
    // 1. Sign in
    // 2. Navigate to expenses page
    // 3. Click delete on an expense
    // 4. Confirm deletion
    // 5. Verify expense is removed from list
  });


  // eslint-disable-next-line playwright/expect-expect, playwright/no-skipped-test
  test.skip('should display expense metrics on dashboard', async ({ page: _page }) => {
    // TODO: Set up authentication helper and seed data
    // 1. Sign in
    // 2. Create expenses for current month/year
    // 3. Navigate to dashboard
    // 4. Verify expense metrics are displayed correctly
  });
});
