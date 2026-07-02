import { Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly logo: Locator;
  readonly nav: Locator;
  readonly navLinks: Locator;
  readonly heading: Locator;
  readonly loadingIndicator: Locator;
  readonly dashboardError: Locator;
  readonly reportsTable: Locator;

  constructor(private readonly page: Page) {
    this.logo             = page.locator('.logo');
    this.nav              = page.locator('nav');
    this.navLinks         = page.locator('nav a');
    this.heading          = page.locator('h1');
    this.loadingIndicator = page.locator('#loading');
    this.dashboardError   = page.locator('[data-testid="error-message"]');
    this.reportsTable     = page.locator('[data-testid="dashboard-table"]');
  }

  async navigate(): Promise<void> {
    await this.page.goto('/dashboard');
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForFunction(
      () => (document.getElementById('loading') as HTMLElement).style.display === 'none',
      { timeout: 8000 },
    );
  }

  getRowLocator(manufacturer: string): Locator {
    return this.page.locator('[data-testid="dashboard-row"]').filter({ hasText: manufacturer });
  }

  async fitsViewport(): Promise<boolean> {
    return this.page.evaluate(() => document.body.scrollWidth <= window.innerWidth + 5);
  }
}
