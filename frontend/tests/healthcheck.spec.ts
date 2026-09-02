import { test, expect } from '@playwright/test';

// Base URL for dev server (set by Vite)
const baseURL = 'http://localhost:5174';

test.describe("Payal's Bakery Cottage Frontend Health Check", () => {
  // 1. Homepage renders with header and footer
  test('homepage renders header and footer', async ({ page }) => {
    await page.goto(baseURL + '/');
    await expect(page).toHaveURL(/\//);
    const header = page.locator('[data-test-id="header"]');
    await expect(header).toBeVisible();
    const footer = page.locator('[data-test-id="footer"]');
    await expect(footer).toBeVisible();
  });

  // 2. All public routes render
  const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/verify-email'];
  for (const route of publicRoutes) {
    test(`route ${route} renders`, async ({ page }) => {
      await page.goto(baseURL + route);
      await expect(page).toHaveURL(new RegExp(route.replace('/', '\\/') + '$'));
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();
    });
  }

  // 3. Protected route redirects when unauthenticated
  test('protected route redirects', async ({ page }) => {
    await page.goto(baseURL + '/profile');
    await expect(page).toHaveURL(/\/login/);
  });

  // 4. Login form validation (invalid email)
  test('login form validation', async ({ page }) => {
    await page.goto(baseURL + '/login');
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', 'short');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Invalid email')).toBeVisible();
    await expect(page.locator('text=Password')).toBeVisible();
  });

  // 5. Registration form validation (empty fields)
  test('registration form validation', async ({ page }) => {
    await page.goto(baseURL + '/register');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Required')).toBeVisible();
  });

  // 6. Forgot password UI
  test('forgot password UI', async ({ page }) => {
    await page.goto(baseURL + '/forgot-password');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=If an account exists')).toBeVisible();
  });

  // 7. Reset password UI (token param)
  test('reset password UI', async ({ page }) => {
    const token = 'dummy-token';
    await page.goto(`${baseURL}/reset-password/${token}`);
    await expect(page.locator('h1')).toContainText('Reset Password');
  });

  // 8. Email verification UI
  test('email verification UI', async ({ page }) => {
    const token = 'dummy-token';
    await page.goto(`${baseURL}/verify-email/${token}`);
    await expect(page.locator('text=Email verified')).toBeVisible();
  });

  // 9. Responsive breakpoints screenshots
  const viewports = [
    { width: 320, height: 640 },
    { width: 375, height: 667 },
    { width: 425, height: 800 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1440, height: 900 },
  ];
  for (const vp of viewports) {
    test(`screenshot ${vp.width}x${vp.height}`, async ({ page }) => {
      await page.setViewportSize(vp);
      await page.goto(baseURL + '/');
      await page.screenshot({ path: `frontend/tests/screenshots/home-${vp.width}x${vp.height}.png` });
    });
  }
});
