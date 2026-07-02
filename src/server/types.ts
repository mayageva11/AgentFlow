export type Row = {
  month?: string;
  policy_id?: string;
  category?: string;
  [key: string]: unknown;
};

export interface ValidationResult {
  valid: boolean;
  statusCode?: number;
}

export interface UploadResponse {
  status: number;
}

export interface ManufacturerData {
  name: string;
  iconColor: string;
  agencyId: string;
}

export interface ReportData {
  manufacturerId: string;
  branch: string;
  name: string;
  category: string;
}
