import { and, desc, eq, gte, like, lte, or, sql, type SQL } from 'drizzle-orm';
import { preopForms } from '../db/schema';
import { generateId } from '../lib/password';
import type { AppDb, AppUser } from '../types/app';
import type { FormListQuery, FormSearchResult, FormStatus, FormSubmissionPayload } from '../types/forms';
import { AppError } from './errors';
import { buildAuditSummary, diffAuditValues, writeAuditLog } from './auditService';

const REQUIRED_FORM_FIELDS: Array<keyof FormSubmissionPayload> = [
  'formDate',
  'formTime',
  'ward',
  'hn',
  'patientName'
];

const ensureRequiredFormFields = (payload: FormSubmissionPayload) => {
  for (const field of REQUIRED_FORM_FIELDS) {
    if (!payload[field]) {
      throw new AppError(400, `กรุณากรอก ${field}`, `Missing required field: ${field}`);
    }
  }
};

const stringifyJsonField = (value: Record<string, unknown> | null | undefined) =>
  value ? JSON.stringify(value) : null;

const buildFormMutation = (payload: FormSubmissionPayload) => ({
    formDate: payload.formDate,
    formTime: payload.formTime,
    ward: payload.ward,
    timeField: payload.timeField || null,
    preparer: payload.preparer || null,
    hn: payload.hn,
    an: payload.an || null,
    patientName: payload.patientName,
    sex: payload.sex || null,
    age: payload.age || null,
    dob: payload.dob || null,
    department: payload.department || null,
    weight: payload.weight || null,
    rightSide: payload.rightSide || null,
    allergy: payload.allergy || null,
    attendingPhysician: payload.attendingPhysician || null,
    bed: payload.bed || null,
    orChecklist: stringifyJsonField(payload.orChecklist),
    anesChecklist: stringifyJsonField(payload.anesChecklist),
    anesLab: stringifyJsonField(payload.anesLab),
    consultMed: stringifyJsonField(payload.consultMed),
    riskConditions: stringifyJsonField(payload.riskConditions),
    consentData: stringifyJsonField(payload.consentData),
    npoData: stringifyJsonField(payload.npoData),
    ivData: stringifyJsonField(payload.ivData),
    premedication: payload.premedication || null,
    otherNotes: payload.otherNotes || null,
    resultOr: stringifyJsonField(payload.resultOr),
    resultAnes: stringifyJsonField(payload.resultAnes)
  });

const parseJsonField = <T>(value: string | null): T | null =>
  value ? JSON.parse(value) as T : null;

const FORM_FIELD_LABELS: Record<string, string> = {
  formDate: 'Form Date',
  formTime: 'Form Time',
  ward: 'Ward',
  timeField: 'Header Time',
  preparer: 'Header Preparer',
  hn: 'HN',
  an: 'AN',
  patientName: 'Patient Name',
  sex: 'Sex',
  age: 'Age',
  dob: 'Date of Birth',
  department: 'Department',
  weight: 'Weight',
  rightSide: 'Right Side',
  allergy: 'Allergy',
  attendingPhysician: 'Attending Physician',
  bed: 'Bed',
  premedication: 'Premedication',
  otherNotes: 'Other Notes',
  qrCodeData: 'QR Code Data',
  surgeryCompleted: 'Surgery Completed',
  surgeryCompletedAt: 'Surgery Completed At',
  surgeryCompletedBy: 'Surgery Completed By'
};

const FORM_SECTION_LABELS: Record<string, string> = {
  orChecklist: 'OR Checklist',
  anesChecklist: 'Anes Checklist',
  anesLab: 'Anes Lab',
  consultMed: 'Consult Med',
  riskConditions: 'Risk Conditions',
  consentData: 'Consent',
  npoData: 'NPO',
  ivData: 'IV Data',
  resultOr: 'OR Result',
  resultAnes: 'Anes Result'
};

const FORM_VALUE_LABELS: Record<string, string> = {
  yes: 'Yes',
  no: 'No',
  time: 'Time',
  date: 'Date',
  preparer: 'Preparer',
  preparerId: 'Preparer ID',
  checker: 'Checker',
  checkTime: 'Check Time',
  checkDate: 'Check Date',
  complete: 'Complete',
  notComplete: 'Not Complete'
};

const formatAuditPathLabel = (path: string) => {
  const segments = path.split('.');
  const [first, ...rest] = segments;
  const head = FORM_SECTION_LABELS[first] || FORM_FIELD_LABELS[first] || first;

  if (rest.length === 0) {
    return head;
  }

  const tail = rest
    .map((segment) => {
      if (FORM_VALUE_LABELS[segment]) {
        return FORM_VALUE_LABELS[segment];
      }

      if (/^row\d/.test(segment)) {
        return segment.replace('_', '.');
      }

      return segment;
    })
    .join(' - ');

  return `${head} - ${tail}`;
};

