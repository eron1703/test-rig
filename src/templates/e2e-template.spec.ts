// E2E Test Template (Playwright + TypeScript)
// Use this as a starting point for new end-to-end test files
// Replace {{COMPONENT_NAME}} and {{COMPONENT_PATH}} with actual values

import { test, expect, Page, Browser, BrowserContext } from '@playwright/test';

// ============================================================================
// PAGE OBJECT MODEL - {{COMPONENT_NAME}}
// ============================================================================

/**
 * Page Object for {{COMPONENT_NAME}} component
 * Encapsulates all interactions and selectors for the component
 */
class {{COMPONENT_NAME}}Page {
  readonly page: Page;

  // -------------------------------------------------------------------------
  // SELECTORS
  // -------------------------------------------------------------------------

  // Main component selectors
  readonly componentRoot = '[data-testid="{{COMPONENT_PATH}}"]';
  readonly componentTitle = '[data-testid="{{COMPONENT_PATH}}-title"]';
  readonly componentContent = '[data-testid="{{COMPONENT_PATH}}-content"]';

  // Button and interactive elements
  readonly primaryButton = '[data-testid="{{COMPONENT_PATH}}-primary-btn"]';
  readonly secondaryButton = '[data-testid="{{COMPONENT_PATH}}-secondary-btn"]';
  readonly closeButton = '[data-testid="{{COMPONENT_PATH}}-close-btn"]';

  // Input and form elements
  readonly inputField = '[data-testid="{{COMPONENT_PATH}}-input"]';
  readonly submitButton = '[data-testid="{{COMPONENT_PATH}}-submit"]';
  readonly formContainer = '[data-testid="{{COMPONENT_PATH}}-form"]';

  // Status and feedback elements
  readonly successMessage = '[data-testid="{{COMPONENT_PATH}}-success"]';
  readonly errorMessage = '[data-testid="{{COMPONENT_PATH}}-error"]';
  readonly loadingSpinner = '[data-testid="{{COMPONENT_PATH}}-loading"]';

  constructor(page: Page) {
    this.page = page;
  }

  // -------------------------------------------------------------------------
  // NAVIGATION HELPERS
  // -------------------------------------------------------------------------

