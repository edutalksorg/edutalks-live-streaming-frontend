import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FaBook, FaVideo, FaUsers, FaBell, FaCheck, FaChalkboardTeacher, FaUserClock, FaUserTie, FaClipboardList } from 'react-icons/fa';
import { useModal } from '../../context/ModalContext';
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
    const { showAlert, showConfirm } = useModal();
    const { } = useContext(AuthContext)!;
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [stats, setStats] = useState<Stats>({ totalStudents: 0, totalInstructors: 0 });
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [pendingInstructors, setPendingInstructors] = useState<User[]>([]);
    const [className, setClassName] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'pending' | 'users' | 'allocation' | 'batches'>('overview');

    const [showLiveModal, setShowLiveModal] = useState(false);
    const [liveTitle, setLiveTitle] = useState('');
    const [liveSubjectId, setLiveSubjectId] = useState('');

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
    }, [activeTab]);

    const handleApprove = async (id: number) => {
        const confirmed = await showConfirm("Approve this instructor?", 'warning');
        if (!confirmed) return;
        try {
            await api.post('/api/super-instructor/approve-instructor', { instructorId: id });
            showAlert("Instructor Approved!", 'success');
            fetchData();
        } catch (err) {
            showAlert("Failed to approve", 'error');
        }
    };



    const handleStartImmediate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/api/super-instructor/classes/start-immediate', {
                title: liveTitle,
                subject_id: liveSubjectId || null
            });
            navigate(`/super-instructor/classroom/${res.data.id}`);
        } catch (err) {
            console.error("Failed to start live class:", err);
            showAlert("Failed to start live class", 'error');
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-[60vh] text-primary lg:text-3xl font-black uppercase tracking-[0.4em] italic animate-pulse">Loading Premium Dashboard...</div>;

    if (!className) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="bg-primary/10 border-2 border-primary/20 rounded-[3rem] p-20 text-center max-w-2xl shadow-2xl backdrop-blur-3xl animate-fadeIn">
                <FaVideo size={80} className="mx-auto text-primary mb-8 animate-pulse" />
                <h3 className="text-3xl font-black text-accent-white mb-4 italic tracking-tight uppercase">Access Restricted</h3>
                <p className="text-accent-gray text-lg font-medium italic opacity-70">No Class Assigned to you. Please contact Admin to start managing students.</p>
            </div>
        </div>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {[
                            { label: 'Total Students', value: stats.totalStudents, icon: FaUsers, accent: 'text-accent-blue', border: 'border-accent-blue', tab: 'users' },
                            { label: 'Active Instructors', value: stats.totalInstructors, icon: FaChalkboardTeacher, accent: 'text-accent-purple', border: 'border-accent-purple', tab: 'users' },
                            { label: 'Pending Approvals', value: pendingInstructors.length, icon: FaBell, accent: 'text-primary', border: 'border-primary', tab: 'pending' },
                            { label: 'Total Subjects', value: subjects.length, icon: FaBook, accent: 'text-accent-emerald', border: 'border-accent-emerald', tab: 'allocation' },
                        ].map((item, i) => (
                            <div
                                key={i}
                                onClick={() => setActiveTab(item.tab as any)}
                                className={`relative overflow-hidden bg-surface p-8 rounded-[2rem] shadow-premium border-l-8 ${item.border} border border-surface-border transition-all hover:-translate-y-2 hover:shadow-premium-hover cursor-pointer group`}
                            >
                                <div className="flex justify-between items-start relative z-10">
                                    <div>
                                        <p className="text-[10px] font-black text-accent-gray uppercase tracking-widest mb-2 group-hover:text-accent-white transition-colors">{item.label}</p>
                                        <h3 className={`text-4xl font-black italic tracking-tighter ${item.accent}`}>{item.value}</h3>
                                    </div>
                                    <div className={`p-4 rounded-2xl bg-surface-light ${item.accent} shadow-xl border border-surface-border group-hover:rotate-12 transition-transform`}>
                                        <item.icon className="text-2xl" />
                                    </div>
                                </div>
                                <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors"></div>
                            </div>
                        ))}
                    </div>
                );
            case 'pending':
                return (
                    <div className="premium-card overflow-hidden animate-fadeIn">
                        <div className="p-6 md:p-10 border-b border-surface-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-light/30">
                            <h3 className="text-xl md:text-2xl font-black text-accent-white italic tracking-tight">Pending Instructor <span className="text-primary italic">Approvals</span></h3>
                            <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse shadow-lg">{pendingInstructors.length} Pending Actions</span>
                        </div>
                        {pendingInstructors.length === 0 ? (
                            <div className="p-20 md:p-32 text-center text-accent-gray italic font-black uppercase tracking-[0.3em] opacity-30 text-[10px]">No pending requests at the moment.</div>
                        ) : (
                            <>
                                {/* Mobile View - Cards */}
                                <div className="md:hidden space-y-4 p-4">
                                    {pendingInstructors.map(inst => (
                                        <div key={inst.id} className="bg-surface-dark/50 p-6 rounded-[1.5rem] border border-surface-border shadow-lg">
                                            <div className="mb-4">
                                                <h4 className="font-black text-accent-white italic text-lg">{inst.name}</h4>
                                                <p className="text-sm text-accent-gray italic opacity-70 break-all">{inst.email}</p>
                                            </div>
                                            <div className="flex justify-between items-center mb-6 pt-4 border-t border-surface-border/50">
                                                <span className="text-[10px] font-black text-accent-gray uppercase tracking-widest opacity-50">Phone</span>
                                                <span className="text-xs text-accent-white italic font-medium">{inst.phone || 'N/A'}</span>
                                            </div>
                                            <button
                                                onClick={() => handleApprove(inst.id)}
                                                className="btn-primary w-full py-4 rounded-xl shadow-lg shadow-primary/30 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3"
                                            >
                                                <FaCheck /> Approve Instructor
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop View - Table */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-left text-sm text-accent-gray">
                                        <thead className="bg-surface-dark text-accent-white font-black uppercase text-[10px] tracking-[0.2em]">
                                            <tr>
                                                <th className="p-8">Name</th><th className="p-8">Email</th><th className="p-8">Phone</th><th className="p-8 text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-surface-border">
                                            {pendingInstructors.map(inst => (
                                                <tr key={inst.id} className="hover:bg-primary/5 transition-colors group">
                                                    <td className="p-8 font-black text-accent-white italic text-lg">{inst.name}</td>
                                                    <td className="p-8 opacity-70 italic">{inst.email}</td>
                                                    <td className="p-8 italic font-medium">{inst.phone || '-'}</td>
                                                    <td className="p-8 text-center">
                                                        <button onClick={() => handleApprove(inst.id)} className="btn-primary px-8 py-3 rounded-xl shadow-lg shadow-primary/30 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 mx-auto">
                                                            <FaCheck /> Approve User
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                );
            case 'users':
                return <SuperInstructorUsers onRefresh={fetchData} />;
            case 'allocation':
                return <SuperInstructorAllocation />;
            case 'batches':
                return <BatchManagement />;
            default: return null;
        }
    }

    return (
        <div className={`space-y-8 min-h-screen p-4 md:p-12 transition-colors duration-500 ${theme === 'dark' ? 'dark' : ''}`}>
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-8 mb-16">
                <div>
                    <h2 className="text-5xl font-black text-accent-white tracking-tighter italic">Super Instructor <span className="text-gradient-red italic">Dashboard</span></h2>
                    <p className="text-accent-gray mt-3 font-black uppercase tracking-[0.4em] text-[10px] opacity-60 italic">
                        Managing <span className="text-primary">Grade {className}</span> Academic Ecosystem
                    </p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-4 border-b border-surface-border pb-1 mb-16 overflow-x-auto no-scrollbar scroll-smooth">
                {[
                    { id: 'overview', label: 'Overview', icon: FaBook },
                    { id: 'pending', label: 'Approvals', icon: FaUserClock },
                    { id: 'users', label: 'Users', icon: FaUserTie },
                    { id: 'allocation', label: 'Subject Allocation', icon: FaCheck },
                    { id: 'batches', label: 'Batches', icon: FaClipboardList },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-4 px-10 py-5 rounded-t-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-primary text-white shadow-premium scale-105 active:scale-95' : 'text-accent-gray hover:text-accent-white hover:bg-surface-light/30'}`}
                    >
                        <tab.icon size={18} /> {tab.label}
                        {tab.id === 'pending' && pendingInstructors.length > 0 && <span className="bg-white text-primary text-[10px] px-2.5 py-1 rounded-full font-black animate-bounce ml-3 shadow-lg">{pendingInstructors.length}</span>}
                    </button>
                ))}
            </div>

            <div className="min-h-[600px] animate-fadeIn">
                {renderTabContent()}
            </div>

            {/* Start Live Modal */}
            {showLiveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-surface-dark/95 backdrop-blur-xl animate-in fade-in zoom-in duration-300">
                    <div className="premium-card p-10 max-w-lg w-full border-surface-border shadow-[0_0_100px_rgba(238,29,35,0.1)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary-hover"></div>
                        <h3 className="text-2xl font-black text-accent-white italic tracking-tighter uppercase mb-8">INITIATE <span className="text-primary">IMMEDIATE SESSION</span></h3>

                        <form onSubmit={handleStartImmediate} className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-accent-gray uppercase tracking-[0.3em] opacity-40">SESSION TITLE</label>
                                <input
                                    type="text" placeholder="e.g. Doubts Clearing Session" required
                                    className="w-full bg-surface-light border-2 border-surface-border rounded-xl p-4 text-accent-white font-medium italic focus:border-primary outline-none transition-all"
                                    value={liveTitle} onChange={e => setLiveTitle(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-accent-gray uppercase tracking-[0.3em] opacity-40">SELECT SUBJECT</label>
                                <select
                                    className="w-full bg-surface-light border-2 border-surface-border rounded-xl p-4 text-accent-white font-medium italic focus:border-primary outline-none transition-all"
                                    value={liveSubjectId} onChange={e => setLiveSubjectId(e.target.value)}
                                >
                                    <option value="">General (All subjects)</option>
                                    {subjects.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowLiveModal(false)}
                                    className="px-8 py-4 text-[10px] font-black text-accent-gray uppercase tracking-widest hover:text-white transition-colors"
                                >
                                    ABORT
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary px-10 py-4 rounded-xl shadow-lg shadow-primary/20"
                                >
                                    <span className="tracking-[0.2em] font-black uppercase text-[10px]">GO LIVE NOW</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperInstructorDashboard;
