import { test, expect } from '@playwright/test';

test.describe('Simple UI Bug Testing', () => {
    test('🔍 Test Login Flow', async ({ page }) => {
        console.log('🚀 Testing Login Flow...');

        // Go to login page
        await page.goto('http://localhost:4200/auth/login');
        await page.waitForLoadState('networkidle');

        // Check if page loaded correctly
        await expect(page.locator('h1')).toContainText('Welcome Back');
        console.log('✅ Login page loaded correctly');

        // Fill login form
        await page.fill('#usernameOrEmail', 'test@example.com');
        await page.fill('#password', 'password123');
        console.log('📝 Filled login form');

        // Listen for the login API call
        const responsePromise = page.waitForResponse(response =>
            response.url().includes('/api/auth/login')
        );

        // Submit form
        await page.click('button[type="submit"]');
        console.log('🔄 Submitted login form');

        try {
            const response = await responsePromise;
            const responseBody = await response.json();
            console.log('📡 Login Response:', JSON.stringify(responseBody, null, 2));

            // Wait for potential redirects
            await page.waitForTimeout(3000);

            const currentUrl = page.url();
            console.log(`📍 Current URL after login: ${currentUrl}`);

            if (currentUrl.includes('/dashboard')) {
                console.log('✅ Successfully redirected to dashboard');
            } else {
                console.log('⚠️ Login may have issues - checking for errors');

                // Check for error messages
                const errorElement = page.locator('.error-message');
                if (await errorElement.isVisible()) {
                    const errorText = await errorElement.textContent();
                    console.log(`❌ Error message: ${errorText}`);
                }
            }

        } catch (error) {
            console.log('❌ Login request failed:', error);
        }
    });

    test('🔍 Test Dashboard Access', async ({ page }) => {
        console.log('🚀 Testing Dashboard Access...');

        // Try to access dashboard directly
        await page.goto('http://localhost:4200/dashboard');
        await page.waitForTimeout(2000);

        const currentUrl = page.url();
        console.log(`📍 Current URL: ${currentUrl}`);

        if (currentUrl.includes('/auth/login')) {
            console.log('🔒 Correctly redirected to login (auth guard working)');

            // Try login flow
            await page.fill('#usernameOrEmail', 'test@example.com');
            await page.fill('#password', 'password123');
            await page.click('button[type="submit"]');

            await page.waitForTimeout(3000);
            const finalUrl = page.url();
            console.log(`📍 Final URL after login: ${finalUrl}`);

            if (finalUrl.includes('/dashboard')) {
                console.log('✅ Login successful, now on dashboard');

                // Check if dashboard content loads
                const welcomeText = page.locator('[data-testid="user-menu"]');
                if (await welcomeText.isVisible()) {
                    console.log('✅ Dashboard content loaded correctly');
                } else {
                    console.log('⚠️ Dashboard content may not be loading');
                }
            } else {
                console.log('❌ Login failed, still not on dashboard');
            }

        } else if (currentUrl.includes('/dashboard')) {
            console.log('✅ Already authenticated, dashboard accessible');
        }
    });
});