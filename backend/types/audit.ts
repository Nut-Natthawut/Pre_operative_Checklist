export type AuditAction =
  | 'auth.login'
  | 'form.create'
  | 'form.update'
  | 'form.surgery_completed'
  | 'user.create'
  | 'user.delete';

export type AuditEntityType = 'auth' | 'form' | 'user';

export type AuditChange = {
  path: string;
  label: string;
  oldValue: unknown;
  newValue: unknown;
};

export type AuditDetails = {
  summary: string;
  changes?: AuditChange[];
  [key: string]: unknown;
};

export type AuditEventInput = {
  userId: string | null;
  username: string | null;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string | null;
  formId: string | null;
  details: AuditDetails;
  createdAt?: string;
};

export type AuditLogListItem = {
  id: string;
  userId: string | null;
  username: string | null;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string | null;
  formId: string | null;
  details: AuditDetails;
  createdAt: string;
};
