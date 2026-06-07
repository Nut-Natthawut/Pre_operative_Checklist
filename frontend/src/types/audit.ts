export type AuditAction =
  | 'auth.login'
  | 'form.create'
  | 'form.update'
  | 'form.surgery_completed'
  | 'user.create'
  | 'user.delete';

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

export type AuditLogItem = {
  id: string;
  userId: string | null;
  username: string | null;
  action: AuditAction;
  entityType: 'auth' | 'form' | 'user';
  entityId: string | null;
  formId: string | null;
  details: AuditDetails;
  summary: string;
  createdAt: string;
};

export type AuditLogListResponse = {
  items: AuditLogItem[];
  page: number;
  limit: number;
  totalCount: number;
};
