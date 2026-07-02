import { Page, Locator, Download } from '@playwright/test';

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

  // ── Manufacturer actions ────────────────────────────────────────────────────

  async fillManufacturerName(name: string): Promise<void> {
    await this.manufacturerNameInput.fill(name);
  }

  async fillManufacturerColor(color: string): Promise<void> {
    await this.manufacturerColorInput.fill(color);
  }

  async clickCreateManufacturer(): Promise<void> {
    await this.createManufacturerButton.click();
  }

  // ── Report actions ──────────────────────────────────────────────────────────

  async fillReportManufacturerId(id: string): Promise<void> {
    await this.reportManufacturerIdInput.fill(id);
  }

  async fillReportBranch(branch: string): Promise<void> {
    await this.reportBranchInput.fill(branch);
  }

  async fillReportName(name: string): Promise<void> {
    await this.reportNameInput.fill(name);
  }

  async fillReportCategory(category: string): Promise<void> {
    await this.reportCategoryInput.fill(category);
  }

  async clickCreateReport(): Promise<void> {
    await this.createReportButton.click();
  }

  // ── Upload actions ──────────────────────────────────────────────────────────

  async setUploadFile(filePath: string): Promise<void> {
    await this.fileInput.setInputFiles(filePath);
  }

  async clickUpload(): Promise<void> {
    await this.uploadButton.click();
  }

  // ── Template actions ────────────────────────────────────────────────────────

  async clickDownloadTemplate(): Promise<Download> {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.downloadTemplateButton.click(),
    ]);
    return download;
  }

  // ── Viewport ────────────────────────────────────────────────────────────────

  async fitsViewport(): Promise<boolean> {
    return this.page.evaluate(() => document.body.scrollWidth <= window.innerWidth + 5);
  }
}