const mapAuditLabels = <T extends { path: string; label: string }>(changes: T[]) =>
  changes.map((change) => ({
    ...change,
    label: formatAuditPathLabel(change.path)
  }));

const buildFormAuditSnapshotFromPayload = (payload: FormSubmissionPayload) => ({
  formDate: payload.formDate,
  formTime: payload.formTime,
  ward: payload.ward,
  timeField: payload.timeField || null,
  preparer: payload.preparer || null,
  hn: payload.hn,
  an: payload.an || null,
  patientName: payload.patientName,
  sex: payload.sex || null,
  age: payload.age || null,
  dob: payload.dob || null,
  department: payload.department || null,
  weight: payload.weight || null,
  rightSide: payload.rightSide || null,
  allergy: payload.allergy || null,
  attendingPhysician: payload.attendingPhysician || null,
  bed: payload.bed || null,
  orChecklist: payload.orChecklist || null,
  anesChecklist: payload.anesChecklist || null,
  anesLab: payload.anesLab || null,
  consultMed: payload.consultMed || null,
  riskConditions: payload.riskConditions || null,
  consentData: payload.consentData || null,
  npoData: payload.npoData || null,
  ivData: payload.ivData || null,
  premedication: payload.premedication || null,
  otherNotes: payload.otherNotes || null,
  resultOr: payload.resultOr || null,
  resultAnes: payload.resultAnes || null
});

const buildFormAuditSnapshotFromRow = (form: typeof preopForms.$inferSelect) => ({
  formDate: form.formDate,
  formTime: form.formTime,
  ward: form.ward,
  timeField: form.timeField,
  preparer: form.preparer,
  hn: form.hn,
  an: form.an,
  patientName: form.patientName,
  sex: form.sex,
  age: form.age,
  dob: form.dob,
  department: form.department,
  weight: form.weight,
  rightSide: form.rightSide,
  allergy: form.allergy,
  attendingPhysician: form.attendingPhysician,
  bed: form.bed,
  orChecklist: parseJsonField(form.orChecklist),
  anesChecklist: parseJsonField(form.anesChecklist),
  anesLab: parseJsonField(form.anesLab),
  consultMed: parseJsonField(form.consultMed),
  riskConditions: parseJsonField(form.riskConditions),
  consentData: parseJsonField(form.consentData),
  npoData: parseJsonField(form.npoData),
  ivData: parseJsonField(form.ivData),
  premedication: form.premedication,
  otherNotes: form.otherNotes,
  resultOr: parseJsonField(form.resultOr),
  resultAnes: parseJsonField(form.resultAnes)
});

const calculateFormStatus = (form: {
  resultOr: string | null;
  anesLab: string | null;
  attendingPhysician: string | null;
  orChecklist: string | null;
  consentData: string | null;
  npoData: string | null;
}) => {
  let status: FormStatus = 'red';
  let statusMessage = '';
  const pendingItems: string[] = [];

  try {
    const resultOr = parseJsonField<Record<string, any>>(form.resultOr) || {};
    const orChecklist = parseJsonField<Record<string, any>>(form.orChecklist) || {};
    const anesLab = parseJsonField<Record<string, any>>(form.anesLab) || {};
    const npoData = parseJsonField<Record<string, any>>(form.npoData) || {};

    const hasChecklistActivity = Object.keys(orChecklist).some((key) => {
      const row = orChecklist[key];
      return row && (row.yes === true || row.no === true || (row.time && row.time.length > 0));
    });

    const hasConsent = orChecklist.row8?.yes === true;
    const hasNPO = npoData.npoSolid === true || npoData.npoLiquid === true || orChecklist.row9?.yes === true;
    const hasLab =
      anesLab.labCbc ||
      anesLab.labUa ||
      anesLab.labElectrolyte ||
      anesLab.labPtPtt ||
      orChecklist.row11?.yes === true;

    if (!hasConsent && hasChecklistActivity) pendingItems.push('Consent');
    if (!hasNPO && hasChecklistActivity) pendingItems.push('NPO');
    if (!hasLab && hasChecklistActivity) pendingItems.push('Lab');
    if (!form.attendingPhysician && hasChecklistActivity) pendingItems.push('แพทย์');

    if (resultOr.complete === true) {
      status = 'green';
      statusMessage = 'พร้อมผ่าตัด';
    } else if (hasChecklistActivity) {
      status = 'yellow';
      if (resultOr.notComplete === true) {
        statusMessage = 'ยังไม่พร้อม (ตรวจสอบแล้ว)';
      } else if (pendingItems.length > 0) {
        statusMessage = `รอ ${pendingItems.slice(0, 3).join(', ')}`;
      } else {
        statusMessage = 'กำลังดำเนินการ';
      }
    } else {
      status = 'red';
      statusMessage = 'ยังไม่เริ่มต้น';
    }
  } catch (error) {
    console.error('Error parsing form data for status:', error);
    status = 'red';
    statusMessage = 'ข้อผิดพลาด';
  }

  return { status, statusMessage };
};

