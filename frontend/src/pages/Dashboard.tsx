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
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
            color: 'bg-green-500 hover:bg-green-600',
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
            color: 'bg-purple-500 hover:bg-purple-600',
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

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className={`grid gap-6 ${menuItems.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                    {menuItems.map((item) => (
                        <Link key={item.href} to={item.href} className="card hover:shadow-xl transition-shadow duration-300 group">
                            <div className={`w-16 h-16 ${item.color} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                {item.icon}
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h2>
                            <p className="text-gray-500">{item.description}</p>
                        </Link>
                    ))}
                </div>

                <div className="mt-8 card">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                            รายการบันทึกล่าสุด
                        </h3>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="ค้นหา HN..."
                                    className="pl-8 pr-3 py-1 border border-gray-300 rounded text-sm outline-none focus:border-blue-500 w-32 focus:w-48 transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">วันที่:</span>
                                <input
                                    type="date"
                                    className="border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                                    value={filterDate}
                                    onChange={(e) => setFilterDate(e.target.value)}
                                    disabled={!!searchTerm}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="py-3 px-4 font-medium text-gray-600 w-[15%]">วันที่-เวลา</th>
                                    <th className="py-3 px-4 font-medium text-gray-600 w-[15%]">HN</th>
                                    <th className="py-3 px-4 font-medium text-gray-600 w-[25%]">ชื่อผู้ป่วย</th>
                                    <th className="py-3 px-4 font-medium text-gray-600 w-[10%]">Ward</th>
                                    <th className="py-3 px-4 font-medium text-gray-600 w-[35%]">สถานะ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoadingLogs ? (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-gray-500">กำลังโหลดข้อมูล...</td>
                                    </tr>
                                ) : logs.length > 0 ? (
                                    logs.reduce((acc: React.ReactNode[], log, index, array) => {
                                        const logDate = new Date(log.createdAt);
                                        const dateStr = logDate.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });

                                        const prevLog = index > 0 ? array[index - 1] : null;
                                        const prevDateStr = prevLog ? new Date(prevLog.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

                                        // Add Date Header if date changes
                                        if (dateStr !== prevDateStr) {
                                            acc.push(
                                                <tr key={`header-${dateStr}`} className="bg-gray-100/50">
                                                    <td colSpan={5} className="py-2 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider relative">
                                                        <div className="flex items-center gap-2">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            {dateStr}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }

                                        acc.push(
                                            <tr key={log.id} className="hover:bg-blue-50 transition-colors cursor-pointer group" onClick={() => navigate(`/form/${log.id}`)}>
                                                <td className="py-3 px-4 text-gray-800 border-l-4 border-transparent group-hover:border-blue-500 pl-3">
                                                    {logDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                                                </td>
                                                <td className="py-3 px-4 text-gray-800 font-medium text-blue-600 group-hover:underline">{log.hn}</td>
                                                <td className="py-3 px-4 text-gray-800">{log.patientName}</td>
                                                <td className="py-3 px-4 text-gray-600 bg-gray-50/30 rounded-r-lg group-hover:bg-transparent">{log.ward || '-'}</td>
                                                <td className="py-3 px-4">
                                                    {log.status === 'green' ? (
                                                        <div className="flex items-center gap-2 text-green-700 bg-green-50 px-2 py-1 rounded-full w-fit text-xs border border-green-200">
                                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                                            <span>{log.statusMessage || 'พร้อมผ่าตัด'}</span>
                                                        </div>
                                                    ) : log.status === 'yellow' ? (
                                                        <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 px-2 py-1 rounded-full w-fit text-xs border border-yellow-200">
                                                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                                            <span>{log.statusMessage || 'กำลังดำเนินการ'}</span>
                                                        </div>
                                                    ) : log.status === 'red' ? (
                                                        <div className="flex items-center gap-2 text-red-700 bg-red-50 px-2 py-1 rounded-full w-fit text-xs border border-red-200">
                                                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                                            <span>{log.statusMessage || 'ยังไม่เริ่มต้น'}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-gray-400 text-xs">
                                                            <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                                                            <span>-</span>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );

                                        return acc;
                                    }, [])
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-gray-500">
                                            ไม่พบข้อมูลการบันทึก{searchTerm ? ` ของ HN "${searchTerm}"` : (filterDate ? ` ของวันที่ ${new Date(filterDate).toLocaleDateString('th-TH')}` : '')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-8 card">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">ข้อมูลระบบ</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">FORM101</p>
                            <p className="text-sm text-gray-500">รหัสแบบฟอร์ม</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">v2.0.0</p>
                            <p className="text-sm text-gray-500">เวอร์ชัน</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <p className="text-2xl font-bold text-purple-600">{user?.role === 'admin' ? 'Admin' : 'User'}</p>
                            <p className="text-sm text-gray-500">สิทธิ์การใช้งาน</p>
                        </div>
                        <div className="text-center p-4 bg-amber-50 rounded-lg">
                            <p className="text-2xl font-bold text-amber-600">iPad</p>
                            <p className="text-sm text-gray-500">รองรับอุปกรณ์</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
