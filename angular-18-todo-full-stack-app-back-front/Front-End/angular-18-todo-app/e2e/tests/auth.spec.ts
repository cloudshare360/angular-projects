import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { RegisterPage } from '../pages/register.page';

test.describe('Authentication Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Start from the home page
        await page.goto('/');
    });

    test('should redirect to login page when not authenticated', async ({ page }) => {
        await page.goto('/dashboard');
        await expect(page).toHaveURL(/.*\/auth\/login/);
    });

    test('should display login form correctly', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();

        await expect(loginPage.emailInput).toBeVisible();
        await expect(loginPage.passwordInput).toBeVisible();
        await expect(loginPage.loginButton).toBeVisible();
        await expect(loginPage.registerLink).toBeVisible();
    });

    test('should navigate to register page from login', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.goToRegister();

        await expect(page).toHaveURL(/.*\/auth\/register/);
    });

    test('should display register form correctly', async ({ page }) => {
        const registerPage = new RegisterPage(page);
        await registerPage.goto();

        await expect(registerPage.usernameInput).toBeVisible();
        await expect(registerPage.emailInput).toBeVisible();
        await expect(registerPage.passwordInput).toBeVisible();
        await expect(registerPage.confirmPasswordInput).toBeVisible();
        await expect(registerPage.firstNameInput).toBeVisible();
        await expect(registerPage.lastNameInput).toBeVisible();
        await expect(registerPage.registerButton).toBeVisible();
        await expect(registerPage.loginLink).toBeVisible();
    });

    test('should navigate to login page from register', async ({ page }) => {
        const registerPage = new RegisterPage(page);
        await registerPage.goto();
        await registerPage.goToLogin();

        await expect(page).toHaveURL(/.*\/auth\/login/);
    });

    test('should show error for invalid login credentials', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login('invalid@email.com', 'wrongpassword');

        // Wait for error message or check for failed login state
        await page.waitForTimeout(2000);
        // Check that we're still on login page (login failed)
        await expect(page).toHaveURL(/.*\/auth\/login/);
    });

    test('should successfully login with valid credentials', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();

        const email = process.env['E2E_TEST_EMAIL'] || 'admin@example.com';
        const password = process.env['E2E_TEST_PASSWORD'] || 'admin123';

        await loginPage.login(email, password);

        // Should redirect to dashboard after successful login
        await expect(page).toHaveURL(/.*\/dashboard/);
    });

    test('should register new user successfully', async ({ page }) => {
        const registerPage = new RegisterPage(page);
        await registerPage.goto();

        const timestamp = Date.now();
        const userData = {
            username: `testuser${timestamp}`,
            email: `test${timestamp}@example.com`,
            password: 'testpass123',
            confirmPassword: 'testpass123',
            firstName: 'Test',
            lastName: 'User'
        };

        await registerPage.register(userData);

        // Should redirect to dashboard or login after successful registration
        await expect(page).toHaveURL(/.*\/(dashboard|auth\/login)/);
    });

    test('should show validation errors for invalid registration data', async ({ page }) => {
        const registerPage = new RegisterPage(page);
        await registerPage.goto();

        // Try to register with mismatched passwords
        const userData = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            confirmPassword: 'differentpassword',
            firstName: 'Test',
            lastName: 'User'
        };

        await registerPage.register(userData);

        // Should stay on register page due to validation errors
        await expect(page).toHaveURL(/.*\/auth\/register/);
    });
});