import { describe, expect, it } from 'vitest';
import { canAccessAuditLog, isTouchedFormForUser } from '../routes/auditLogs';

describe('audit visibility rules', () => {
  it('allows admin to see all audit logs', () => {
    const viewer = { id: 'admin-1', username: 'admin', role: 'admin', fullName: 'System Administrator' };
    const log = {
      id: 'log-1',
      userId: 'someone-else',
      username: 'rn18',
      action: 'form.update',
      entityType: 'form',
      entityId: 'form-1',
      formId: 'form-1',
      details: '{}',
      createdAt: '2026-06-07T00:00:00.000Z'
    };

    expect(canAccessAuditLog(viewer, log, new Set())).toBe(true);
  });

  it('allows user to see logs written by themselves', () => {
    const viewer = { id: 'user-1', username: 'rn18', role: 'user', fullName: 'กฤตภาส RN' };
    const log = {
      id: 'log-1',
      userId: 'user-1',
      username: 'rn18',
      action: 'form.update',
      entityType: 'form',
      entityId: 'form-1',
      formId: 'form-1',
      details: '{}',
      createdAt: '2026-06-07T00:00:00.000Z'
    };

    expect(canAccessAuditLog(viewer, log, new Set())).toBe(true);
  });

  it('matches forms by createdBy, preparerId, or preparer full name', () => {
    const viewer = { id: 'user-1', username: 'rn18', role: 'user', fullName: 'กฤตภาส RN' };
    const byCreator = {
      id: 'form-1',
      createdBy: 'user-1',
      orChecklist: null,
      anesChecklist: null,
      anesLab: null,
      consultMed: null,
      riskConditions: null,
      consentData: null,
      npoData: null,
      ivData: null,
      resultOr: null,
      resultAnes: null,
      preparer: null
    };
    const byPreparerId = {
      ...byCreator,
      createdBy: 'other-user',
      orChecklist: JSON.stringify({
        row1: {
          preparerId: 'user-1'
        }
      })
    };
    const byFullName = {
      ...byCreator,
      createdBy: 'other-user',
      orChecklist: JSON.stringify({
        row1: {
          preparer: 'กฤตภาส RN'
        }
      })
    };

    expect(isTouchedFormForUser(byCreator as never, viewer)).toBe(true);
    expect(isTouchedFormForUser(byPreparerId as never, viewer)).toBe(true);
    expect(isTouchedFormForUser(byFullName as never, viewer)).toBe(true);
  });

  it('blocks unrelated user logs', () => {
    const viewer = { id: 'user-1', username: 'rn18', role: 'user', fullName: 'กฤตภาส RN' };
    const log = {
      id: 'log-1',
      userId: 'user-2',
      username: 'rn09',
      action: 'form.update',
      entityType: 'form',
      entityId: 'form-2',
      formId: 'form-2',
      details: '{}',
      createdAt: '2026-06-07T00:00:00.000Z'
    };

    expect(canAccessAuditLog(viewer, log, new Set(['form-1']))).toBe(false);
  });
});
