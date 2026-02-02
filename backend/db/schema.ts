import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['admin', 'user'] }).notNull().default('user'),
  fullName: text('full_name').notNull(),
  createdAt: text('created_at').notNull(),
  createdBy: text('created_by'),
});

// Pre-operative forms table
export const preopForms = sqliteTable('preop_forms', {
  id: text('id').primaryKey(),
  
  // Header
  formDate: text('form_date').notNull(),
  formTime: text('form_time').notNull(),
  
  // Table header
  ward: text('ward').notNull(),
  timeField: text('time_field'), // เวลา column
  preparer: text('preparer'), // ผู้เตรียม
  
  // Patient info (QA footer)
  hn: text('hn').notNull(), // KEY for search
  an: text('an'),
  patientName: text('patient_name').notNull(),
  sex: text('sex'),
  age: text('age'),
  dob: text('dob'),
  department: text('department'),
  weight: text('weight'),
  rightSide: text('right_side'), // ข้างที่เจาะ
  allergy: text('allergy'), // แพ้ยา
  attendingPhysician: text('attending_physician'),
  bed: text('bed'),
  
  // Checklists (JSON)
  orChecklist: text('or_checklist'), // JSON: items 1-8 OR column
  anesChecklist: text('anes_checklist'), // JSON: items 1-8 ANES column
  anesLab: text('anes_lab'), // JSON: EKG, CXR, etc.
  consultMed: text('consult_med'), // JSON: CONSULT MED section
  riskConditions: text('risk_conditions'), // JSON: Condition for Consult
  consentData: text('consent_data'), // JSON: CONSENT section
  npoData: text('npo_data'), // JSON: NPO section
  ivData: text('iv_data'), // JSON: IV fluid section
  premedication: text('premedication'), // Section 12
  otherNotes: text('other_notes'), // Section 13
  resultOr: text('result_or'), // JSON: ผลการตรวจสอบ OR
  resultAnes: text('result_anes'), // JSON: ผลการตรวจสอบ ANES
  
  // QR Code data (will be generated)
  qrCodeData: text('qr_code_data'),
  
  // Surgery completion tracking
  surgeryCompleted: integer('surgery_completed').default(0), // 0 = not completed, 1 = completed
  surgeryCompletedAt: text('surgery_completed_at'), // Timestamp when marked complete
  surgeryCompletedBy: text('surgery_completed_by'), // User who marked it complete
  
  // Metadata
  createdAt: text('created_at').notNull(),
  createdBy: text('created_by').notNull(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type PreopForm = typeof preopForms.$inferSelect;
export type NewPreopForm = typeof preopForms.$inferInsert;
