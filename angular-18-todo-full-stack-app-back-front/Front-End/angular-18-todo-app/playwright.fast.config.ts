import { defineConfig, devices } from '@playwright/test';

/**
 * FAST E2E TESTING CONFIGURATION
 * Optimized for speed while maintaining essential functionality
 */
export default defineConfig({
    testDir: './e2e',

    // Speed optimizations
    fullyParallel: false, // Keep sequential for observation
    workers: 1, // Single worker for fastest sequential execution
    retries: 0, // No retries for speed
    timeout: 60000, // Reduced to 1 minute per test
    globalTimeout: 600000, // 10 minutes total

    // Minimal reporting for speed
    reporter: [['line'], ['html', { open: 'never' }]],

    use: {
        baseURL: 'http://localhost:4200',

        // Speed optimizations
        headless: false, // Keep for observation but faster than headed
        actionTimeout: 5000, // Reduced from 10s to 5s
        navigationTimeout: 10000, // Reduced from 15s to 10s

        // Minimal media capture for speed
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'retain-on-failure',
    },

    // Single browser for speed
    projects: [
        {
            name: 'chromium-fast',
            use: {
                ...devices['Desktop Chrome'],
                headless: false,
                launchOptions: {
                    slowMo: 300, // Reduced from 1000ms to 300ms
                },
                viewport: { width: 1280, height: 720 },
            },
        },
    ],

    // Remove webServer config to avoid conflicts
    outputDir: 'test-results/',
});