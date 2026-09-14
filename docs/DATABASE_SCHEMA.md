# ZFOD SMART PTW - Database Architecture & Schema Specification

This document details the enterprise database schema for the **Zubair Field Operating Division (ZFOD) Electronic Permit To Work (PTW)** system, supporting high-integrity industrial safety operations, OSHA 1910.119 / ISO 45001 compliance, real-time gas monitoring, and role-based cryptographic authorization.

---

## 1. Relational Database Schema (PostgreSQL)

```sql
-- ENUM Types
CREATE TYPE user_role AS ENUM ('ADMIN', 'HSE_OFFICER', 'CONTRACTOR', 'AUDITOR');
CREATE TYPE permit_status AS ENUM (
    'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 
    'REJECTED', 'ACTIVE', 'SUSPENDED', 'MONITORED', 
    'VALIDATED', 'ISOLATED', 'CLOSED'
);
CREATE TYPE risk_level AS ENUM (
    'CRITICAL RISK', 'HIGH RISK (CLASS A)', 'HIGH RISK', 
    'MEDIUM RISK', 'CRITICAL (3.3 kV)', 'CRITICAL'
);
CREATE TYPE gas_status AS ENUM ('SAFE', 'WARNING', 'CRITICAL');
CREATE TYPE checklist_status AS ENUM ('PASS', 'PENDING', 'FAIL');
CREATE TYPE audit_severity AS ENUM ('normal', 'info', 'success', 'warning', 'danger');

-- Table: users
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    badge_id VARCHAR(64) UNIQUE NOT NULL,
    department_en VARCHAR(255) NOT NULL,
    department_ar VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: permits
CREATE TABLE permits (
    id VARCHAR(64) PRIMARY KEY,
    key VARCHAR(64) UNIQUE NOT NULL,
    is_main_permit BOOLEAN DEFAULT TRUE,
    permit_no VARCHAR(64) UNIQUE NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    title_ar VARCHAR(255) NOT NULL,
    sub_title_en TEXT,
    sub_title_ar TEXT,
    icon VARCHAR(32) DEFAULT '🔥',
    risk risk_level NOT NULL,
    risk_badge_class VARCHAR(128) NOT NULL,
    location_en VARCHAR(255) NOT NULL,
    location_ar VARCHAR(255) NOT NULL,
    contractor_en VARCHAR(255) NOT NULL,
    contractor_ar VARCHAR(255) NOT NULL,
    validity_window VARCHAR(128) NOT NULL,
    validity_window_ar VARCHAR(128) NOT NULL,
    validity_start TIMESTAMP WITH TIME ZONE,
    validity_end TIMESTAMP WITH TIME ZONE,
    attached_certs JSONB DEFAULT '[]'::jsonb,
    status permit_status NOT NULL DEFAULT 'DRAFT',
    status_ar VARCHAR(64) NOT NULL,
    technical_spec_label_en VARCHAR(255),
    technical_spec_label_ar VARCHAR(255),
    technical_spec_value VARCHAR(255),
    safety_radius_en VARCHAR(255),
    safety_radius_ar VARCHAR(255),
    survey_meter_en VARCHAR(255),
    survey_meter_ar VARCHAR(255),
    progress_percent INTEGER DEFAULT 0,
    progress_text_en VARCHAR(128),
    progress_text_ar VARCHAR(128),
    
    -- Supplementary form fields
    work_order_no VARCHAR(64),
    equipment_name VARCHAR(255),
    equipment_line VARCHAR(255),
    tag_no VARCHAR(64),
    department VARCHAR(255),
    tools_required TEXT,
    people_day INTEGER DEFAULT 1,
    people_night INTEGER DEFAULT 0,
    hazardous_notes TEXT,
    special_precautions TEXT,
    
    -- Security & Governance
    gas_critical_warning_active BOOLEAN DEFAULT FALSE,
    created_by_user_id VARCHAR(64) REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: checklist_items
CREATE TABLE checklist_items (
    id VARCHAR(64) PRIMARY KEY,
    permit_id VARCHAR(64) NOT NULL REFERENCES permits(id) ON DELETE CASCADE,
    title_en VARCHAR(255) NOT NULL,
    title_ar VARCHAR(255) NOT NULL,
    desc_en TEXT,
    desc_ar TEXT,
    verified BOOLEAN DEFAULT FALSE,
    status checklist_status DEFAULT 'PENDING',
    verified_by_user_id VARCHAR(64) REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    order_index INTEGER DEFAULT 0
);
CREATE INDEX idx_checklist_permit ON checklist_items(permit_id);

-- Table: gas_readings
CREATE TABLE gas_readings (
    id VARCHAR(64) PRIMARY KEY,
    permit_id VARCHAR(64) NOT NULL REFERENCES permits(id) ON DELETE CASCADE,
    sampled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    time_label VARCHAR(32) NOT NULL,
    lel_value NUMERIC(5,2) NOT NULL,    -- Percentage LEL (< 10% safe)
    o2_value NUMERIC(5,2) NOT NULL,     -- Percentage O2 (19.5% - 23.5% safe)
    h2s_value NUMERIC(5,2) NOT NULL,    -- ppm (< 10 ppm safe)
    co_value NUMERIC(5,2) NOT NULL,     -- ppm (< 35 ppm safe)
    tester_name VARCHAR(255) NOT NULL,
    tester_user_id VARCHAR(64) REFERENCES users(id),
    signature_hash VARCHAR(255) NOT NULL,
    status gas_status NOT NULL,
    violations JSONB DEFAULT '[]'::jsonb
);
CREATE INDEX idx_gas_permit ON gas_readings(permit_id);

-- Table: signatures
CREATE TABLE signatures (
    id VARCHAR(64) PRIMARY KEY,
    permit_id VARCHAR(64) NOT NULL REFERENCES permits(id) ON DELETE CASCADE,
    role_en VARCHAR(128) NOT NULL,
    role_ar VARCHAR(128) NOT NULL,
    user_id VARCHAR(64) REFERENCES users(id),
    signer_name VARCHAR(255) NOT NULL,
    badge_id VARCHAR(64) NOT NULL,
    signed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(64) NOT NULL DEFAULT 'PENDING',
    signature_digest VARCHAR(255),
    ip_address VARCHAR(45)
);
CREATE INDEX idx_signatures_permit ON signatures(permit_id);

-- Table: audit_trail
CREATE TABLE audit_trail (
    id VARCHAR(64) PRIMARY KEY,
    permit_id VARCHAR(64) NOT NULL REFERENCES permits(id) ON DELETE CASCADE,
    user_id VARCHAR(64) REFERENCES users(id),
    user_name VARCHAR(255),
    title_en VARCHAR(255) NOT NULL,
    title_ar VARCHAR(255) NOT NULL,
    detail_en TEXT,
    detail_ar TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    severity audit_severity DEFAULT 'normal'
);
CREATE INDEX idx_audit_permit ON audit_trail(permit_id);
```

