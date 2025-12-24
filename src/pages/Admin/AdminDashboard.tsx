import React, { useEffect, useState } from 'react';
import { FaChalkboardTeacher, FaUserGraduate, FaVideo, FaBell, FaCheck, FaTimes } from 'react-icons/fa';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

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
    const { theme } = useTheme();
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
        const isActive = Boolean(currentStatus);
        const action = isActive ? 'deactivate' : 'approve';
        const actionText = isActive ? 'Deactivate' : 'Approve';

        if (!window.confirm(`Are you sure you want to ${actionText.toLowerCase()} this user?`)) return;

        try {
            const endpoint = isActive ? `/api/admin/deactivate/${id}` : `/api/admin/approve/${id}`;
            await api.put(endpoint);
            alert(`User ${actionText.toLowerCase()}d successfully!`);
            fetchUsers(); // Refresh data
        } catch (err) {
            console.error(`Failed to ${action} user`, err);
            alert(`Failed to ${action} user.`);
        }
    };

    if (loading) return <div className="p-10 text-center text-primary font-black uppercase lg:text-3xl italic animate-pulse">Loading Premium Dashboard...</div>;

    const filteredUsers = filterRole
        ? users.filter(u => filterRole === 'pending' ? !u.is_active : u.role_name === filterRole)
        : users;

    return (
        <div className={`space-y-8 transition-colors duration-500 ${theme === 'dark' ? 'dark' : ''}`}>
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-extrabold text-accent-white tracking-tight italic">Admin <span className="text-primary italic">Dashboard</span></h2>
                <div className="flex items-center gap-3 text-sm text-accent-gray italic font-medium">
                    <span>Last updated: just now</span>
                    <button className="p-2 bg-surface rounded-full shadow-premium border border-surface-border hover:bg-surface-light hover:text-primary transition-all"><FaBell /></button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Super Instructors', value: stats.superInstructors, icon: FaChalkboardTeacher, border: 'border-accent-purple', accent: 'text-accent-purple', filter: 'super_instructor' },
                    { label: 'Total Instructors', value: stats.instructors, icon: FaChalkboardTeacher, border: 'border-accent-blue', accent: 'text-accent-blue', filter: 'instructor' },
                    { label: 'Total Students', value: stats.students, icon: FaUserGraduate, border: 'border-accent-indigo', accent: 'text-accent-indigo', filter: 'student' },
                    { label: 'Pending Requests', value: stats.pending, icon: FaVideo, border: 'border-primary', accent: 'text-primary', filter: 'pending' },
                ].map((stat, idx) => (
                    <div
                        key={idx}
                        onClick={() => setFilterRole(stat.filter === filterRole ? null : stat.filter)}
                        className={`relative overflow-hidden rounded-[2rem] p-8 shadow-premium bg-surface border-l-8 ${stat.border} border border-surface-border transition transform hover:-translate-y-2 cursor-pointer ${filterRole === stat.filter ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-105 active:scale-95' : 'hover:shadow-premium-hover'}`}
                    >
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors"></div>
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-gray mb-3">{stat.label}</p>
                                <h3 className={`text-4xl font-black mt-2 italic tracking-tighter ${stat.accent}`}>{stat.value}</h3>
                            </div>
                            <div className={`p-5 bg-surface-light rounded-3xl border border-surface-border shadow-xl`}>
                                <stat.icon size={28} className={stat.accent} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity / Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-3 premium-card overflow-hidden">
                    <div className="p-8 border-b border-surface-border flex justify-between items-center bg-surface-light/30">
                        <h3 className="text-xl font-black text-accent-white italic">
                            {filterRole ? `${filterRole.replace('_', ' ').charAt(0).toUpperCase() + filterRole.replace('_', ' ').slice(1)} List` : 'All Users'}
                        </h3>
                        <button onClick={() => { fetchUsers(); setFilterRole(null); }} className="text-primary text-[10px] font-black hover:underline tracking-widest uppercase italic">Reset & Refresh</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-accent-gray">
                            <thead className="bg-surface-dark text-accent-white font-black uppercase tracking-widest text-[10px]">
                                <tr>
                                    <th className="p-6">Name</th>
                                    <th className="p-6">Email</th>
                                    <th className="p-6">Role</th>
                                    <th className="p-6">Grade</th>
                                    <th className="p-6">Joined Date</th>
                                    <th className="p-6">Status</th>
                                    <th className="p-6">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-border">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-primary/5 transition-colors group">
                                        <td className="p-6 font-black text-accent-white italic">{user.name}</td>
                                        <td className="p-6 opacity-70 italic">{user.email}</td>
                                        <td className="p-6 capitalize">
                                            <span className="px-3 py-1 rounded-full bg-surface-dark border border-surface-border text-[9px] uppercase font-black tracking-widest text-accent-gray">
                                                {user.role_name.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="p-6 font-bold">{user.grade || '-'}</td>
                                        <td className="p-6 italic">{new Date(user.created_at).toLocaleDateString()}</td>
                                        <td className="p-6">
                                            {user.is_active ? (
                                                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">Active</span>
                                            ) : (
                                                <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest border border-amber-500/20 animate-pulse">Pending</span>
                                            )}
                                        </td>
                                        <td className="p-6">
                                            <button
                                                onClick={() => toggleStatus(user.id, user.is_active)}
                                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl shadow-lg text-[10px] font-black uppercase tracking-widest transition transform hover:scale-105 active:scale-95 ${user.is_active ? 'bg-surface-dark border border-surface-border hover:border-primary/50 text-accent-gray cursor-not-allowed opacity-50' : 'bg-primary text-white hover:bg-primary-hover shadow-primary/30'}`}
                                            >
                                                {user.is_active ? <><FaTimes /> Active</> : <><FaCheck /> Approve</>}
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
