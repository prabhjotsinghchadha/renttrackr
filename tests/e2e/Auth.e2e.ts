import { expect, test } from '@playwright/test';

test.describe('Authentication', () => {
  test('should redirect to sign-in when accessing protected route', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL(/sign-in/);
  });

  test('should show sign-in page', async ({ page }) => {
    await page.goto('/sign-in');
    // Check for sign-in elements
    const signInButton = page
      .getByRole('button', { name: /sign in/i })
      .or(page.locator('input[type="submit"]'));

    await expect(signInButton.first()).toBeVisible();
  });

  // eslint-disable-next-line playwright/expect-expect, playwright/no-skipped-test
  test.skip('should sign in successfully', async ({ page: _page }) => {
    // TODO: Set up Clerk test accounts or authentication helper
    // await _page.goto('/sign-in');
    // Fill in credentials and sign in
    // Verify redirect to dashboard
  });

  // eslint-disable-next-line playwright/expect-expect, playwright/no-skipped-test
  test.skip('should sign out successfully', async ({ page: _page }) => {
    // TODO: Set up authentication helper
    // Sign in first, then sign out
    // Verify redirect to home page
  });

  // eslint-disable-next-line playwright/expect-expect, playwright/no-skipped-test
  test.skip('should maintain session after page refresh', async ({ page: _page }) => {
    // TODO: Set up authentication helper
    // Sign in, refresh page, verify still authenticated
  });
});