export const submitForm = async (db: AppDb, currentUser: AppUser | null, payload: FormSubmissionPayload) => {
  ensureRequiredFormFields(payload);

  const now = new Date().toISOString();
  const formId = generateId();
  const qrCodeData = JSON.stringify({
    formId,
    hn: payload.hn,
    an: payload.an || null,
    createdAt: now
  });

  await db.insert(preopForms).values({
    id: formId,
    ...buildFormMutation(payload),
    qrCodeData,
    createdAt: now,
    createdBy: currentUser?.id || 'unknown'
  });

  await writeAuditLog(db, {
    userId: currentUser?.id || null,
    username: currentUser?.username || null,
    action: 'form.create',
    entityType: 'form',
    entityId: formId,
    formId,
    details: {
      summary: 'Created new form',
      hn: payload.hn,
      patientName: payload.patientName,
      ward: payload.ward
    }
  });

  return {
    formId,
    hn: payload.hn,
    patientName: payload.patientName,
    createdAt: now
  };
};

export const searchForms = async (db: AppDb, currentUser: AppUser | null, hn: string) => {
  if (!hn) {
    throw new AppError(400, 'กรุณาระบุ HN เพื่อค้นหา', 'Please provide HN parameter for search');
  }

  const isAdmin = currentUser?.role === 'admin';
  const searchCondition = or(
    like(preopForms.hn, `%${hn}%`),
    like(preopForms.patientName, `%${hn}%`)
  );

  const whereCondition = isAdmin
    ? searchCondition
    : and(
        searchCondition,
        or(eq(preopForms.surgeryCompleted, 0), sql`${preopForms.surgeryCompleted} IS NULL`)
      );

  const results = await db
    .select({
      id: preopForms.id,
      hn: preopForms.hn,
      an: preopForms.an,
      patientName: preopForms.patientName,
      ward: preopForms.ward,
      formDate: preopForms.formDate,
      formTime: preopForms.formTime,
      createdAt: preopForms.createdAt,
      surgeryCompleted: preopForms.surgeryCompleted,
      resultOr: preopForms.resultOr,
      anesLab: preopForms.anesLab,
      attendingPhysician: preopForms.attendingPhysician,
      preparer: preopForms.preparer,
      orChecklist: preopForms.orChecklist,
      consentData: preopForms.consentData,
      npoData: preopForms.npoData
    })
    .from(preopForms)
    .where(whereCondition)
    .all();

  const resultsWithStatus = results.map((form) => ({
    ...form,
    ...calculateFormStatus(form)
  }));

  return {
    count: resultsWithStatus.length,
    results: resultsWithStatus
  };
};

export const getFormDetail = async (db: AppDb, formId: string) => {
  const form = await db.select().from(preopForms).where(eq(preopForms.id, formId)).get();

  if (!form) {
    throw new AppError(404, 'ไม่พบข้อมูลฟอร์ม', 'Form not found');
  }

  return {
    ...form,
    orChecklist: parseJsonField(form.orChecklist),
    anesChecklist: parseJsonField(form.anesChecklist),
    anesLab: parseJsonField(form.anesLab),
    consultMed: parseJsonField(form.consultMed),
    riskConditions: parseJsonField(form.riskConditions),
    consentData: parseJsonField(form.consentData),
    npoData: parseJsonField(form.npoData),
    ivData: parseJsonField(form.ivData),
    resultOr: parseJsonField(form.resultOr),
    resultAnes: parseJsonField(form.resultAnes),
    qrCodeData: parseJsonField(form.qrCodeData)
  };
};

