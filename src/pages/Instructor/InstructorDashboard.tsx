import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaVideo, FaClipboardList, FaUsers, FaMedal, FaBookOpen } from 'react-icons/fa';
import api from '../../services/api';

const InstructorDashboard: React.FC = () => {
    const { user } = useContext(AuthContext)!;
    const { theme } = useTheme();
    const [stats, setStats] = useState({ totalStudents: 0, classesCount: 0, activeExams: 0, pendingReviews: 0 });
    const [batches, setBatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [showLiveModal, setShowLiveModal] = useState(false);
    const [liveTitle, setLiveTitle] = useState('');
    const [liveSubjectId, setLiveSubjectId] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const res = await api.get('/api/instructor/dashboard');
            setStats(res.data.stats);
            setBatches(res.data.batches);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartImmediate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/api/classes/start-immediate', {
                title: liveTitle,
                subject_id: liveSubjectId || batches[0]?.subject_id
            });
            navigate(`/instructor/live/${res.data.id}`);
        } catch (err) {
            console.error("Failed to start immediate class", err);
            alert("Failed to start class. Please try again.");
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-[400px] text-primary LG:text-3xl font-black uppercase tracking-widest animate-pulse italic">Accessing Instructor Portal...</div>;

    return (
        <div className={`max-w-7xl mx-auto transition-colors duration-500 ${theme === 'dark' ? 'dark' : ''}`}>
            <header className="mb-10">
                <h2 className="text-4xl font-extrabold text-gradient-red mb-2 italic tracking-tight">
                    Welcome back, {user?.name}
                </h2>
                <p className="text-accent-gray font-black uppercase tracking-[0.2em] text-[10px] opacity-70 italic">Manage your batches, conduct live classes, and review students.</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[
                    { label: 'Assigned Students', value: stats.totalStudents, icon: FaUsers, accent: 'text-accent-blue', border: 'border-accent-blue', link: '/instructor/students' },
                    { label: 'Classes Conducted', value: stats.classesCount, icon: FaVideo, accent: 'text-accent-purple', border: 'border-accent-purple', link: '/instructor/classes' },
                    { label: 'Active Exams', value: stats.activeExams, icon: FaClipboardList, accent: 'text-accent-emerald', border: 'border-accent-emerald', link: '/instructor/exams' },
                    { label: 'Pending Reviews', value: stats.pendingReviews, icon: FaMedal, accent: 'text-primary', border: 'border-primary', link: '/instructor/exams' },
                ].map((item, i) => (
                    <Link to={item.link} key={i} className="block h-full">
                        <div className={`relative overflow-hidden bg-surface p-8 rounded-[2rem] shadow-premium border-l-8 ${item.border} border border-surface-border transition-all hover:-translate-y-2 hover:shadow-premium-hover group h-full`}>
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
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* My Batches */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="premium-card p-8 bg-surface-light/30">
                        <h3 className="text-2xl font-black text-accent-white flex items-center gap-3 italic tracking-tight">
                            <span className="w-2 h-8 bg-primary rounded-full shadow-primary-glow"></span>
                            My Assigned Batches
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {batches.length > 0 ? batches.map((batch: any) => (
                            <div key={batch.id} className="group bg-surface p-10 rounded-[2.5rem] shadow-premium hover:shadow-premium-hover hover:border-primary/30 transition-all border border-surface-border relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors"></div>
                                <h4 className="font-black text-2xl text-accent-white mb-2 relative z-10 italic tracking-tight">{batch.name}</h4>
                                <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-6 relative z-10 italic">{batch.subject_name}</p>
                                <div className="flex justify-between items-center relative z-10 pt-4 border-t border-surface-border">
                                    <div className="text-[10px] text-accent-gray font-black uppercase tracking-widest">
                                        <span className="text-accent-white font-black text-lg mr-1">{batch.student_count}</span> Students
                                    </div>
                                    <Link to={`/instructor/students?batchId=${batch.id}`} className="text-[9px] bg-surface-dark hover:bg-primary hover:text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-widest transition-all border border-surface-border hover:border-primary/50 text-accent-gray">
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-2 bg-surface-dark/50 border-2 border-dashed border-surface-border rounded-[2.5rem] p-20 text-center">
                                <p className="text-accent-gray font-black uppercase tracking-[0.4em] text-[10px] italic opacity-50">No batches assigned yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions & Live */}
                <div className="space-y-6">
                    <div className="bg-primary/10 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-primary/20 shadow-premium relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform -rotate-12 translate-x-4 -translate-y-4">
                            <FaVideo size={180} />
                        </div>
                        <h3 className="text-3xl font-black text-accent-white mb-3 italic tracking-tighter">Go Live <span className="text-primary">Now</span></h3>
                        <p className="text-accent-gray text-base mb-10 font-medium italic leading-relaxed">Conduct a session for your assigned students and answer doubts in real-time.</p>
                        <button
                            onClick={() => setShowLiveModal(true)}
                            className="btn-primary w-full text-center py-4 shadow-xl shadow-primary/30 text-[10px] font-black tracking-widest uppercase"
                        >
                            Start Streaming
                        </button>
                    </div>

                    <div className="premium-card p-10">
                        <h3 className="text-xl font-black text-accent-white mb-8 flex items-center gap-3 italic tracking-tight">
                            <span className="w-1.5 h-6 bg-accent-white/20 rounded-full"></span>
                            Quick Actions
                        </h3>
                        <div className="space-y-4">
                            <p className="text-accent-gray text-[10px] font-black uppercase tracking-widest italic mb-8 opacity-70">Connect with students and share notes to help them prepare for exams.</p>
                            <Link to="/instructor/notes" className="flex items-center gap-6 p-6 rounded-[1.5rem] border border-surface-border hover:border-primary/20 hover:bg-primary/5 transition-all group">
                                <div className="p-4 bg-surface-dark text-accent-gray group-hover:bg-primary group-hover:text-white rounded-2xl transition-all shadow-xl group-hover:rotate-6">
                                    <FaBookOpen size={20} />
                                </div>
                                <span className="font-black text-accent-white text-[10px] uppercase tracking-widest group-hover:text-primary transition-colors">Upload Study Material</span>
                            </Link>
                        </div>
                    </div>
                </div>
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
                                    value={liveSubjectId} onChange={e => setLiveSubjectId(e.target.value)} required
                                >
                                    <option value="">Choose a subject...</option>
                                    {batches.map(b => (
                                        <option key={b.id} value={b.subject_id}>{b.subject_name}</option>
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

export default InstructorDashboard;
