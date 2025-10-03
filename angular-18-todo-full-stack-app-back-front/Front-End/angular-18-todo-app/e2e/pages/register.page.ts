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
        this.usernameInput = page.locator('input#username, input[formControlName="username"]').first();
        this.emailInput = page.locator('input#email, input[formControlName="email"]').first();
        this.passwordInput = page.locator('input#password, input[formControlName="password"]').first();
        this.confirmPasswordInput = page.locator('input#confirmPassword, input[formControlName="confirmPassword"]').first();
        this.firstNameInput = page.locator('input#firstName, input[formControlName="firstName"]').first();
        this.lastNameInput = page.locator('input#lastName, input[formControlName="lastName"]').first();
        this.registerButton = page.locator('button[type="submit"]').first();
        this.errorMessage = page.locator('.error-message').first();
        this.loginLink = page.locator('a[href="/auth/login"], a:has-text("Sign in here")').first();
    }

    async goto() {
        await this.page.goto('/auth/register');
    }

    async register(userData: {
        username: string;
        email: string;
        password: string;
        confirmPassword?: string;
        firstName: string;
        lastName: string;
    }) {
        await this.firstNameInput.fill(userData.firstName);
        await this.lastNameInput.fill(userData.lastName);
        await this.usernameInput.fill(userData.username);
        await this.emailInput.fill(userData.email);
        await this.passwordInput.fill(userData.password);

        // Only fill confirmPassword if the field exists
        if (userData.confirmPassword && await this.confirmPasswordInput.isVisible().catch(() => false)) {
            await this.confirmPasswordInput.fill(userData.confirmPassword);
        }

        await this.registerButton.click();
    }

    async isErrorVisible() {
        return await this.errorMessage.isVisible();
    }

    async goToLogin() {
        await this.loginLink.click();
    }
}