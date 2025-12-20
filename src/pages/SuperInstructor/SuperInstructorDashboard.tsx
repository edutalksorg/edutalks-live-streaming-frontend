
import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { FaChalkboardTeacher, FaUserGraduate, FaBook, FaCheck, FaVideo, FaUsers, FaUserClock, FaUserTie, FaClipboardList } from 'react-icons/fa';
import SuperInstructorAllocation from './SuperInstructorAllocation';
import SuperInstructorUsers from './SuperInstructorUsers';
import BatchManagement from '../Instructor/BatchManagement';

interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    is_active: number | boolean;
    created_at: string;
}

interface Subject {
    id: number;
    name: string;
    instructors: User[];
}

interface Stats {
    totalStudents: number;
    totalInstructors: number;
}

const SuperInstructorDashboard: React.FC = () => {
    const { user } = useContext(AuthContext)!;
    const [stats, setStats] = useState<Stats>({ totalStudents: 0, totalInstructors: 0 });
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [pendingInstructors, setPendingInstructors] = useState<User[]>([]);
    const [className, setClassName] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'pending' | 'users' | 'allocation' | 'batches' | 'live'>('overview');

    const fetchData = async () => {
        try {
            const [dashRes, pendingRes] = await Promise.all([
                api.get('/api/super-instructor/dashboard'),
                api.get('/api/super-instructor/pending-instructors')
            ]);

            setClassName(dashRes.data.className);
            setStats(dashRes.data.stats || { totalStudents: 0, totalInstructors: 0 });
            setSubjects(dashRes.data.subjects || []);
            setPendingInstructors(pendingRes.data);
            setLoading(false);
        } catch (err: any) {
            console.error("Failed to fetch dashboard data", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApprove = async (id: number) => {
        if (!window.confirm("Approve this instructor?")) return;
        try {
            await api.post('/api/super-instructor/approve-instructor', { instructorId: id });
            alert("Instructor Approved!");
            fetchData();
        } catch (err) {
            alert("Failed to approve");
        }
    };



    if (loading) return <div className="p-10 text-center font-bold text-gray-500">Loading Dashboard...</div>;

    if (!className) return <div className="p-10 text-center text-red-600 font-bold border rounded-xl bg-red-50 m-4">No Class Assigned to you. Please contact Admin.</div>;

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
                        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-indigo-500 flex items-center justify-between hover:scale-105 transition">
                            <div>
                                <p className="text-gray-500 text-sm font-semibold uppercase">Total Students</p>
                                <h3 className="text-3xl font-extrabold text-indigo-600">{stats.totalStudents}</h3>
                            </div>
                            <div className="p-3 bg-indigo-50 rounded-full"><FaUserGraduate size={24} className="text-indigo-500" /></div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500 flex items-center justify-between hover:scale-105 transition">
                            <div>
                                <p className="text-gray-500 text-sm font-semibold uppercase">Active Instructors</p>
                                <h3 className="text-3xl font-extrabold text-purple-600">{stats.totalInstructors}</h3>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-full"><FaChalkboardTeacher size={24} className="text-purple-500" /></div>
                        </div>
                        <div onClick={() => setActiveTab('pending')} className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-500 flex items-center justify-between hover:scale-105 transition cursor-pointer">
                            <div>
                                <p className="text-gray-500 text-sm font-semibold uppercase">Pending Approvals</p>
                                <h3 className="text-3xl font-extrabold text-yellow-600">{pendingInstructors.length}</h3>
                            </div>
                            <div className="p-3 bg-yellow-50 rounded-full"><FaUserClock size={24} className="text-yellow-500" /></div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500 flex items-center justify-between hover:scale-105 transition">
                            <div>
                                <p className="text-gray-500 text-sm font-semibold uppercase">Total Subjects</p>
                                <h3 className="text-3xl font-extrabold text-green-600">{subjects.length}</h3>
                            </div>
                            <div className="p-3 bg-green-50 rounded-full"><FaBook size={24} className="text-green-500" /></div>
                        </div>
                    </div>
                );
            case 'pending':
                return (
                    <div className="bg-white rounded-xl shadow overflow-hidden animate-fadeIn">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800">Pending Instructor Approvals</h3>
                            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold">{pendingInstructors.length} Pending</span>
                        </div>
                        {pendingInstructors.length === 0 ? (
                            <div className="p-10 text-center text-gray-400 italic">No pending requests.</div>
                        ) : (
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 text-gray-700 font-bold uppercase text-xs">
                                    <tr>
                                        <th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Phone</th><th className="p-4 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {pendingInstructors.map(inst => (
                                        <tr key={inst.id} className="hover:bg-gray-50">
                                            <td className="p-4 font-medium text-gray-900">{inst.name}</td>
                                            <td className="p-4">{inst.email}</td>
                                            <td className="p-4">{inst.phone || '-'}</td>
                                            <td className="p-4 text-center">
                                                <button onClick={() => handleApprove(inst.id)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-full shadow text-xs font-bold transition flex items-center gap-1 mx-auto">
                                                    <FaCheck /> Approve
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                );
            case 'users':
                return <SuperInstructorUsers />;
            case 'allocation':
                return <SuperInstructorAllocation />;
            case 'batches':
                return <BatchManagement />;
            case 'live':
                return (
                    <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-xl shadow-xl p-8 text-white text-center flex flex-col items-center justify-center animate-fadeIn min-h-[400px]">
                        <div className="p-4 bg-white/20 backdrop-blur-md rounded-full mb-6">
                            <FaVideo size={48} className="text-white" />
                        </div>
                        <h3 className="text-3xl font-extrabold mb-4">Start a Live Broadcast</h3>
                        <p className="text-white/80 max-w-lg mb-8 text-lg">
                            Conduct a live session for your entire <b>Grade {className}</b>. Students will see this in their dashboard instantly.
                        </p>
                        <button className="bg-white text-red-600 px-8 py-3 rounded-full font-extrabold text-lg shadow-lg hover:scale-105 transition transform flex items-center gap-2">
                            Go Live Now <FaVideo />
                        </button>
                    </div>
                );
            default: return null;
        }
    }

    return (
        <div className="space-y-8 min-h-screen bg-gray-50/50 p-8">
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Super Instructor Dashboard</h2>
                    <p className="text-gray-500 mt-1">Managing <span className="font-bold text-indigo-600">Grade {className}</span></p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-1 mb-6">
                {[
                    { id: 'overview', label: 'Overview', icon: FaBook },
                    { id: 'pending', label: 'Approvals', icon: FaUserClock },
                    { id: 'users', label: 'Users', icon: FaUserTie },
                    { id: 'allocation', label: 'Subject Allocation', icon: FaCheck },
                    { id: 'batches', label: 'Batches', icon: FaClipboardList },
                    { id: 'live', label: 'Live Class', icon: FaVideo },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-t-lg text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-white text-indigo-600 border-b-2 border-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'} `}
                    >
                        <tab.icon /> {tab.label}
                        {tab.id === 'pending' && pendingInstructors.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{pendingInstructors.length}</span>}
                    </button>
                ))}
            </div>

            <div className="bg-white/50 rounded-xl p-4 min-h-[500px]">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default SuperInstructorDashboard;
