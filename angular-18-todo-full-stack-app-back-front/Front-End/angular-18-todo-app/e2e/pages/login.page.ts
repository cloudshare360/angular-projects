import { Page, Locator } from '@playwright/test';

export class LoginPage {
    readonly page: Page;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;
    readonly errorMessage: Locator;
    readonly registerLink: Locator;

    constructor(page: Page) {
        this.page = page;
        this.emailInput = page.locator('input#usernameOrEmail, input[type="email"]').first();
        this.passwordInput = page.locator('input#password, input[type="password"]').first();
        this.loginButton = page.locator('button[type="submit"]').first();
        this.errorMessage = page.locator('.error-message').first();
        this.registerLink = page.locator('a[href="/auth/register"], a:has-text("Sign up here")').first();
    }

    async goto() {
        await this.page.goto('/auth/login');
    }

    async login(email: string, password: string) {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }

    async isErrorVisible() {
        return await this.errorMessage.isVisible();
    }

    async goToRegister() {
        await this.registerLink.click();
    }
}