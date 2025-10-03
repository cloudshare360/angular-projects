import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { RegisterPage } from '../pages/register.page';
import { DashboardPage } from '../pages/dashboard.page';

// FAST E2E Test Configuration
test.describe.configure({ mode: 'serial' });

test.describe('Fast User Journey - Optimized Flow', () => {
    let loginPage: LoginPage;
    let registerPage: RegisterPage;
    let dashboardPage: DashboardPage;

    // Optimized test user
    const timestamp = Date.now();
    const testUser = {
        username: `fastuser${timestamp}`,
        email: `fast${timestamp}@test.com`,
        password: 'Fast123!',
        firstName: 'Fast',
        lastName: 'Test'
    };

    // Authentication state tracking
    let isAuthenticated = false;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        registerPage = new RegisterPage(page);
        dashboardPage = new DashboardPage(page);

        // Reduced delay for speed
        await page.waitForTimeout(1000); // 1s instead of 3s
    });

    test.afterEach(async ({ page }) => {
        // Minimal delay between tests
        await page.waitForTimeout(2000); // 2s instead of 5s
    });

    test('⚡ Fast Registration', async ({ page }) => {
        console.log('🚀 Fast Registration Test');

        await page.goto('/auth/register');
        await page.waitForLoadState('networkidle');

        // Faster form filling
        await registerPage.usernameInput.fill(testUser.username);
        await page.waitForTimeout(200); // Reduced delay

        await registerPage.emailInput.fill(testUser.email);
        await page.waitForTimeout(200);

        await registerPage.passwordInput.fill(testUser.password);
        await page.waitForTimeout(200);

        // Handle confirm password if exists
        const confirmPasswordExists = await registerPage.confirmPasswordInput.isVisible().catch(() => false);
        if (confirmPasswordExists) {
            await registerPage.confirmPasswordInput.fill(testUser.password);
            await page.waitForTimeout(200);
        }

        await registerPage.firstNameInput.fill(testUser.firstName);
        await page.waitForTimeout(200);

        await registerPage.lastNameInput.fill(testUser.lastName);
        await page.waitForTimeout(500);

        // Submit and check result quickly
        await registerPage.registerButton.click();
        await page.waitForTimeout(2000); // Reduced wait time

        const currentUrl = page.url();
        if (currentUrl.includes('/dashboard')) {
            console.log('✅ Auto-authenticated to dashboard');
            isAuthenticated = true;
        }

        console.log('🎉 Fast registration completed');
    });

    test('⚡ Fast Login (if needed)', async ({ page }) => {
        console.log('🚀 Fast Login Test');

        if (isAuthenticated) {
            console.log('⏭️ Already authenticated, verifying dashboard access');
            await page.goto('/dashboard');
            await expect(page).toHaveURL(/.*\/dashboard/);
            console.log('🎉 Dashboard access confirmed');
            return;
        }

        await page.goto('/auth/login');
        await page.waitForLoadState('networkidle');

        // Fast login
        await loginPage.emailInput.fill(testUser.email);
        await page.waitForTimeout(200);

        await loginPage.passwordInput.fill(testUser.password);
        await page.waitForTimeout(200);

        await loginPage.loginButton.click();
        await page.waitForTimeout(2000);

        const currentUrl = page.url();
        if (currentUrl.includes('/dashboard')) {
            isAuthenticated = true;
            console.log('✅ Login successful');
        }

        console.log('🎉 Fast login completed');
    });

    test('⚡ Fast Dashboard Operations', async ({ page }) => {
        console.log('🚀 Fast Dashboard Test');

        // Ensure we're on dashboard
        if (!isAuthenticated) {
            await page.goto('/auth/login');
            await loginPage.emailInput.fill(testUser.email);
            await loginPage.passwordInput.fill(testUser.password);
            await loginPage.loginButton.click();
            await page.waitForTimeout(2000);
        } else {
            await page.goto('/dashboard');
        }

        await page.waitForLoadState('networkidle');

        // Quick dashboard verification
        await expect(page.locator('[data-testid="user-menu"]')).toBeVisible({ timeout: 5000 });
        console.log('✅ Dashboard loaded');

        // Fast todo creation (if create button exists)
        const createBtn = page.locator('[data-testid="create-todo-btn"]');
        if (await createBtn.isVisible()) {
            await createBtn.click();
            await page.waitForTimeout(1000);

            // Quick todo form (if modal opens)
            const todoTitle = page.locator('#todo-title');
            if (await todoTitle.isVisible()) {
                await todoTitle.fill('Fast Test Todo');
                await page.waitForTimeout(200);

                const saveBtn = page.locator('[data-testid="save-todo-btn"]');
                if (await saveBtn.isVisible()) {
                    await saveBtn.click();
                    await page.waitForTimeout(1000);
                    console.log('✅ Todo created');
                }
            }
        }

        console.log('🎉 Fast dashboard operations completed');
    });

    test('⚡ Fast Logout', async ({ page }) => {
        console.log('🚀 Fast Logout Test');

        // Ensure we're on dashboard
        await page.goto('/dashboard');
        await page.waitForTimeout(1000);

        // Fast logout
        const logoutBtn = page.locator('[data-testid="logout-btn"]');
        if (await logoutBtn.isVisible()) {
            await logoutBtn.click();
            await page.waitForTimeout(1500);

            // Verify redirect to login
            const currentUrl = page.url();
            if (currentUrl.includes('/auth/login')) {
                console.log('✅ Logout successful');
                isAuthenticated = false;
            }
        }

        console.log('🎉 Fast logout completed');
    });
});