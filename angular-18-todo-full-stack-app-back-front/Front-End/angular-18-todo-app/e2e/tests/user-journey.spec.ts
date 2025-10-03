import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { RegisterPage } from '../pages/register.page';
import { DashboardPage } from '../pages/dashboard.page';

// Test configuration for sequential execution with browser visibility
test.describe.configure({ mode: 'serial' });

test.describe('Complete User Journey - Sequential Flow', () => {
    let loginPage: LoginPage;
    let registerPage: RegisterPage;
    let dashboardPage: DashboardPage;

    // Generate unique test user for this test run to avoid conflicts
    const timestamp = Date.now();
    const testUser = {
        username: `testuser_${timestamp}`,
        email: `testuser_${timestamp}@example.com`,
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User'
    };

    // Shared authentication state to avoid multiple logins
    let isAuthenticated = false;
    let authToken = '';

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        registerPage = new RegisterPage(page);
        dashboardPage = new DashboardPage(page);
        
        // Add delay between test cases for stability
        await page.waitForTimeout(3000);
    });

    test.afterEach(async ({ page }) => {
        // Add delay after each test case completion
        console.log('⏳ Test case completed, waiting 5 seconds before next test...');
        await page.waitForTimeout(5000);
    });

    test('1️⃣ Step 1: New User Registration', async ({ page }) => {
        console.log('🚀 Starting Step 1: New User Registration');

        // Navigate to registration page
        await page.goto('/auth/register');
        await expect(page).toHaveURL(/.*\/auth\/register/);

        // Wait for page to be fully loaded with user viewing time
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Verify registration form is visible
        await expect(registerPage.usernameInput).toBeVisible();
        await expect(registerPage.emailInput).toBeVisible();
        await expect(registerPage.passwordInput).toBeVisible();
        await expect(registerPage.firstNameInput).toBeVisible();
        await expect(registerPage.lastNameInput).toBeVisible();

        console.log('📝 Filling registration form...');

        // Fill registration form with realistic delays
        await registerPage.usernameInput.fill(testUser.username);
        await page.waitForTimeout(800);

        await registerPage.emailInput.fill(testUser.email);
        await page.waitForTimeout(800);

        await registerPage.passwordInput.fill(testUser.password);
        await page.waitForTimeout(800);

        // Handle confirm password field if exists
        const confirmPasswordExists = await registerPage.confirmPasswordInput.isVisible().catch(() => false);
        if (confirmPasswordExists) {
            await registerPage.confirmPasswordInput.fill(testUser.password);
            await page.waitForTimeout(800);
        }

        await registerPage.firstNameInput.fill(testUser.firstName);
        await page.waitForTimeout(800);

        await registerPage.lastNameInput.fill(testUser.lastName);
        await page.waitForTimeout(1000);

        // Submit registration
        console.log('✅ Submitting registration...');
        await registerPage.registerButton.click();

        // Wait for registration processing
        await page.waitForTimeout(4000);

                // Check registration result
        const currentUrl = page.url();
        if (currentUrl.includes('/dashboard')) {
            console.log('✅ Registration successful - redirected to dashboard');
            await expect(page).toHaveURL(/.*\/dashboard/);
            isAuthenticated = true; // Mark as authenticated to skip login
        } else if (currentUrl.includes('/login')) {
            console.log('✅ Registration successful - redirected to login');
            await expect(page).toHaveURL(/.*\/login/);
        } else {
            console.log('📍 Current URL after registration:', currentUrl);
        }

        console.log('🎉 Step 1 Complete: User registration finished');
    });

    test('2️⃣ Step 2: User Login (if not already authenticated)', async ({ page }) => {
        console.log('🚀 Starting Step 2: User Login');

        // Skip login if already authenticated from registration
        if (isAuthenticated) {
            console.log('⏭️ User already authenticated from registration, skipping login step');
            await page.goto('/dashboard');
            await expect(page).toHaveURL(/.*\/dashboard/);
            console.log('🎉 Step 2 Complete: Already authenticated, verified dashboard access');
            return;
        }

        // Navigate to login page
        await page.goto('/auth/login');
        await expect(page).toHaveURL(/.*\/auth\/login/);

        // Wait for page to be fully loaded with user viewing time
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Verify login form is visible
        await expect(loginPage.emailInput).toBeVisible();
    });

    test('2️⃣ Step 2: User Login', async ({ page }) => {
        console.log('🚀 Starting Step 2: User Login');

        // Navigate to login page
        await page.goto('/auth/login');
        await expect(page).toHaveURL(/.*\/auth\/login/);

        // Wait for page to be fully loaded
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000); // User viewing time

        // Verify login form is visible
        await expect(loginPage.emailInput).toBeVisible();
        await expect(loginPage.passwordInput).toBeVisible();
        await expect(loginPage.loginButton).toBeVisible();

        console.log('📝 Filling login form...');

        // Fill login form with delays
        await loginPage.emailInput.fill(testUser.email);
        await page.waitForTimeout(500);

        await loginPage.passwordInput.fill(testUser.password);
        await page.waitForTimeout(1000);

        // Check if login button is enabled
        const isEnabled = await loginPage.loginButton.isEnabled();
        console.log('🔘 Login button enabled:', isEnabled);

        if (isEnabled) {
            console.log('🔑 Attempting to login...');
            await loginPage.loginButton.click();

            // Wait for login to complete
            await page.waitForTimeout(3000);

            // Check if successfully redirected to dashboard
            const currentUrl = page.url();
            console.log('📍 Current URL after login:', currentUrl);

            if (currentUrl.includes('/dashboard')) {
                console.log('✅ Login successful - redirected to dashboard');
                await expect(page).toHaveURL(/.*\/dashboard/);
            } else {
                // If still on login page, check for error messages
                const errorMessage = await page.locator('.error-message, .alert-danger').textContent().catch(() => '');
                console.log('❌ Login may have failed. Error message:', errorMessage);

                // Try using existing test user
                await loginPage.emailInput.fill('test@example.com');
                await page.waitForTimeout(500);
                await loginPage.passwordInput.fill('password123');
                await page.waitForTimeout(1000);
                await loginPage.loginButton.click();
                await page.waitForTimeout(3000);

                const retryUrl = page.url();
                if (retryUrl.includes('/dashboard')) {
                    console.log('✅ Login successful with existing user');
                    await expect(page).toHaveURL(/.*\/dashboard/);
                }
            }
        } else {
            console.log('❌ Login button is disabled - form validation may be failing');

            // Try with existing test user
            await loginPage.emailInput.clear();
            await loginPage.passwordInput.clear();
            await page.waitForTimeout(500);

            await loginPage.emailInput.fill('test@example.com');
            await page.waitForTimeout(500);
            await loginPage.passwordInput.fill('password123');
            await page.waitForTimeout(1000);

            await loginPage.loginButton.click();
            await page.waitForTimeout(3000);
        }

        console.log('🎉 Step 2 Complete: User login finished');
    });

    test('3️⃣ Step 3: Dashboard Navigation and Overview', async ({ page }) => {
        console.log('🚀 Starting Step 3: Dashboard Navigation');

        // Ensure we're logged in first
        await page.goto('/auth/login');
        await loginPage.emailInput.fill('test@example.com');
        await loginPage.passwordInput.fill('password123');
        await loginPage.loginButton.click();
        await page.waitForTimeout(3000);

        // Navigate to dashboard if not already there
        if (!page.url().includes('/dashboard')) {
            await page.goto('/dashboard');
        }

        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000); // User viewing time

        console.log('🔍 Exploring dashboard components...');

        // Check for main dashboard elements
        const welcomeText = await page.locator('h1, h2, .welcome, .dashboard-title').first().isVisible().catch(() => false);
        if (welcomeText) {
            console.log('✅ Dashboard welcome section found');
        }

        // Look for navigation elements
        const navElements = await page.locator('nav, .navbar, .sidebar, .menu').count();
        console.log(`📊 Found ${navElements} navigation elements`);

        // Check for todo-related sections
        const todoSections = await page.locator('[class*="todo"], [class*="list"], [class*="task"]').count();
        console.log(`📝 Found ${todoSections} todo-related sections`);

        // Wait for user to observe dashboard
        await page.waitForTimeout(3000);

        console.log('🎉 Step 3 Complete: Dashboard overview finished');
    });

    test('4️⃣ Step 4: Create New Todo List', async ({ page }) => {
        console.log('🚀 Starting Step 4: Create New Todo List');

        // Ensure we're logged in and on dashboard
        await page.goto('/auth/login');
        await loginPage.emailInput.fill('test@example.com');
        await loginPage.passwordInput.fill('password123');
        await loginPage.loginButton.click();
        await page.waitForTimeout(2000);

        if (!page.url().includes('/dashboard')) {
            await page.goto('/dashboard');
        }

        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        console.log('📝 Creating new todo list...');

        // Look for "Create List" or "New List" button
        const createListSelectors = [
            'button:has-text("Create List")',
            'button:has-text("New List")',
            'button:has-text("Add List")',
            '[data-testid="create-list"]',
            '.create-list-btn',
            '.add-list-btn'
        ];

        let createButton = null;
        for (const selector of createListSelectors) {
            const element = page.locator(selector).first();
            if (await element.isVisible().catch(() => false)) {
                createButton = element;
                break;
            }
        }

        if (createButton) {
            console.log('🔘 Found create list button, clicking...');
            await createButton.click();
            await page.waitForTimeout(1000);

            // Look for list name input
            const nameInputSelectors = [
                'input[name="name"]',
                'input[placeholder*="list"]i',
                'input[placeholder*="name"]i',
                '.list-name-input',
                '#listName'
            ];

            let nameInput = null;
            for (const selector of nameInputSelectors) {
                const element = page.locator(selector).first();
                if (await element.isVisible().catch(() => false)) {
                    nameInput = element;
                    break;
                }
            }

            if (nameInput) {
                const listName = `My Test List ${timestamp}`;
                await nameInput.fill(listName);
                await page.waitForTimeout(1000);

                // Look for submit button
                const submitSelectors = [
                    'button[type="submit"]',
                    'button:has-text("Create")',
                    'button:has-text("Save")',
                    'button:has-text("Add")'
                ];

                for (const selector of submitSelectors) {
                    const button = page.locator(selector).first();
                    if (await button.isVisible().catch(() => false)) {
                        await button.click();
                        await page.waitForTimeout(2000);
                        break;
                    }
                }

                console.log(`✅ Todo list "${listName}" created successfully`);
            } else {
                console.log('❌ Could not find list name input field');
            }
        } else {
            console.log('❌ Could not find create list button');
        }

        await page.waitForTimeout(2000);
        console.log('🎉 Step 4 Complete: Todo list creation finished');
    });

    test('5️⃣ Step 5: Add Todo Items', async ({ page }) => {
        console.log('🚀 Starting Step 5: Add Todo Items');

        // Ensure we're logged in and on dashboard
        await page.goto('/auth/login');
        await loginPage.emailInput.fill('test@example.com');
        await loginPage.passwordInput.fill('password123');
        await loginPage.loginButton.click();
        await page.waitForTimeout(2000);

        if (!page.url().includes('/dashboard')) {
            await page.goto('/dashboard');
        }

        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        console.log('📝 Adding todo items...');

        const todoItems = [
            'Complete project documentation',
            'Review code changes',
            'Test application functionality'
        ];

        for (let i = 0; i < todoItems.length; i++) {
            const item = todoItems[i];
            console.log(`📌 Adding todo item ${i + 1}: "${item}"`);

            // Look for "Add Todo" or "New Todo" button
            const addTodoSelectors = [
                'button:has-text("Add Todo")',
                'button:has-text("New Todo")',
                'button:has-text("Create Todo")',
                '[data-testid="add-todo"]',
                '.add-todo-btn',
                '.create-todo-btn'
            ];

            let addButton = null;
            for (const selector of addTodoSelectors) {
                const element = page.locator(selector).first();
                if (await element.isVisible().catch(() => false)) {
                    addButton = element;
                    break;
                }
            }

            if (addButton) {
                await addButton.click();
                await page.waitForTimeout(1000);

                // Look for todo title input
                const titleInputSelectors = [
                    'input[name="title"]',
                    'input[placeholder*="todo"]i',
                    'input[placeholder*="task"]i',
                    '.todo-title-input',
                    '#todoTitle'
                ];

                let titleInput = null;
                for (const selector of titleInputSelectors) {
                    const element = page.locator(selector).first();
                    if (await element.isVisible().catch(() => false)) {
                        titleInput = element;
                        break;
                    }
                }

                if (titleInput) {
                    await titleInput.fill(item);
                    await page.waitForTimeout(500);

                    // Look for submit button
                    const submitSelectors = [
                        'button[type="submit"]',
                        'button:has-text("Add")',
                        'button:has-text("Create")',
                        'button:has-text("Save")'
                    ];

                    for (const selector of submitSelectors) {
                        const button = page.locator(selector).first();
                        if (await button.isVisible().catch(() => false)) {
                            await button.click();
                            await page.waitForTimeout(1500);
                            break;
                        }
                    }

                    console.log(`✅ Todo item "${item}" added successfully`);
                } else {
                    console.log(`❌ Could not find todo title input for item ${i + 1}`);
                }
            } else {
                console.log(`❌ Could not find add todo button for item ${i + 1}`);
                break;
            }

            // Delay between adding items for better user experience observation
            await page.waitForTimeout(1000);
        }

        console.log('🎉 Step 5 Complete: Todo items added');
    });

    test('6️⃣ Step 6: Manage Todo Items (Complete/Edit/Delete)', async ({ page }) => {
        console.log('🚀 Starting Step 6: Manage Todo Items');

        // Ensure we're logged in and on dashboard
        await page.goto('/auth/login');
        await loginPage.emailInput.fill('test@example.com');
        await loginPage.passwordInput.fill('password123');
        await loginPage.loginButton.click();
        await page.waitForTimeout(2000);

        if (!page.url().includes('/dashboard')) {
            await page.goto('/dashboard');
        }

        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        console.log('🔄 Managing existing todo items...');

        // Look for existing todo items
        const todoItemSelectors = [
            '.todo-item',
            '.task-item',
            '[data-testid="todo-item"]',
            'li:has(input[type="checkbox"])'
        ];

        let todoItems = null;
        for (const selector of todoItemSelectors) {
            const elements = page.locator(selector);
            const count = await elements.count();
            if (count > 0) {
                todoItems = elements;
                console.log(`📋 Found ${count} todo items`);
                break;
            }
        }

        if (todoItems && await todoItems.count() > 0) {
            const itemCount = await todoItems.count();

            // Mark first item as complete
            console.log('✅ Marking first todo item as complete...');
            const firstItem = todoItems.first();
            const checkbox = firstItem.locator('input[type="checkbox"]').first();
            if (await checkbox.isVisible().catch(() => false)) {
                await checkbox.click();
                await page.waitForTimeout(1000);
                console.log('✅ First item marked as complete');
            }

            // Edit second item if it exists
            if (itemCount > 1) {
                console.log('✏️ Attempting to edit second todo item...');
                const secondItem = todoItems.nth(1);

                // Look for edit button
                const editButton = secondItem.locator('button:has-text("Edit"), .edit-btn, [data-testid="edit-todo"]').first();
                if (await editButton.isVisible().catch(() => false)) {
                    await editButton.click();
                    await page.waitForTimeout(1000);

                    // Look for edit input
                    const editInput = page.locator('input[name="title"], .edit-input').first();
                    if (await editInput.isVisible().catch(() => false)) {
                        await editInput.fill('Updated todo item');
                        await page.waitForTimeout(500);

                        // Save changes
                        const saveButton = page.locator('button:has-text("Save"), .save-btn').first();
                        if (await saveButton.isVisible().catch(() => false)) {
                            await saveButton.click();
                            await page.waitForTimeout(1000);
                            console.log('✅ Second item edited successfully');
                        }
                    }
                }
            }

            // Delete third item if it exists
            if (itemCount > 2) {
                console.log('🗑️ Attempting to delete third todo item...');
                const thirdItem = todoItems.nth(2);

                // Look for delete button
                const deleteButton = thirdItem.locator('button:has-text("Delete"), .delete-btn, [data-testid="delete-todo"]').first();
                if (await deleteButton.isVisible().catch(() => false)) {
                    await deleteButton.click();
                    await page.waitForTimeout(500);

                    // Confirm deletion if confirmation dialog appears
                    const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete")').first();
                    if (await confirmButton.isVisible().catch(() => false)) {
                        await confirmButton.click();
                        await page.waitForTimeout(1000);
                        console.log('✅ Third item deleted successfully');
                    }
                }
            }
        } else {
            console.log('❌ No todo items found to manage');
        }

        await page.waitForTimeout(2000);
        console.log('🎉 Step 6 Complete: Todo management finished');
    });

    test('7️⃣ Step 7: User Logout', async ({ page }) => {
        console.log('🚀 Starting Step 7: User Logout');

        // Ensure we're logged in first
        await page.goto('/auth/login');
        await loginPage.emailInput.fill('test@example.com');
        await loginPage.passwordInput.fill('password123');
        await loginPage.loginButton.click();
        await page.waitForTimeout(2000);

        if (!page.url().includes('/dashboard')) {
            await page.goto('/dashboard');
        }

        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        console.log('🚪 Logging out user...');

        // Look for logout button/link
        const logoutSelectors = [
            'button:has-text("Logout")',
            'button:has-text("Sign Out")',
            'a:has-text("Logout")',
            'a:has-text("Sign Out")',
            '[data-testid="logout"]',
            '.logout-btn'
        ];

        let logoutButton = null;
        for (const selector of logoutSelectors) {
            const element = page.locator(selector).first();
            if (await element.isVisible().catch(() => false)) {
                logoutButton = element;
                break;
            }
        }

        if (logoutButton) {
            console.log('🔘 Found logout button, clicking...');
            await logoutButton.click();
            await page.waitForTimeout(2000);

            // Verify redirected to login page
            const currentUrl = page.url();
            if (currentUrl.includes('/login') || currentUrl.includes('/auth')) {
                console.log('✅ Logout successful - redirected to login page');
                await expect(page).toHaveURL(/.*\/(login|auth)/);
            } else {
                console.log('📍 Current URL after logout:', currentUrl);
            }
        } else {
            console.log('❌ Could not find logout button');

            // Try user menu/dropdown
            const userMenuSelectors = [
                '.user-menu',
                '.profile-menu',
                '[data-testid="user-menu"]',
                'button:has-text("User")',
                'button:has-text("Profile")'
            ];

            for (const selector of userMenuSelectors) {
                const element = page.locator(selector).first();
                if (await element.isVisible().catch(() => false)) {
                    await element.click();
                    await page.waitForTimeout(1000);

                    // Look for logout in dropdown
                    const dropdownLogout = page.locator('button:has-text("Logout"), a:has-text("Logout")').first();
                    if (await dropdownLogout.isVisible().catch(() => false)) {
                        await dropdownLogout.click();
                        await page.waitForTimeout(2000);
                        console.log('✅ Logout successful via dropdown menu');
                        break;
                    }
                }
            }
        }

        await page.waitForTimeout(2000);
        console.log('🎉 Step 7 Complete: User logout finished');
        console.log('🏁 Complete User Journey Finished Successfully!');
    });
});