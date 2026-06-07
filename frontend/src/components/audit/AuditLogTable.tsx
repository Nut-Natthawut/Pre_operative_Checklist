import type { AuditLogItem } from '../../types/audit';

type AuditLogTableProps = {
  logs: AuditLogItem[];
  onSelect: (log: AuditLogItem) => void;
};

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('th-TH', {
    dateStyle: 'short',
    timeStyle: 'short'
  });

const AuditLogTable = ({ logs, onSelect }: AuditLogTableProps) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-4 py-3 font-medium">เวลา</th>
            <th className="px-4 py-3 font-medium">ผู้ใช้</th>
            <th className="px-4 py-3 font-medium">Action</th>
            <th className="px-4 py-3 font-medium">Entity</th>
            <th className="px-4 py-3 font-medium">Summary</th>
            <th className="px-4 py-3 font-medium text-right">รายละเอียด</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-700">{formatDateTime(log.createdAt)}</td>
              <td className="px-4 py-3 text-gray-800">{log.username || '-'}</td>
              <td className="px-4 py-3 text-gray-700">{log.action}</td>
              <td className="px-4 py-3 text-gray-700">
                {log.entityType}
                {log.entityId ? ` (${log.entityId})` : ''}
              </td>
              <td className="px-4 py-3 text-gray-700">{log.summary}</td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => onSelect(log)}
                  className="rounded-lg bg-[#004ac6] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#00379b]"
                >
                  ดูรายละเอียด
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AuditLogTable;
