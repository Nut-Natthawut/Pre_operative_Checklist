import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { DashboardSkeleton, SkeletonTableRow } from '../components/ui/Skeleton';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import DatePicker, { registerLocale } from 'react-datepicker';
import { th } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import React from 'react';

// Register Thai locale
registerLocale('th', th);

// Helper: Format date to YYYY-MM-DD for API
const formatDateForAPI = (date: Date | null): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Helper: Parse YYYY-MM-DD to Date object
const parseDateFromAPI = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
};

// Thai month names
const THAI_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

// Helper: Format date in Buddhist Era (พ.ศ.) with Thai month names
const formatDateBE = (date: Date | null): string => {
    if (!date) return '';
    const day = date.getDate();
    const month = THAI_MONTHS[date.getMonth()];
    const yearBE = date.getFullYear() + 543;
    return `${day} ${month} ${yearBE}`;
};

interface CustomInputProps {
    value?: string;
    onClick?: () => void;
    placeholder?: string;
    disabled?: boolean;
    displayValue?: string;
}

const CustomDateInput = React.forwardRef<HTMLButtonElement, CustomInputProps>(
    ({ onClick, placeholder, disabled, displayValue }, ref) => (
        <button
            type="button"
            ref={ref}
            onClick={onClick}
            disabled={disabled}
            className={`bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none text-gray-600 cursor-pointer hover:bg-white transition-colors w-36 text-left ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {displayValue && displayValue !== '' ? displayValue : <span className="text-gray-400">{placeholder}</span>}
        </button>
    )
);

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
    const [startDate, setStartDate] = useState('');  // Empty = show all
    const [endDate, setEndDate] = useState('');      // Empty = show all
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

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
    }, [isLoggedIn, user, startDate, endDate, searchTerm, currentPage, limit]);

    const fetchLogs = async () => {
        setIsLoadingLogs(true);
        try {
            if (searchTerm) {
                const response = await api.searchForms(searchTerm);
                if (response.success && response.data) {
                    setLogs(response.data.results);
                    setTotalCount(response.data.count);
                }
            } else {
                const response = await api.listForms(currentPage, limit, startDate || undefined, endDate || undefined);
                if (response.success && response.data) {
                    setLogs(response.data.forms);
                    setTotalCount(response.data.totalCount);
                }
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setIsLoadingLogs(false);
        }
    };

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const startItem = totalCount > 0 ? (currentPage - 1) * limit + 1 : 0;
    const endItem = Math.min(currentPage * limit, totalCount);

    // Handle page change
    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Handle limit change
    const handleLimitChange = (newLimit: number) => {
        setLimit(newLimit);
        setCurrentPage(1); // Reset to first page when changing limit
    };

    // Clear date filter
    const clearDateFilter = () => {
        setStartDate('');
        setEndDate('');
        setCurrentPage(1);
    };

    if (isLoading) {
        return <DashboardSkeleton />;
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

                        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
                            <div className="relative flex-1 md:w-48">
                                <input
                                    type="text"
                                    placeholder="ค้นหา HN..."
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none transition-all placeholder-gray-400"
                                    style={{ '--tw-ring-color': '#009CA6' } as React.CSSProperties}
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                    onFocus={(e) => { e.target.style.borderColor = '#009CA6'; e.target.style.backgroundColor = '#fff'; }}
                                    onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.backgroundColor = '#f9fafb'; }}
                                />
                                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>

                            {/* Date Range Filter - Buddhist Era (พ.ศ.) */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">ตั้งแต่</span>
                                <DatePicker
                                    selected={parseDateFromAPI(startDate)}
                                    onChange={(date: Date | null) => { setStartDate(formatDateForAPI(date)); setCurrentPage(1); }}
                                    locale="th"
                                    placeholderText="ว/ด/ป"
                                    disabled={!!searchTerm}
                                    showYearDropdown
                                    scrollableYearDropdown
                                    yearDropdownItemNumber={15}
                                    customInput={<CustomDateInput displayValue={formatDateBE(parseDateFromAPI(startDate))} placeholder="ว/ด/ป" disabled={!!searchTerm} />}
                                    renderCustomHeader={({
                                        date,
                                        decreaseMonth,
                                        increaseMonth,
                                        changeYear,
                                        prevMonthButtonDisabled,
                                        nextMonthButtonDisabled,
                                    }) => (
                                        <div className="flex items-center justify-between px-2 py-2 bg-white">
                                            <button type="button" onClick={decreaseMonth} disabled={prevMonthButtonDisabled} className="p-1 hover:bg-gray-100 rounded">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                            </button>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{date.toLocaleDateString('th-TH', { month: 'long' })}</span>
                                                <select value={date.getFullYear()} onChange={({ target: { value } }) => changeYear(Number(value))} className="border rounded px-1 py-0.5 text-sm">
                                                    {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - 10 + i).map(year => (
                                                        <option key={year} value={year}>พ.ศ. {year + 543}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <button type="button" onClick={increaseMonth} disabled={nextMonthButtonDisabled} className="p-1 hover:bg-gray-100 rounded">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                            </button>
                                        </div>
                                    )}
                                />
                                <span className="text-sm text-gray-500">ถึง</span>
                                <DatePicker
                                    selected={parseDateFromAPI(endDate)}
                                    onChange={(date: Date | null) => { setEndDate(formatDateForAPI(date)); setCurrentPage(1); }}
                                    locale="th"
                                    placeholderText="ว/ด/ป"
                                    disabled={!!searchTerm}
                                    showYearDropdown
                                    scrollableYearDropdown
                                    yearDropdownItemNumber={15}
                                    customInput={<CustomDateInput displayValue={formatDateBE(parseDateFromAPI(endDate))} placeholder="ว/ด/ป" disabled={!!searchTerm} />}
                                    renderCustomHeader={({
                                        date,
                                        decreaseMonth,
                                        increaseMonth,
                                        changeYear,
                                        prevMonthButtonDisabled,
                                        nextMonthButtonDisabled,
                                    }) => (
                                        <div className="flex items-center justify-between px-2 py-2 bg-white">
                                            <button type="button" onClick={decreaseMonth} disabled={prevMonthButtonDisabled} className="p-1 hover:bg-gray-100 rounded">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                            </button>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{date.toLocaleDateString('th-TH', { month: 'long' })}</span>
                                                <select value={date.getFullYear()} onChange={({ target: { value } }) => changeYear(Number(value))} className="border rounded px-1 py-0.5 text-sm">
                                                    {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - 10 + i).map(year => (
                                                        <option key={year} value={year}>พ.ศ. {year + 543}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <button type="button" onClick={increaseMonth} disabled={nextMonthButtonDisabled} className="p-1 hover:bg-gray-100 rounded">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                            </button>
                                        </div>
                                    )}
                                />
                                {(startDate || endDate) && (
                                    <button
                                        onClick={clearDateFilter}
                                        className="px-2 py-1 text-xs text-gray-500 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                        title="ล้างตัวกรองวันที่"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            <select
                                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none text-gray-600 cursor-pointer hover:bg-white transition-colors"
                                value={limit}
                                onChange={(e) => handleLimitChange(Number(e.target.value))}
                                disabled={!!searchTerm}
                            >
                                <option value={10}>10 รายการ</option>
                                <option value={20}>20 รายการ</option>
                                <option value={50}>50 รายการ</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="py-4 px-3 md:px-4 font-semibold text-gray-600 w-[10%]">เวลา</th>
                                    <th className="py-4 px-3 md:px-4 font-semibold text-gray-600 w-[12%]">HN</th>
                                    <th className="py-4 px-3 md:px-4 font-semibold text-gray-600 w-[28%]">ผู้ป่วย</th>
                                    <th className="py-4 px-3 md:px-4 font-semibold text-gray-600 w-[10%]">Ward</th>
                                    <th className="py-4 px-3 md:px-4 font-semibold text-gray-600 w-[25%]">สถานะ</th>
                                    <th className="py-4 px-3 md:px-4 font-semibold text-gray-600 w-[15%] text-center">ดำเนินการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {isLoadingLogs ? (
                                    <>
                                        <SkeletonTableRow />
                                        <SkeletonTableRow />
                                        <SkeletonTableRow />
                                        <SkeletonTableRow />
                                        <SkeletonTableRow />
                                    </>
                                ) : logs.length > 0 ? (
                                    logs.reduce((acc: React.ReactNode[], log, index, array) => {
                                        const logDate = new Date(log.createdAt);
                                        const dateStr = logDate.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });

                                        const prevLog = index > 0 ? array[index - 1] : null;
                                        const prevDateStr = prevLog ? new Date(prevLog.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

                                        // Date Header
                                        if (dateStr !== prevDateStr) {
                                            acc.push(
                                                <tr key={`header-${dateStr}`} className="bg-gradient-to-r from-teal-50 to-transparent">
                                                    <td colSpan={6} className="py-3 px-3 md:px-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-med-teal/10 flex items-center justify-center">
                                                                <svg className="w-4 h-4 text-med-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                            </div>
                                                            <span className="text-sm font-semibold text-med-teal">{dateStr}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }

                                        acc.push(
                                            <tr key={log.id}
                                                className="hover:bg-teal-50/30 transition-colors cursor-pointer group border-l-2 border-transparent hover:border-med-teal"
                                                onClick={() => navigate(`/form/${log.id}`)}>
                                                <td className="py-4 px-3 md:px-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hidden sm:flex">
                                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        </div>
                                                        <span className="font-medium text-gray-700">{logDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-3 md:px-4">
                                                    <span className="font-bold text-gray-700 group-hover:text-med-teal transition-colors">{log.hn}</span>
                                                    {/* Add AN if available in future */}
                                                </td>
                                                <td className="py-4 px-3 md:px-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-gray-900 font-medium truncate max-w-[120px] md:max-w-xs">{log.patientName}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-3 md:px-4 text-gray-500">
                                                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">{log.ward || '-'}</span>
                                                </td>
                                                <td className="py-4 px-3 md:px-4">
                                                    {log.status === 'green' ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 shadow-sm whitespace-nowrap">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                            {log.statusMessage || 'พร้อมผ่าตัด'}
                                                        </span>
                                                    ) : log.status === 'yellow' ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20 shadow-sm whitespace-nowrap">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                                            {log.statusMessage || 'กำลังดำเนินการ'}
                                                        </span>
                                                    ) : log.status === 'red' ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20 shadow-sm whitespace-nowrap">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                                            {log.statusMessage || 'ยังไม่เริ่มต้น'}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 font-light">-</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-3 md:px-4 text-center">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); navigate(`/form/${log.id}`); }}
                                                        className="inline-flex items-center gap-1.5 px-2 py-1.5 md:px-3 text-med-teal bg-teal-50 hover:bg-med-teal hover:text-white border border-med-teal/30 hover:border-transparent text-xs font-medium rounded-md transition-all duration-200 cursor-pointer shadow-sm hover:shadow"
                                                        title="ดูฟอร์ม"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        <span className="hidden lg:inline">ดูฟอร์ม</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                        return acc;
                                    }, [])
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-16 text-center text-gray-400">
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

                    {/* Pagination Controls */}
                    {!searchTerm && totalCount > 0 && (
                        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="text-sm text-gray-500">
                                แสดง {startItem}-{endItem} จาก {totalCount} รายการ
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    ก่อนหน้า
                                </button>

                                {/* Page Numbers */}
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum: number;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => goToPage(pageNum)}
                                            className={`w-8 h-8 text-sm rounded-lg transition-colors ${currentPage === pageNum
                                                ? 'bg-med-teal text-white'
                                                : 'text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    ถัดไป
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-400">
                    <p>© 2026 CMU Hospital. All rights reserved.</p>
                    <div className="flex items-center justify-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span>System Normal</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="font-semibold text-gray-500 block mb-0.5">VERSION</span>
                            <span>v2.0.0 (Beta)</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 justify-center">
                        <span>Supported Devices:</span>
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-500">iPad</span>
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-500">Desktop</span>
                    </div>
                </div>
            </main>
        </div>
    );
}
