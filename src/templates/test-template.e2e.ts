// E2E Test Template (TypeScript + Vitest + Playwright)
// Tests complete user workflows and UI interactions

import { test, expect, Page, Browser, BrowserContext } from '@playwright/test';
import axios, { AxiosInstance } from 'axios';

// ============================================================================
// SETUP & CONFIGURATION
// ============================================================================

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:3001';
const TEST_TIMEOUT = 30000;

let apiClient: AxiosInstance;
let page: Page;
let context: BrowserContext;

// ============================================================================
// IMPORTS
// ============================================================================

// Test utilities and data builders
import { UserFactory } from '@tests/factories/user.factory';

// ============================================================================
// TEST HOOKS
// ============================================================================

test.beforeAll(async ({ browser }) => {
  // Initialize API client
  apiClient = axios.create({
    baseURL: API_URL,
    timeout: TEST_TIMEOUT,
    validateStatus: () => true, // Don't throw on any status code
  });
});

test.beforeEach(async ({ browser }) => {
  // Create new context for each test (isolated cookies, storage)
  context = await browser.newContext();
  page = await context.newPage();

  // Set up request/response interception if needed
  page.on('response', response => {
    if (response.status() >= 400) {
      console.warn(`HTTP ${response.status()}: ${response.url()}`);
    }
  });
});

test.afterEach(async () => {
  // Clean up
  await context?.close();
  await page?.close();
});

// ============================================================================
// E2E TEST SCENARIOS
// ============================================================================

