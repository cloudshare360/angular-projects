import { Page, Locator } from '@playwright/test';

export class DashboardPage {
    readonly page: Page;
    readonly addListButton: Locator;
    readonly addTodoButton: Locator;
    readonly logoutButton: Locator;
    readonly userMenu: Locator;
    readonly searchInput: Locator;
    readonly filterSelect: Locator;
    readonly listContainer: Locator;
    readonly todoContainer: Locator;

    constructor(page: Page) {
        this.page = page;
        this.addListButton = page.locator('[data-testid="add-list-btn"]');
        this.addTodoButton = page.locator('[data-testid="add-todo-btn"]');
        this.logoutButton = page.locator('[data-testid="logout-btn"]');
        this.userMenu = page.locator('[data-testid="user-menu"]');
        this.searchInput = page.locator('input[placeholder*="Search"]');
        this.filterSelect = page.locator('mat-select[placeholder*="Filter"]');
        this.listContainer = page.locator('.lists-container');
        this.todoContainer = page.locator('.todos-container');
    }

    async goto() {
        await this.page.goto('/dashboard');
    }

    async createNewList(name: string, description?: string, color?: string) {
        await this.addListButton.click();

        // Fill in list modal
        await this.page.locator('input[formControlName="name"]').fill(name);
        if (description) {
            await this.page.locator('textarea[formControlName="description"]').fill(description);
        }
        if (color) {
            await this.page.locator(`[data-color="${color}"]`).click();
        }

        await this.page.locator('button:has-text("Create")').click();
    }

    async createNewTodo(title: string, description?: string, priority?: string) {
        await this.addTodoButton.click();

        // Fill in todo modal
        await this.page.locator('input[formControlName="title"]').fill(title);
        if (description) {
            await this.page.locator('textarea[formControlName="description"]').fill(description);
        }
        if (priority) {
            await this.page.locator('mat-select[formControlName="priority"]').click();
            await this.page.locator(`mat-option:has-text("${priority}")`).click();
        }

        await this.page.locator('button:has-text("Create")').click();
    }

    async getListCount() {
        const lists = this.page.locator('.list-item');
        return await lists.count();
    }

    async getTodoCount() {
        const todos = this.page.locator('.todo-item');
        return await todos.count();
    }

    async editTodo(todoTitle: string, newTitle: string) {
        const todoItem = this.page.locator('.todo-item').filter({ hasText: todoTitle });
        await todoItem.locator('[data-testid="edit-todo-btn"]').click();

        await this.page.locator('input[formControlName="title"]').fill(newTitle);
        await this.page.locator('button:has-text("Update")').click();
    }

    async deleteTodo(todoTitle: string) {
        const todoItem = this.page.locator('.todo-item').filter({ hasText: todoTitle });
        await todoItem.locator('[data-testid="delete-todo-btn"]').click();

        // Confirm deletion
        await this.page.locator('button:has-text("Delete")').click();
    }

    async toggleTodoComplete(todoTitle: string) {
        const todoItem = this.page.locator('.todo-item').filter({ hasText: todoTitle });
        await todoItem.locator('[data-testid="toggle-todo-btn"]').click();
    }

    async searchTodos(searchTerm: string) {
        await this.searchInput.fill(searchTerm);
    }

    async filterByPriority(priority: string) {
        await this.filterSelect.click();
        await this.page.locator(`mat-option:has-text("${priority}")`).click();
    }

    async logout() {
        await this.userMenu.click();
        await this.logoutButton.click();
    }

    async waitForDashboardToLoad() {
        await this.page.waitForSelector('.dashboard-container');
        await this.page.waitForLoadState('networkidle');
    }
}