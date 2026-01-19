import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

interface LogData {
    id: string;
    hn: string;
    patientName: string;
    ward: string;
    createdAt: string;
    status?: 'green' | 'yellow' | 'red';
    statusMessage?: string;
}

export default function DashboardPage() {
    const { user, isLoggedIn, isLoading, isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const [logs, setLogs] = useState<LogData[]>([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(true);
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!isLoading && !isLoggedIn) {
            navigate('/login');
        }
    }, [isLoggedIn, isLoading, navigate]);

    useEffect(() => {
        if (isLoggedIn && user) {
            const timeoutId = setTimeout(() => {
                fetchLogs();
            }, 500);
            return () => clearTimeout(timeoutId);
        }
    }, [isLoggedIn, user, filterDate, searchTerm]);

    const fetchLogs = async () => {
        setIsLoadingLogs(true);
        try {
            if (searchTerm) {
                const response = await api.searchForms(searchTerm);
                if (response.success && response.data) {
                    setLogs(response.data.results);
                }
            } else {
                const response = await api.listForms(1, 100, filterDate);
                if (response.success && response.data) {
                    setLogs(response.data.forms);
                }
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setIsLoadingLogs(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#009CA6', borderTopColor: 'transparent' }}></div>
                    <p className="text-gray-600">กำลังโหลด...</p>
                </div>
            </div>
        );
    }

    if (!isLoggedIn) return null;

    const menuItems = [
        {
            title: 'บันทึกข้อมูลใหม่',
            description: 'กรอกแบบฟอร์มรายงานการเตรียมผู้ป่วยก่อนผ่าตัด',
            href: '/form/new',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            ),
            color: 'bg-[#009CA6] hover:bg-[#007a82]',
        },
    ];

    if (isAdmin) {
        menuItems.push({
            title: 'จัดการผู้ใช้',
            description: 'สร้างและจัดการบัญชีผู้ใช้งาน',
            href: '/admin/users',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            color: 'bg-[#0F7D4B] hover:bg-[#0a5c36]',
        });
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">รายงานการเตรียมผู้ป่วยก่อนผ่าตัด</h1>
                        <p className="text-sm text-gray-500">โรงพยาบาลมหาราชนครเชียงใหม่</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="font-medium text-gray-800">{user?.fullName}</p>
                            <p className="text-sm text-gray-500">{user?.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งาน'}</p>
                        </div>
                        <button onClick={logout} className="btn-secondary flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>ออกจากระบบ</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">


                {/* 2. Main Menu - Action Cards */}
                <div className="grid gap-6 grid-cols-1">
                    {menuItems.map((item) => (
                        <Link key={item.href} to={item.href} className="card hover:shadow-lg transition-all duration-300 group border border-transparent hover:border-gray-200 flex items-center p-6 gap-6 relative overflow-hidden">
                            <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-300 flex-shrink-0 z-10`}>
                                {item.icon}
                            </div>
                            <div className="z-10">
                                <h2 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-med-teal transition-colors">{item.title}</h2>
                                <p className="text-gray-500 text-sm">{item.description}</p>
                            </div>
                            {/* Decor circle */}
                            <div className={`absolute -right-6 -bottom-6 w-32 h-32 rounded-full opacity-10 ${item.color}`}></div>
                        </Link>
                    ))}
                </div>

                {/* 3. Recent Logs Table - Data Grid */}
                <div className="card overflow-hidden border border-gray-100 shadow-md">
                    <div className="p-6 border-b border-gray-100 bg-white flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-teal-50 rounded-lg text-med-teal">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">รายการบันทึกล่าสุด</h3>
                                <p className="text-xs text-gray-500">Overview of recent patient forms</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <input
                                    type="text"
                                    placeholder="ค้นหา HN..."
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none transition-all placeholder-gray-400"
                                    style={{ '--tw-ring-color': '#009CA6' } as React.CSSProperties}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onFocus={(e) => { e.target.style.borderColor = '#009CA6'; e.target.style.backgroundColor = '#fff'; }}
                                    onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.backgroundColor = '#f9fafb'; }}
                                />
                                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="date"
                                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none text-gray-600 cursor-pointer hover:bg-white transition-colors"
                                style={{ '--tw-ring-color': '#009CA6' } as React.CSSProperties}
                                onFocus={(e) => { e.target.style.borderColor = '#009CA6'; }}
                                onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; }}
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                disabled={!!searchTerm}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="py-4 px-6 font-semibold text-gray-600 w-[15%]">เวลา</th>
                                    <th className="py-4 px-6 font-semibold text-gray-600 w-[15%]">HN/AN</th>
                                    <th className="py-4 px-6 font-semibold text-gray-600 w-[25%]">ผู้ป่วย</th>
                                    <th className="py-4 px-6 font-semibold text-gray-600 w-[15%]">Ward</th>
                                    <th className="py-4 px-6 font-semibold text-gray-600 w-[30%]">สถานะ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {isLoadingLogs ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-8 h-8 border-4 border-med-teal border-t-transparent rounded-full animate-spin mb-2"></div>
                                                <p>กำลังโหลดข้อมูล...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : logs.length > 0 ? (
                                    logs.reduce((acc: React.ReactNode[], log, index, array) => {
                                        const logDate = new Date(log.createdAt);
                                        const dateStr = logDate.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });

                                        const prevLog = index > 0 ? array[index - 1] : null;
                                        const prevDateStr = prevLog ? new Date(prevLog.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

                                        // Date Header
                                        if (dateStr !== prevDateStr) {
                                            acc.push(
                                                <tr key={`header-${dateStr}`} className="bg-gray-50/80">
                                                    <td colSpan={5} className="py-2 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-med-teal"></div>
                                                            {dateStr}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }

                                        acc.push(
                                            <tr key={log.id}
                                                className="hover:bg-teal-50/30 transition-colors cursor-pointer group border-l-2 border-transparent hover:border-med-teal"
                                                onClick={() => navigate(`/form/${log.id}`)}>
                                                <td className="py-4 px-6 text-gray-600 font-mono text-xs">
                                                    {logDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="font-bold text-gray-700 group-hover:text-med-teal transition-colors">{log.hn}</span>
                                                    {/* Add AN if available in future */}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-gray-900 font-medium">{log.patientName}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-gray-500">
                                                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">{log.ward || '-'}</span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    {log.status === 'green' ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                            {log.statusMessage || 'พร้อมผ่าตัด'}
                                                        </span>
                                                    ) : log.status === 'yellow' ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-100">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                                                            {log.statusMessage || 'กำลังดำเนินการ'}
                                                        </span>
                                                    ) : log.status === 'red' ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                                            {log.statusMessage || 'ยังไม่เริ่มต้น'}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                        return acc;
                                    }, [])
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-16 text-center text-gray-400">
                                            <div className="flex flex-col items-center gap-3">
                                                <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                <span>ไม่พบข้อมูลการบันทึก</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 4. Footer System Info */}
                <div className="pt-8 border-t border-gray-200">
                    <div className="flex flex-wrap justify-between items-center gap-4 text-xs text-gray-400">
                        <div className="flex items-center gap-6">
                            <div>
                                <span className="font-semibold text-gray-500 block mb-0.5">FORM ID</span>
                                <span className="font-mono text-med-teal">FORM101</span>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-500 block mb-0.5">VERSION</span>
                                <span>v2.0.0 (Beta)</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>Supported Devices:</span>
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-500">iPad</span>
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-500">Desktop</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
