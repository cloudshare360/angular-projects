import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
    console.log('🧹 Starting global teardown for Playwright tests...');

    // Clean up any global state
    console.log('✅ Global teardown completed');
}

export default globalTeardown;