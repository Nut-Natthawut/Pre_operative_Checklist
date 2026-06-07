import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AuditLogDetailModal from '../components/audit/AuditLogDetailModal';
import AuditLogTable from '../components/audit/AuditLogTable';
import { useAuth } from '../contexts/AuthContext';
import { getAuditLogs } from '../services/auditLogService';
import type { AuditLogItem } from '../types/audit';

export default function AuditLogsPage() {
  const { isLoggedIn, isLoading } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [loadingLogs, setLoadingLogs] = useState(true);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate('/login');
    }
  }, [isLoading, isLoggedIn, navigate]);

  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      void loadLogs();
    }
  }, [isLoading, isLoggedIn]);

  const loadLogs = async () => {
    setLoadingLogs(true);
    try {
      const data = await getAuditLogs();
      setLogs(data.items);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      toast.error('ไม่สามารถโหลด audit logs ได้');
    } finally {
      setLoadingLogs(false);
    }
  };

  if (isLoading || loadingLogs) {
    return <div className="min-h-screen flex items-center justify-center">กำลังโหลด...</div>;
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Audit Logs</h1>
                <p className="text-sm text-gray-500">ตรวจสอบว่าใครเปลี่ยนข้อมูลอะไร เมื่อไหร่</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          {logs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
              ยังไม่มี audit logs ให้แสดง
            </div>
          ) : (
            <AuditLogTable logs={logs} onSelect={setSelectedLog} />
          )}
        </main>
      </div>

      <AuditLogDetailModal log={selectedLog} open={selectedLog !== null} onClose={() => setSelectedLog(null)} />
    </>
  );
}
