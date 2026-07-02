import { Page, Locator, Download, expect } from '@playwright/test';

export class DownloadsPage {
  // Manufacturer section
  readonly manufacturerNameInput: Locator;
  readonly manufacturerColorInput: Locator;
  readonly createManufacturerButton: Locator;
  readonly manufacturerResult: Locator;

  // Report section
  readonly reportManufacturerIdInput: Locator;
  readonly reportBranchInput: Locator;
  readonly reportNameInput: Locator;
  readonly reportCategoryInput: Locator;
  readonly createReportButton: Locator;
  readonly reportResult: Locator;

  // Upload section
  readonly fileInput: Locator;
  readonly uploadButton: Locator;
  readonly uploadResult: Locator;

  // Template section
  readonly downloadTemplateButton: Locator;

  constructor(private readonly page: Page) {
    this.manufacturerNameInput    = page.locator('#manufacturer-name');
    this.manufacturerColorInput   = page.locator('#manufacturer-color');
    this.createManufacturerButton = page.locator('#create-manufacturer-btn');
    this.manufacturerResult       = page.locator('#manufacturer-result');

    this.reportManufacturerIdInput = page.locator('#report-manufacturer-id');
    this.reportBranchInput         = page.locator('#report-branch');
    this.reportNameInput           = page.locator('#report-name');
    this.reportCategoryInput       = page.locator('#report-category');
    this.createReportButton        = page.locator('#create-report-btn');
    this.reportResult              = page.locator('#report-result');

    this.fileInput            = page.locator('#upload-file');
    this.uploadButton         = page.locator('#upload-btn');
    this.uploadResult         = page.locator('#upload-result');

    this.downloadTemplateButton = page.locator('#download-template-btn');
  }

  async navigate(): Promise<void> {
    await this.page.goto('/downloads');
  }

  async createManufacturer(name: string, iconColor: string): Promise<void> {
    await this.manufacturerNameInput.fill(name);
    await this.manufacturerColorInput.fill(iconColor);
    await this.createManufacturerButton.click();
  }

  async createReport(
    manufacturerId: string,
    branch: string,
    name: string,
    category: string,
  ): Promise<void> {
    await this.reportManufacturerIdInput.fill(manufacturerId);
    await this.reportBranchInput.fill(branch);
    await this.reportNameInput.fill(name);
    await this.reportCategoryInput.fill(category);
    await this.createReportButton.click();
  }

  async uploadExcelFile(filePath: string): Promise<void> {
    await this.fileInput.setInputFiles(filePath);
    await this.uploadButton.click();
  }

  async downloadTemplate(): Promise<Download> {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.downloadTemplateButton.click(),
    ]);
    return download;
  }

  async assertManufacturerCreated(): Promise<void> {
    await expect(this.manufacturerResult).toContainText('Created');
    await expect(this.manufacturerResult).toContainText('ID:');
  }

  async assertReportCreated(): Promise<void> {
    await expect(this.reportResult).toContainText('Created');
    await expect(this.reportResult).toContainText('ID:');
  }

  async assertUploadStatus(status: string): Promise<void> {
    await expect(this.uploadResult).toContainText(status);
  }

  async assertUploadStatusNot(status: string): Promise<void> {
    await expect(this.uploadResult).not.toContainText(status);
  }

  async fitsViewport(): Promise<boolean> {
    return this.page.evaluate(() => document.body.scrollWidth <= window.innerWidth + 5);
  }
}
