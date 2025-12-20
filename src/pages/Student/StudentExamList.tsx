import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { FaClock, FaClipboardCheck, FaPlay } from 'react-icons/fa';

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
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExams = async () => {
            try {
                // Determine if we should filter by class/subject? For now fetch all active.
                // ideally backend filters by student's class.
                const res = await api.get('/api/exams/student');
                setExams(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchExams();
    }, []);

    if (loading) return <div>Loading available exams...</div>;

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Available Exams & Olympiads</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exams.map(exam => {
                    const isExpired = exam.expiry_date && new Date() > new Date(exam.expiry_date);
                    const noAttemptsLeft = exam.attempt_count >= exam.attempts_allowed;
                    const canAttempt = !isExpired && !noAttemptsLeft;

                    return (
                        <div key={exam.id} className={`bg-white rounded-[2rem] shadow-xl p-8 border-t-8 transition-all hover:scale-[1.02] ${isExpired ? 'border-red-200 grayscale' : (exam.type === 'olympiad' ? 'border-yellow-400' : 'border-indigo-500')}`}>
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-2xl font-black text-gray-900 leading-tight">{exam.title}</h3>
                                <div className="flex flex-col items-end gap-1">
                                    {exam.type === 'olympiad' && (
                                        <span className="bg-yellow-100 text-yellow-800 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest">OLYMPIAD</span>
                                    )}
                                    {isExpired && (
                                        <span className="bg-red-100 text-red-600 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest">EXPIRED</span>
                                    )}
                                </div>
                            </div>

                            <p className="text-gray-500 mb-6 text-sm font-medium line-clamp-2">{exam.description || 'No description provided.'}</p>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-gray-50 p-3 rounded-2xl flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-indigo-500 shadow-sm"><FaClock /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase">Duration</p>
                                        <p className="text-sm font-bold text-gray-700">{exam.duration}m</p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-2xl flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-indigo-500 shadow-sm"><FaClipboardCheck /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase">Attempts</p>
                                        <p className="text-sm font-bold text-gray-700">{exam.attempt_count} / {exam.attempts_allowed}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 mb-8 text-[11px] font-bold">
                                <div className="flex justify-between items-center text-gray-400">
                                    <span>STARTS</span>
                                    <span className="text-gray-700">{new Date(exam.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                </div>
                                {exam.expiry_date && (
                                    <div className="flex justify-between items-center text-red-300">
                                        <span>EXPIRES</span>
                                        <span className={isExpired ? 'text-red-500' : 'text-red-400'}>{new Date(exam.expiry_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                    </div>
                                )}
                            </div>

                            {exam.submission_id ? (
                                <div className="space-y-4">
                                    <Link
                                        to={`/student/exam-result/${exam.submission_id}`}
                                        className="block w-full text-center py-4 rounded-2xl bg-indigo-50 text-indigo-700 font-black text-sm hover:bg-indigo-100 transition-all border-2 border-indigo-100"
                                    >
                                        View Latest Result
                                    </Link>
                                    {canAttempt && (
                                        <Link to={`/student/exam/${exam.id}`} className={`block w-full text-center py-4 rounded-2xl text-white font-black text-sm transition-all shadow-lg ${exam.type === 'olympiad' ? 'bg-yellow-500 hover:bg-yellow-600 shadow-yellow-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'}`}>
                                            Re-attempt Exam
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                canAttempt ? (
                                    <Link to={`/student/exam/${exam.id}`} className={`block w-full text-center py-4 rounded-2xl text-white font-black text-sm transition-all shadow-lg ${exam.type === 'olympiad' ? 'bg-yellow-500 hover:bg-yellow-600 shadow-yellow-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'}`}>
                                        <div className="flex items-center justify-center gap-2">
                                            <FaPlay className="text-[10px]" /> Start Exam
                                        </div>
                                    </Link>
                                ) : (
                                    <button disabled className="block w-full text-center py-4 rounded-2xl bg-gray-100 text-gray-400 font-black text-sm cursor-not-allowed border-2 border-gray-200">
                                        {isExpired ? 'Exam Expired' : 'No Attempts Left'}
                                    </button>
                                )
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StudentExamList;
