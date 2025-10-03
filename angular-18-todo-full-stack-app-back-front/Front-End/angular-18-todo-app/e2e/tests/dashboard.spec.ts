import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';

test.describe('Dashboard Functionality', () => {
    test.beforeEach(async ({ page }) => {
        // Login before each test
        const loginPage = new LoginPage(page);
        await loginPage.goto();

        const email = process.env['E2E_TEST_EMAIL'] || 'admin@example.com';
        const password = process.env['E2E_TEST_PASSWORD'] || 'admin123';

        await loginPage.login(email, password);
        await expect(page).toHaveURL(/.*\/dashboard/);
    });

    test('should display dashboard components correctly', async ({ page }) => {
        const dashboardPage = new DashboardPage(page);
        await dashboardPage.waitForDashboardToLoad();

        await expect(dashboardPage.addListButton).toBeVisible();
        await expect(dashboardPage.addTodoButton).toBeVisible();
        await expect(dashboardPage.userMenu).toBeVisible();
    });

    test('should create a new list successfully', async ({ page }) => {
        const dashboardPage = new DashboardPage(page);
        await dashboardPage.waitForDashboardToLoad();

        const initialListCount = await dashboardPage.getListCount();
        await dashboardPage.createNewList('Test List', 'This is a test list', '#3498db');

        // Wait for the new list to appear
        await page.waitForTimeout(2000);
        const newListCount = await dashboardPage.getListCount();
        expect(newListCount).toBeGreaterThan(initialListCount);
    });

    test('should create a new todo successfully', async ({ page }) => {
        const dashboardPage = new DashboardPage(page);
        await dashboardPage.waitForDashboardToLoad();

        const initialTodoCount = await dashboardPage.getTodoCount();
        await dashboardPage.createNewTodo('Test Todo', 'This is a test todo', 'medium');

        // Wait for the new todo to appear
        await page.waitForTimeout(2000);
        const newTodoCount = await dashboardPage.getTodoCount();
        expect(newTodoCount).toBeGreaterThan(initialTodoCount);
    });

    test('should search todos correctly', async ({ page }) => {
        const dashboardPage = new DashboardPage(page);
        await dashboardPage.waitForDashboardToLoad();

        // Create a todo first
        await dashboardPage.createNewTodo('Searchable Todo', 'This todo should be searchable');
        await page.waitForTimeout(2000);

        // Search for the todo
        await dashboardPage.searchTodos('Searchable');
        await page.waitForTimeout(1000);

        // Verify search results
        const searchResults = page.locator('.todo-item:visible');
        const searchResultsCount = await searchResults.count();
        expect(searchResultsCount).toBeGreaterThan(0);
    });

    test('should filter todos by priority', async ({ page }) => {
        const dashboardPage = new DashboardPage(page);
        await dashboardPage.waitForDashboardToLoad();

        // Create todos with different priorities
        await dashboardPage.createNewTodo('High Priority Todo', 'Important task', 'high');
        await page.waitForTimeout(1000);
        await dashboardPage.createNewTodo('Low Priority Todo', 'Less important task', 'low');
        await page.waitForTimeout(2000);

        // Filter by high priority
        await dashboardPage.filterByPriority('High');
        await page.waitForTimeout(1000);

        // Verify filter results
        const highPriorityTodos = page.locator('.todo-item:visible .priority-high');
        const highPriorityCount = await highPriorityTodos.count();
        expect(highPriorityCount).toBeGreaterThan(0);
    });

    test('should edit todo successfully', async ({ page }) => {
        const dashboardPage = new DashboardPage(page);
        await dashboardPage.waitForDashboardToLoad();

        // Create a todo first
        const originalTitle = 'Original Todo Title';
        const newTitle = 'Updated Todo Title';

        await dashboardPage.createNewTodo(originalTitle, 'This will be edited');
        await page.waitForTimeout(2000);

        // Edit the todo
        await dashboardPage.editTodo(originalTitle, newTitle);
        await page.waitForTimeout(2000);

        // Verify the todo was updated
        const updatedTodo = page.locator('.todo-item').filter({ hasText: newTitle });
        await expect(updatedTodo).toBeVisible();
    });

    test('should delete todo successfully', async ({ page }) => {
        const dashboardPage = new DashboardPage(page);
        await dashboardPage.waitForDashboardToLoad();

        // Create a todo first
        const todoTitle = 'Todo to Delete';
        await dashboardPage.createNewTodo(todoTitle, 'This will be deleted');
        await page.waitForTimeout(2000);

        // Delete the todo
        await dashboardPage.deleteTodo(todoTitle);
        await page.waitForTimeout(2000);

        // Verify the todo was deleted
        const deletedTodo = page.locator('.todo-item').filter({ hasText: todoTitle });
        await expect(deletedTodo).toHaveCount(0);
    });

    test('should toggle todo completion status', async ({ page }) => {
        const dashboardPage = new DashboardPage(page);
        await dashboardPage.waitForDashboardToLoad();

        // Create a todo first
        const todoTitle = 'Todo to Complete';
        await dashboardPage.createNewTodo(todoTitle, 'This will be completed');
        await page.waitForTimeout(2000);

        // Toggle completion
        await dashboardPage.toggleTodoComplete(todoTitle);
        await page.waitForTimeout(1000);

        // Verify the todo status changed
        const completedTodo = page.locator('.todo-item').filter({ hasText: todoTitle });
        await expect(completedTodo).toHaveClass(/completed/);
    });

    test('should logout successfully', async ({ page }) => {
        const dashboardPage = new DashboardPage(page);
        await dashboardPage.waitForDashboardToLoad();

        await dashboardPage.logout();

        // Should redirect to login page
        await expect(page).toHaveURL(/.*\/auth\/login/);
    });
});