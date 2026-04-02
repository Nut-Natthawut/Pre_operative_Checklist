import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await login(username, password);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#faf8ff] medical-grid relative overflow-hidden">
            {/* Background Decor — Stitch inspired blurs */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#eaedff] to-transparent pointer-events-none"></div>
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#b4c5ff] rounded-full blur-[120px] opacity-30 pointer-events-none"></div>
            <div className="absolute top-1/2 -left-24 w-72 h-72 bg-[#c0c1ff] rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-[#dbe1ff] rounded-full blur-[100px] opacity-30 pointer-events-none"></div>

            <div className="w-full max-w-md relative z-10 px-4">
                {/* Card — Glassmorphism */}
                <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white/50 shadow-[0_20px_60px_rgba(0,74,198,0.08)] p-8 sm:p-10">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#004ac6] to-[#2563eb] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-500/25 transform rotate-3">
                            <svg className="w-8 h-8 text-white transform -rotate-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-black text-[#131b2e] tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
                            Suandok Forms
                        </h1>
                        <p className="text-[#434655] mt-1.5 text-sm font-medium">รายงานการเตรียมผู้ป่วยก่อนผ่าตัด</p>
                        <p className="text-[#737686] text-xs mt-0.5">โรงพยาบาลมหาราชนครเชียงใหม่</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2 border border-red-100/50">
                            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="username" className="block text-sm font-semibold text-[#131b2e] mb-1.5 ml-1">
                                ชื่อผู้ใช้
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 bg-[#f2f3ff] border-2 border-transparent rounded-xl outline-none transition-all text-[#131b2e] placeholder-[#737686] focus:bg-white focus:border-[#004ac6] focus:shadow-[0_0_0_3px_rgba(0,74,198,0.1)]"
                                placeholder="กรอกชื่อผู้ใช้"
                                required
                                autoComplete="username"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-[#131b2e] mb-1.5 ml-1">
                                รหัสผ่าน
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-[#f2f3ff] border-2 border-transparent rounded-xl outline-none transition-all text-[#131b2e] placeholder-[#737686] focus:bg-white focus:border-[#004ac6] focus:shadow-[0_0_0_3px_rgba(0,74,198,0.1)]"
                                placeholder="กรอกรหัสผ่าน"
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#004ac6] to-[#2563eb] text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        <span>กำลังเข้าสู่ระบบ...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>เข้าสู่ระบบ</span>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-xs text-[#737686]">
                            &copy; {new Date().getFullYear()} ศูนย์พัฒนาระบบดิจิทัล โรงพยาบาลมหาราชนครเชียงใหม่
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
