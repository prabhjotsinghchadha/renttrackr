import { test } from '@playwright/test';

test.describe('Renovations', () => {

  // eslint-disable-next-line playwright/expect-expect, playwright/no-skipped-test
  test.skip('should create a new renovation', async ({ page: _page }) => {
    // TODO: Set up authentication helper and seed data
    // 1. Sign in
    // 2. Navigate to renovations page
    // 3. Click "Add Renovation"
    // 4. Fill in renovation form (property, unit, title, dates, cost)
    // 5. Submit form
    // 6. Verify renovation appears in list
  });


  // eslint-disable-next-line playwright/expect-expect, playwright/no-skipped-test
  test.skip('should add items to renovation', async ({ page: _page }) => {
    // TODO: Set up authentication helper and seed data
    // 1. Sign in
    // 2. Navigate to renovation details
    // 3. Add renovation items (category, description, vendor, cost)
    // 4. Verify items appear in renovation details
    // 5. Verify total cost updates
  });


  // eslint-disable-next-line playwright/expect-expect, playwright/no-skipped-test
  test.skip('should display renovation list', async ({ page: _page }) => {
    // TODO: Set up authentication helper and seed data
    // 1. Sign in
    // 2. Navigate to renovations page
    // 3. Verify renovations are displayed
    // 4. Verify renovation details (title, property, dates, cost) are visible
  });


  // eslint-disable-next-line playwright/expect-expect, playwright/no-skipped-test
  test.skip('should view renovation details', async ({ page: _page }) => {
    // TODO: Set up authentication helper and seed data
    // 1. Sign in
    // 2. Navigate to renovations page
    // 3. Click on a renovation
    // 4. Verify renovation details page loads
    // 5. Verify renovation information and items are displayed
  });


  // eslint-disable-next-line playwright/expect-expect, playwright/no-skipped-test
  test.skip('should edit renovation', async ({ page: _page }) => {
    // TODO: Set up authentication helper and seed data
    // 1. Sign in
    // 2. Navigate to renovation details
    // 3. Click edit button
    // 4. Modify renovation information
    // 5. Save changes
    // 6. Verify changes are reflected
  });


  // eslint-disable-next-line playwright/expect-expect, playwright/no-skipped-test
  test.skip('should update renovation status based on dates', async ({ page: _page }) => {
    // TODO: Set up authentication helper and seed data
    // 1. Sign in
    // 2. Create renovation with start date in future
    // 3. Verify it shows as "pending"
    // 4. Update start date to past
    // 5. Verify it shows as "in progress"
    // 6. Add end date in past
    // 7. Verify it shows as "completed"
  });
});
