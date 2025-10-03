import { test, expect, Page } from '@playwright/test';

test.describe('UI Bug Detection and Debugging', () => {
    let consoleLogs: string[] = [];
    let consoleErrors: string[] = [];

    test.beforeEach(async ({ page }) => {
        consoleLogs = [];
        consoleErrors = [];

        // Capture console logs and errors
        page.on('console', msg => {
            const text = `[${msg.type()}] ${msg.text()}`;
            consoleLogs.push(text);
            if (msg.type() === 'error') {
                consoleErrors.push(text);
            }
        });

        // Capture network failures
        page.on('requestfailed', request => {
            consoleErrors.push(`[NETWORK] Failed: ${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
        });

        // Capture page errors
        page.on('pageerror', error => {
            consoleErrors.push(`[PAGE ERROR] ${error.message}`);
        });
    });

    test.afterEach(async () => {
        console.log('\n=== CONSOLE LOGS ===');
        consoleLogs.forEach(log => console.log(log));

        if (consoleErrors.length > 0) {
            console.log('\n=== CONSOLE ERRORS ===');
            consoleErrors.forEach(error => console.log(error));
        }
    });

    test('🔍 Step 1: Debug Registration Flow', async ({ page }) => {
        console.log('🚀 Testing Registration Flow...');

        await page.goto('http://localhost:4200/auth/register');
        await page.waitForLoadState('networkidle');

        // Check if page loaded correctly
        await expect(page.locator('h1')).toContainText('Create Account');

        // Fill registration form with new user data
        const timestamp = Date.now();
        const testUser = {
            firstName: 'Debug',
            lastName: 'User',
            username: `debuguser${timestamp}`,
            email: `debug${timestamp}@example.com`,
            password: 'password123'
        };

        await page.fill('#firstName', testUser.firstName);
        await page.fill('#lastName', testUser.lastName);
        await page.fill('#username', testUser.username);
        await page.fill('#email', testUser.email);
        await page.fill('#password', testUser.password);

        console.log(`📝 Filled form with user: ${testUser.email}`);

        // Submit form and monitor network
        const responsePromise = page.waitForResponse(response =>
            response.url().includes('/api/auth/register') && response.status() === 200
        );

        await page.click('button[type="submit"]');

        try {
            const response = await responsePromise;
            const responseBody = await response.json();
            console.log('📡 Registration Response:', JSON.stringify(responseBody, null, 2));

            // Wait a bit for any redirects or UI updates
            await page.waitForTimeout(2000);

            const currentUrl = page.url();
            console.log(`📍 Current URL after registration: ${currentUrl}`);

            // Check if redirected to dashboard
            if (currentUrl.includes('/dashboard')) {
                console.log('✅ Registration successful - redirected to dashboard');
            } else {
                console.log('⚠️ Registration may have failed - still on registration page');

                // Check for error messages
                const errorMsg = await page.locator('.error-message').textContent();
                if (errorMsg) {
                    console.log(`❌ Error message displayed: ${errorMsg}`);
                }
            }

        } catch (error) {
            console.log('❌ Registration request failed:', error);
        }
    });

    test('🔍 Step 2: Debug Login Flow', async ({ page }) => {
        console.log('🚀 Testing Login Flow...');

        await page.goto('http://localhost:4200/auth/login');
        await page.waitForLoadState('networkidle');

        // Check if page loaded correctly
        await expect(page.locator('h1')).toContainText('Welcome Back');

        // Use existing test user
        await page.fill('#usernameOrEmail', 'test@example.com');
        await page.fill('#password', 'password123');

        console.log('📝 Filled login form with test@example.com');

        // Submit form and monitor network
        const responsePromise = page.waitForResponse(response =>
            response.url().includes('/api/auth/login') && response.status() === 200
        );

        await page.click('button[type="submit"]');

        try {
            const response = await responsePromise;
            const responseBody = await response.json();
            console.log('📡 Login Response:', JSON.stringify(responseBody, null, 2));

            // Wait a bit for any redirects or UI updates
            await page.waitForTimeout(2000);

            const currentUrl = page.url();
            console.log(`📍 Current URL after login: ${currentUrl}`);

            // Check if redirected to dashboard
            if (currentUrl.includes('/dashboard')) {
                console.log('✅ Login successful - redirected to dashboard');
            } else {
                console.log('⚠️ Login may have failed - still on login page');

                // Check for error messages
                const errorMsg = await page.locator('.error-message').textContent();
                if (errorMsg) {
                    console.log(`❌ Error message displayed: ${errorMsg}`);
                }
            }

        } catch (error) {
            console.log('❌ Login request failed:', error);
        }
    });

    test('🔍 Step 3: Debug Dashboard Access', async ({ page }) => {
        console.log('🚀 Testing Dashboard Access...');

        // First login
        await page.goto('http://localhost:4200/auth/login');
        await page.waitForLoadState('networkidle');

        await page.fill('#usernameOrEmail', 'test@example.com');
        await page.fill('#password', 'password123');
        await page.click('button[type="submit"]');

        // Wait for potential redirect
        await page.waitForTimeout(3000);

        const currentUrl = page.url();
        console.log(`📍 URL after login attempt: ${currentUrl}`);

        if (!currentUrl.includes('/dashboard')) {
            console.log('⚠️ Not redirected to dashboard, trying direct navigation...');
            await page.goto('http://localhost:4200/dashboard');
            await page.waitForTimeout(2000);

            const finalUrl = page.url();
            console.log(`📍 Final URL after direct navigation: ${finalUrl}`);

            if (finalUrl.includes('/auth/login')) {
                console.log('❌ Redirected back to login - authentication failed');
            } else if (finalUrl.includes('/dashboard')) {
                console.log('✅ Successfully accessed dashboard');
            }
        }
    });
});