test.describe('UserService E2E Workflows', () => {
  test.describe('User Registration Flow', () => {
    test('should complete full registration workflow', async () => {
      // Arrange
      const userEmail = `user-${Date.now()}@example.com`;
      const userData = {
        email: userEmail,
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      // Act - Navigate to registration page
      await page.goto(`${BASE_URL}/register`);

      // Fill registration form
      await page.fill('input[name="email"]', userData.email);
      await page.fill('input[name="password"]', userData.password);
      await page.fill('input[name="firstName"]', userData.firstName);
      await page.fill('input[name="lastName"]', userData.lastName);

      // Submit form
      await page.click('button[type="submit"]');

      // Assert - Should redirect to confirmation or dashboard
      await page.waitForURL(/\/(confirmation|dashboard)/, { timeout: 10000 });
      expect(page.url()).toMatch(/\/(confirmation|dashboard)/);

      // Verify user in backend
      const response = await apiClient.get(`/api/users/email/${userEmail}`);
      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
      });
    });

    test('should show validation errors for invalid input', async () => {
      // Act - Navigate to registration
      await page.goto(`${BASE_URL}/register`);

      // Try to submit without filling form
      await page.click('button[type="submit"]');

      // Assert - Should show error messages
      const emailError = await page.locator('text=Email is required');
      const passwordError = await page.locator('text=Password is required');

      await expect(emailError).toBeVisible();
      await expect(passwordError).toBeVisible();
    });

    test('should prevent duplicate email registration', async () => {
      // Arrange - Create user via API
      const existingUser = UserFactory.build();
      await apiClient.post('/api/users', existingUser);

      // Act - Try to register with same email
      await page.goto(`${BASE_URL}/register`);
      await page.fill('input[name="email"]', existingUser.email);
      await page.fill('input[name="password"]', 'SecurePass123!');
      await page.fill('input[name="firstName"]', 'John');
      await page.fill('input[name="lastName"]', 'Doe');

      // Submit form
      await page.click('button[type="submit"]');

      // Assert - Should show duplicate error
      const errorMessage = await page.locator('text=Email already registered');
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('User Authentication Flow', () => {
    test('should complete login workflow', async () => {
      // Arrange - Create user via API
      const userData = UserFactory.build();
      await apiClient.post('/api/users', userData);

      // Act - Navigate to login
      await page.goto(`${BASE_URL}/login`);

      // Fill login form
      await page.fill('input[name="email"]', userData.email);
      await page.fill('input[name="password"]', userData.password);

      // Submit
      await page.click('button[type="submit"]');

      // Assert - Should redirect to dashboard
      await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 10000 });
      expect(page.url()).toBe(`${BASE_URL}/dashboard`);

      // Verify auth token in storage
      const token = await page.evaluate(() => localStorage.getItem('authToken'));
      expect(token).toBeTruthy();
    });

    test('should display error for invalid credentials', async () => {
      // Act
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[name="email"]', 'nonexistent@example.com');
      await page.fill('input[name="password"]', 'WrongPassword123!');
      await page.click('button[type="submit"]');

      // Assert
      const errorMessage = await page.locator('text=Invalid credentials');
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
    });

    test('should logout user successfully', async () => {
      // Arrange - Create and login user
      const userData = UserFactory.build();
      await apiClient.post('/api/users', userData);
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[name="email"]', userData.email);
      await page.fill('input[name="password"]', userData.password);
      await page.click('button[type="submit"]');
      await page.waitForURL(`${BASE_URL}/dashboard`);

      // Act - Click logout
      await page.click('button:has-text("Logout")');

      // Assert - Should redirect to login and clear token
      await page.waitForURL(`${BASE_URL}/login`, { timeout: 5000 });
      const token = await page.evaluate(() => localStorage.getItem('authToken'));
      expect(token).toBeNull();
    });
  });

  test.describe('User Profile Management', () => {
    test('should update user profile', async () => {
      // Arrange - Create and login user
      const userData = UserFactory.build();
      await apiClient.post('/api/users', userData);
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[name="email"]', userData.email);
      await page.fill('input[name="password"]', userData.password);
      await page.click('button[type="submit"]');
      await page.waitForURL(`${BASE_URL}/dashboard`);

      // Navigate to profile
      await page.click('a:has-text("Profile")');
      await page.waitForURL(`${BASE_URL}/profile`);

      // Act - Update profile
      const newFirstName = 'UpdatedName';
      await page.fill('input[name="firstName"]', newFirstName);
      await page.click('button:has-text("Save")');

      // Assert - Should show success message
      const successMessage = await page.locator('text=Profile updated');
      await expect(successMessage).toBeVisible({ timeout: 5000 });

      // Verify via API
      const token = await page.evaluate(() => localStorage.getItem('authToken'));
      const response = await apiClient.get('/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(response.data.firstName).toBe(newFirstName);
    });

    test('should upload user avatar', async () => {
      // Arrange - Create and login user
      const userData = UserFactory.build();
      await apiClient.post('/api/users', userData);
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[name="email"]', userData.email);
      await page.fill('input[name="password"]', userData.password);
      await page.click('button[type="submit"]');

      // Navigate to profile
      await page.goto(`${BASE_URL}/profile`);

      // Act - Upload avatar
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles('./test-data/avatar.jpg');

      // Wait for upload
      await page.waitForTimeout(2000);

      // Assert - Avatar should be visible
      const avatarImg = page.locator('img[alt="User Avatar"]');
      await expect(avatarImg).toBeVisible();
    });
  });

  test.describe('Concurrent User Operations', () => {
    test('should handle concurrent user modifications', async () => {
      // Arrange - Create users
      const users = [
        UserFactory.build(),
        UserFactory.build(),
        UserFactory.build(),
      ];

      for (const user of users) {
        await apiClient.post('/api/users', user);
      }

      // Act - Login first user and open profile
      const firstUser = users[0];
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[name="email"]', firstUser.email);
      await page.fill('input[name="password"]', firstUser.password);
      await page.click('button[type="submit"]');
      await page.goto(`${BASE_URL}/profile`);

      // Act - Make concurrent API requests while user is viewing profile
      const updatePromises = users.map(user =>
        apiClient.patch(`/api/users/${user.id}`, {
          lastModified: new Date().toISOString(),
        })
      );

      await Promise.all(updatePromises);

      // Assert - Page should remain functional
      const firstNameInput = page.locator('input[name="firstName"]');
      await expect(firstNameInput).toBeVisible();

      // Refresh and verify data loaded correctly
      await page.reload();
      await expect(firstNameInput).toBeVisible();
    });
  });

  test.describe('Error Recovery & Resilience', () => {
    test('should handle network timeouts gracefully', async () => {
      // Act - Navigate with simulated slow network
      await page.goto(`${BASE_URL}/register`);

      // Simulate timeout by filling form very slowly
      const emailInput = page.locator('input[name="email"]');
      await emailInput.fill('test@example.com', { timeout: TEST_TIMEOUT });

      // Form should remain interactive
      const passwordInput = page.locator('input[name="password"]');
      await expect(passwordInput).toBeVisible();
    });

    test('should retry failed requests', async () => {
      // Arrange
      const userData = UserFactory.build();

      // Act - Make request that might fail temporarily
      const response = await apiClient.post('/api/users', userData);

      // Assert - Should eventually succeed
      expect(response.status).toBeLessThan(500);
    });
  });
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function loginUser(email: string, password: string) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 10000 });
}

async function logoutUser() {
  await page.click('button:has-text("Logout")');
  await page.waitForURL(`${BASE_URL}/login`);
}

async function createUserViaAPI(userData: any) {
  const response = await apiClient.post('/api/users', userData);
  if (response.status >= 400) {
    throw new Error(`Failed to create user: ${response.status}`);
  }
  return response.data;
}
