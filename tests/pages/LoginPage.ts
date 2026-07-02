import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(private readonly page: Page) {
    this.emailInput    = page.locator('[name="email"]');
    this.passwordInput = page.locator('[name="password"]');
    this.submitButton  = page.locator('[type="submit"]');
    this.errorMessage  = page.locator('#error-msg');
  }

  async navigate(): Promise<void> {
    await this.page.goto('/login');
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async clickSubmit(): Promise<void> {
    await this.submitButton.click();
  }

  async fitsViewport(): Promise<boolean> {
    return this.page.evaluate(() => document.body.scrollWidth <= window.innerWidth + 5);
  }
}
