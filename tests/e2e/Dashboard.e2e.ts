import { expect, test } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard - will redirect to sign-in if not authenticated
    await page.goto('/dashboard');
  });

  test('should redirect to sign-in when not authenticated', async ({ page }) => {
    // Check if redirected to sign-in page
    await expect(page).toHaveURL(/sign-in/);
  });

  test.describe('when authenticated', () => {
    // Note: These tests assume you have a way to authenticate in E2E
    // You may need to set up Clerk test accounts or use test authentication
    // eslint-disable-next-line playwright/no-skipped-test
    test.skip('should load dashboard without errors', async ({ page }) => {
      // TODO: Set up authentication helper or use Clerk test accounts
      // For now, this is skipped until authentication setup is configured

      await page.goto('/dashboard');

      // Wait for dashboard to load
      await page.waitForLoadState('load');

      // Check for main dashboard title
      const heading = page.getByRole('heading', { name: /dashboard/i });

      await expect(heading).toBeVisible();

      // Verify no error messages are displayed
      const errorMessages = page.locator('[role="alert"], .error, [data-error]');

      await expect(errorMessages).toHaveCount(0);
    });

    // eslint-disable-next-line playwright/no-skipped-test
    test.skip('should display empty state when no properties exist', async ({ page }) => {
      // TODO: Set up authentication helper
      await page.goto('/dashboard');

      await page.waitForLoadState('load');

      // Check that metrics show 0 or empty states
      const propertyCount = page
        .locator('text=/total properties/i')
        .locator('..')
        .locator('text=/^0$/');
      const tenantCount = page
        .locator('text=/active tenants/i')
        .locator('..')
        .locator('text=/^0$/');

      // If empty states exist, they should be visible
      await expect(propertyCount.or(page.locator('text=/no properties/i'))).toBeVisible();
      await expect(tenantCount.or(page.locator('text=/no tenants/i'))).toBeVisible();
    });

    // eslint-disable-next-line playwright/no-skipped-test
    test.skip('should display metrics when data exists', async ({ page }) => {
      // TODO: Set up authentication and seed test data
      await page.goto('/dashboard');

      await page.waitForLoadState('load');

      // Check for key metrics sections
      const propertiesSection = page.locator('text=/total properties/i');
      const tenantsSection = page.locator('text=/active tenants/i');
      const revenueSection = page.locator('text=/monthly revenue/i');

      await expect(propertiesSection).toBeVisible();
      await expect(tenantsSection).toBeVisible();
      await expect(revenueSection).toBeVisible();
    });

    // eslint-disable-next-line playwright/no-skipped-test
    test.skip('should display recent payments section', async ({ page }) => {
      // TODO: Set up authentication and seed test data
      await page.goto('/dashboard');

      await page.waitForLoadState('load');

      const recentPaymentsHeading = page.getByRole('heading', { name: /recent payments/i });

      await expect(recentPaymentsHeading).toBeVisible();

      // Should show either payments list or empty state
      const paymentsList = page
        .locator('[data-testid="recent-payments"]')
        .or(page.locator('text=/no recent payments/i'));

      await expect(paymentsList.first()).toBeVisible();
    });

    // eslint-disable-next-line playwright/no-skipped-test
    test.skip('should display upcoming tasks section', async ({ page }) => {
      // TODO: Set up authentication and seed test data
      await page.goto('/dashboard');

      await page.waitForLoadState('load');

      const upcomingTasksHeading = page.getByRole('heading', { name: /upcoming tasks/i });

      await expect(upcomingTasksHeading).toBeVisible();

      // Should show either tasks list or empty state
      const tasksList = page
        .locator('[data-testid="upcoming-tasks"]')
        .or(page.locator('text=/no upcoming tasks/i'));

      await expect(tasksList.first()).toBeVisible();
    });

    // eslint-disable-next-line playwright/no-skipped-test
    test.skip('should have working quick action links', async ({ page }) => {
      // TODO: Set up authentication
      await page.goto('/dashboard');

      await page.waitForLoadState('load');

      // Check quick action links exist
      const addPropertyLink = page.getByRole('link', { name: /add property/i });
      const addTenantLink = page.getByRole('link', { name: /add tenant/i });
      const recordPaymentLink = page.getByRole('link', { name: /record payment/i });
      const addExpenseLink = page.getByRole('link', { name: /add expense/i });

      await expect(addPropertyLink).toBeVisible();
      await expect(addTenantLink).toBeVisible();
      await expect(recordPaymentLink).toBeVisible();
      await expect(addExpenseLink).toBeVisible();

      // Verify links are clickable and navigate correctly
      await addPropertyLink.click();

      await expect(page).toHaveURL(/\/dashboard\/properties\/new/);
    });

    // eslint-disable-next-line playwright/no-skipped-test
    test.skip('should not show JavaScript errors in console', async ({ page }) => {
      // TODO: Set up authentication
      const errors: string[] = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      page.on('pageerror', (error) => {
        errors.push(error.message);
      });

      await page.goto('/dashboard');
      await page.waitForLoadState('load');

      // Filter out known acceptable errors (like Sentry, analytics)
      const criticalErrors = errors.filter(
        (error) =>
          !error.includes('sentry') &&
          !error.includes('posthog') &&
          !error.toLowerCase().includes('analytics'),
      );

      expect(criticalErrors).toHaveLength(0);
    });
  });
});
