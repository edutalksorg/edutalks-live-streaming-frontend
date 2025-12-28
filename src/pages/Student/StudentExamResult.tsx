import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FaCheckCircle, FaTimesCircle, FaChevronLeft } from 'react-icons/fa';

const StudentExamResult: React.FC = () => {
    const { submissionId } = useParams<{ submissionId: string }>();
    const navigate = useNavigate();
    const [submission, setSubmission] = useState<any>(null);
    const [exam, setExam] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [fallbackReviewText, setFallbackReviewText] = useState<string | null>(null);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                // We need an endpoint to get a specific submission with its exam questions
                const res = await api.get(`/api/student/submissions/${submissionId}`);
                console.log('Submission Data Debug:', res.data.submission);
                console.log('Exam Data Debug:', res.data.exam);
                setSubmission(res.data.submission);
                setExam(res.data.exam);

                // Fallback: Check dashboard for review text if missing in primary response
                if (!res.data.submission.review_text && !res.data.submission.reviewText && !res.data.submission.feedback) {
                    try {
                        const dashRes = await api.get('/api/student/dashboard');
                        const recentResults = dashRes.data.recentResults || [];
                        const matchingResult = recentResults.find((r: any) => r.submission_id == submissionId);
                        if (matchingResult && matchingResult.review_text) {
                            console.log('Found review text in dashboard fallback:', matchingResult.review_text);
                            setFallbackReviewText(matchingResult.review_text);
                        }
                    } catch (e) {
                        console.warn('Fallback dashboard fetch failed', e);
                    }
                }

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchResult();
    }, [submissionId]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
        </div>
    );

    if (!submission || !exam) return <div className="p-10 text-center">Result not found.</div>;

    const questions = typeof exam.questions === 'string' ? JSON.parse(exam.questions) : exam.questions;
    const studentAnswers = typeof submission.submission_data === 'string' ? JSON.parse(submission.submission_data) : submission.submission_data;

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-10 pb-24 animate-in fade-in duration-700">
            <button
                onClick={() => navigate('/student/tests')}
                className="group flex items-center gap-3 text-accent-gray hover:text-primary font-black uppercase tracking-widest text-[10px] mb-12 transition-all p-3 bg-surface-light border border-surface-border rounded-2xl"
            >
                <FaChevronLeft className="group-hover:-translate-x-1 transition-transform" /> BACK TO TACTICAL HUB
            </button>

            <div className="bg-surface rounded-[3.5rem] shadow-premium overflow-hidden border border-surface-border mb-12">
                <div className="p-16 bg-surface-dark relative overflow-hidden text-center border-b border-surface-border">
                    <div className="absolute inset-0 bg-pattern-dark opacity-10"></div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                    <div className="relative z-10">
                        <h2 className="text-4xl font-black text-accent-white italic mb-3 tracking-tighter uppercase">{exam.title}</h2>
                        <p className="text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-10 opacity-70 italic">{exam.type}</p>

                        <div className="inline-flex flex-col items-center bg-surface-light/50 backdrop-blur-2xl rounded-[3rem] p-12 border-2 border-surface-border shadow-2xl relative group">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg">FINAL SCORECODE</div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-gray mb-3 opacity-50">Operational Synthesis</span>
                            <div className="text-7xl font-black text-accent-white italic tracking-tighter group-hover:scale-105 transition-transform duration-500">
                                {submission.score !== null ? submission.score : 0} <span className="text-2xl text-accent-gray/30 mr-2">/</span><span className="text-4xl text-accent-gray/50">{exam.total_marks}</span>
                            </div>
                            {submission.status === 'graded' ? (
                                <div className="mt-8 px-8 py-2.5 bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    ANALYSIS FINALIZED
                                </div>
                            ) : (
                                <div className="mt-8 px-8 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                                    PENDING MANUAL AUDIT
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-8 md:p-16 space-y-12">
                    {/* Worksheet Upload Section - HIGH VISIBILITY */}
                    <div className="bg-primary/5 rounded-[2.5rem] border-2 border-dashed border-primary/20 p-10 flex flex-col items-center text-center group/upload hover:bg-primary/10 transition-all duration-700">
                        <div className="w-20 h-20 bg-primary text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/40 mb-6 group-hover/upload:scale-110 group-hover/upload:rotate-6 transition-all duration-500">
                            <FaCheckCircle size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-accent-white italic tracking-tighter uppercase mb-4">Upload Your Worksheet</h3>
                        <p className="text-sm text-accent-gray italic font-medium max-w-lg mb-8 opacity-60 leading-relaxed">
                            To finalize your manual review, please upload a clear photo of your handwritten solutions. Our instructors rely on this visual evidence for tactical grading.
                        </p>

                        <input
                            type="file"
                            id="worksheet-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                const formData = new FormData();
                                formData.append('file', file);

                                try {
                                    await api.post(`/api/exams/submissions/${submissionId}/upload-worksheet`, formData);
                                    alert('MISSION INTEL TRANSMITTED: Worksheet uploaded successfully!');
                                    window.location.reload();
                                } catch (err) {
                                    console.error(err);
                                    alert('TRANSMISSION FAILURE: Upload failed');
                                }
                            }}
                        />

                        {submission.file_path ? (
                            <div className="space-y-4">
                                <div className="px-8 py-3 bg-accent-emerald/20 text-accent-emerald border border-accent-emerald/30 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                                    <FaCheckCircle /> VISUAL Intel DETECTED
                                </div>
                                <label htmlFor="worksheet-upload" className="block text-[8px] font-black text-primary uppercase tracking-widest cursor-pointer hover:underline">
                                    Replace Current Uplink?
                                </label>
                            </div>
                        ) : (
                            <label
                                htmlFor="worksheet-upload"
                                className="px-12 py-5 bg-primary text-white rounded-2xl font-black text-[10px] tracking-[0.3em] hover:bg-primary-hover shadow-xl shadow-primary/30 transition-all cursor-pointer transform hover:scale-105 active:scale-95 uppercase"
                            >
                                Initialize Uplink
                            </label>
                        )}
                    </div>

                    {(submission.review_text || submission.reviewText || submission.feedback || exam?.review_text || exam?.reviewText || exam?.feedback || fallbackReviewText) && (
                        <div className="bg-surface-light/50 border border-surface-border p-8 rounded-[2.5rem] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <h3 className="text-lg font-black text-accent-white italic tracking-tighter uppercase mb-4 flex items-center gap-3">
                                <span className="w-2 h-8 bg-primary rounded-r-full"></span>
                                INSTRUCTOR FEEDBACK
                            </h3>
                            <div className="px-6 py-2 border-l-2 border-primary/20 bg-primary/5 rounded-r-xl">
                                <p className="text-accent-white italic font-medium leading-relaxed">
                                    "{submission.review_text || submission.reviewText || submission.feedback || exam?.review_text || exam?.reviewText || exam?.feedback || fallbackReviewText}"
                                </p>
                                <p className="text-[9px] font-black text-primary uppercase tracking-widest mt-3 opacity-60">Verified by Instructor</p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        <h3 className="text-2xl font-black text-accent-white italic tracking-tighter uppercase">MISSION <span className="text-primary">DEBRIEF</span></h3>
                        <div className="flex-1 h-px bg-surface-border"></div>
                    </div>

                    <div className="space-y-10">
                        {questions.map((q: any, idx: number) => {
                            const studentAns = studentAnswers[idx];
                            let isCorrect = false;

                            if (q.type === 'mcq') {
                                isCorrect = studentAns === q.correctOption;
                            } else if (q.type === 'fib') {
                                isCorrect = studentAns?.toString().trim().toLowerCase() === q.correctAnswer?.toString().trim().toLowerCase();
                            }

                            return (
                                <div key={idx} className={`premium-card p-10 relative overflow-hidden transition-all duration-500 ${q.type === 'photo' ? 'border-primary/20' : (isCorrect ? 'border-accent-emerald/20' : 'border-primary/30')}`}>
                                    <div className="flex justify-between items-center mb-8 pb-6 border-b border-surface-border/50">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-accent-gray uppercase tracking-widest opacity-50">NODE {idx + 1}</span>
                                            <span className="w-1.5 h-1.5 bg-surface-border rounded-full"></span>
                                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">{q.type} UNIT</span>
                                        </div>
                                        {q.type !== 'photo' && (
                                            isCorrect ?
                                                <span className="flex items-center gap-2 text-accent-emerald font-black text-[10px] uppercase tracking-widest bg-accent-emerald/10 px-4 py-1.5 rounded-full border border-accent-emerald/20"><FaCheckCircle /> POSITIVE MATCH</span> :
                                                <span className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20"><FaTimesCircle /> NEGATIVE MATCH</span>
                                        )}
                                    </div>
                                    <p className="text-xl font-black text-accent-white italic leading-tight mb-8 uppercase tracking-tight">{q.text}</p>

                                    {q.type === 'mcq' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {q.options.map((opt: string, oIdx: number) => (
                                                <div
                                                    key={oIdx}
                                                    className={`p-5 rounded-[1.5rem] text-sm font-bold border-2 transition-all flex justify-between items-center ${oIdx === q.correctOption
                                                        ? 'bg-accent-emerald/10 border-accent-emerald/40 text-accent-emerald'
                                                        : (oIdx === studentAns ? 'bg-primary/10 border-primary/40 text-primary' : 'bg-surface-light border-surface-border text-accent-gray opacity-50')
                                                        }`}
                                                >
                                                    <span className="italic font-medium">{opt}</span>
                                                    {oIdx === q.correctOption && <span className="text-[8px] font-black uppercase bg-accent-emerald text-white px-2 py-0.5 rounded ml-2">TARGET VALID</span>}
                                                    {oIdx === studentAns && oIdx !== q.correctOption && <span className="text-[8px] font-black uppercase bg-primary text-white px-2 py-0.5 rounded ml-2">USER INPUT</span>}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {q.type === 'fib' && (
                                        <div className="space-y-4 bg-surface-light/50 p-6 rounded-3xl border border-surface-border">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="space-y-1">
                                                    <span className="text-[8px] font-black text-accent-gray uppercase tracking-widest opacity-50">USER SYNTHESIS</span>
                                                    <p className={`font-black text-lg italic ${isCorrect ? 'text-accent-emerald' : 'text-primary'}`}>{studentAns || '(NULL)'}</p>
                                                </div>
                                                {!isCorrect && (
                                                    <div className="space-y-1 md:text-right">
                                                        <span className="text-[8px] font-black text-accent-emerald uppercase tracking-widest opacity-50">ENCRYPTION KEY</span>
                                                        <p className="font-black text-lg italic text-accent-emerald">{q.correctAnswer}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {q.type === 'photo' && (
                                        <div className="flex flex-col items-center gap-6 py-6 border-t border-surface-border mt-8">
                                            <div className="text-primary bg-primary/10 border border-primary/20 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] italic">Visual Documentation Attached</div>
                                            {submission.file_path ? (
                                                <div className="relative group/photo">
                                                    <div className="absolute inset-0 bg-primary/20 blur-2xl opacity-0 group-hover/photo:opacity-100 transition-opacity"></div>
                                                    <img
                                                        src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/${submission.file_path.replace(/^\//, '')}`}
                                                        alt="Mission Intel"
                                                        className="relative max-h-80 rounded-[2.5rem] border-2 border-surface-border shadow-2xl transition-transform group-hover/photo:scale-[1.02] duration-500"
                                                    />
                                                </div>
                                            ) : (
                                                <p className="text-accent-gray italic font-medium opacity-50">No photographic evidence retrieved.</p>
                                            )}
                                            <div className="bg-surface p-4 rounded-2xl border border-surface-border max-w-md text-center">
                                                <p className="text-[10px] text-accent-gray font-black uppercase tracking-widest leading-relaxed">System Note: Manual grading protocol initiated. Tactical score only reflects computational components.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentExamResult;
