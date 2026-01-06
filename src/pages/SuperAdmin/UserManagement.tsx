import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../services/api';
import { FaPlus, FaCheck, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useModal } from '../../context/ModalContext';

interface User {
    id: number;
    name: string;
    email: string;
    role_name: string;
    is_active: number;
    created_at: string;
    grade?: string;
}

const UserManagement: React.FC = () => {
    const { showAlert, showConfirm } = useModal();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [filter, setFilter] = useState<'all' | 'pending'>('all');

    // New User State
    const [newUser, setNewUser] = useState<{ name: string, email: string, password: string, role: string, grade?: string, phone?: string }>({ name: '', email: '', password: '', role: 'admin', grade: '', phone: '' });

    // Categories State for dynamic dropdown
    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
    const [educationLevel, setEducationLevel] = useState('');

    const location = useLocation();

    useEffect(() => {
        fetchUsers();
        fetchCategories();
        if (location.state?.openCreateModal) {
            setShowModal(true);
            // Clear state to prevent reopening on refresh (optional, but good practice requires history manipulation which we might skip for simplicity or do: window.history.replaceState({}, document.title) if critical)
        }
    }, [location]);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/api/classes/categories');
            setCategories(res.data);
        } catch (err) {
            console.error("Failed to fetch categories");
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get('/api/users');
            setUsers(res.data);
        } catch (err) {
            console.error('Failed to fetch users', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/api/users', newUser);
            setShowModal(false);
            setNewUser({ name: '', email: '', password: '', role: 'admin', grade: '', phone: '' });
            fetchUsers();
        } catch (err: any) {
            showAlert(err.response?.data?.message || 'Failed to create user', 'error');
        }
    };

    const toggleStatus = async (id: number, currentStatus: number) => {
        try {
            await api.put(`/api/users/${id}/status`, { is_active: !currentStatus });
            fetchUsers();
        } catch (err: any) {
            console.error(err);
            showAlert(err.response?.data?.message || "Failed to update status", 'error');
        }
    };

    const deleteUser = async (id: number) => {
        const confirmed = await showConfirm('Are you sure you want to delete this user? This action cannot be undone.', 'error', 'Delete User');
        if (!confirmed) return;
        try {
            await api.delete(`/api/users/${id}`);
            showAlert('User deleted successfully', 'success');
            fetchUsers();
        } catch (err: any) {
            console.error(err);
            showAlert(err.response?.data?.message || 'Failed to delete user', 'error');
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-[400px] text-primary font-black uppercase tracking-widest animate-pulse italic">Loading User Ecosystem...</div>;

    return (
        <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black text-accent-white tracking-tighter italic">User <span className="text-gradient-red">Management</span></h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary flex items-center gap-2 px-6 shadow-xl shadow-primary/20 scale-105 active:scale-95 transition-all"
                >
                    <FaPlus /> ADD NEW USER
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-8 mb-8 border-b border-surface-border">
                <button
                    onClick={() => setFilter('all')}
                    className={`pb-4 px-2 text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'border-b-2 border-primary text-primary' : 'text-accent-gray hover:text-accent-white'}`}
                >
                    All Users
                </button>
                <button
                    onClick={() => setFilter('pending')}
                    className={`pb-4 px-2 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'pending' ? 'border-b-2 border-primary text-primary' : 'text-accent-gray hover:text-accent-white'}`}
                >
                    Pending Approvals
                    {users.filter(u => !u.is_active).length > 0 && (
                        <span className="bg-primary text-white text-[8px] rounded-full h-4 w-4 flex items-center justify-center animate-bounce shadow-lg shadow-primary/40 font-black">
                            {users.filter(u => !u.is_active).length}
                        </span>
                    )}
                </button>
            </div>

            {/* Mobile View - Cards */}
            <div className="md:hidden space-y-4">
                {users.filter(u => filter === 'all' || !u.is_active).map((user) => (
                    <div key={user.id} className="premium-card p-4 bg-surface dark:bg-surface border border-surface-border rounded-xl shadow-lg">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h4 className="font-black text-accent-white text-lg">{user.name}</h4>
                                <p className="text-sm font-medium text-accent-gray/70 break-all">{user.email}</p>
                            </div>
                            <span className={`px-2 py-1 text-[8px] font-black uppercase tracking-wider rounded-lg border shadow-sm ${user.role_name === 'instructor' ? 'bg-purple-900/20 text-purple-400 border-purple-500/20' : user.role_name === 'super_instructor' ? 'bg-indigo-900/20 text-indigo-400 border-indigo-500/20' : 'bg-surface-dark text-accent-gray border-white/5'}`}>
                                {user.role_name.replace('_', ' ')}
                            </span>
                            {user.grade && (
                                <span className="ml-2 px-2 py-1 text-[8px] font-black uppercase tracking-wider rounded-lg border border-white/5 bg-surface-dark text-accent-gray shadow-sm">
                                    {user.grade}
                                </span>
                            )}
                        </div>

                        <div className="flex justify-between items-center mb-4 pt-3 border-t border-surface-border">
                            <span className="text-xs font-bold text-accent-gray uppercase tracking-widest">Status</span>
                            {user.is_active ? (
                                <span className="text-accent-emerald flex items-center gap-1.5 font-black uppercase text-[9px] tracking-widest"><FaCheck size={10} /> Active</span>
                            ) : (
                                <span className="text-primary flex items-center gap-1.5 font-black uppercase text-[9px] tracking-widest animate-pulse">Pending Review</span>
                            )}
                        </div>

                        <div className="pt-2">
                            <ActionButtons user={user} toggleStatus={toggleStatus} deleteUser={deleteUser} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop View - Table */}
            <div className="hidden md:block premium-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-surface-border">
                        <thead className="bg-surface-dark/50">
                            <tr>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-accent-white uppercase tracking-[0.2em]">Name</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-accent-white uppercase tracking-[0.2em]">Email</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-accent-white uppercase tracking-[0.2em]">Role</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-accent-white uppercase tracking-[0.2em]">Class</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-accent-white uppercase tracking-[0.2em]">Status</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-accent-white uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-border">
                            {users.filter(u => filter === 'all' || !u.is_active).map((user) => (
                                <tr key={user.id} className={`${!user.is_active ? "bg-primary/5" : ""} hover:bg-white/5 transition-colors`}>
                                    <td className="px-6 py-4 whitespace-nowrap font-black text-accent-white italic">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-accent-gray/70 text-sm font-medium">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg border shadow-sm ${user.role_name === 'instructor' ? 'bg-purple-900/20 text-purple-400 border-purple-500/20' : user.role_name === 'super_instructor' ? 'bg-indigo-900/20 text-indigo-400 border-indigo-500/20' : 'bg-surface-dark text-accent-gray border-white/5'}`}>
                                            {user.role_name.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-accent-gray text-xs font-black uppercase tracking-wider">
                                        {user.grade || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {user.is_active ? (
                                            <span className="text-accent-emerald flex items-center gap-1.5 font-black uppercase text-[9px] tracking-widest"><FaCheck size={10} /> Active</span>
                                        ) : (
                                            <span className="text-primary flex items-center gap-1.5 font-black uppercase text-[9px] tracking-widest animate-pulse">Pending Review</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <ActionButtons user={user} toggleStatus={toggleStatus} deleteUser={deleteUser} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-md transition-opacity" onClick={() => setShowModal(false)}></div>
                    <div className="bg-surface p-8 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10 w-full max-w-md relative z-10 animate-fadeInTransform">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-accent-white italic tracking-tighter">Create New <span className="text-primary">User</span></h3>
                            <button onClick={() => setShowModal(false)} className="text-accent-gray hover:text-white transition-colors"><FaTimes size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateUser} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-accent-gray uppercase tracking-widest ml-2">Full Name</label>
                                <input
                                    type="text" placeholder="e.g. John Doe" required
                                    className="w-full bg-surface-dark border border-white/5 rounded-2xl p-4 text-accent-white focus:border-primary/50 outline-none transition-all placeholder:text-white/10"
                                    value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-accent-gray uppercase tracking-widest ml-2">Email Address</label>
                                <input
                                    type="email" placeholder="john@example.com" required
                                    className="w-full bg-surface-dark border border-white/5 rounded-2xl p-4 text-accent-white focus:border-primary/50 outline-none transition-all placeholder:text-white/10"
                                    value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-accent-gray uppercase tracking-widest ml-2">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'} placeholder="••••••••" required
                                            className="w-full bg-surface-dark border border-white/5 rounded-2xl p-4 pr-12 text-accent-white focus:border-primary/50 outline-none transition-all placeholder:text-white/10"
                                            value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-accent-gray hover:text-primary transition-colors"
                                        >
                                            {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-accent-gray uppercase tracking-widest ml-2">Phone</label>
                                    <input
                                        type="text" placeholder="+91..." required
                                        className="w-full bg-surface-dark border border-white/5 rounded-2xl p-4 text-accent-white focus:border-primary/50 outline-none transition-all placeholder:text-white/10"
                                        value={newUser.phone || ''} onChange={e => setNewUser({ ...newUser, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-accent-gray uppercase tracking-widest ml-2">Account Role</label>
                                <select
                                    className="w-full bg-surface-dark border border-white/5 rounded-2xl p-4 text-accent-white focus:border-primary/50 outline-none transition-all appearance-none cursor-pointer"
                                    value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    <option value="admin">Admin</option>
                                    <option value="super_instructor">Super Instructor</option>
                                    <option value="instructor">Instructor</option>
                                    <option value="student">Student</option>
                                </select>
                            </div>

                            {(newUser.role === 'instructor' || newUser.role === 'super_instructor' || newUser.role === 'student') && (
                                <>
                                    <div className="space-y-2 animate-fadeIn">
                                        <label className="text-[10px] font-black text-accent-gray uppercase tracking-widest ml-2">Education Level</label>
                                        <select
                                            className="w-full bg-surface-dark border border-white/5 rounded-2xl p-4 text-accent-white focus:border-primary/50 outline-none transition-all appearance-none cursor-pointer"
                                            value={educationLevel}
                                            onChange={(e) => {
                                                setEducationLevel(e.target.value);
                                                setNewUser({ ...newUser, grade: '' }); // Reset grade on level change
                                            }}
                                        >
                                            <option value="">Select Level...</option>
                                            <option value="school">School Education (6th-12th)</option>
                                            <option value="ug">Undergraduate (UG)</option>
                                            <option value="pg">Postgraduate (PG)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2 animate-fadeIn">
                                        <label className="text-[10px] font-black text-accent-gray uppercase tracking-widest ml-2">
                                            {newUser.role === 'student' ? (educationLevel === 'school' ? 'Grade / Class' : 'Course / Stream') : (educationLevel === 'school' ? 'Teaching Grade' : 'Teaching Stream')}
                                        </label>
                                        <select
                                            className="w-full bg-surface-dark border border-white/10 rounded-2xl p-4 text-accent-white focus:border-primary/50 outline-none transition-all appearance-none cursor-pointer shadow-lg shadow-primary/5"
                                            value={newUser.grade || ''}
                                            onChange={e => setNewUser({ ...newUser, grade: e.target.value })}
                                            disabled={!educationLevel}
                                        >
                                            <option value="">Select Option...</option>
                                            {categories
                                                .filter(c => educationLevel === 'school' ? c.name.includes('Class') : !c.name.includes('Class'))
                                                .map((cat) => (
                                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                </>
                            )}
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-4 text-[10px] font-black uppercase tracking-widest text-accent-gray hover:text-white transition-colors border border-white/5 rounded-2xl hover:bg-white/5">Cancel</button>
                                <button type="submit" className="flex-1 btn-primary py-4 scale-100 hover:scale-105">CREATE USER</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper component to handle role checking cleaner
const ActionButtons = ({ user, toggleStatus, deleteUser }: { user: User, toggleStatus: any, deleteUser: any }) => {
    const userJson = localStorage.getItem('user');
    const currentUser = userJson ? JSON.parse(userJson) : null;
    const isSuperAdmin = currentUser?.role === 'super_admin';

    if (!isSuperAdmin) return <span className="text-accent-gray/30 text-[9px] font-black uppercase tracking-widest italic">Read Only</span>;

    return (
        <div className="flex gap-2">
            <button
                onClick={() => toggleStatus(user.id, user.is_active)}
                className={`flex-1 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all transform hover:scale-105 active:scale-95 shadow-lg border ${user.is_active ? 'bg-surface-dark border-white/5 text-accent-gray hover:border-primary/50' : 'bg-primary text-white border-primary-hover shadow-primary/20'}`}
            >
                {user.is_active ? 'Deactivate' : 'Approve'}
            </button>
            <button
                onClick={() => deleteUser(user.id)}
                className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-lg hover:shadow-red-500/20"
                title="Delete User"
            >
                <FaTimes size={12} />
            </button>
        </div>
    );
};

export default UserManagement;