---

## 2. NoSQL / Cloud Firestore Schema Structure

In Google Cloud Firestore, the data is partitioned into root collections and subcollections for atomic operations and offline sync:

```
users/
  {userId}/
    email: string
    name: string
    nameAr: string
    role: "ADMIN" | "HSE_OFFICER" | "CONTRACTOR" | "AUDITOR"
    badgeId: string
    departmentEn: string
    departmentAr: string

permits/
  {permitId}/
    key: string
    permitNo: string
    titleEn: string
    titleAr: string
    risk: string
    status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "ACTIVE" | "SUSPENDED" | "MONITORED" | "VALIDATED" | "ISOLATED" | "CLOSED"
    locationEn: string
    contractorEn: string
    validityWindow: string
    gasCriticalWarningActive: boolean
    createdAt: timestamp
    updatedAt: timestamp
    
    // Subcollections:
    checklists/
      {checklistId}/
        titleEn: string
        titleAr: string
        verified: boolean
        status: "PASS" | "PENDING" | "FAIL"
        
    gasReadings/
      {readingId}/
        time: string
        lel: string
        o2: string
        h2s: string
        co: string
        status: "SAFE" | "WARNING" | "CRITICAL"
        testerUserId: string
        violations: array
        timestamp: timestamp

    signatures/
      {sigId}/
        roleEn: string
        roleAr: string
        userId: string
        badgeId: string
        signedAt: string
        status: "DIGITALLY SIGNED" | "PENDING"

    auditTrail/
      {eventId}/
        titleEn: string
        titleAr: string
        detailEn: string
        detailAr: string
        severity: "normal" | "info" | "success" | "warning" | "danger"
        timestamp: timestamp
```
