import React, { useEffect, useState, useCallback, useContext } from 'react';
import { io } from 'socket.io-client';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { FaClock, FaClipboardCheck, FaPlay } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';

interface Exam {
    id: number;
    title: string;
    description: string;
    date: string;
    expiry_date?: string;
    duration: number;
    type: 'normal' | 'olympiad';
    submission_id?: number | null;
    submission_status?: 'pending' | 'graded';
    achieved_score?: number | null;
    total_marks?: number;
    attempts_allowed: number;
    attempt_count: number;
}

const StudentExamList: React.FC = () => {
    const { user } = useContext(AuthContext)!;

    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchExams = useCallback(async () => {
        try {
            const res = await api.get('/api/exams/student');
            setExams(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchExams();

        // Setup real-time sync
        const socket = io(import.meta.env.VITE_API_URL.replace('/api', ''));

        socket.on('global_sync', (payload) => {
            console.log('[StudentExamList] Sync received:', payload);
            if (payload.type === 'exams') {
                fetchExams();
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [fetchExams]);

    if (loading) return <div>Loading available exams...</div>;

    return (
        <div className="animate-in fade-in duration-700">
            <div className="mb-12">
                <h2 className="text-4xl font-black text-accent-white italic mb-2 tracking-tighter uppercase">AVAILABLE <span className="text-primary">ASSESSMENTS</span></h2>
                <p className="text-accent-gray uppercase tracking-[0.3em] text-[10px] font-black opacity-70">Exams, Quizzes & Global Olympiads</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {exams.map(exam => {
                    const isExpired = exam.expiry_date && new Date() > new Date(exam.expiry_date);
                    const noAttemptsLeft = exam.attempt_count >= exam.attempts_allowed;
                    const canAttempt = !isExpired && !noAttemptsLeft;

                    return (
                        <div key={exam.id} className={`premium-card p-10 flex flex-col justify-between transition-all duration-500 group ${isExpired ? 'opacity-50 grayscale' : 'hover:scale-[1.02]'}`}>
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex flex-col gap-2">
                                        <h3 className="text-2xl font-black text-accent-white leading-tight italic uppercase tracking-tighter group-hover:text-primary transition-colors">{exam.title}</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {exam.type === 'olympiad' && (
                                                <span className="bg-accent-blue/10 text-accent-blue text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border border-accent-blue/20">OLYMPIAD UNIT</span>
                                            )}
                                            {isExpired && (
                                                <span className="bg-primary/10 text-primary text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border border-primary/20">EXPIRED</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <p className="text-accent-gray mb-8 text-sm italic font-medium line-clamp-2 opacity-70">
                                    {exam.description || 'Standard tactical assessment protocol.'}
                                </p>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="bg-surface-light border border-surface-border p-4 rounded-2xl flex items-center gap-3">
                                        <div className="p-2.5 bg-primary/10 rounded-xl text-primary"><FaClock size={14} /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-accent-gray uppercase tracking-widest opacity-50">Duration</p>
                                            <p className="text-sm font-black text-accent-white italic tracking-tighter">{exam.duration}M</p>
                                        </div>
                                    </div>
                                    <div className="bg-surface-light border border-surface-border p-4 rounded-2xl flex items-center gap-3">
                                        <div className="p-2.5 bg-accent-blue/10 rounded-xl text-accent-blue"><FaClipboardCheck size={14} /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-accent-gray uppercase tracking-widest opacity-50">Execution</p>
                                            <p className="text-sm font-black text-accent-white italic tracking-tighter">{exam.attempt_count}/{exam.attempts_allowed}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-10 text-[10px] font-black uppercase tracking-widest">
                                    <div className="flex justify-between items-center text-accent-gray">
                                        <span className="opacity-50">Mission Start</span>
                                        <span className="text-accent-white font-black italic">{new Date(exam.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                    </div>
                                    {exam.achieved_score !== null && (
                                        <div className="flex justify-between items-center text-emerald-500">
                                            <span className="opacity-50">Best Score</span>
                                            <span className="font-black italic">{exam.achieved_score}/{exam.total_marks}</span>
                                        </div>
                                    )}
                                    {exam.expiry_date && (
                                        <div className="flex justify-between items-center text-primary/70">
                                            <span className="opacity-50">Lifecycle End</span>
                                            <span className="font-black italic">{new Date(exam.expiry_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {exam.submission_id ? (
                                <div className="space-y-4 pt-6 border-t border-surface-border">
                                    <div

                                        className="w-full h-full"
                                    >
                                        <Link
                                            to={(!user?.plan_name || user.plan_name === 'Free') ? '#' : `/student/exam-result/${exam.submission_id}`}
                                            onClick={(e) => {
                                                const isFree = !user?.plan_name || user.plan_name === 'Free';
                                                if (isFree) e.preventDefault();
                                            }}
                                            className="btn-outline w-full py-4 text-[10px]"
                                        >
                                            ANALYZE PREVIOUS DATA
                                        </Link>
                                    </div>
                                    {canAttempt && (
                                        <div

                                            className="w-full h-full"
                                        >
                                            <Link
                                                to={(!user?.plan_name || user.plan_name === 'Free') ? '#' : `/student/exam/${exam.id}`}
                                                onClick={(e) => {
                                                    const isFree = !user?.plan_name || user.plan_name === 'Free';
                                                    if (isFree) e.preventDefault();
                                                }}
                                                className="btn-primary w-full py-4 text-[10px]"
                                            >
                                                RE-ENGAGE MISSION
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="pt-6 border-t border-surface-border">
                                    {canAttempt ? (
                                        <div

                                            className="w-full h-full"
                                        >
                                            <Link
                                                to={(!user?.plan_name || user.plan_name === 'Free') ? '#' : `/student/exam/${exam.id}`}
                                                onClick={(e) => {
                                                    const isFree = !user?.plan_name || user.plan_name === 'Free';
                                                    if (isFree) e.preventDefault();
                                                }}
                                                className="btn-primary w-full py-4 text-[10px] flex items-center justify-center gap-3"
                                            >
                                                <FaPlay size={10} /> INITIALIZE SESSION
                                            </Link>
                                        </div>
                                    ) : (
                                        <button disabled className="w-full py-4 rounded-full bg-surface-light border border-surface-border text-accent-gray/40 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 cursor-not-allowed">
                                            {isExpired ? 'TIME-LOCK ACTIVE' : 'LIMIT EXCEEDED'}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {exams.length === 0 && (
                <>
                    {(!user?.plan_name || user.plan_name === 'Free') ? (
                        <div className="premium-card p-12 text-center border-l-4 border-yellow-500 relative overflow-hidden group hover:scale-[1.01] transition-transform duration-500">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
                            {/* Note: Ensure FaCrown is imported from react-icons/fa */}
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white italic uppercase tracking-tight mb-4 mt-4">
                                Upgrade for <span className="text-yellow-500">More Content</span>
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-lg font-medium max-w-2xl mx-auto mb-8 leading-relaxed">
                                Unlock premium exams, olympiads, and detailed performance analytics with the Pro plan.
                            </p>
                            <div className="flex justify-center gap-4">
                                <Link
                                    to="/student/subscription"
                                    className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-xl font-black uppercase tracking-widest shadow-xl shadow-yellow-500/20 hover:shadow-yellow-500/40 hover:-translate-y-1 transition-all flex items-center gap-2"
                                >
                                    Upgrade Now
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="premium-card p-24 text-center opacity-50 border-dashed border-2">
                            <FaClipboardCheck className="mx-auto text-accent-gray/20 text-7xl mb-6" />
                            <h3 className="text-2xl font-black text-accent-white italic uppercase tracking-tight">No active missions found</h3>
                            <p className="text-accent-gray italic font-medium mt-3">Tactical headquarters has not deployed any assessments for your node yet.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default StudentExamList;