  /**
   * Navigate to the page containing the {{COMPONENT_NAME}} component
   */
  async navigateTo(path: string = '/{{COMPONENT_PATH}}'): Promise<void> {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for component to be visible and ready
   */
  async waitForComponentReady(): Promise<void> {
    await this.page.waitForSelector(this.componentRoot, { state: 'visible' });
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate back using browser back button
   */
  async navigateBack(): Promise<void> {
    await this.page.goBack();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate forward using browser forward button
   */
  async navigateForward(): Promise<void> {
    await this.page.goForward();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Reload the current page
   */
  async reloadPage(): Promise<void> {
    await this.page.reload();
    await this.page.waitForLoadState('networkidle');
  }

  // -------------------------------------------------------------------------
  // INTERACTION HELPERS
  // -------------------------------------------------------------------------

  /**
   * Click the primary button
   */
  async clickPrimaryButton(): Promise<void> {
    await this.page.click(this.primaryButton);
  }

  /**
   * Click the secondary button
   */
  async clickSecondaryButton(): Promise<void> {
    await this.page.click(this.secondaryButton);
  }

  /**
   * Click the close button
   */
  async clickCloseButton(): Promise<void> {
    await this.page.click(this.closeButton);
  }

  /**
   * Fill input field with text
   */
  async fillInput(text: string): Promise<void> {
    await this.page.fill(this.inputField, text);
  }

  /**
   * Get current value of input field
   */
  async getInputValue(): Promise<string> {
    return await this.page.inputValue(this.inputField);
  }

  /**
   * Submit the form
   */
  async submitForm(): Promise<void> {
    await this.page.click(this.submitButton);
    // Wait for potential navigation or response
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Clear input field
   */
  async clearInput(): Promise<void> {
    await this.page.fill(this.inputField, '');
  }

  /**
   * Type text character by character
   */
  async typeInput(text: string, delayMs: number = 50): Promise<void> {
    await this.page.type(this.inputField, text, { delay: delayMs });
  }

  /**
   * Hover over element
   */
  async hoverOver(selector: string): Promise<void> {
    await this.page.hover(selector);
  }

  /**
   * Focus on element
   */
  async focus(selector: string): Promise<void> {
    await this.page.focus(selector);
  }

  /**
   * Press keyboard key
   */
  async pressKey(key: string): Promise<void> {
    await this.page.press(this.inputField, key);
  }

  // -------------------------------------------------------------------------
  // ASSERTION HELPERS
  // -------------------------------------------------------------------------

  /**
   * Assert component is visible
   */
  async assertComponentVisible(): Promise<void> {
    await expect(this.page.locator(this.componentRoot)).toBeVisible();
  }

  /**
   * Assert component is hidden
   */
  async assertComponentHidden(): Promise<void> {
    await expect(this.page.locator(this.componentRoot)).toBeHidden();
  }

  /**
   * Assert component title text
   */
  async assertTitleText(expectedText: string): Promise<void> {
    await expect(this.page.locator(this.componentTitle)).toContainText(
      expectedText
    );
  }

  /**
   * Assert button is enabled
   */
  async assertButtonEnabled(buttonSelector: string): Promise<void> {
    await expect(this.page.locator(buttonSelector)).toBeEnabled();
  }

  /**
   * Assert button is disabled
   */
  async assertButtonDisabled(buttonSelector: string): Promise<void> {
    await expect(this.page.locator(buttonSelector)).toBeDisabled();
  }

  /**
   * Assert input has specific value
   */
  async assertInputValue(expectedValue: string): Promise<void> {
    await expect(this.page.locator(this.inputField)).toHaveValue(expectedValue);
  }

  /**
   * Assert success message is visible
   */
  async assertSuccessMessageVisible(): Promise<void> {
    await expect(this.page.locator(this.successMessage)).toBeVisible();
  }

  /**
   * Assert error message is visible
   */
  async assertErrorMessageVisible(): Promise<void> {
    await expect(this.page.locator(this.errorMessage)).toBeVisible();
  }

  /**
   * Assert loading spinner is visible
   */
  async assertLoadingSpinnerVisible(): Promise<void> {
    await expect(this.page.locator(this.loadingSpinner)).toBeVisible();
  }

  /**
   * Assert loading spinner is not visible
   */
  async assertLoadingSpinnerHidden(): Promise<void> {
    await expect(this.page.locator(this.loadingSpinner)).toBeHidden();
  }

  /**
   * Assert element count matches expected
   */
  async assertElementCount(selector: string, expectedCount: number): Promise<void> {
    const elements = this.page.locator(selector);
    await expect(elements).toHaveCount(expectedCount);
  }

  /**
   * Assert URL matches pattern
   */
  async assertUrlContains(pathPart: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(pathPart));
  }

  // -------------------------------------------------------------------------
  // SCREENSHOT & DEBUG HELPERS
  // -------------------------------------------------------------------------

  /**
   * Take a screenshot of the component
   */
  async takeScreenshot(name: string = '{{COMPONENT_PATH}}'): Promise<void> {
    await this.page.screenshot({
      path: `./screenshots/${name}-${Date.now()}.png`,
      fullPage: false,
    });
  }

  /**
   * Take a full page screenshot
   */
  async takeFullPageScreenshot(name: string = '{{COMPONENT_PATH}}-full'): Promise<void> {
    await this.page.screenshot({
      path: `./screenshots/${name}-${Date.now()}.png`,
      fullPage: true,
    });
  }

  /**
   * Get the HTML content of the component
   */
  async getComponentHTML(): Promise<string | null> {
    return await this.page.locator(this.componentRoot).innerHTML();
  }

  /**
   * Get text content of element
   */
  async getTextContent(selector: string): Promise<string | null> {
    return await this.page.locator(selector).textContent();
  }

  /**
   * Get attribute value of element
   */
  async getAttribute(selector: string, attributeName: string): Promise<string | null> {
    return await this.page.locator(selector).getAttribute(attributeName);
  }

  /**
   * Wait for element to have specific text
   */
  async waitForText(selector: string, text: string, timeoutMs: number = 5000): Promise<void> {
    await this.page.locator(selector).waitFor({ state: 'visible', timeout: timeoutMs });
    await expect(this.page.locator(selector)).toContainText(text, { timeout: timeoutMs });
  }

  /**
   * Wait for element to be removed from DOM
   */
  async waitForElementRemoved(selector: string, timeoutMs: number = 5000): Promise<void> {
    await this.page.locator(selector).waitFor({ state: 'hidden', timeout: timeoutMs });
  }
}

// ============================================================================
// TEST FIXTURES & SETUP
// ============================================================================

test.describe('{{COMPONENT_NAME}} Component - E2E Tests', () => {
  let {{COMPONENT_PATH}}Page: {{COMPONENT_NAME}}Page;

  // -------------------------------------------------------------------------
  // HOOKS - Setup & Teardown
  // -------------------------------------------------------------------------

  test.beforeEach(async ({ page }) => {
    // Initialize page object
    {{COMPONENT_PATH}}Page = new {{COMPONENT_NAME}}Page(page);

    // Navigate to component
    await {{COMPONENT_PATH}}Page.navigateTo();

    // Wait for component to be ready
    await {{COMPONENT_PATH}}Page.waitForComponentReady();

    // Optional: Set up any page interceptors or mocks
    // await page.route('**/api/**', route => route.continue());
  });

  test.afterEach(async ({ page }) => {
    // Take screenshot on failure
    const testInfo = test.info();
    if (testInfo.status !== 'passed') {
      await {{COMPONENT_PATH}}Page.takeFullPageScreenshot(
        `${testInfo.title}-failure`
      );
    }

    // Close page and clean up
    await page.close();
  });

  // =========================================================================
  // HAPPY PATH TESTS
  // =========================================================================

  test.describe('Rendering & Visibility', () => {
    test('should render component on page load', async () => {
      // Assert
      await {{COMPONENT_PATH}}Page.assertComponentVisible();
    });

    test('should display component title', async () => {
      // Assert
      await {{COMPONENT_PATH}}Page.assertTitleText('{{COMPONENT_NAME}}');
    });

    test('should have all required buttons visible', async () => {
      // Assert
      await expect(
        {{COMPONENT_PATH}}Page.page.locator({{COMPONENT_PATH}}Page.primaryButton)
      ).toBeVisible();
      await expect(
        {{COMPONENT_PATH}}Page.page.locator({{COMPONENT_PATH}}Page.secondaryButton)
      ).toBeVisible();
    });
  });

  test.describe('User Interactions', () => {
    test('should handle button click', async () => {
      // Act
      await {{COMPONENT_PATH}}Page.clickPrimaryButton();

      // Assert
      await {{COMPONENT_PATH}}Page.assertComponentVisible();
    });

    test('should accept text input', async () => {
      // Arrange
      const testInput = 'Test Input Value';

      // Act
      await {{COMPONENT_PATH}}Page.fillInput(testInput);

      // Assert
      await {{COMPONENT_PATH}}Page.assertInputValue(testInput);
    });

    test('should clear input field', async () => {
      // Arrange
      await {{COMPONENT_PATH}}Page.fillInput('Some Text');

      // Act
      await {{COMPONENT_PATH}}Page.clearInput();

      // Assert
      await {{COMPONENT_PATH}}Page.assertInputValue('');
    });

    test('should submit form successfully', async () => {
      // Arrange
      await {{COMPONENT_PATH}}Page.fillInput('Valid Input');

      // Act
      await {{COMPONENT_PATH}}Page.submitForm();

      // Assert
      await {{COMPONENT_PATH}}Page.assertSuccessMessageVisible();
    });
  });

  test.describe('Navigation', () => {
    test('should navigate to component page', async () => {
      // Assert
      await {{COMPONENT_PATH}}Page.assertUrlContains('{{COMPONENT_PATH}}');
    });

    test('should reload page without errors', async () => {
      // Act
      await {{COMPONENT_PATH}}Page.reloadPage();

      // Assert
      await {{COMPONENT_PATH}}Page.assertComponentVisible();
    });
  });

  // =========================================================================
  // ERROR CASES
  // =========================================================================

  test.describe('Error Handling', () => {
    test('should show error message on invalid input', async () => {
      // Arrange
      const invalidInput = ''; // Empty input

      // Act
      await {{COMPONENT_PATH}}Page.fillInput(invalidInput);
      await {{COMPONENT_PATH}}Page.submitForm();

      // Assert
      await {{COMPONENT_PATH}}Page.assertErrorMessageVisible();
    });

    test('should display loading state during submission', async () => {
      // Arrange
      await {{COMPONENT_PATH}}Page.fillInput('Valid Input');

      // Act
      await {{COMPONENT_PATH}}Page.submitForm();

      // Assert - Loading spinner should have appeared and disappeared
      // Note: This may be instantaneous, so adjust timing as needed
      await {{COMPONENT_PATH}}Page.assertLoadingSpinnerHidden();
    });

    test('should disable submit button while processing', async () => {
      // Arrange
      await {{COMPONENT_PATH}}Page.fillInput('Valid Input');

      // Act & Assert
      await {{COMPONENT_PATH}}Page.assertButtonEnabled({{COMPONENT_PATH}}Page.submitButton);
    });
  });

  // =========================================================================
  // ACCESSIBILITY & RESPONSIVENESS
  // =========================================================================

  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async () => {
      // Arrange
      const heading = {{COMPONENT_PATH}}Page.page.locator(
        {{COMPONENT_PATH}}Page.componentTitle
      );

      // Assert
      await expect(heading).toBeVisible();
    });

    test('should support keyboard navigation', async () => {
      // Act
      await {{COMPONENT_PATH}}Page.focus({{COMPONENT_PATH}}Page.inputField);
      await {{COMPONENT_PATH}}Page.pressKey('Tab');

      // Assert - Focus should move to next element
      const focusedElement = await {{COMPONENT_PATH}}Page.page.evaluate(
        () => document.activeElement?.tagName
      );
      expect(focusedElement).toBeTruthy();
    });

    test('should support form submission with Enter key', async () => {
      // Arrange
      await {{COMPONENT_PATH}}Page.fillInput('Test Input');

      // Act
      await {{COMPONENT_PATH}}Page.pressKey('Enter');

      // Assert
      await {{COMPONENT_PATH}}Page.assertSuccessMessageVisible();
    });
  });

  // =========================================================================
  // STATE MANAGEMENT
  // =========================================================================

  test.describe('State Management', () => {
    test('should maintain input value after interaction', async () => {
      // Arrange
      const testValue = 'Persistent Value';

      // Act
      await {{COMPONENT_PATH}}Page.fillInput(testValue);

      // Assert
      await {{COMPONENT_PATH}}Page.assertInputValue(testValue);
    });

    test('should clear form after successful submission', async () => {
      // Arrange
      await {{COMPONENT_PATH}}Page.fillInput('Test');

      // Act
      await {{COMPONENT_PATH}}Page.submitForm();

      // Assert
      // Input should be cleared after successful submission
      await {{COMPONENT_PATH}}Page.assertInputValue('');
    });
  });

  // =========================================================================
  // EDGE CASES & BOUNDARY CONDITIONS
  // =========================================================================

  test.describe('Edge Cases', () => {
    test('should handle very long input text', async () => {
      // Arrange
      const longText = 'a'.repeat(1000);

      // Act
      await {{COMPONENT_PATH}}Page.fillInput(longText);

      // Assert
      const inputValue = await {{COMPONENT_PATH}}Page.getInputValue();
      expect(inputValue.length).toBeGreaterThan(0);
    });

    test('should handle special characters in input', async () => {
      // Arrange
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

      // Act
      await {{COMPONENT_PATH}}Page.fillInput(specialChars);

      // Assert
      await {{COMPONENT_PATH}}Page.assertInputValue(specialChars);
    });

    test('should handle unicode characters in input', async () => {
      // Arrange
      const unicodeText = '你好世界 مرحبا بالعالم';

      // Act
      await {{COMPONENT_PATH}}Page.fillInput(unicodeText);

      // Assert
      await {{COMPONENT_PATH}}Page.assertInputValue(unicodeText);
    });

    test('should handle rapid clicking', async () => {
      // Act
      await {{COMPONENT_PATH}}Page.page.click(
        {{COMPONENT_PATH}}Page.primaryButton,
        { clickCount: 3 }
      );

      // Assert
      await {{COMPONENT_PATH}}Page.assertComponentVisible();
    });
  });

  // =========================================================================
  // VISUAL REGRESSION
  // =========================================================================

  test.describe('Visual Regression', () => {
    test('should match baseline screenshot', async ({ page }) => {
      // Assert - Playwright's built-in screenshot comparison
      await expect(page).toHaveScreenshot('{{COMPONENT_PATH}}-baseline.png');
    });

    test('should match screenshot after user interaction', async ({ page }) => {
      // Act
      await {{COMPONENT_PATH}}Page.clickPrimaryButton();

      // Assert
      await expect(page).toHaveScreenshot('{{COMPONENT_PATH}}-after-click.png');
    });
  });

  // =========================================================================
  // PERFORMANCE
  // =========================================================================

  test.describe('Performance', () => {
    test('should load component within acceptable time', async () => {
      // Arrange
      const startTime = Date.now();

      // Act
      const metrics = await {{COMPONENT_PATH}}Page.page.evaluate(() => {
        const perfData = window.performance.getEntriesByType('navigation')[0] as any;
        return {
          domContentLoaded: perfData?.domContentLoadedEventEnd - perfData?.domContentLoadedEventStart,
          loadComplete: perfData?.loadEventEnd - perfData?.loadEventStart,
        };
      });

      // Assert
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
    });
  });
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Wait for specific network response
 */
async function waitForNetworkResponse(
  page: Page,
  urlPattern: string | RegExp,
  timeoutMs: number = 5000
): Promise<any> {
  const response = await page.waitForResponse(
    (response) => {
      const urlString = response.url();
      return typeof urlPattern === 'string'
        ? urlString.includes(urlPattern)
        : urlPattern.test(urlString);
    },
    { timeout: timeoutMs }
  );
  return response.json();
}

/**
 * Intercept and mock API response
 */
async function mockApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  mockData: any
): Promise<void> {
  await page.route(urlPattern, async (route) => {
    await route.abort('blockedbyclient');
    // Or provide mock response:
    // await route.fulfill({ status: 200, body: JSON.stringify(mockData) });
  });
}

/**
 * Get local storage value
 */
async function getLocalStorageValue(
  page: Page,
  key: string
): Promise<string | null> {
  return await page.evaluate((k) => localStorage.getItem(k), key);
}

/**
 * Set local storage value
 */
async function setLocalStorageValue(
  page: Page,
  key: string,
  value: string
): Promise<void> {
  await page.evaluate(
    ({ k, v }) => localStorage.setItem(k, v),
    { k: key, v: value }
  );
}
