import { api } from '../lib/api';
import type { AuditLogItem, AuditLogListResponse } from '../types/audit';

export const getAuditLogs = async (page = 1, limit = 20) => {
  const response = await api.getAuditLogs(page, limit);
  if (!response.success || !response.data) {
    throw new Error(response.message || 'ไม่สามารถโหลด audit logs ได้');
  }

  return response.data as AuditLogListResponse;
};

export const getAuditLogById = async (id: string) => {
  const response = await api.getAuditLog(id);
  if (!response.success || !response.data) {
    throw new Error(response.message || 'ไม่สามารถโหลดรายละเอียด audit log ได้');
  }

  return response.data as AuditLogItem;
};
