import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import { FaClipboardList } from 'react-icons/fa';

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
        if (!selectedSubmission || score === '') return alert('Please enter a score');
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

    if (loading) return <div className="p-8 text-center text-indigo-600 font-bold">Loading submissions...</div>;

    return (
        <div className="max-w-7xl mx-auto h-[calc(100vh-160px)] flex gap-8">
            {/* List of Submissions */}
            <div className="w-80 bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col overflow-hidden">
                <div className="p-6 bg-indigo-600 text-white font-black text-lg shadow-inner">Submissions</div>
                <div className="flex-1 overflow-y-auto">
                    {submissions.length === 0 ? (
                        <div className="p-10 text-center text-gray-400 font-medium italic">No students have submitted yet.</div>
                    ) : (
                        submissions.map(sub => (
                            <button
                                key={sub.id}
                                onClick={() => {
                                    setSelectedSubmission(sub);
                                    setScore(sub.score || '');
                                    setReviewText(sub.review_text || '');
                                }}
                                className={`w-full text-left p-6 border-b border-gray-50 transition-all ${selectedSubmission?.id === sub.id ? 'bg-indigo-50 border-r-4 border-indigo-600' : 'hover:bg-gray-50'}`}
                            >
                                <div className="font-bold text-gray-800 mb-1">{sub.student_name}</div>
                                <div className="text-xs text-gray-400 font-bold truncate mb-2">{sub.student_email}</div>
                                <div className="flex justify-between items-center">
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${sub.score !== null ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                        {sub.score !== null ? 'GRADED' : 'PENDING'}
                                    </span>
                                    {sub.score !== null && <span className="text-xs font-black text-indigo-600">Score: {sub.score}</span>}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Grading Area */}
            <div className="flex-1 bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col overflow-hidden">
                {selectedSubmission ? (
                    <>
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-2xl font-black text-gray-800">{selectedSubmission.student_name}</h2>
                                <p className="text-sm text-gray-400 font-semibold">{selectedSubmission.student_email}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-400 font-black uppercase tracking-widest">Submitted At</p>
                                <p className="text-sm font-bold text-gray-600">{new Date(selectedSubmission.submitted_at).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            {/* Question by Question Review */}
                            {exam && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
                                        Student Performance Breakdown
                                    </h3>
                                    <div className="space-y-4">
                                        {(typeof exam.questions === 'string' ? JSON.parse(exam.questions) : exam.questions).map((q: any, idx: number) => {
                                            const studentAnswers = typeof selectedSubmission.submission_data === 'string'
                                                ? JSON.parse(selectedSubmission.submission_data)
                                                : selectedSubmission.submission_data;
                                            const studentAns = studentAnswers[idx];
                                            let isCorrect = false;
                                            if (q.type === 'mcq') isCorrect = studentAns === q.correctOption;
                                            if (q.type === 'fib') isCorrect = studentAns?.toString().trim().toLowerCase() === q.correctAnswer?.toString().trim().toLowerCase();

                                            return (
                                                <div key={idx} className={`p-5 rounded-2xl border-2 ${q.type === 'photo' ? 'border-orange-100 bg-orange-50/20' : (isCorrect ? 'border-green-100 bg-green-50/20' : 'border-red-100 bg-red-50/20')}`}>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-[10px] font-black uppercase text-gray-400">Q{idx + 1} • {q.type}</span>
                                                        {q.type !== 'photo' && (
                                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                {isCorrect ? 'AUTO-CORRECT' : 'AUTO-WRONG'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm font-bold text-gray-700 mb-3">{q.text}</p>

                                                    {q.type === 'mcq' && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {q.options.map((opt: string, oIdx: number) => (
                                                                <span key={oIdx} className={`px-3 py-1 rounded-lg text-xs font-bold ${oIdx === q.correctOption ? 'bg-green-100 text-green-700 border border-green-200' : (oIdx === studentAns ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-white text-gray-400 border border-gray-100')}`}>
                                                                    {opt}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {q.type === 'fib' && (
                                                        <div className="text-xs">
                                                            <p className="font-bold text-gray-500">Student: <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>{studentAns || '(Empty)'}</span></p>
                                                            {!isCorrect && <p className="font-bold text-green-600">Correct: {q.correctAnswer}</p>}
                                                        </div>
                                                    )}

                                                    {q.type === 'photo' && (
                                                        <div className="text-orange-600 text-xs font-bold italic">Check the handwritten sheet below for this answer.</div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Photo Assessment */}
                            {selectedSubmission.file_path && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span>
                                        Handwritten Answer Sheet
                                    </h3>
                                    <div className="relative group rounded-3xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50 p-4">
                                        <img
                                            src={`http://localhost:5000/${selectedSubmission.file_path}`}
                                            alt="Handwritten Submission"
                                            className="mx-auto max-h-[600px] object-contain rounded-2xl shadow-2xl group-hover:scale-[1.02] transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <a
                                                href={`http://localhost:5000/${selectedSubmission.file_path}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-white text-gray-800 px-6 py-3 rounded-2xl font-bold shadow-2xl hover:bg-gray-100 transition-colors"
                                            >
                                                Open Large Preview
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Scoring & Feedback */}
                            <div className="bg-indigo-50/50 p-8 rounded-[2rem] border border-indigo-100 space-y-6">
                                <h3 className="text-lg font-bold text-indigo-900">Review & Grades</h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="md:col-span-1 space-y-2">
                                        <label className="text-xs font-black text-indigo-400 uppercase tracking-widest">Total Score</label>
                                        <input
                                            type="number"
                                            className="w-full p-4 bg-white border-2 border-indigo-100 rounded-2xl font-black text-2xl text-center text-indigo-700 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-gray-200"
                                            placeholder="00"
                                            value={score}
                                            onChange={e => setScore(parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div className="md:col-span-3 space-y-2">
                                        <label className="text-xs font-black text-indigo-400 uppercase tracking-widest">Feedback & Reviews</label>
                                        <textarea
                                            className="w-full p-4 bg-white border-2 border-indigo-100 rounded-2xl font-medium text-gray-700 min-h-[120px] focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:italic"
                                            placeholder="Write a detailed review to help the student improve..."
                                            value={reviewText}
                                            onChange={e => setReviewText(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        onClick={() => setSelectedSubmission(null)}
                                        className="px-8 py-4 text-gray-500 font-bold hover:bg-gray-100 rounded-2xl transition-colors"
                                    >
                                        Close
                                    </button>
                                    <button
                                        onClick={handleGrade}
                                        className="px-12 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                        Release Review
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-20 bg-gray-50/30">
                        <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6 text-4xl">
                            <FaClipboardList />
                        </div>
                        <h3 className="text-2xl font-black text-gray-800 mb-2">Select a Candidate</h3>
                        <p className="text-gray-400 font-medium max-w-sm">Choose a student from the sidebar to start reviewing their exam performance and handwritten sheets.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InstructorGrading;
