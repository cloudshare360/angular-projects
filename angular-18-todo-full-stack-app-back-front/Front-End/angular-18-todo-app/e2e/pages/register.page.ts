import { Page, Locator } from '@playwright/test';

export class RegisterPage {
    readonly page: Page;
    readonly usernameInput: Locator;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly confirmPasswordInput: Locator;
    readonly firstNameInput: Locator;
    readonly lastNameInput: Locator;
    readonly registerButton: Locator;
    readonly errorMessage: Locator;
    readonly loginLink: Locator;

    constructor(page: Page) {
        this.page = page;
        this.usernameInput = page.locator('input[formControlName="username"]');
        this.emailInput = page.locator('input[formControlName="email"]');
        this.passwordInput = page.locator('input[formControlName="password"]');
        this.confirmPasswordInput = page.locator('input[formControlName="confirmPassword"]');
        this.firstNameInput = page.locator('input[formControlName="firstName"]');
        this.lastNameInput = page.locator('input[formControlName="lastName"]');
        this.registerButton = page.locator('button[type="submit"]');
        this.errorMessage = page.locator('.error-message');
        this.loginLink = page.locator('a[href="/auth/login"]');
    }

    async goto() {
        await this.page.goto('/auth/register');
    }

    async register(userData: {
        username: string;
        email: string;
        password: string;
        confirmPassword: string;
        firstName: string;
        lastName: string;
    }) {
        await this.usernameInput.fill(userData.username);
        await this.emailInput.fill(userData.email);
        await this.passwordInput.fill(userData.password);
        await this.confirmPasswordInput.fill(userData.confirmPassword);
        await this.firstNameInput.fill(userData.firstName);
        await this.lastNameInput.fill(userData.lastName);
        await this.registerButton.click();
    }

    async isErrorVisible() {
        return await this.errorMessage.isVisible();
    }

    async goToLogin() {
        await this.loginLink.click();
    }
}