import { defineConfig, devices } from '@playwright/test';

/**
 * CRITICAL: Before running E2E tests, verify all services are running:
 * 
 * 1. MongoDB (port 27017): netstat -ln | grep :27017
 * 2. Express.js Backend (port 3000): curl -s http://localhost:3000/health
 * 3. Angular Frontend (port 4200): curl -s -I http://localhost:4200
 * 
 * If services are not running, execute: ./start-dev.sh
 * 
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    testDir: './e2e',
    /* Run tests in files in parallel */
    fullyParallel: false, // Changed to false for sequential execution
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env['CI'],
    /* Retry on CI only */
    retries: process.env['CI'] ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env['CI'] ? 1 : 1, // Changed to 1 worker for sequential execution
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [
        ['html', {
            outputFolder: 'playwright-report',
            open: 'never'
        }],
        ['json', {
            outputFile: 'test-results/test-results.json'
        }],
        ['list']
    ],
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: 'http://localhost:4200',
        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry',
        /* Browser settings for user observation with improved delays */
        headless: false, // Always show browser for user journey testing
        /* Screenshot and video settings */
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        /* Additional timeouts for stability */
        actionTimeout: 10000, // 10 seconds for actions
        navigationTimeout: 15000, // 15 seconds for navigation
    },

    /* Global timeout for each test - increased to accommodate delays */
    timeout: 120000, // 2 minutes per test (was 60 seconds)

    /* Test inter-execution delays */
    globalTimeout: 1800000, // 30 minutes total for all tests

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                // Enable headed mode for user observation
                headless: false,
                // Slow down for better user experience and observation
                launchOptions: {
                    slowMo: 1000, // 1 second delay between actions for better observation
                },
                viewport: { width: 1280, height: 720 },
            },
        },

        {
            name: 'firefox',
            use: {
                ...devices['Desktop Firefox'],
                headless: false,
                launchOptions: {
                    slowMo: 500,
                },
                viewport: { width: 1280, height: 720 },
            },
        },

        {
            name: 'webkit',
            use: {
                ...devices['Desktop Safari'],
                headless: false,
                launchOptions: {
                    slowMo: 500,
                },
                viewport: { width: 1280, height: 720 },
            },
        },

        /* Test against mobile viewports. */
        {
            name: 'Mobile Chrome',
            use: {
                ...devices['Pixel 5'],
                headless: false,
                launchOptions: {
                    slowMo: 500,
                },
            },
        },
        {
            name: 'Mobile Safari',
            use: {
                ...devices['iPhone 12'],
                headless: false,
                launchOptions: {
                    slowMo: 500,
                },
            },
        },

        /* Test against branded browsers. */
        // {
        //   name: 'Microsoft Edge',
        //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
        // },
        // {
        //   name: 'Google Chrome',
        //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
        // },
    ],

    /* Folder for test artifacts such as screenshots, videos, traces, etc. */
    outputDir: 'test-results/',

    /* Run your local dev server before starting the tests */
    webServer: {
        command: 'echo "Web server already running"',
        url: 'http://localhost:4200',
        reuseExistingServer: true,
        timeout: 30000,
    },

    /* Global setup and teardown */
    globalSetup: require.resolve('./e2e/global-setup.ts'),
    globalTeardown: require.resolve('./e2e/global-teardown.ts'),
});