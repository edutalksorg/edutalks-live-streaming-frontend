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

    useEffect(() => {
        const fetchResult = async () => {
            try {
                // We need an endpoint to get a specific submission with its exam questions
                const res = await api.get(`/api/student/submissions/${submissionId}`);
                setSubmission(res.data.submission);
                setExam(res.data.exam);
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
        <div className="max-w-4xl mx-auto p-6 pb-20">
            <button onClick={() => navigate('/student/tests')} className="flex items-center gap-2 text-indigo-600 font-bold mb-8 hover:gap-3 transition-all">
                <FaChevronLeft /> Back to My Tests
            </button>

            <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 mb-10">
                <div className="p-10 bg-gradient-to-br from-indigo-600 to-purple-700 text-white text-center">
                    <h2 className="text-3xl font-black mb-2">{exam.title}</h2>
                    <p className="opacity-80 font-bold uppercase tracking-widest text-sm mb-6">{exam.type}</p>

                    <div className="inline-flex flex-col items-center bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
                        <span className="text-xs font-black uppercase tracking-tighter opacity-60">Final Score</span>
                        <div className="text-6xl font-black">
                            {submission.score !== null ? submission.score : 0} <span className="text-2xl opacity-50">/ {exam.total_marks}</span>
                        </div>
                        {submission.status === 'graded' ? (
                            <div className="mt-4 px-6 py-1.5 bg-green-400 text-green-950 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-500/20">
                                Grading Complete
                            </div>
                        ) : (
                            <div className="mt-4 px-6 py-1.5 bg-yellow-400 text-yellow-950 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse shadow-lg shadow-yellow-500/20">
                                Instructor Review Pending
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-8 md:p-12 space-y-10">
                    <h3 className="text-2xl font-black text-gray-800 border-b pb-4">Performance Review</h3>

                    <div className="space-y-8">
                        {questions.map((q: any, idx: number) => {
                            const studentAns = studentAnswers[idx];
                            let isCorrect = false;

                            if (q.type === 'mcq') {
                                isCorrect = studentAns === q.correctOption;
                            } else if (q.type === 'fib') {
                                isCorrect = studentAns?.toString().trim().toLowerCase() === q.correctAnswer?.toString().trim().toLowerCase();
                            }

                            return (
                                <div key={idx} className={`p-6 rounded-3xl border-2 ${q.type === 'photo' ? 'border-orange-50 bg-orange-50/30' : (isCorrect ? 'border-green-50 bg-green-50/30' : 'border-red-50 bg-red-50/30')}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-xs font-black text-gray-400 uppercase">Question {idx + 1} • {q.type}</span>
                                        {q.type !== 'photo' && (
                                            isCorrect ?
                                                <span className="flex items-center gap-1 text-green-600 font-black text-xs uppercase"><FaCheckCircle /> Correct</span> :
                                                <span className="flex items-center gap-1 text-red-600 font-black text-xs uppercase"><FaTimesCircle /> Incorrect</span>
                                        )}
                                    </div>
                                    <p className="text-lg font-bold text-gray-800 mb-6">{q.text}</p>

                                    {q.type === 'mcq' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {q.options.map((opt: string, oIdx: number) => (
                                                <div
                                                    key={oIdx}
                                                    className={`p-4 rounded-2xl text-sm font-bold border-2 transition-all ${oIdx === q.correctOption
                                                        ? 'bg-green-100 border-green-500 text-green-800'
                                                        : (oIdx === studentAns ? 'bg-red-100 border-red-500 text-red-800' : 'bg-white border-gray-100 text-gray-400')
                                                        }`}
                                                >
                                                    {opt}
                                                    {oIdx === q.correctOption && <span className="ml-2 text-[10px] font-black uppercase">(Correct)</span>}
                                                    {oIdx === studentAns && oIdx !== q.correctOption && <span className="ml-2 text-[10px] font-black uppercase">(Your Answer)</span>}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {q.type === 'fib' && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-black text-gray-400">Your Answer:</span>
                                                <span className={`font-black ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>{studentAns || '(Empty)'}</span>
                                            </div>
                                            {!isCorrect && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-black text-gray-400">Correct Answer:</span>
                                                    <span className="font-black text-green-600">{q.correctAnswer}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {q.type === 'photo' && (
                                        <div className="flex flex-col items-center gap-4 py-4">
                                            <div className="text-orange-600 bg-orange-100 px-4 py-2 rounded-2xl text-xs font-black uppercase">Handwritten Submission</div>
                                            {submission.file_path ? (
                                                <img
                                                    src={`http://localhost:5000/${submission.file_path}`}
                                                    alt="Submission"
                                                    className="max-h-60 rounded-2xl border border-orange-200 shadow-lg"
                                                />
                                            ) : (
                                                <p className="text-gray-400 italic text-sm">No photo uploaded.</p>
                                            )}
                                            <p className="text-[10px] text-orange-400 font-bold text-center">Instructor will grade this manually. The current score only reflects MCQ/FIB components.</p>
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
