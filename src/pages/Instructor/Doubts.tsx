import React, { useState, useEffect, useContext } from 'react';
import { FaQuestionCircle, FaClock, FaCheckCircle, FaFilter, FaSearch } from 'react-icons/fa';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import DoubtChat from '../../components/DoubtChat';

const InstructorDoubts: React.FC = () => {
    const { user } = useContext(AuthContext)!;
    const { showToast } = useToast();
    const [doubts, setDoubts] = useState<any[]>([]);
    const [selectedDoubt, setSelectedDoubt] = useState<any>(null);
    const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchDoubts();
        const interval = setInterval(fetchDoubts, 10000); // Slower polling for list
        return () => clearInterval(interval);
    }, []);

    const fetchDoubts = async () => {
        try {
            const res = await api.get('/api/doubts/instructor');
            setDoubts(res.data);
        } catch (err) {
            console.error('Error fetching doubts:', err);
        }
    };

    const handleResolve = async (id: number, currentStatus: string) => {
        try {
            const newStatus = currentStatus === 'resolved' ? 'pending' : 'resolved';
            await api.patch(`/api/doubts/${id}/status`, { status: newStatus });
            showToast(`Inquiry marked as ${newStatus}`, 'success');
            fetchDoubts();
            if (selectedDoubt?.id === id) {
                setSelectedDoubt({ ...selectedDoubt, status: newStatus });
            }
        } catch (err) {
            showToast('Failed to update status', 'error');
        }
    };

    const filteredDoubts = doubts.filter(d => {
        const matchesSearch = d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.student_name.toLowerCase().includes(searchTerm.toLowerCase());
        if (filter === 'all') return matchesSearch;
        return d.status === filter && matchesSearch;
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface p-6 rounded-3xl border border-surface-border shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-10 transition-opacity">
                    <FaQuestionCircle size={100} />
                </div>
                <div>
                    <h1 className="text-3xl font-black italic text-accent-white tracking-widest uppercase flex items-center gap-3">
                        <FaQuestionCircle className="text-primary" /> Resolve Doubts
                    </h1>
                    <p className="text-accent-gray text-xs mt-2 uppercase font-black tracking-[0.2em] italic opacity-70">Mentoring Dashboard • Peer Solutions</p>
                </div>

                <div className="flex bg-surface-dark/50 p-1.5 rounded-2xl border border-surface-border backdrop-blur-sm self-stretch md:self-auto">
                    {(['all', 'pending', 'resolved'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-accent-gray hover:text-accent-white'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[750px] relative">
                {/* List Panel */}
                <div className="lg:col-span-4 bg-surface rounded-[2.5rem] border border-surface-border shadow-2xl overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-surface-border space-y-4 bg-surface-dark/30">
                        <div className="relative">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-accent-gray opacity-40" />
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by student or topic..."
                                className="w-full bg-surface-dark border border-surface-border rounded-2xl pl-12 pr-4 py-3.5 text-xs font-bold focus:ring-2 ring-primary outline-none transition-all placeholder:opacity-30"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                        {filteredDoubts.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-accent-gray opacity-30 italic">
                                <FaFilter size={32} className="mb-4" />
                                <p className="text-xs uppercase font-black tracking-widest">No matching inquiries</p>
                            </div>
                        ) : (
                            filteredDoubts.map(d => (
                                <button
                                    key={d.id}
                                    onClick={() => setSelectedDoubt(d)}
                                    className={`w-full text-left p-4 rounded-3xl transition-all duration-300 border flex flex-col gap-3 relative group ${selectedDoubt?.id === d.id
                                        ? 'bg-primary text-white border-primary shadow-2xl shadow-primary/20 scale-[1.02] z-10'
                                        : 'bg-surface-dark/40 border-surface-border hover:border-accent-gray/30'
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col">
                                            <span className={`text-[8px] font-black uppercase tracking-widest mb-1 ${selectedDoubt?.id === d.id ? 'text-white/80' : 'text-primary'}`}>{d.subject_name}</span>
                                            <h3 className={`text-sm font-black leading-tight ${selectedDoubt?.id === d.id ? 'text-white' : 'text-accent-white'}`}>{d.title}</h3>
                                        </div>
                                        {d.status === 'resolved' ? <FaCheckCircle className={selectedDoubt?.id === d.id ? 'text-white' : 'text-emerald-500'} /> : <FaClock className={selectedDoubt?.id === d.id ? 'text-white/50 animate-pulse' : 'text-amber-500 animate-pulse'} />}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black ${selectedDoubt?.id === d.id ? 'bg-white/20' : 'bg-primary/20 text-primary'}`}>
                                            {d.student_name.charAt(0)}
                                        </div>
                                        <span className={`text-[10px] font-bold ${selectedDoubt?.id === d.id ? 'text-white/90' : 'text-accent-gray'}`}>{d.student_name}</span>
                                    </div>

                                    <div className="flex justify-between items-center mt-1">
                                        <p className={`text-[8px] font-black uppercase tracking-widest ${selectedDoubt?.id === d.id ? 'text-white/60' : 'text-accent-gray/40'}`}>
                                            Last active: {new Date(d.updated_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* View/Chat Panel */}
                <div className="lg:col-span-8 bg-surface rounded-[2.5rem] border border-surface-border shadow-2xl overflow-hidden flex flex-col">
                    {selectedDoubt ? (
                        <div className="flex-1 flex flex-col h-full bg-background-dark/20">
                            <div className="p-6 bg-surface-dark border-b border-surface-border flex justify-between items-center">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-black bg-primary/10 text-primary px-3 py-1 rounded-full uppercase italic tracking-widest">{selectedDoubt.subject_name}</span>
                                        <span className="text-[10px] text-accent-gray uppercase tracking-tighter">Inquiry #{selectedDoubt.id}</span>
                                    </div>
                                    <h2 className="text-xl font-black text-accent-white">{selectedDoubt.title}</h2>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleResolve(selectedDoubt.id, selectedDoubt.status); }}
                                    className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${selectedDoubt.status === 'resolved' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'}`}
                                >
                                    {selectedDoubt.status === 'resolved' ? <><FaClock /> Re-open</> : <><FaCheckCircle /> Resolve</>}
                                </button>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <DoubtChat
                                    doubtId={selectedDoubt.id}
                                    currentUserId={user!.id}
                                    role="instructor"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-surface-dark/5 shadow-inner">
                            <div className="relative mb-8">
                                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
                                <div className="relative w-24 h-24 bg-surface rounded-full flex items-center justify-center border-2 border-surface-border shadow-2xl">
                                    <FaQuestionCircle size={40} className="text-primary/20" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-black text-accent-white tracking-widest uppercase italic">Student Inquiry Feed</h2>
                            <p className="text-[10px] mt-4 uppercase tracking-[0.2em] font-bold text-accent-gray max-w-sm leading-loose italic">Select a student's inquiry to provide academic assistance and resolution.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InstructorDoubts;
