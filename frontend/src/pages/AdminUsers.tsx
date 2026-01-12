import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { toast } from 'sonner';

interface User {
    id: string;
    username: string;
    fullName: string;
    role: string;
    createdAt: string;
}

export default function AdminUsersPage() {
    const { isLoggedIn, isLoading, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', password: '', fullName: '', role: 'user' });
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (!isLoading) {
            if (!isLoggedIn) { navigate('/login'); }
            else if (!isAdmin) { navigate('/dashboard'); toast.error('คุณไม่มีสิทธิ์เข้าถึงหน้านี้'); }
            else { loadUsers(); }
        }
    }, [isLoggedIn, isLoading, isAdmin, navigate]);

    const loadUsers = async () => {
        setLoadingUsers(true);
        try {
            const response = await api.getUsers();
            if (response.success && response.data) { setUsers(response.data.users); }
        } catch (error) { console.error('Error loading users:', error); }
        finally { setLoadingUsers(false); }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            const response = await api.createUser(newUser);
            if (response.success) { toast.success('สร้างผู้ใช้สำเร็จ'); setShowCreateModal(false); setNewUser({ username: '', password: '', fullName: '', role: 'user' }); loadUsers(); }
            else { toast.error(`เกิดข้อผิดพลาด: ${response.message}`); }
        } catch { toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ'); }
        finally { setCreating(false); }
    };

    const handleDeleteUser = async (userId: string, username: string) => {
        if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้ "${username}"?`)) return;
        try {
            const response = await api.deleteUser(userId);
            if (response.success) { toast.success('ลบผู้ใช้สำเร็จ'); loadUsers(); }
            else { toast.error(`เกิดข้อผิดพลาด: ${response.message}`); }
        } catch { toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ'); }
    };

    if (isLoading || loadingUsers) return <div className="min-h-screen flex items-center justify-center">กำลังโหลด...</div>;
    if (!isLoggedIn || !isAdmin) return null;

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/dashboard" className="text-gray-400 hover:text-gray-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></Link>
                        <h1 className="text-xl font-bold text-gray-800">จัดการผู้ใช้</h1>
                    </div>
                    <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        <span>เพิ่มผู้ใช้</span>
                    </button>
                </div>
            </header>
            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="card">
                    <table className="w-full text-left text-sm">
                        <thead><tr className="bg-gray-50 border-b border-gray-200">
                            <th className="py-3 px-4 font-medium text-gray-600">ชื่อผู้ใช้</th>
                            <th className="py-3 px-4 font-medium text-gray-600">ชื่อ-สกุล</th>
                            <th className="py-3 px-4 font-medium text-gray-600">สิทธิ์</th>
                            <th className="py-3 px-4 font-medium text-gray-600">วันที่สร้าง</th>
                            <th className="py-3 px-4 font-medium text-gray-600 text-right">จัดการ</th>
                        </tr></thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="py-3 px-4 text-gray-800 font-medium">{user.username}</td>
                                    <td className="py-3 px-4 text-gray-800">{user.fullName}</td>
                                    <td className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>{user.role === 'admin' ? 'Admin' : 'User'}</span></td>
                                    <td className="py-3 px-4 text-gray-600">{new Date(user.createdAt).toLocaleDateString('th-TH')}</td>
                                    <td className="py-3 px-4 text-right"><button onClick={() => handleDeleteUser(user.id, user.username)} className="text-red-600 hover:text-red-800 font-medium text-sm">ลบ</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100"><h3 className="text-lg font-bold text-gray-900">เพิ่มผู้ใช้ใหม่</h3></div>
                        <form onSubmit={handleCreateUser}>
                            <div className="px-6 py-6 space-y-4">
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ใช้</label><input type="text" className="input-field" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} required /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label><input type="password" className="input-field" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} required /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-สกุล</label><input type="text" className="input-field" value={newUser.fullName} onChange={e => setNewUser({ ...newUser, fullName: e.target.value })} required /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">สิทธิ์</label><select className="input-field" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}><option value="user">User</option><option value="admin">Admin</option></select></div>
                            </div>
                            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">ยกเลิก</button>
                                <button type="submit" disabled={creating} className="btn-primary">{creating ? 'กำลังสร้าง...' : 'สร้างผู้ใช้'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
