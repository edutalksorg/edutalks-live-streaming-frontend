import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { FaVideo, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface ClassSession {
    id: number;
    title: string;
    description: string;
    start_time: string;
    duration: number;
    status: 'scheduled' | 'live' | 'completed';
    agora_channel: string;
}

const InstructorClasses: React.FC = () => {
    const { user } = useContext(AuthContext)!;
    const [classes, setClasses] = useState<ClassSession[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [newClass, setNewClass] = useState({ title: '', description: '', start_time: '', duration: 60, subject_id: '' });
    const [batches, setBatches] = useState<any[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const res = await api.get(`/api/classes/instructor/${user?.id}`);
            setClasses(res.data);

            // Fetch batches to get subjects for scheduling
            const dashRes = await api.get('/api/instructor/dashboard');
            setBatches(dashRes.data.batches);
        } catch (err) {
            console.error('Failed to fetch classes or batches');
        }
    };

    const handleCreateClass = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/api/classes', { ...newClass, instructor_id: user?.id });
            setShowModal(false);
            fetchClasses();
        } catch (err) {
            console.error('Failed to create class');
        }
    };

    const startClass = async (classId: number) => {
        // Navigate to the Live Room
        navigate(`/instructor/live/${classId}`);
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-2xl md:text-4xl font-black text-accent-white italic tracking-tighter uppercase">MISSION <span className="text-gradient-red">SCHEDULER</span></h2>
                    <p className="text-accent-gray italic font-medium mt-1 md:mt-2 opacity-80 text-[10px] md:text-base">CONFIGURE AND EXECUTE LIVE EDUCATIONAL SORTIES</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary flex items-center gap-3 px-8 py-4 rounded-2xl group"
                >
                    <FaPlus className="group-hover:rotate-90 transition-transform duration-300" />
                    <span className="tracking-[0.2em] font-black uppercase text-[10px]">SCHEDULE SORTIE</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 md:gap-8">
                {classes.map(cls => (
                    <div key={cls.id} className="premium-card group hover:scale-[1.02] transition-all duration-500 border-surface-border p-6 lg:p-8">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-xl font-black text-accent-white italic tracking-tighter uppercase group-hover:text-primary transition-colors">{cls.title}</h3>
                            <div className="flex flex-col items-end">
                                <span className={`px-4 py-1 text-[8px] font-black uppercase tracking-widest rounded-full border ${cls.status === 'live' ? 'bg-primary/10 text-primary border-primary/20 animate-pulse' : 'bg-surface-light text-accent-emerald border-accent-emerald/20'}`}>
                                    {cls.status}
                                </span>
                            </div>
                        </div>

                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                            <span className="w-1 h-1 bg-primary rounded-full"></span> {new Date(cls.start_time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>

                        <p className="text-accent-gray text-sm italic font-medium mb-8 line-clamp-2 opacity-80">{cls.description}</p>

                        <div className="flex justify-between items-center pt-6 border-t border-surface-border/50">
                            <span className="text-[9px] font-black text-accent-gray uppercase tracking-widest opacity-70">DURATION: {cls.duration} MINS</span>

                            {cls.status !== 'completed' && (
                                <button
                                    onClick={() => startClass(cls.id)}
                                    className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-6 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 transform active:scale-95 border border-primary/20 group/btn"
                                >
                                    <FaVideo className="group-hover/btn:scale-110 transition-transform" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">{cls.status === 'live' ? 'RESUME' : 'INITIATE'}</span>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {classes.length === 0 && (
                    <div className="col-span-full py-32 text-center premium-card border-dashed border-surface-border/50">
                        <p className="text-accent-gray italic font-medium opacity-70 tracking-widest uppercase text-xs">No active missions scheduled in this sector.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-6 bg-surface-dark/95 backdrop-blur-xl animate-in fade-in zoom-in duration-300">
                    <div className="premium-card p-6 lg:p-10 max-w-lg w-full border-surface-border shadow-[0_0_100px_rgba(238,29,35,0.1)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary-hover"></div>

                        <h3 className="text-2xl font-black text-accent-white italic tracking-tighter uppercase mb-8">CONFIGURE <span className="text-primary">MISSION</span></h3>

                        <form onSubmit={handleCreateClass} className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-accent-gray uppercase tracking-[0.3em] opacity-70">MISSION TITLE</label>
                                <input
                                    type="text" placeholder="Title of the session" required
                                    className="w-full bg-surface-light border-2 border-surface-border rounded-xl p-4 text-accent-white font-medium italic focus:border-primary focus:shadow-[0_0_20px_rgba(238,29,35,0.05)] outline-none transition-all"
                                    value={newClass.title} onChange={e => setNewClass({ ...newClass, title: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-accent-gray uppercase tracking-[0.3em] opacity-70">MISSION BRIEFING</label>
                                <textarea
                                    placeholder="Details and objectives..."
                                    className="w-full bg-surface-light border-2 border-surface-border rounded-xl p-4 text-accent-white font-medium italic focus:border-primary focus:shadow-[0_0_20px_rgba(238,29,35,0.05)] outline-none transition-all min-h-[120px]"
                                    value={newClass.description} onChange={e => setNewClass({ ...newClass, description: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-accent-gray uppercase tracking-[0.3em] opacity-70">SELECT SUBJECT</label>
                                <select
                                    className="w-full bg-surface-light border-2 border-surface-border rounded-xl p-4 text-accent-white font-medium italic focus:border-primary focus:shadow-[0_0_20px_rgba(238,29,35,0.05)] outline-none transition-all"
                                    value={newClass.subject_id} onChange={e => setNewClass({ ...newClass, subject_id: e.target.value })} required
                                >
                                    <option value="">Choose a subject...</option>
                                    {batches.map(b => (
                                        <option key={b.id} value={b.subject_id}>{b.subject_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-accent-gray uppercase tracking-[0.3em] opacity-70">DEPLOYMENT TIME</label>
                                    <input
                                        type="datetime-local" required
                                        className="w-full bg-surface-light border-2 border-surface-border rounded-xl p-4 text-accent-white font-medium italic focus:border-primary focus:shadow-[0_0_20px_rgba(238,29,35,0.05)] outline-none transition-all"
                                        value={newClass.start_time} onChange={e => setNewClass({ ...newClass, start_time: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-accent-gray uppercase tracking-[0.3em] opacity-70">INTENSIONAL SPAN (MINS)</label>
                                    <input
                                        type="number" placeholder="60" required
                                        className="w-full bg-surface-light border-2 border-surface-border rounded-xl p-4 text-accent-white font-medium italic focus:border-primary focus:shadow-[0_0_20px_rgba(238,29,35,0.05)] outline-none transition-all"
                                        value={newClass.duration} onChange={e => setNewClass({ ...newClass, duration: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-8 py-4 text-[10px] font-black text-accent-gray uppercase tracking-widest hover:text-white transition-colors"
                                >
                                    ABORT
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary px-10 py-4 rounded-xl shadow-lg shadow-primary/20"
                                >
                                    <span className="tracking-[0.2em] font-black uppercase text-[10px]">SCHEDULE MISSION</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstructorClasses;
