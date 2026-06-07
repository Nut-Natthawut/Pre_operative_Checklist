import type { AuditLogItem } from '../../types/audit';

type AuditLogDetailModalProps = {
  log: AuditLogItem | null;
  open: boolean;
  onClose: () => void;
};

const AuditLogDetailModal = ({ log, open, onClose }: AuditLogDetailModalProps) => {
  if (!open || !log) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="max-h-[85vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Audit Log Detail</h2>
            <p className="mt-1 text-sm text-gray-500">{log.summary}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            ปิด
          </button>
        </div>

        <div className="space-y-6 px-6 py-5">
          <div className="grid gap-3 text-sm text-gray-700 md:grid-cols-2">
            <div><span className="font-semibold">ผู้ใช้:</span> {log.username || '-'}</div>
            <div><span className="font-semibold">Action:</span> {log.action}</div>
            <div><span className="font-semibold">Entity:</span> {log.entityType}</div>
            <div><span className="font-semibold">Form ID:</span> {log.formId || '-'}</div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Changes</h3>
            {log.details.changes && log.details.changes.length > 0 ? (
              <div className="space-y-3">
                {log.details.changes.map((change, index) => (
                  <div key={`${change.path}-${index}`} className="rounded-xl border border-gray-200 p-4">
                    <div className="font-medium text-gray-900">{change.label}</div>
                    <div className="mt-1 text-xs text-gray-500">{change.path}</div>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div>
                        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Old value</div>
                        <pre className="whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-xs text-gray-700">
                          {JSON.stringify(change.oldValue, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">New value</div>
                        <pre className="whitespace-pre-wrap rounded-lg bg-blue-50 p-3 text-xs text-gray-700">
                          {JSON.stringify(change.newValue, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                ไม่มี field-level changes สำหรับ event นี้
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogDetailModal;
