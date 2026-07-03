import { Page, Locator } from '@playwright/test';

export class ImportPage {
  readonly mfrName: Locator;
  readonly mfrColor: Locator;
  readonly mfrSubmit: Locator;
  readonly mfrResult: Locator;
  readonly rptBranch: Locator;
  readonly rptName: Locator;
  readonly rptCategory: Locator;
  readonly rptSubmit: Locator;
  readonly rptResult: Locator;
  readonly templateLink: Locator;
  readonly fileInput: Locator;
  readonly uploadSubmit: Locator;
  readonly uploadResult: Locator;

  constructor(private readonly page: Page) {
    this.mfrName      = page.locator('[data-testid="mfr-name"]');
    this.mfrColor     = page.locator('[data-testid="mfr-color"]');
    this.mfrSubmit    = page.locator('[data-testid="mfr-submit"]');
    this.mfrResult    = page.locator('[data-testid="mfr-result"]');
    this.rptBranch    = page.locator('[data-testid="rpt-branch"]');
    this.rptName      = page.locator('[data-testid="rpt-name"]');
    this.rptCategory  = page.locator('[data-testid="rpt-category"]');
    this.rptSubmit    = page.locator('[data-testid="rpt-submit"]');
    this.rptResult    = page.locator('[data-testid="rpt-result"]');
    this.templateLink = page.locator('[data-testid="template-link"]');
    this.fileInput    = page.locator('[data-testid="file-input"]');
    this.uploadSubmit = page.locator('[data-testid="upload-submit"]');
    this.uploadResult = page.locator('[data-testid="upload-result"]');
  }

  async navigate(): Promise<void> {
    await this.page.goto('/import');
  }

  async createManufacturer(name: string, iconColor: string): Promise<void> {
    await this.mfrName.fill(name);
    await this.mfrColor.fill(iconColor);
    await this.mfrSubmit.click();
  }

  async createReport(branch: string, name: string, category: string): Promise<void> {
    await this.rptBranch.selectOption(branch);
    await this.rptName.fill(name);
    await this.rptCategory.selectOption(category);
    await this.rptSubmit.click();
  }

  async uploadFile(filePath: string): Promise<void> {
    await this.fileInput.setInputFiles(filePath);
    await this.uploadSubmit.click();
  }
}
