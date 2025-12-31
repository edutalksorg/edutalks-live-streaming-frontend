import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { FaUserGraduate, FaChalkboardTeacher, FaCheck, FaUsers } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import { useModal } from '../../context/ModalContext';

interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    is_active: number | boolean;
    created_at: string;
}

const SuperInstructorUsers: React.FC = () => {
    const { theme } = useTheme();
    const { showAlert, showConfirm } = useModal();
    const [activeTab, setActiveTab] = useState<'instructors' | 'students'>('instructors');
    const [instructors, setInstructors] = useState<User[]>([]);
    const [students, setStudents] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [instRes, studRes] = await Promise.all([
                api.get('/api/super-instructor/instructors'),
                api.get('/api/super-instructor/students')
            ]);
            setInstructors(instRes.data);
            setStudents(studRes.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch user data", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApprove = async (id: number) => {
        const confirmed = await showConfirm("Approve this instructor?", "warning", "Approve Instructor");
        if (!confirmed) return;
        try {
            await api.post('/api/super-instructor/approve-instructor', { instructorId: id });
            showAlert("Instructor Approved!", "success");
            fetchData();
        } catch (err) {
            showAlert("Failed to approve", "error");
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-[400px] text-primary font-black uppercase tracking-[0.4em] animate-pulse italic">Accessing User Ecosystem...</div>;

    return (
        <div className={`space-y-8 animate-fadeIn transition-colors duration-500 ${theme === 'dark' ? 'dark' : ''}`}>
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 premium-card p-10">
                <div className="flex items-center gap-6">
                    <div className="p-5 bg-primary/10 rounded-[2rem] border border-primary/20 shadow-glow">
                        <FaUsers size={32} className="text-primary" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-accent-white italic tracking-tighter">User <span className="text-primary">Ecosystem</span></h2>
                        <p className="text-accent-gray mt-1 font-black uppercase tracking-[0.4em] text-[10px] opacity-60">Complete management of grade-level human resources</p>
                    </div>
                </div>

                <div className="flex p-2 bg-surface-dark rounded-[2rem] border border-surface-border shadow-2xl">
                    {[
                        { id: 'instructors', label: 'Instructors', icon: FaChalkboardTeacher },
                        { id: 'students', label: 'Students', icon: FaUserGraduate }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-4 px-10 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === tab.id
                                ? 'bg-primary text-white shadow-xl shadow-primary/20 active:scale-95 translate-y-[-2px]'
                                : 'text-accent-gray hover:text-accent-white hover:bg-surface-light/50'
                                }`}
                        >
                            <tab.icon size={14} /> {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="premium-card overflow-hidden animate-fadeIn min-h-[500px]">
                <div className="p-8 border-b border-surface-border bg-surface-light/30 flex justify-between items-center">
                    <h3 className="text-2xl font-black text-accent-white italic tracking-tight flex items-center gap-4">
                        {activeTab === 'instructors' ? <FaChalkboardTeacher className="text-primary" /> : <FaUserGraduate className="text-primary" />}
                        {activeTab === 'instructors' ? 'Academic' : 'Learning'} <span className="text-primary italic">Cohort</span>
                    </h3>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-accent-gray uppercase tracking-widest opacity-60 italic">Displaying</span>
                        <span className="bg-primary/10 text-primary border border-primary/20 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                            {activeTab === 'instructors' ? instructors.length : students.length} Active Nodes
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-accent-gray">
                        <thead className="bg-surface-dark text-accent-white font-black uppercase text-[10px] tracking-[0.2em]">
                            <tr>
                                <th className="p-8">Identification</th>
                                <th className="p-8">Communication</th>
                                <th className="p-8">Phone</th>
                                <th className="p-8">Status</th>
                                {activeTab === 'instructors' && <th className="p-8 text-center">Protocol</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-border">
                            {(activeTab === 'instructors' ? instructors : students).map(user => (
                                <tr key={user.id} className="hover:bg-primary/5 transition-colors group">
                                    <td className="p-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 rounded-2xl bg-surface-dark border border-surface-border flex items-center justify-center font-black text-accent-white italic shadow-lg group-hover:border-primary/30 transition-all">
                                                {user.name.charAt(0)}
                                            </div>
                                            <p className="font-black text-accent-white italic text-lg tracking-tight group-hover:text-primary transition-colors">{user.name}</p>
                                        </div>
                                    </td>
                                    <td className="p-8 italic font-medium opacity-80">{user.email}</td>
                                    <td className="p-8 italic font-black text-[10px] tracking-widest">{user.phone || 'N/A'}</td>
                                    <td className="p-8">
                                        {user.is_active ?
                                            <span className="text-emerald-500 font-black text-[10px] bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-2 w-fit shadow-md">
                                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Verified Node
                                            </span>
                                            : <span className="text-amber-500 font-black text-[10px] bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-2 w-fit shadow-md">
                                                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></div> Pending Review
                                            </span>
                                        }
                                    </td>
                                    {activeTab === 'instructors' && (
                                        <td className="p-8 text-center">
                                            {!user.is_active ? (
                                                <button onClick={() => handleApprove(user.id)} className="btn-primary px-8 py-3 rounded-xl shadow-lg shadow-primary/30 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 mx-auto">
                                                    Authorize <FaCheck />
                                                </button>
                                            ) : (
                                                <span className="text-accent-gray text-[9px] font-black uppercase tracking-widest italic opacity-30">Already Authorized</span>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {(activeTab === 'instructors' ? instructors : students).length === 0 && (
                                <tr>
                                    <td colSpan={activeTab === 'instructors' ? 5 : 4} className="p-32 text-center text-accent-gray italic font-black uppercase tracking-[0.4em] opacity-30 text-[10px]">
                                        Ecosystem Cohort Empty.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SuperInstructorUsers;
