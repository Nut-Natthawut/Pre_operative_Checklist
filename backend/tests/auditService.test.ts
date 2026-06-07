import { describe, expect, it } from 'vitest';
import {
  buildAuditInsert,
  buildAuditSummary,
  diffAuditValues,
  parseAuditDetails,
} from '../services/auditService';

describe('auditService', () => {
  it('builds a readable summary from change count', () => {
    expect(buildAuditSummary([])).toBe('Updated 0 fields');
    expect(buildAuditSummary([{ path: 'ward' }])).toBe('Updated 1 field');
    expect(buildAuditSummary([{ path: 'ward' }, { path: 'orChecklist.0.yes' }])).toBe('Updated 2 fields');
  });

  it('serializes details when building an insert payload', () => {
    const payload = buildAuditInsert({
      userId: 'u-1',
      username: 'rn18',
      action: 'form.update',
      entityType: 'form',
      entityId: 'form-1',
      formId: 'form-1',
      details: { summary: 'Updated 1 field' },
      createdAt: '2026-06-07T12:00:00.000Z',
    });

    expect(payload.userId).toBe('u-1');
    expect(payload.details).toBe(JSON.stringify({ summary: 'Updated 1 field' }));
    expect(payload.createdAt).toBe('2026-06-07T12:00:00.000Z');
  });

  it('produces a field-level diff for changed values only', () => {
    const changes = diffAuditValues(
      {
        ward: 'ICU',
        notes: '',
        rows: [{ id: 'row-1', yes: false, preparer: '' }],
      },
      {
        ward: 'Ward 5',
        notes: '',
        rows: [{ id: 'row-1', yes: true, preparer: 'กฤตภาส RN' }],
      },
      {
        ward: 'Ward',
        'rows.0.yes': 'Checklist Row 1 - Yes',
        'rows.0.preparer': 'Checklist Row 1 - Preparer',
      },
    );

    expect(changes).toEqual([
      {
        path: 'ward',
        label: 'Ward',
        oldValue: 'ICU',
        newValue: 'Ward 5',
      },
      {
        path: 'rows.0.yes',
        label: 'Checklist Row 1 - Yes',
        oldValue: false,
        newValue: true,
      },
      {
        path: 'rows.0.preparer',
        label: 'Checklist Row 1 - Preparer',
        oldValue: '',
        newValue: 'กฤตภาส RN',
      },
    ]);
  });

  it('omits unchanged values from the audit diff', () => {
    const changes = diffAuditValues(
      { ward: 'Ward 5', notes: 'ok' },
      { ward: 'Ward 5', notes: 'ok' },
      { ward: 'Ward' },
    );

    expect(changes).toEqual([]);
  });

  it('parses stored details safely', () => {
    expect(parseAuditDetails(JSON.stringify({ summary: 'Created new form' }))).toEqual({
      summary: 'Created new form',
    });
  });
});
