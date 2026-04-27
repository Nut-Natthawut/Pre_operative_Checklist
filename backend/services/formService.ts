import { and, desc, eq, gte, like, lte, or, sql, type SQL } from 'drizzle-orm';
import { preopForms } from '../db/schema';
import { generateId } from '../lib/password';
import type { AppDb, AppUser } from '../types/app';
import type { FormListQuery, FormSearchResult, FormStatus, FormSubmissionPayload } from '../types/forms';
import { AppError } from './errors';

const REQUIRED_FORM_FIELDS: Array<keyof FormSubmissionPayload> = [
  'formDate',
  'formTime',
  'ward',
  'hn',
  'patientName'
];

function ensureRequiredFormFields(payload: FormSubmissionPayload) {
  for (const field of REQUIRED_FORM_FIELDS) {
    if (!payload[field]) {
      throw new AppError(400, `กรุณากรอก ${field}`, `Missing required field: ${field}`);
    }
  }
}

function stringifyJsonField(value: Record<string, unknown> | null | undefined) {
  return value ? JSON.stringify(value) : null;
}

function buildFormMutation(payload: FormSubmissionPayload) {
  return {
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
  };
}

function parseJsonField<T>(value: string | null): T | null {
  return value ? JSON.parse(value) as T : null;
}

function calculateFormStatus(form: {
  resultOr: string | null;
  anesLab: string | null;
  attendingPhysician: string | null;
  orChecklist: string | null;
  consentData: string | null;
  npoData: string | null;
}) {
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
}

export async function submitForm(db: AppDb, currentUser: AppUser | null, payload: FormSubmissionPayload) {
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

  return {
    formId,
    hn: payload.hn,
    patientName: payload.patientName,
    createdAt: now
  };
}

export async function searchForms(db: AppDb, currentUser: AppUser | null, hn: string) {
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
}

export async function getFormDetail(db: AppDb, formId: string) {
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
}

export async function listForms(db: AppDb, currentUser: AppUser | null, query: FormListQuery) {
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
}

export async function updateForm(db: AppDb, currentUser: AppUser | null, formId: string, payload: FormSubmissionPayload) {
  const existingForm = await db.select().from(preopForms).where(eq(preopForms.id, formId)).get();
  if (!existingForm) {
    throw new AppError(404, 'ไม่พบข้อมูลฟอร์ม');
  }

  const isAdmin = currentUser?.role === 'admin';
  const existingResultOr = parseJsonField<Record<string, any>>(existingForm.resultOr) || {};
  if (!isAdmin && (existingResultOr.complete === true || existingForm.surgeryCompleted === 1)) {
    throw new AppError(400, 'ฟอร์มนี้ถูกล็อกแล้ว ไม่สามารถแก้ไขได้');
  }

  await db.update(preopForms).set(buildFormMutation(payload)).where(eq(preopForms.id, formId));
  return { formId };
}

export async function markSurgeryCompleted(db: AppDb, currentUser: AppUser | null, formId: string) {
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

  return { formId };
}
