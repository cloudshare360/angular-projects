import { defineConfig, devices } from '@playwright/test';

/**
 * Simplified Playwright configuration for testing with already running servers
 */
export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env['CI'],
    retries: process.env['CI'] ? 2 : 0,
    workers: process.env['CI'] ? 1 : undefined,
    reporter: [
        ['line'],
        ['html', {
            outputFolder: 'playwright-report',
            open: 'never'
        }]
    ],
    use: {
        baseURL: 'http://localhost:4200',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        actionTimeout: 10000,
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],

    // No webServer configuration - assuming services are already running
    outputDir: 'test-results/',
    expect: {
        timeout: 5000,
        toHaveScreenshot: {
            threshold: 0.2,
        },
    },
    timeout: 30 * 1000,
});