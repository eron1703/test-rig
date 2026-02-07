// Playwright Configuration Template
// Use this as a starting point for setting up Playwright in your project
// Customize BASE_URL, timeouts, and browser configurations as needed

import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables for configuration
 * CI detection: GITHUB_ACTIONS, GITLAB_CI, CIRCLECI, TRAVIS, JENKINS
 */
const isCI = !!process.env.CI || !!process.env.GITHUB_ACTIONS;
const baseURL = process.env.BASE_URL || 'http://localhost:3000';

/**
 * Playwright Configuration
 * See https://playwright.dev/docs/test-configuration for complete options
 */
export default defineConfig({
  // ============================================================================
  // TEST CONFIGURATION
  // ============================================================================

  testDir: './tests/e2e',
  testMatch: '**/*.spec.ts',
  testIgnore: '**/*.skip.ts',

  // ============================================================================
  // TIMEOUT SETTINGS
  // ============================================================================

  /**
   * Test timeout: Maximum time for a single test to run
   * Recommended: 30s for typical e2e tests, 60s for heavy operations
   */
  timeout: 30000,

  /**
   * Expect timeout: Maximum time for expect() assertions
   * Recommended: 5s for typical assertions
   */
  expect: {
    timeout: 5000,
  },

  /**
   * Global timeout: Maximum time for all tests combined
   * Recommended: 30 minutes for typical CI/CD runs
   */
  globalTimeout: 30 * 60 * 1000,

  /**
   * Expect timeout for navigation and waitForLoadState
   * Recommended: 30s for page navigation
   */
  navigationTimeout: 30000,

  // ============================================================================
  // EXECUTION CONFIGURATION
  // ============================================================================

  /**
   * Parallel execution: Number of worker processes
   * In CI: 1 worker to avoid resource contention
   * Locally: Use all available cores
   */
  workers: isCI ? 1 : undefined, // undefined uses default (CPU count)

  /**
   * Retry configuration
   * Useful for flaky tests in CI/CD environments
   * Recommended: 2 retries in CI, 0 locally
   */
  retries: isCI ? 2 : 0,

  /**
   * Run tests in sequence (false) or in parallel (true)
   * Set to false if tests modify shared state
   */
  fullyParallel: true,

  /**
   * Exit on first test failure
   * Useful for debugging, disable in CI
   */
  forbidOnly: isCI,

  // ============================================================================
  // REPORTING & OUTPUT
  // ============================================================================

  /**
   * Reporter configuration
   * Multiple reporters can be used simultaneously
   */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'], // Console output
  ],

  /**
   * Output folder for test results
   */
  outputFolder: 'test-results',

  /**
   * Snapshot directory for visual regression testing
   */
  snapshotDir: 'tests/e2e/snapshots',
  snapshotPathTemplate: '{snapshotDir}/{testFileDir}/{testFileName}-{platform}{ext}',

  // ============================================================================
  // DEBUGGING & DIAGNOSTICS
  // ============================================================================

  /**
   * Screenshot on failure
   * Capture screenshots when tests fail for easier debugging
   */
  use: {
    /**
     * Base URL for navigation
     * Tests can use relative URLs: page.goto('/dashboard')
     */
    baseURL,

    /**
     * Screenshot configuration
     * 'only-on-failure': Only capture if test fails
     * 'off': Disable screenshots
     * 'on': Always capture
     */
    screenshot: 'only-on-failure',

    /**
     * Video configuration
     * 'retain-on-failure': Only keep videos from failed tests
     * 'off': Disable videos
     * 'on': Always record
     */
    video: 'retain-on-failure',

    /**
     * Trace configuration
     * Traces help debug test execution
     * 'on-first-retry': Capture trace when test is retried
     * 'off': Disable tracing
     * 'on': Always trace
     */
    trace: 'on-first-retry',

    /**
     * Network request interception timeout
     */
    navigationTimeout: 30000,

    /**
     * Browser action timeout (click, fill, etc.)
     */
    actionTimeout: 10000,
  },

  // ============================================================================
  // BROWSER CONFIGURATION
  // ============================================================================

  projects: [
    /**
     * Chromium: Google Chrome, Microsoft Edge, Opera
     * Primary browser for testing, most compatible
     */
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        /**
         * Viewport size
         * Standard desktop: 1280x720
         * Full HD: 1920x1080
         * Mobile: 390x844
         */
        viewport: { width: 1280, height: 720 },

        /**
         * Device scale factor
         * 1 = 96 DPI (standard)
         * 2 = 192 DPI (retina)
         */
        deviceScaleFactor: 1,

        /**
         * Ignore HTTPS certificate errors
         * Useful for development environments
         */
        ignoreHTTPSErrors: false,

        /**
         * Geolocation
         * Useful for location-based testing
         */
        geolocation: undefined, // Set to { latitude: 37.7749, longitude: -122.4194 } if needed

        /**
         * Timezone
         * Useful for timezone-specific testing
         */
        timezone: 'America/Los_Angeles',

        /**
         * Locale
         * Useful for internationalization testing
         */
        locale: 'en-US',

        /**
         * Permissions
         * Preset permissions for notifications, camera, microphone, etc.
         */
        permissions: [],

        /**
         * HTTP credentials
         * Useful for basic auth testing
         */
        httpCredentials: undefined,

        /**
         * Offline mode
         * Useful for offline-first testing
         */
        offline: false,
      },
    },

    /**
     * Firefox: Mozilla Firefox
     * Important for cross-browser compatibility
     */
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 1,
        ignoreHTTPSErrors: false,
        timezone: 'America/Los_Angeles',
        locale: 'en-US',
        offline: false,
      },
    },

    /**
     * WebKit: Safari and other WebKit-based browsers
     * Important for iOS/macOS compatibility
     */
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 1,
        ignoreHTTPSErrors: false,
        timezone: 'America/Los_Angeles',
        locale: 'en-US',
        offline: false,
      },
    },

    // --------
    // Optional: Mobile browser testing
    // Uncomment to enable mobile testing
    // --------

    /**
     * Mobile Chrome (Android)
     */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },

    /**
     * Mobile Safari (iOS)
     */
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  // ============================================================================
  // WEB SERVER CONFIGURATION (OPTIONAL)
  // ============================================================================

  /**
   * Web server to run alongside tests
   * Useful for starting a dev server before tests
   * Uncomment if you need automatic server startup
   */
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !isCI,
  //   timeout: 120000,
  // },

  // ============================================================================
  // CI/CD SPECIFIC CONFIGURATION
  // ============================================================================

  ...(isCI && {
    /**
     * Fail tests if they're marked with .only() or .skip()
     * Prevents accidental skipped tests in CI
     */
    forbidOnly: true,

    /**
     * Fail if no tests found
     * Ensures test suite is healthy
     */
    forbidUnusedFilter: true,

    /**
     * Update snapshots in CI only with CI=1 UPDATE_SNAPSHOTS=1
     */
    updateSnapshots: process.env.UPDATE_SNAPSHOTS === 'true',
  }),
});
