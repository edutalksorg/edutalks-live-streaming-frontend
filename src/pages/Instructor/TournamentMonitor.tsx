import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FaTrophy, FaUsers, FaClock, FaChartBar, FaUserCircle, FaArrowLeft, FaSync } from 'react-icons/fa';

interface StudentProgress {
    student_id: number;
    student_name: string;
    started_at: string | null;
    submitted_at: string | null;
    score: number | null;
    tab_switches: number;
    questions_answered: number;
}

interface MonitorData {
    tournament: {
        name: string;
        status: string;
        exam_start: string;
        exam_end: string;
    };
    stats: {
        total_registered: number;
        total_started: number;
        total_submitted: number;
    };
    students: StudentProgress[];
}

const TournamentMonitor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<MonitorData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const res = await api.get(`/api/tournaments/${id}/monitor`);
            setData(res.data);
        } catch (err) {
            console.error('Error fetching monitor data:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Auto-refresh every 30s
        return () => clearInterval(interval);
    }, [id]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-surface-dark flex items-center justify-center">
                <div className="animate-spin h-12 w-12 border-4 border-yellow-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-surface-dark p-8 text-center">
                <p className="text-white">Tournament data not found.</p>
                <button onClick={() => navigate('/instructor/tournaments')} className="mt-4 text-primary hover:underline">Back to Tournaments</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface-dark p-6 md:p-10">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <button
                            onClick={() => navigate('/instructor/tournaments')}
                            className="flex items-center gap-2 text-accent-gray hover:text-white transition-colors text-sm mb-4"
                        >
                            <FaArrowLeft /> Back to Dashboard
                        </button>
                        <h1 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-none flex items-center gap-4">
                            <FaChartBar className="text-yellow-500" />
                            Live <span className="text-yellow-500">Monitor</span>
                        </h1>
                        <p className="text-accent-gray text-sm mt-2 font-bold uppercase tracking-widest">{data.tournament.name}</p>
                    </div>

                    <button
                        onClick={handleRefresh}
                        className={`flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl border border-white/10 transition-all ${refreshing ? 'animate-pulse' : ''}`}
                    >
                        <FaSync className={refreshing ? 'animate-spin' : ''} />
                        Sync Real-time
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="premium-card p-8 border-white/5 bg-white/[0.02]">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500">
                                <FaUsers size={24} />
                            </div>
                            <span className="text-accent-gray text-sm font-bold uppercase tracking-widest">Registered</span>
                        </div>
                        <div className="text-5xl font-black text-white italic">{data.stats.total_registered}</div>
                    </div>

                    <div className="premium-card p-8 border-yellow-500/20 bg-yellow-500/[0.02]">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-500">
                                <FaClock size={24} />
                            </div>
                            <span className="text-accent-gray text-sm font-bold uppercase tracking-widest">Active/Started</span>
                        </div>
                        <div className="text-5xl font-black text-white italic">{data.stats.total_started}</div>
                    </div>

                    <div className="premium-card p-8 border-green-500/20 bg-green-500/[0.02]">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-500">
                                <FaTrophy size={24} />
                            </div>
                            <span className="text-accent-gray text-sm font-bold uppercase tracking-widest">Completed</span>
                        </div>
                        <div className="text-5xl font-black text-white italic">{data.stats.total_submitted}</div>
                    </div>
                </div>

                {/* Student Progress Table */}
                <div className="premium-card border-white/5 bg-white/[0.02] overflow-hidden">
                    <div className="p-6 border-b border-white/5">
                        <h2 className="text-xl font-bold text-white italic uppercase tracking-tighter">Operative Engagement</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/[0.05]">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black italic text-accent-gray uppercase tracking-widest">Student</th>
                                    <th className="px-8 py-5 text-[10px] font-black italic text-accent-gray uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black italic text-accent-gray uppercase tracking-widest">Progress</th>
                                    <th className="px-8 py-5 text-[10px] font-black italic text-accent-gray uppercase tracking-widest">Alerts</th>
                                    <th className="px-8 py-5 text-[10px] font-black italic text-accent-gray uppercase tracking-widest text-right">Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {data.students.map((student) => (
                                    <tr key={student.student_id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <FaUserCircle className="text-accent-gray" size={24} />
                                                <span className="text-sm font-bold text-white uppercase tracking-tighter italic">{student.student_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {!student.started_at ? (
                                                <span className="text-[10px] font-bold bg-white/5 text-accent-gray px-3 py-1 rounded-full uppercase tracking-widest">Pending</span>
                                            ) : student.submitted_at ? (
                                                <span className="text-[10px] font-bold bg-green-500/20 text-green-400 px-3 py-1 rounded-full uppercase tracking-widest">Submitted</span>
                                            ) : (
                                                <span className="text-[10px] font-bold bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">In Progress</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden w-24">
                                                    <div
                                                        className="h-full bg-primary transition-all duration-500"
                                                        style={{ width: `${(student.questions_answered / 20) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-[10px] text-accent-gray font-bold italic">{student.questions_answered} Ans</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {student.tab_switches > 0 && (
                                                <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-1">
                                                    ⚠️ {student.tab_switches} Switches
                                                </span>
                                            )}
                                            {student.tab_switches === 0 && <span className="text-accent-gray opacity-20">—</span>}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className="text-xl font-black text-white italic tracking-tighter">
                                                {student.score !== null ? student.score : '—'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {data.students.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center text-accent-gray italic">No students registered for this tournament yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TournamentMonitor;
