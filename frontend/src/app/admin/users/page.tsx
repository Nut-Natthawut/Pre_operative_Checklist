'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import Link from 'next/link';

interface User {
    id: string;
    username: string;
    role: string;
    fullName: string;
    createdAt: string;
}

export default function AdminUsersPage() {
    const { isLoggedIn, isLoading, isAdmin } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [error, setError] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newUser, setNewUser] = useState({
        username: '',
        password: '',
        fullName: '',
        role: 'user',
    });

    useEffect(() => {
        if (!isLoading) {
            if (!isLoggedIn) {
                router.push('/login');
            } else if (!isAdmin) {
                router.push('/dashboard');
            } else {
                loadUsers();
            }
        }
    }, [isLoggedIn, isLoading, isAdmin, router]);

    const loadUsers = async () => {
        setLoadingUsers(true);
        const response = await api.getUsers();
        if (response.success && response.data) {
            setUsers(response.data.users);
        } else {
            setError(response.message);
        }
        setLoadingUsers(false);
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        setError('');

        const response = await api.createUser(newUser);
        if (response.success) {
            setShowCreateModal(false);
            setNewUser({ username: '', password: '', fullName: '', role: 'user' });
            loadUsers();
        } else {
            setError(response.message);
        }
        setCreating(false);
    };

    const handleDeleteUser = async (userId: string, username: string) => {
        if (!confirm(`ต้องการลบผู้ใช้ "${username}" ใช่หรือไม่?`)) return;

        const response = await api.deleteUser(userId);
        if (response.success) {
            loadUsers();
        } else {
            setError(response.message);
        }
    };

    if (isLoading || !isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">จัดการผู้ใช้</h1>
                            <p className="text-sm text-gray-500">สร้างและจัดการบัญชีผู้ใช้งาน</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>เพิ่มผู้ใช้ใหม่</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {error && (
                    <div className="error-banner mb-6">{error}</div>
                )}

                <div className="card">
                    {loadingUsers ? (
                        <div className="text-center py-8">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-500">กำลังโหลด...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">ชื่อผู้ใช้</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">ชื่อ-นามสกุล</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">สิทธิ์</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">วันที่สร้าง</th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-700">จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4 font-medium">{user.username}</td>
                                            <td className="py-3 px-4">{user.fullName}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin'
                                                        ? 'bg-purple-100 text-purple-700'
                                                        : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งาน'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-500">
                                                {new Date(user.createdAt).toLocaleDateString('th-TH')}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteUser(user.id, user.username)}
                                                    className="text-red-600 hover:text-red-800 font-medium"
                                                >
                                                    ลบ
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* Create User Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">เพิ่มผู้ใช้ใหม่</h2>

                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    ชื่อผู้ใช้
                                </label>
                                <input
                                    type="text"
                                    value={newUser.username}
                                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    รหัสผ่าน
                                </label>
                                <input
                                    type="password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    ชื่อ-นามสกุล
                                </label>
                                <input
                                    type="text"
                                    value={newUser.fullName}
                                    onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    สิทธิ์การใช้งาน
                                </label>
                                <select
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="user">ผู้ใช้งาน</option>
                                    <option value="admin">ผู้ดูแลระบบ</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="btn-secondary flex-1"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="btn-primary flex-1"
                                >
                                    {creating ? 'กำลังสร้าง...' : 'สร้างผู้ใช้'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
