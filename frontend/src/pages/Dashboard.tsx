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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                    <th className="py-3 px-4 font-medium text-gray-600">วันที่-เวลา</th>
                                    <th className="py-3 px-4 font-medium text-gray-600">HN</th>
                                    <th className="py-3 px-4 font-medium text-gray-600">ชื่อผู้ป่วย</th>
                                    <th className="py-3 px-4 font-medium text-gray-600">Ward</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoadingLogs ? (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-gray-500">กำลังโหลดข้อมูล...</td>
                                    </tr>
                                ) : logs.length > 0 ? (
                                    logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-blue-50 transition-colors cursor-pointer" onClick={() => navigate(`/form/${log.id}`)}>
                                            <td className="py-3 px-4 text-gray-800">
                                                {new Date(log.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="py-3 px-4 text-gray-800 font-medium text-blue-600">{log.hn}</td>
                                            <td className="py-3 px-4 text-gray-800">{log.patientName}</td>
                                            <td className="py-3 px-4 text-gray-600">{log.ward || '-'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-gray-500">
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
