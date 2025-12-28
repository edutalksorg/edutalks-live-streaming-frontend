import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import { FaClipboardList, FaExternalLinkAlt } from 'react-icons/fa';

interface Submission {
    id: number;
    student_name: string;
    student_email: string;
    score: number | null;
    status: 'pending' | 'graded';
    submission_data: any; // Answers JSON
    file_path: string | null;
    review_text: string | null;
    submitted_at: string;
}

const InstructorGrading: React.FC = () => {
    const { id: examId } = useParams<{ id: string }>();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
    const [score, setScore] = useState<number | ''>('');
    const [reviewText, setReviewText] = useState('');
    const [exam, setExam] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (examId) fetchSubmissions();
    }, [examId]);

    const fetchSubmissions = async () => {
        try {
            const [subRes, examRes] = await Promise.all([
                api.get(`/api/instructor/exams/${examId}/submissions`),
                api.get(`/api/exams/${examId}`)
            ]);
            setSubmissions(subRes.data);
            setExam(examRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleGrade = async () => {
        if (!selectedSubmission) return;
        try {
            await api.post('/api/instructor/submissions/review', {
                submissionId: selectedSubmission.id,
                reviewText,
                score
            });
            alert('Graded and Reviewed successfully');
            setScore('');
            setReviewText('');
            setSelectedSubmission(null);
            fetchSubmissions();
        } catch (err) {
            console.error(err);
            alert('Failed to submit review');
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-primary font-black uppercase tracking-widest text-xs italic">Decrypting Submissions...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto h-[calc(100vh-160px)] flex gap-10 animate-in fade-in duration-700">
            {/* List of Submissions */}
            <div className="w-96 bg-surface rounded-[2.5rem] shadow-2xl border border-surface-border flex flex-col overflow-hidden">
                <div className="p-8 bg-surface-dark/50 border-b border-surface-border">
                    <h3 className="text-[10px] font-black text-accent-white uppercase tracking-[0.4em] italic mb-1">CANDIDATE QUEUE</h3>
                    <p className="text-[8px] text-accent-gray italic font-medium opacity-50 uppercase tracking-widest">{submissions.length} Total Units</p>
                </div>
                <div className="flex-1 overflow-y-auto scrollbar-premium">
                    {submissions.length === 0 ? (
                        <div className="p-12 text-center text-accent-gray italic font-medium opacity-20 text-xs uppercase tracking-widest">No assets submitted in this sector.</div>
                    ) : (
                        submissions.map((sub: any) => (
                            <button
                                key={sub.id}
                                onClick={() => {
                                    setSelectedSubmission(sub);
                                    setScore(sub.reviewed_score || sub.score || '');
                                    setReviewText(sub.review_text || '');
                                }}
                                className={`w-full text-left p-8 border-b border-surface-border transition-all group ${selectedSubmission?.id === sub.id ? 'bg-primary/5' : 'hover:bg-white/5'}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <div className={`font-black italic text-lg tracking-tighter uppercase transition-colors ${selectedSubmission?.id === sub.id ? 'text-primary' : 'text-accent-white group-hover:text-primary'}`}>{sub.student_name}</div>
                                    <div className="text-[10px] font-black italic text-primary bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">ATMT {sub.attempt_number}</div>
                                </div>
                                <div className="text-[9px] text-accent-gray font-black tracking-widest opacity-30 group-hover:opacity-60 truncate mb-4 uppercase">{sub.student_email}</div>
                                <div className="flex justify-between items-center">
                                    <span className={`text-[8px] font-black tracking-[0.2em] px-3 py-1 rounded-full border ${sub.reviewed_score !== null ? 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                                        {sub.reviewed_score !== null ? 'EVALUATED' : 'ANOMALY DETECTED'}
                                    </span>
                                    <span className="text-[10px] font-black italic text-primary tracking-tighter">MAGNITUDE: {sub.reviewed_score !== null ? sub.reviewed_score : (sub.score || 0)}</span>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Grading Area */}
            <div className="flex-1 bg-surface rounded-[2.5rem] shadow-2xl border border-surface-border flex flex-col overflow-hidden relative">
                {selectedSubmission ? (
                    <>
                        <div className="p-8 border-b border-surface-border flex justify-between items-center bg-surface-dark/30">
                            <div>
                                <h2 className="text-3xl font-black text-accent-white italic tracking-tighter uppercase leading-none">{selectedSubmission.student_name}</h2>
                                <p className="text-[9px] text-accent-gray font-black tracking-[0.3em] uppercase opacity-40 mt-2">{selectedSubmission.student_email}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[8px] text-accent-gray font-black uppercase tracking-widest opacity-30 mb-1">SUBMISSION TIMESTAMP</p>
                                <p className="text-[10px] font-black text-primary italic tracking-widest">{new Date(selectedSubmission.submitted_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).toUpperCase()}</p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 space-y-12 scrollbar-premium">
                            {/* Question by Question Review */}
                            {exam && (
                                <div className="space-y-8">
                                    <h3 className="text-sm font-black text-accent-white italic tracking-widest uppercase flex items-center gap-4">
                                        <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(238,29,35,0.5)]"></span>
                                        PERFORMANCE BREAKDOWN
                                    </h3>
                                    <div className="space-y-6">
                                        {(typeof exam.questions === 'string' ? JSON.parse(exam.questions) : exam.questions).map((q: any, idx: number) => {
                                            const studentAnswers = typeof selectedSubmission.submission_data === 'string'
                                                ? JSON.parse(selectedSubmission.submission_data)
                                                : selectedSubmission.submission_data;
                                            const studentAns = studentAnswers[idx];
                                            let isCorrect = false;
                                            if (q.type === 'mcq') isCorrect = studentAns === q.correctOption;
                                            if (q.type === 'fib') isCorrect = studentAns?.toString().trim().toLowerCase() === q.correctAnswer?.toString().trim().toLowerCase();

                                            return (
                                                <div key={idx} className={`p-8 rounded-[1.5rem] border-2 transition-all group ${q.type === 'photo' ? 'border-primary/10 bg-primary/5 italic opacity-60' : (isCorrect ? 'border-accent-emerald/10 bg-accent-emerald/5' : 'border-primary/20 bg-primary/5')}`}>
                                                    <div className="flex justify-between items-start mb-4">
                                                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-accent-gray opacity-40">SORTIE UNIT {idx + 1} • {q.type.toUpperCase()}</span>
                                                        {q.type !== 'photo' && (
                                                            <span className={`text-[8px] font-black px-3 py-1 rounded-full border tracking-widest ${isCorrect ? 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20' : 'bg-primary/20 text-primary border-primary/30'}`}>
                                                                {isCorrect ? 'VALIDATED' : 'ANOMALY'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-base font-black text-accent-white italic tracking-tighter mb-6">{q.text}</p>

                                                    {q.type === 'mcq' && (
                                                        <div className="flex flex-wrap gap-4">
                                                            {q.options.map((opt: string, oIdx: number) => (
                                                                <span key={oIdx} className={`px-5 py-2 rounded-xl text-[10px] font-black italic tracking-widest border transition-all ${oIdx === q.correctOption ? 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : (oIdx === studentAns ? 'bg-primary/10 text-primary border-primary/30' : 'bg-surface-light text-accent-gray/50 border-surface-border')}`}>
                                                                    {opt}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {q.type === 'fib' && (
                                                        <div className="flex items-center gap-6">
                                                            <div className="space-y-1">
                                                                <p className="text-[8px] font-black text-accent-gray uppercase tracking-widest opacity-30">INPUT</p>
                                                                <p className={`text-sm font-black italic tracking-widest ${isCorrect ? 'text-accent-emerald' : 'text-primary'}`}>{studentAns || 'NULL RESPONSE'}</p>
                                                            </div>
                                                            {!isCorrect && (
                                                                <div className="space-y-1 pl-6 border-l border-surface-border">
                                                                    <p className="text-[8px] font-black text-accent-gray uppercase tracking-widest opacity-30">REQUIRED</p>
                                                                    <p className="text-sm font-black italic tracking-widest text-accent-emerald">{q.correctAnswer}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {q.type === 'photo' && (
                                                        <div className="text-primary text-[10px] font-black italic tracking-widest">VISUAL EVIDENCE ATTACHED BELOW • MANUAL VERIFICATION REQUIRED</div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Photo Assessment */}
                            {/* Photo Assessment */}
                            {selectedSubmission.file_path && (
                                <div className="space-y-8">
                                    <h3 className="text-sm font-black text-accent-white italic tracking-widest uppercase flex items-center gap-4">
                                        <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(238,29,35,0.5)]"></span>
                                        VISUAL EVIDENCE LOG
                                    </h3>
                                    <div className="relative group rounded-[2.5rem] overflow-hidden border-2 border-dashed border-surface-border bg-surface-light p-6">
                                        <img
                                            src={`${import.meta.env.VITE_API_URL.replace('/api', '')}${selectedSubmission.file_path}`}
                                            alt="Visual Submission"
                                            className="mx-auto max-h-[800px] object-contain rounded-2xl shadow-[0_40px_100px_rgba(0,0,0,0.6)] group-hover:scale-[1.01] transition-all duration-700"
                                        />
                                        <div className="absolute inset-0 bg-surface-dark/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                                            <a
                                                href={`${import.meta.env.VITE_API_URL.replace('/api', '')}${selectedSubmission.file_path}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn-primary px-10 py-5 rounded-2xl flex items-center gap-4 group/link"
                                            >
                                                <span className="tracking-[0.2em] font-black uppercase text-[10px]">FULL RADIOGRAPH VIEW</span>
                                                <FaExternalLinkAlt className="group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Attempt History */}
                            <div className="space-y-8">
                                <h3 className="text-sm font-black text-accent-white italic tracking-widest uppercase flex items-center gap-4">
                                    <span className="w-2 h-2 bg-accent-emerald rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                                    CHRONOLOGICAL LOGS (OTHER ATTEMPTS)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {submissions
                                        .filter((s: any) => s.student_id === selectedSubmission.student_id && s.id !== selectedSubmission.id)
                                        .map((other: any) => (
                                            <div key={other.id} className="p-6 rounded-2xl bg-surface-dark border border-surface-border opacity-60 hover:opacity-100 transition-all">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">ATMT {other.attempt_number}</span>
                                                    <span className="text-[10px] font-black italic text-accent-white">{other.reviewed_score || other.score || 0}/{exam.total_marks}</span>
                                                </div>
                                                <div className="text-[8px] text-accent-gray uppercase tracking-tighter mb-4 opacity-50">
                                                    {new Date(other.submitted_at).toLocaleString()}
                                                </div>
                                                {other.review_text && (
                                                    <p className="text-[10px] text-accent-white italic border-l border-primary/20 pl-3 line-clamp-2">"{other.review_text}"</p>
                                                )}
                                            </div>
                                        ))}
                                    {submissions.filter((s: any) => s.student_id === selectedSubmission.student_id && s.id !== selectedSubmission.id).length === 0 && (
                                        <div className="col-span-full py-8 text-center bg-surface-dark/50 rounded-2xl border-2 border-dashed border-surface-border text-[10px] font-black text-accent-gray uppercase tracking-widest opacity-20 italic">
                                            Primary Attempt • No prior logs found
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Scoring & Feedback */}
                            <div className="bg-primary/5 p-10 rounded-[2.5rem] border border-primary/10 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000"></div>
                                <h3 className="text-lg font-black text-accent-white italic tracking-tighter uppercase mb-8 flex items-center gap-4">
                                    <FaClipboardList className="text-primary" /> MISSION EVALUATION
                                </h3>
                                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">

                                    <div className="lg:col-span-4 space-y-3">
                                        <label className="text-[9px] font-black text-primary uppercase tracking-[0.3em] opacity-60">TACTICAL DEBRIEFING</label>
                                        <textarea
                                            className="w-full bg-surface-dark border-2 border-primary/20 rounded-2xl p-6 text-sm text-accent-white font-medium italic min-h-[160px] focus:border-primary outline-none transition-all placeholder:text-accent-gray/20 placeholder:font-black placeholder:uppercase placeholder:tracking-widest"
                                            placeholder="ENTER DETAILED PERFORMANCE ANALYSIS..."
                                            value={reviewText}
                                            onChange={e => setReviewText(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-6 pt-10">
                                    <button
                                        onClick={() => setSelectedSubmission(null)}
                                        className="px-8 py-5 text-[10px] font-black text-accent-gray uppercase tracking-widest hover:text-white transition-colors"
                                    >
                                        ABORT REVIEW
                                    </button>
                                    <button
                                        onClick={handleGrade}
                                        className="btn-primary px-12 py-5 rounded-2xl shadow-xl shadow-primary/30"
                                    >
                                        <span className="tracking-[0.2em] font-black uppercase text-[10px]">TRANSMIT EVALUATION</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-20 animate-in fade-in zoom-in duration-1000">
                        <div className="w-32 h-32 bg-primary/10 text-primary rounded-[2.5rem] flex items-center justify-center mb-10 text-5xl shadow-2xl shadow-primary/5 animate-pulse">
                            <FaClipboardList />
                        </div>
                        <h3 className="text-3xl font-black text-accent-white italic tracking-tighter uppercase mb-4">SELECT CANDIDATE</h3>
                        <p className="text-sm text-accent-gray italic font-medium max-w-sm opacity-40 leading-relaxed uppercase tracking-widest">Awaiting unit assignment from the tactical queue. Select a student to begin operational evaluation.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InstructorGrading;
