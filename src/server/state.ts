export interface StoredManufacturer {
  id: string;
  name: string;
  iconColor: string;
  agencyId: string;
}

export interface StoredReport {
  id: string;
  manufacturerId: string;
  branch: string;
  name: string;
  category: string;
  agencyId: string;
}

export interface UploadEntry {
  id: string;
  filename: string;
  status: number;
  rowCount: number;
  ts: string;
  agencyId: string;
}

export interface CommissionRecord {
  manufacturer: string;
  month: string;
  category: string;
  totalCommission: number;
  policyCount: number;
  status: 'processed';
}

export const manufacturers   = new Map<string, StoredManufacturer>();
export const reports         = new Map<string, StoredReport>();
export const uploadHistory: UploadEntry[]    = [];
export const commissionData: CommissionRecord[] = [];