export const listForms = async (db: AppDb, currentUser: AppUser | null, query: FormListQuery) => {
  const offset = (query.page - 1) * query.limit;
  const isAdmin = currentUser?.role === 'admin';
  const conditions: SQL<unknown>[] = [];

  if (query.startDate && query.endDate) {
    conditions.push(gte(preopForms.createdAt, `${query.startDate}T00:00:00.000Z`));
    conditions.push(lte(preopForms.createdAt, `${query.endDate}T23:59:59.999Z`));
  } else if (query.startDate) {
    conditions.push(gte(preopForms.createdAt, `${query.startDate}T00:00:00.000Z`));
  } else if (query.endDate) {
    conditions.push(lte(preopForms.createdAt, `${query.endDate}T23:59:59.999Z`));
  }

  if (!isAdmin) {
    conditions.push(or(eq(preopForms.surgeryCompleted, 0), sql`${preopForms.surgeryCompleted} IS NULL`) as SQL<unknown>);
  }

  const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(preopForms)
    .where(whereCondition)
    .get();

  const forms = await db
    .select({
      id: preopForms.id,
      hn: preopForms.hn,
      an: preopForms.an,
      patientName: preopForms.patientName,
      ward: preopForms.ward,
      formDate: preopForms.formDate,
      formTime: preopForms.formTime,
      createdAt: preopForms.createdAt,
      surgeryCompleted: preopForms.surgeryCompleted,
      resultOr: preopForms.resultOr,
      anesLab: preopForms.anesLab,
      attendingPhysician: preopForms.attendingPhysician,
      preparer: preopForms.preparer,
      orChecklist: preopForms.orChecklist,
      consentData: preopForms.consentData,
      npoData: preopForms.npoData
    })
    .from(preopForms)
    .where(whereCondition)
    .orderBy(desc(preopForms.createdAt))
    .limit(query.limit)
    .offset(offset)
    .all();

  const normalizedForms: FormSearchResult[] = forms.map((form) => {
    const { status, statusMessage } = calculateFormStatus(form);
    return {
      id: form.id,
      hn: form.hn,
      an: form.an,
      patientName: form.patientName,
      ward: form.ward,
      formDate: form.formDate,
      formTime: form.formTime,
      createdAt: form.createdAt,
      surgeryCompleted: form.surgeryCompleted,
      status,
      statusMessage
    };
  });

  return {
    page: query.page,
    limit: query.limit,
    totalCount: countResult?.count || 0,
    count: normalizedForms.length,
    forms: normalizedForms
  };
};

export const updateForm = async (
  db: AppDb,
  currentUser: AppUser | null,
  formId: string,
  payload: FormSubmissionPayload
) => {
  const existingForm = await db.select().from(preopForms).where(eq(preopForms.id, formId)).get();
  if (!existingForm) {
    throw new AppError(404, 'ไม่พบข้อมูลฟอร์ม');
  }

  const isAdmin = currentUser?.role === 'admin';
  const existingResultOr = parseJsonField<Record<string, any>>(existingForm.resultOr) || {};
  if (!isAdmin && (existingResultOr.complete === true || existingForm.surgeryCompleted === 1)) {
    throw new AppError(400, 'ฟอร์มนี้ถูกล็อกแล้ว ไม่สามารถแก้ไขได้');
  }

  const previousSnapshot = buildFormAuditSnapshotFromRow(existingForm);
  const nextSnapshot = buildFormAuditSnapshotFromPayload(payload);

  await db.update(preopForms).set(buildFormMutation(payload)).where(eq(preopForms.id, formId));

  const changes = mapAuditLabels(diffAuditValues(previousSnapshot, nextSnapshot));
  if (changes.length > 0) {
    await writeAuditLog(db, {
      userId: currentUser?.id || null,
      username: currentUser?.username || null,
      action: 'form.update',
      entityType: 'form',
      entityId: formId,
      formId,
      details: {
        summary: buildAuditSummary(changes),
        changes
      }
    });
  }

  return { formId };
};

export const markSurgeryCompleted = async (db: AppDb, currentUser: AppUser | null, formId: string) => {
  const form = await db.select().from(preopForms).where(eq(preopForms.id, formId)).get();
  if (!form) {
    throw new AppError(404, 'ไม่พบข้อมูลฟอร์ม', 'Form not found');
  }

  if (form.surgeryCompleted === 1) {
    throw new AppError(400, 'ฟอร์มนี้ถูกทำเครื่องหมายผ่าตัดแล้วก่อนหน้านี้', 'Already marked as surgery completed');
  }

  const resultOr = parseJsonField<Record<string, any>>(form.resultOr) || {};
  if (resultOr.complete !== true) {
    throw new AppError(400, 'ฟอร์มยังไม่พร้อมผ่าตัด ไม่สามารถทำเครื่องหมายได้', 'Form is not ready for surgery');
  }

  const now = new Date().toISOString();
  await db
    .update(preopForms)
    .set({
      surgeryCompleted: 1,
      surgeryCompletedAt: now,
      surgeryCompletedBy: currentUser?.id || 'unknown'
    })
    .where(eq(preopForms.id, formId));

  await writeAuditLog(db, {
    userId: currentUser?.id || null,
    username: currentUser?.username || null,
    action: 'form.surgery_completed',
    entityType: 'form',
    entityId: formId,
    formId,
    details: {
      summary: 'Marked surgery completed',
      hn: form.hn,
      patientName: form.patientName,
      surgeryCompleted: true
    }
  });

  return { formId };
};
