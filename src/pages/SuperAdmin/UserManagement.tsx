import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../services/api';
import { FaPlus, FaCheck, FaTimes } from 'react-icons/fa';

interface User {
    id: number;
    name: string;
    email: string;
    role_name: string;
    is_active: number;
    created_at: string;
}

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState<'all' | 'pending'>('all');

    // New User State
    const [newUser, setNewUser] = useState<{ name: string, email: string, password: string, role: string, grade?: string, phone?: string }>({ name: '', email: '', password: '', role: 'admin', grade: '', phone: '' });

    const location = useLocation();

    useEffect(() => {
        fetchUsers();
        if (location.state?.openCreateModal) {
            setShowModal(true);
            // Clear state to prevent reopening on refresh (optional, but good practice requires history manipulation which we might skip for simplicity or do: window.history.replaceState({}, document.title) if critical)
        }
    }, [location]);

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
            alert(err.response?.data?.message || 'Failed to create user');
        }
    };

    const toggleStatus = async (id: number, currentStatus: number) => {
        try {
            await api.put(`/api/users/${id}/status`, { is_active: !currentStatus });
            fetchUsers();
        } catch (err) {
            console.error(err);
        }
    };

    const deleteUser = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        try {
            await api.delete(`/api/users/${id}`);
            fetchUsers();
        } catch (err) {
            console.error(err);
            alert('Failed to delete user');
        }
    };

    if (loading) return <div>Loading users...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-indigo-700"
                >
                    <FaPlus /> Add User
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-4 border-b">
                <button
                    onClick={() => setFilter('all')}
                    className={`pb-2 px-4 ${filter === 'all' ? 'border-b-2 border-indigo-600 text-indigo-600 font-bold' : 'text-gray-500'}`}
                >
                    All Users
                </button>
                <button
                    onClick={() => setFilter('pending')}
                    className={`pb-2 px-4 flex items-center gap-2 ${filter === 'pending' ? 'border-b-2 border-yellow-500 text-yellow-600 font-bold' : 'text-gray-500'}`}
                >
                    Pending Approvals
                    {users.filter(u => !u.is_active).length > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {users.filter(u => !u.is_active).length}
                        </span>
                    )}
                </button>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            {/* Hide Actions for non-super-admin (assuming valid user context/role check will be added or reused) */}
                            {/* For now, we will check local storage or similar if available, OR we can pass a prop. 
                                However, to keep it simple and safe, let's parse the token here or check "role_name" if we had the current user's info.
                                A better way is to check the 'user' object from AuthContext. But since I need to edit the file now:
                            */}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.filter(u => filter === 'all' || !u.is_active).map((user) => (
                            <tr key={user.id} className={!user.is_active ? "bg-yellow-50" : ""}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role_name === 'instructor' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {user.role_name}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {user.is_active ? (
                                        <span className="text-green-600 flex items-center gap-1 font-bold"><FaCheck size={12} /> Active</span>
                                    ) : (
                                        <span className="text-yellow-600 flex items-center gap-1 font-bold animate-pulse">Pending Approval</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {/* We need to know who is viewing. Let's get it from localStorage for now as a quick fix, or ideally use AuthContext. 
                                       I'll wrap this in a check. */}
                                    <ActionButtons user={user} toggleStatus={toggleStatus} deleteUser={deleteUser} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                        <h3 className="text-lg font-bold mb-4">Create New User</h3>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <input
                                type="text" placeholder="Full Name" required
                                className="w-full p-2 border rounded"
                                value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                            />
                            <input
                                type="email" placeholder="Email" required
                                className="w-full p-2 border rounded"
                                value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                            />
                            <input
                                type="password" placeholder="Password" required
                                className="w-full p-2 border rounded"
                                value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                            />
                            <input
                                type="text" placeholder="Phone Number" required
                                className="w-full p-2 border rounded"
                                value={newUser.phone || ''} onChange={e => setNewUser({ ...newUser, phone: e.target.value })}
                            />
                            <select
                                className="w-full p-2 border rounded"
                                value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                            >
                                <option value="admin">Admin</option>
                                <option value="super_instructor">Super Instructor</option>
                                <option value="instructor">Instructor</option>
                                <option value="student">Student</option>
                            </select>

                            {(newUser.role === 'instructor' || newUser.role === 'super_instructor' || newUser.role === 'student') && (
                                <select
                                    className="w-full p-2 border rounded"
                                    value={newUser.grade || ''}
                                    onChange={e => setNewUser({ ...newUser, grade: e.target.value })}
                                >
                                    <option value="">{newUser.role === 'student' ? 'Select Grade / Class' : 'Select Teaching Grade'}</option>
                                    <option value="6th">6th Grade</option>
                                    <option value="7th">7th Grade</option>
                                    <option value="8th">8th Grade</option>
                                    <option value="9th">9th Grade</option>
                                    <option value="10th">10th Grade</option>
                                    <option value="11th">11th Grade</option>
                                    <option value="12th">12th Grade</option>
                                    <option value="NEET">NEET Dropper</option>
                                    <option value="JEE">JEE Mains</option>
                                </select>
                            )}
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Create</button>
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

    if (!isSuperAdmin) return <span className="text-gray-400 italic">Read Only</span>;

    return (
        <div className="flex gap-2">
            <button
                onClick={() => toggleStatus(user.id, user.is_active)}
                className={`${user.is_active ? 'text-red-600 hover:text-red-900 border border-red-200 px-3 py-1 rounded bg-red-50' : 'text-green-700 hover:text-green-900 bg-green-100 border border-green-300 px-3 py-1 rounded shadow-sm hover:shadow-md transition-all'}`}
            >
                {user.is_active ? 'Disable' : 'Approve'}
            </button>
            <button
                onClick={() => deleteUser(user.id)}
                className="text-red-600 hover:text-red-900 border border-red-200 px-3 py-1 rounded bg-red-50 flex items-center gap-1"
                title="Delete User"
            >
                <FaTimes />
            </button>
        </div>
    );
};

export default UserManagement;
