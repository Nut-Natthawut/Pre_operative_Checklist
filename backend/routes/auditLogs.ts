import { desc, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { auditLogs, preopForms, users } from '../db/schema';
import { authMiddleware } from '../middleware/auth';
import { parseAuditDetails } from '../services/auditService';
import type { AppContext, AppUser, Env, Variables } from '../types/app';

const auditLogsRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

type AuditViewer = AppUser & {
  fullName?: string | null;
};

type AuditLogRecord = typeof auditLogs.$inferSelect;
type FormRecord = typeof preopForms.$inferSelect;

const buildTouchedSearchBlob = (form: FormRecord) =>
  [
    form.orChecklist,
    form.anesChecklist,
    form.anesLab,
    form.consultMed,
    form.riskConditions,
    form.consentData,
    form.npoData,
    form.ivData,
    form.resultOr,
    form.resultAnes,
    form.preparer
  ]
    .filter(Boolean)
    .join(' ');

export const isTouchedFormForUser = (form: FormRecord, viewer: AuditViewer) => {
  if (form.createdBy === viewer.id) {
    return true;
  }

  const searchBlob = buildTouchedSearchBlob(form);
  if (searchBlob.includes(viewer.id)) {
    return true;
  }

  if (viewer.fullName && searchBlob.includes(viewer.fullName)) {
    return true;
  }

  return false;
};

export const canAccessAuditLog = (
  viewer: AuditViewer,
  log: AuditLogRecord,
  accessibleFormIds: Set<string>,
) => {
  if (viewer.role === 'admin') {
    return true;
  }

  if (log.userId === viewer.id) {
    return true;
  }

  return log.formId !== null && accessibleFormIds.has(log.formId);
};

const getViewerWithFullName = async (c: AppContext) => {
  const viewer = c.get('user');
  if (!viewer) {
    return null;
  }

  const db = c.get('db');
  const userRow = await db
    .select({
      id: users.id,
      username: users.username,
      role: users.role,
      fullName: users.fullName
    })
    .from(users)
    .where(eq(users.id, viewer.id))
    .get();

  if (!userRow) {
    return {
      ...viewer,
      fullName: null
    };
  }

  return userRow;
};

const getAccessibleFormIds = async (c: AppContext, viewer: AuditViewer) => {
  if (viewer.role === 'admin') {
    return new Set<string>();
  }

  const db = c.get('db');
  const forms = await db.select().from(preopForms).all();

  return new Set(forms.filter((form) => isTouchedFormForUser(form, viewer)).map((form) => form.id));
};

auditLogsRoute.use('*', authMiddleware);

auditLogsRoute.get('/', async (c) => {
  const viewer = await getViewerWithFullName(c);
  if (!viewer) {
    return c.json({ success: false, message: 'กรุณาเข้าสู่ระบบ', error: 'Unauthorized' }, 401);
  }

  const db = c.get('db');
  const page = Number(c.req.query('page') || '1');
  const limit = Number(c.req.query('limit') || '20');
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 20;
  const accessibleFormIds = await getAccessibleFormIds(c, viewer);

  const allLogs = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).all();
  const visibleLogs = allLogs.filter((log) => canAccessAuditLog(viewer, log, accessibleFormIds));
  const offset = (safePage - 1) * safeLimit;
  const items = visibleLogs.slice(offset, offset + safeLimit).map((log) => {
    const details = parseAuditDetails(log.details);

    return {
      ...log,
      details,
      summary: details.summary
    };
  });

  return c.json({
    success: true,
    message: 'ดึง audit logs สำเร็จ',
    data: {
      items,
      page: safePage,
      limit: safeLimit,
      totalCount: visibleLogs.length
    }
  });
});

auditLogsRoute.get('/:id', async (c) => {
  const viewer = await getViewerWithFullName(c);
  if (!viewer) {
    return c.json({ success: false, message: 'กรุณาเข้าสู่ระบบ', error: 'Unauthorized' }, 401);
  }

  const db = c.get('db');
  const id = c.req.param('id');
  const row = await db.select().from(auditLogs).where(eq(auditLogs.id, id)).get();

  if (!row) {
    return c.json({ success: false, message: 'ไม่พบ audit log', error: 'Audit log not found' }, 404);
  }

  const accessibleFormIds = await getAccessibleFormIds(c, viewer);
  if (!canAccessAuditLog(viewer, row, accessibleFormIds)) {
    return c.json({ success: false, message: 'คุณไม่มีสิทธิ์ดู audit log นี้', error: 'Forbidden' }, 403);
  }

  return c.json({
    success: true,
    message: 'ดึงรายละเอียด audit log สำเร็จ',
    data: {
      ...row,
      details: parseAuditDetails(row.details)
    }
  });
});

export default auditLogsRoute;
