import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

interface SearchResult {
    id: string;
    hn: string;
    an: string;
    patientName: string;
    ward: string;
    formDate: string;
    formTime: string;
    createdAt: string;
}

export default function SearchPage() {
    const { isLoggedIn, isLoading } = useAuth();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => { if (!isLoading && !isLoggedIn) { navigate('/login'); } }, [isLoading, isLoggedIn, navigate]);

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!searchTerm.trim()) return;
        setSearching(true);
        setHasSearched(true);
        try {
            const response = await api.searchForms(searchTerm);
            if (response.success && response.data) { setResults(response.data.results); }
        } catch (error) { console.error('Search error:', error); }
        finally { setSearching(false); }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">กำลังโหลด...</div>;
    if (!isLoggedIn) return null;

    return (
        <div className="min-h-screen bg-gray-50/50">
            <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link to="/dashboard" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-50 text-gray-400 hover:text-med-teal transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">ค้นหาข้อมูลผู้ป่วย</h1>
                        <p className="text-xs text-gray-500">Search Patient Records</p>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                <form onSubmit={handleSearch} className="card mb-8 border border-gray-100 shadow-sm p-6">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="กรอก HN ที่ต้องการค้นหา..."
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none transition-all focus:bg-white"
                                style={{ '--tw-ring-color': '#009CA6' } as React.CSSProperties}
                                onFocus={(e) => e.target.style.borderColor = '#009CA6'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                            <svg className="w-6 h-6 text-gray-400 absolute left-4 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <button
                            type="submit"
                            disabled={searching || !searchTerm.trim()}
                            className="btn-primary flex items-center gap-2 px-6 shadow-md disabled:shadow-none"
                            style={{ backgroundColor: '#009CA6' }}
                        >
                            {searching ? (
                                <><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg><span>กำลังค้นหา...</span></>
                            ) : (
                                <span>ค้นหา</span>
                            )}
                        </button>
                    </div>
                </form>

                {hasSearched && (
                    <div className="card border border-gray-100 shadow-md overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-800">ผลการค้นหา</h3>
                            <span className="text-xs px-2 py-1 bg-white border border-gray-200 rounded-full text-gray-500">
                                พบ {results.length} รายการ
                            </span>
                        </div>

                        {results.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="py-4 px-6 font-semibold text-gray-600">วันที่บันทึก</th>
                                            <th className="py-4 px-6 font-semibold text-gray-600">HN</th>
                                            <th className="py-4 px-6 font-semibold text-gray-600">AN</th>
                                            <th className="py-4 px-6 font-semibold text-gray-600">ชื่อผู้ป่วย</th>
                                            <th className="py-4 px-6 font-semibold text-gray-600">Ward</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {results.map(result => (
                                            <tr key={result.id} className="hover:bg-teal-50/30 transition-colors cursor-pointer group border-l-2 border-transparent hover:border-med-teal" onClick={() => navigate(`/form/${result.id}`)}>
                                                <td className="py-4 px-6 text-gray-600">
                                                    {new Date(result.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </td>
                                                <td className="py-4 px-6 font-bold text-gray-700 group-hover:text-med-teal transition-colors">
                                                    {result.hn}
                                                </td>
                                                <td className="py-4 px-6 text-gray-600">{result.an || '-'}</td>
                                                <td className="py-4 px-6 text-gray-800 font-medium">{result.patientName}</td>
                                                <td className="py-4 px-6 text-gray-500">
                                                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">{result.ward || '-'}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-16 text-gray-400">
                                <div className="flex flex-col items-center gap-3">
                                    <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                    <span>ไม่พบข้อมูลสำหรับ HN "{searchTerm}"</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
