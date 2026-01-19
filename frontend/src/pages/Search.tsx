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
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link to="/dashboard" className="text-gray-400 hover:text-gray-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></Link>
                    <h1 className="text-xl font-bold text-gray-800">ค้นหาข้อมูลผู้ป่วย</h1>
                </div>
            </header>
            <main className="max-w-4xl mx-auto px-4 py-8">
                <form onSubmit={handleSearch} className="card mb-8">
                    <div className="flex gap-4">
                        <input type="text" placeholder="กรอก HN ที่ต้องการค้นหา..." className="input-field flex-1" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        <button type="submit" disabled={searching || !searchTerm.trim()} className="btn-primary flex items-center gap-2">
                            {searching ? (<><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg><span>กำลังค้นหา...</span></>) : (<><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg><span>ค้นหา</span></>)}
                        </button>
                    </div>
                </form>
                {hasSearched && (
                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">ผลการค้นหา ({results.length} รายการ)</h3>
                        {results.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead><tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="py-3 px-4 font-medium text-gray-600">วันที่บันทึก</th>
                                        <th className="py-3 px-4 font-medium text-gray-600">HN</th>
                                        <th className="py-3 px-4 font-medium text-gray-600">AN</th>
                                        <th className="py-3 px-4 font-medium text-gray-600">ชื่อผู้ป่วย</th>
                                        <th className="py-3 px-4 font-medium text-gray-600">Ward</th>
                                    </tr></thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {results.map(result => (
                                            <tr key={result.id} className="hover:bg-[#009CA6]/10 transition-colors cursor-pointer" onClick={() => navigate(`/form/${result.id}`)}>
                                                <td className="py-3 px-4 text-gray-800">{new Date(result.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                                <td className="py-3 px-4 font-medium" style={{ color: '#009CA6' }}>{result.hn}</td>
                                                <td className="py-3 px-4 text-gray-800">{result.an || '-'}</td>
                                                <td className="py-3 px-4 text-gray-800">{result.patientName}</td>
                                                <td className="py-3 px-4 text-gray-600">{result.ward || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (<div className="text-center py-8 text-gray-500">ไม่พบข้อมูลสำหรับ HN "{searchTerm}"</div>)}
                    </div>
                )}
            </main>
        </div>
    );
}
