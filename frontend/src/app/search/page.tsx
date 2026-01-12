'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import Link from 'next/link';

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
    const router = useRouter();
    const [hn, setHn] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [searched, setSearched] = useState(false);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState('');

    if (!isLoading && !isLoggedIn) {
        router.push('/login');
        return null;
    }

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hn.trim()) return;

        setSearching(true);
        setError('');

        const response = await api.searchForms(hn.trim());
        if (response.success && response.data) {
            setResults(response.data.results);
        } else {
            setError(response.message);
            setResults([]);
        }

        setSearched(true);
        setSearching(false);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">ค้นหาข้อมูล</h1>
                        <p className="text-sm text-gray-500">ค้นหาด้วย HN เพื่อดูข้อมูลที่บันทึกไว้</p>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Search Form */}
                <div className="card mb-8">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="flex-1">
                            <label htmlFor="hn" className="block text-sm font-medium text-gray-700 mb-2">
                                HN (Hospital Number)
                            </label>
                            <input
                                id="hn"
                                type="text"
                                value={hn}
                                onChange={(e) => setHn(e.target.value)}
                                className="input-field"
                                placeholder="กรอก HN เพื่อค้นหา"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                disabled={searching || !hn.trim()}
                                className="btn-primary flex items-center gap-2"
                            >
                                {searching ? (
                                    <>
                                        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        <span>กำลังค้นหา...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <span>ค้นหา</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Error */}
                {error && (
                    <div className="error-banner mb-6">{error}</div>
                )}

                {/* Results */}
                {searched && (
                    <div className="card">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            ผลการค้นหา ({results.length} รายการ)
                        </h2>

                        {results.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p>ไม่พบข้อมูลที่ค้นหา</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">HN</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">AN</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">ชื่อผู้ป่วย</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">หอผู้ป่วย</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">วันที่</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">เวลา</th>
                                            <th className="text-right py-3 px-4 font-semibold text-gray-700">ดู</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.map((result) => (
                                            <tr key={result.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-3 px-4 font-medium text-blue-600">{result.hn}</td>
                                                <td className="py-3 px-4">{result.an || '-'}</td>
                                                <td className="py-3 px-4">{result.patientName}</td>
                                                <td className="py-3 px-4">{result.ward}</td>
                                                <td className="py-3 px-4">{result.formDate}</td>
                                                <td className="py-3 px-4">{result.formTime}</td>
                                                <td className="py-3 px-4 text-right">
                                                    <Link
                                                        href={`/form/${result.id}`}
                                                        className="btn-primary text-sm py-2 px-4"
                                                    >
                                                        ดูข้อมูล
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
