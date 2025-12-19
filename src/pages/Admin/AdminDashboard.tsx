import React, { useEffect, useState } from 'react';
import { FaChalkboardTeacher, FaUserGraduate, FaVideo, FaBell, FaChartLine, FaCheck, FaTimes } from 'react-icons/fa';
import api from '../../services/api';

interface User {
    id: number;
    name: string;
    email: string;
    role_name: string;
    is_active: number | boolean;
    created_at: string;
}

const AdminDashboard: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        instructors: 0,
        students: 0,
        pending: 0,
        admins: 0
    });

    const fetchUsers = async () => {
        try {
            const res = await api.get('/api/users');
            const data: User[] = res.data;
            setUsers(data);

            // Calculate Stats
            const instructors = data.filter(u => u.role_name === 'instructor' || u.role_name === 'super_instructor').length;
            const students = data.filter(u => u.role_name === 'student').length;
            const pending = data.filter(u => !u.is_active).length;
            const admins = data.filter(u => u.role_name === 'admin').length;

            setStats({ instructors, students, pending, admins });
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch users", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleStatus = async (id: number, currentStatus: boolean | number) => {
        const newStatus = !currentStatus;
        if (!window.confirm(`Are you sure you want to ${newStatus ? 'Activate' : 'Deactivate'} this user?`)) return;

        try {
            await api.put(`/api/users/${id}/status`, { is_active: newStatus });
            alert(`User ${newStatus ? 'Activated' : 'Deactivated'} successfully!`);
            fetchUsers(); // Refresh data
        } catch (err) {
            console.error("Failed to update status", err);
            alert("Failed to update user status.");
        }
    };

    if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Super Admin Dashboard</h2>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span>Last updated: just now</span>
                    <button className="p-2 bg-white rounded-full shadow hover:bg-gray-50"><FaBell /></button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Instructors', value: stats.instructors, icon: FaChalkboardTeacher, color: 'from-blue-500 to-blue-600' },
                    { label: 'Total Students', value: stats.students, icon: FaUserGraduate, color: 'from-indigo-500 to-indigo-600' },
                    { label: 'Pending Requests', value: stats.pending, icon: FaVideo, color: 'from-red-500 to-red-600' },
                    { label: 'Admins', value: stats.admins, icon: FaChartLine, color: 'from-green-500 to-green-600' },
                ].map((stat, idx) => (
                    <div key={idx} className={`relative overflow-hidden rounded-2xl p-6 text-white shadow-xl bg-gradient-to-br ${stat.color} transition transform hover:-translate-y-1`}>
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <p className="text-sm font-medium opacity-90">{stat.label}</p>
                                <h3 className="text-4xl font-bold mt-2">{stat.value}</h3>
                            </div>
                            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                                <stat.icon size={24} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity / Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-800">User Management</h3>
                        <button onClick={fetchUsers} className="text-indigo-600 text-sm font-medium hover:underline">Refresh</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-800 font-medium">
                                <tr>
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Joined Date</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50/50">
                                        <td className="p-4 font-medium text-gray-900">{user.name}</td>
                                        <td className="p-4">{user.email}</td>
                                        <td className="p-4 capitalize">{user.role_name.replace('_', ' ')}</td>
                                        <td className="p-4">{new Date(user.created_at).toLocaleDateString()}</td>
                                        <td className="p-4">
                                            {user.is_active ? (
                                                <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">Active</span>
                                            ) : (
                                                <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold">Pending</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => toggleStatus(user.id, user.is_active)}
                                                className={`flex items-center gap-1 px-3 py-1 rounded shadow text-xs font-bold text-white transition ${user.is_active ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                                            >
                                                {user.is_active ? <><FaTimes /> Deactivate</> : <><FaCheck /> Approve</>}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
