export type Language = 'ar' | 'en';
export type ViewMode = 'grid' | 'table';
export type RiskLevel = 'CRITICAL RISK' | 'HIGH RISK (CLASS A)' | 'HIGH RISK' | 'MEDIUM RISK' | 'CRITICAL (3.3 kV)' | 'CRITICAL';

export interface GasReading {
  id: string;
  time: string;
  lel: string; // % LEL
  o2: string;  // %
  h2s: string; // ppm
  co: string;  // ppm
  tester: string;
  signature: string;
  status: 'SAFE' | 'WARNING' | 'CRITICAL';
}

export interface ChecklistVerificationItem {
  id: string;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  verified: boolean;
  status: 'PASS' | 'PENDING' | 'FAIL';
}

export interface SignatureEntry {
  roleEn: string;
  roleAr: string;
  name: string;
  badgeId: string;
  signedAt: string;
  status: 'DIGITALLY SIGNED' | 'PENDING';
}

export interface AuditEventItem {
  id: string;
  titleEn: string;
  titleAr: string;
  detailEn: string;
  detailAr: string;
  timestamp: string;
  severity: 'normal' | 'info' | 'success' | 'warning';
}

export interface PTWItem {
  id: string;
  key: string;
  isMainPermit: boolean;
  permitNo: string;
  titleEn: string;
  titleAr: string;
  subTitleEn: string;
  subTitleAr: string;
  icon: string;
  risk: RiskLevel;
  riskBadgeClass: string;
  locationEn: string;
  locationAr: string;
  contractorEn: string;
  contractorAr: string;
  validityWindow: string;
  validityWindowAr: string;
  attachedCerts: string[];
  status: 'ACTIVE' | 'APPROVED' | 'MONITORED' | 'VALIDATED' | 'ISOLATED';
  statusAr: string;
  technicalSpecLabelEn: string;
  technicalSpecLabelAr: string;
  technicalSpecValue: string;
  safetyRadiusEn: string;
  safetyRadiusAr: string;
  surveyMeterEn: string;
  surveyMeterAr: string;
  progressPercent: number;
  progressTextEn: string;
  progressTextAr: string;
  
  // Dynamic checklist & gas tests
  checklists: ChecklistVerificationItem[];
  gasTests: GasReading[];
  signatures: SignatureEntry[];
  auditTrail: AuditEventItem[];

  // Full form specific fields
  workOrderNo?: string;
  equipmentName?: string;
  equipmentLine?: string;
  tagNo?: string;
  department?: string;
  toolsRequired?: string;
  peopleDay?: number;
  peopleNight?: number;
  hazardousNotes?: string;
  specialPrecautions?: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error';
}
