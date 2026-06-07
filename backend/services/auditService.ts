import { auditLogs } from '../db/schema';
import { generateId } from '../lib/password';
import type { AppDb } from '../types/app';
import type { AuditChange, AuditDetails, AuditEventInput } from '../types/audit';

type AuditLabelMap = Record<string, string>;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const normalizeAuditValue = (value: unknown): unknown => {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) =>
      item === null || ['string', 'number', 'boolean'].includes(typeof item) ? item : JSON.stringify(item),
    );
  }

  if (isPlainObject(value)) {
    return value;
  }

  return value == null ? null : String(value);
};

const valuesAreEqual = (left: unknown, right: unknown) =>
  JSON.stringify(normalizeAuditValue(left)) === JSON.stringify(normalizeAuditValue(right));

const walkAuditDiff = (
  beforeValue: unknown,
  afterValue: unknown,
  path: string,
  labels: AuditLabelMap,
  changes: AuditChange[],
) => {
  if (valuesAreEqual(beforeValue, afterValue)) {
    return;
  }

  if (Array.isArray(beforeValue) && Array.isArray(afterValue)) {
    const maxLength = Math.max(beforeValue.length, afterValue.length);

    for (let index = 0; index < maxLength; index += 1) {
      walkAuditDiff(beforeValue[index], afterValue[index], path ? `${path}.${index}` : `${index}`, labels, changes);
    }

    return;
  }

  if (isPlainObject(beforeValue) && isPlainObject(afterValue)) {
    const keys = new Set([...Object.keys(beforeValue), ...Object.keys(afterValue)]);

    for (const key of keys) {
      walkAuditDiff(beforeValue[key], afterValue[key], path ? `${path}.${key}` : key, labels, changes);
    }

    return;
  }

  changes.push({
    path,
    label: labels[path] || path,
    oldValue: normalizeAuditValue(beforeValue),
    newValue: normalizeAuditValue(afterValue),
  });
};

export const buildAuditSummary = (changes: Array<Pick<AuditChange, 'path'>>) =>
  `Updated ${changes.length} field${changes.length === 1 ? '' : 's'}`;

export const diffAuditValues = (
  beforeValue: unknown,
  afterValue: unknown,
  labels: AuditLabelMap = {},
) => {
  const changes: AuditChange[] = [];
  walkAuditDiff(beforeValue, afterValue, '', labels, changes);
  return changes.filter((change) => change.path.length > 0);
};

export const buildAuditInsert = (event: AuditEventInput) => ({
  id: generateId(),
  userId: event.userId,
  username: event.username,
  action: event.action,
  entityType: event.entityType,
  entityId: event.entityId,
  formId: event.formId,
  details: JSON.stringify(event.details),
  createdAt: event.createdAt || new Date().toISOString(),
});

export const parseAuditDetails = (details: string): AuditDetails => JSON.parse(details) as AuditDetails;

export const writeAuditLog = async (db: AppDb, event: AuditEventInput) => {
  try {
    await db.insert(auditLogs).values(buildAuditInsert(event));
  } catch (error) {
    console.error('Audit log write failed:', error);
  }
};
