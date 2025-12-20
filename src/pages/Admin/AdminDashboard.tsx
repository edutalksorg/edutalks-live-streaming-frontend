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
    grade?: string;
}

const AdminDashboard: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        superInstructors: 0,
        instructors: 0,
        students: 0,
        pending: 0,
        admins: 0
    });

    const [filterRole, setFilterRole] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            const [superInstRes, instRes, studRes] = await Promise.all([
                api.get('/api/admin/super-instructors'),
                api.get('/api/admin/instructors'),
                api.get('/api/admin/students')
            ]);

            const superInstructors = superInstRes.data.map((u: any) => ({ ...u, role_name: 'super_instructor' }));
            const instructors = instRes.data.map((u: any) => ({ ...u, role_name: 'instructor' }));
            const students = studRes.data.map((u: any) => ({ ...u, role_name: 'student' }));

            const allUsers = [...superInstructors, ...instructors, ...students];
            setUsers(allUsers);

            // Calculate Stats
            const superInstructorCount = superInstructors.length;
            const instructorCount = instructors.length;
            const studentCount = students.length;
            const pendingCount = allUsers.filter(u => !u.is_active).length;
            // Admin count is not available via these endpoints, setting to 0 or removing
            const adminCount = 0;

            setStats({ superInstructors: superInstructorCount, instructors: instructorCount, students: studentCount, pending: pendingCount, admins: adminCount });
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
        // If already active, we might want to deactivate. But adminController only has approve.
        // We will use approve endpoint for approval.
        if (currentStatus) {
            alert("Deactivation is not currently supported via this dashboard.");
            return;
        }

        if (!window.confirm(`Are you sure you want to Approve this user?`)) return;

        try {
            await api.put(`/api/admin/approve/${id}`);
            alert(`User Approved successfully!`);
            fetchUsers(); // Refresh data
        } catch (err) {
            console.error("Failed to update status", err);
            alert("Failed to approve user.");
        }
    };

    if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>;

    const filteredUsers = filterRole
        ? users.filter(u => filterRole === 'pending' ? !u.is_active : u.role_name === filterRole)
        : users;

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
                    { label: 'Total Super Instructors', value: stats.superInstructors, icon: FaChalkboardTeacher, color: 'from-purple-500 to-purple-600', filter: 'super_instructor' },
                    { label: 'Total Instructors', value: stats.instructors, icon: FaChalkboardTeacher, color: 'from-blue-500 to-blue-600', filter: 'instructor' },
                    { label: 'Total Students', value: stats.students, icon: FaUserGraduate, color: 'from-indigo-500 to-indigo-600', filter: 'student' },
                    { label: 'Pending Requests', value: stats.pending, icon: FaVideo, color: 'from-red-500 to-red-600', filter: 'pending' },
                ].map((stat, idx) => (
                    <div
                        key={idx}
                        onClick={() => setFilterRole(stat.filter === filterRole ? null : stat.filter)}
                        className={`relative overflow-hidden rounded-2xl p-6 text-white shadow-xl bg-gradient-to-br ${stat.color} transition transform hover:-translate-y-1 cursor-pointer ${filterRole === stat.filter ? 'ring-4 ring-offset-2 ring-indigo-500' : ''}`}
                    >
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
                        <h3 className="text-lg font-bold text-gray-800">
                            {filterRole ? `${filterRole.replace('_', ' ').charAt(0).toUpperCase() + filterRole.replace('_', ' ').slice(1)} List` : 'All Users'}
                        </h3>
                        <button onClick={() => { fetchUsers(); setFilterRole(null); }} className="text-indigo-600 text-sm font-medium hover:underline">Reset & Refresh</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-800 font-medium">
                                <tr>
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Grade</th>
                                    <th className="p-4">Joined Date</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50/50">
                                        <td className="p-4 font-medium text-gray-900">{user.name}</td>
                                        <td className="p-4">{user.email}</td>
                                        <td className="p-4 capitalize">{user.role_name.replace('_', ' ')}</td>
                                        <td className="p-4">{user.grade || '-'}</td>
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
