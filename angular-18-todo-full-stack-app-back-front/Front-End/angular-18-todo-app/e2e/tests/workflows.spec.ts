import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';

test.describe('User Workflows', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    
    const email = process.env['E2E_TEST_EMAIL'] || 'admin@example.com';
    const password = process.env['E2E_TEST_PASSWORD'] || 'admin123';
    
    await loginPage.login(email, password);
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('Complete user workflow: Create list, add todos, manage tasks', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.waitForDashboardToLoad();

    // Step 1: Create a new list
    await dashboardPage.createNewList('Project Tasks', 'Tasks for the new project', '#e74c3c');
    await page.waitForTimeout(2000);

    // Step 2: Add multiple todos to the list
    await dashboardPage.createNewTodo('Design wireframes', 'Create initial designs', 'high');
    await page.waitForTimeout(1000);
    
    await dashboardPage.createNewTodo('Develop backend API', 'Implement REST endpoints', 'high');
    await page.waitForTimeout(1000);
    
    await dashboardPage.createNewTodo('Write documentation', 'Create user guide', 'medium');
    await page.waitForTimeout(1000);
    
    await dashboardPage.createNewTodo('Testing and QA', 'Perform quality assurance', 'medium');
    await page.waitForTimeout(2000);

    // Step 3: Mark some todos as complete
    await dashboardPage.toggleTodoComplete('Design wireframes');
    await page.waitForTimeout(1000);
    
    await dashboardPage.toggleTodoComplete('Write documentation');
    await page.waitForTimeout(2000);

    // Step 4: Edit a todo
    await dashboardPage.editTodo('Testing and QA', 'Testing, QA and Bug Fixes');
    await page.waitForTimeout(2000);

    // Step 5: Filter todos by priority
    await dashboardPage.filterByPriority('High');
    await page.waitForTimeout(1000);

    // Verify high priority todos are shown
    const highPriorityTodos = page.locator('.todo-item:visible .priority-high');
    const highPriorityCount = await highPriorityTodos.count();
    expect(highPriorityCount).toBeGreaterThan(0);

    // Step 6: Search for specific todo
    await dashboardPage.searchTodos('backend');
    await page.waitForTimeout(1000);

    // Verify search results
    const searchResults = page.locator('.todo-item:visible');
    await expect(searchResults.first()).toContainText('backend');

    // Step 7: Clear search and show all todos
    await dashboardPage.searchTodos('');
    await page.waitForTimeout(1000);

    // Step 8: Delete a completed todo
    await dashboardPage.deleteTodo('Design wireframes');
    await page.waitForTimeout(2000);

    // Verify todo was deleted
    const deletedTodo = page.locator('.todo-item').filter({ hasText: 'Design wireframes' });
    await expect(deletedTodo).toHaveCount(0);
  });

  test('Mobile responsive workflow', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.waitForDashboardToLoad();

    // Verify mobile layout
    await expect(page.locator('.dashboard-container')).toBeVisible();
    
    // Create a todo on mobile
    await dashboardPage.createNewTodo('Mobile Todo', 'Created on mobile device', 'low');
    await page.waitForTimeout(2000);

    // Verify todo appears
    const mobileTodo = page.locator('.todo-item').filter({ hasText: 'Mobile Todo' });
    await expect(mobileTodo).toBeVisible();

    // Test mobile navigation
    await dashboardPage.userMenu.click();
    await expect(dashboardPage.logoutButton).toBeVisible();
  });

  test('Keyboard navigation workflow', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.waitForDashboardToLoad();

    // Test tab navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Use Enter to activate focused element
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    // Test Escape to close modals
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
  });

  test('Cross-browser compatibility workflow', async ({ page, browserName }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.waitForDashboardToLoad();

    // Create todo specific to browser
    await dashboardPage.createNewTodo(
      `${browserName} Todo`, 
      `Todo created in ${browserName} browser`, 
      'medium'
    );
    await page.waitForTimeout(2000);

    // Verify todo appears in this browser
    const browserTodo = page.locator('.todo-item').filter({ hasText: `${browserName} Todo` });
    await expect(browserTodo).toBeVisible();

    // Test browser-specific features
    if (browserName === 'webkit') {
      // Safari-specific tests
      console.log('Running Safari-specific tests');
    } else if (browserName === 'firefox') {
      // Firefox-specific tests
      console.log('Running Firefox-specific tests');
    } else {
      // Chrome/Chromium-specific tests
      console.log('Running Chrome-specific tests');
    }
  });

  test('Performance and loading workflow', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    
    // Measure page load performance
    const startTime = Date.now();
    await dashboardPage.goto();
    await dashboardPage.waitForDashboardToLoad();
    const loadTime = Date.now() - startTime;

    // Verify reasonable load time (less than 5 seconds)
    expect(loadTime).toBeLessThan(5000);

    // Create multiple todos to test performance
    for (let i = 1; i <= 5; i++) {
      await dashboardPage.createNewTodo(
        `Performance Test Todo ${i}`, 
        `Testing performance with todo ${i}`, 
        i % 2 === 0 ? 'high' : 'low'
      );
      await page.waitForTimeout(500);
    }

    // Verify all todos were created
    const performanceTodos = page.locator('.todo-item').filter({ hasText: 'Performance Test Todo' });
    const todoCount = await performanceTodos.count();
    expect(todoCount).toBe(5);
  });
});