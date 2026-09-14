export type Language = 'ar' | 'en';
export type ViewMode = 'grid' | 'table' | 'map';
export type RiskLevel = 'CRITICAL RISK' | 'HIGH RISK (CLASS A)' | 'HIGH RISK' | 'MEDIUM RISK' | 'CRITICAL (3.3 kV)' | 'CRITICAL';

export type UserRole = 'ADMIN' | 'HSE_OFFICER' | 'CONTRACTOR' | 'AUDITOR';

export interface User {
  id: string;
  name: string;
  nameAr: string;
  email: string;
  role: UserRole;
  badgeId: string;
  departmentEn: string;
  departmentAr: string;
  avatar?: string;
}

export type PTWStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'MONITORED'
  | 'VALIDATED'
  | 'ISOLATED'
  | 'CLOSED';

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
  violations?: string[];
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
  userId?: string;
  userEmail?: string;
}

export interface AuditEventItem {
  id: string;
  titleEn: string;
  titleAr: string;
  detailEn: string;
  detailAr: string;
  timestamp: string;
  severity: 'normal' | 'info' | 'success' | 'warning' | 'danger';
  userId?: string;
  userName?: string;
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
  status: PTWStatus;
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
  equipmentTag?: string;
  department?: string;
  toolsRequired?: string;
  peopleDay?: number;
  peopleNight?: number;
  hazardousNotes?: string;
  specialPrecautions?: string;

  // Metadata
  createdByUserId?: string;
  createdAt?: string;
  updatedAt?: string;
  gasCriticalWarningActive?: boolean;
}

export interface NotificationItem {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  time: string;
  urgent: boolean;
  type?: 'gas' | 'expiry' | 'approval' | 'system' | 'loto';
  permitNo?: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

