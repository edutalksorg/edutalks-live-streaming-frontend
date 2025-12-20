import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { FaCheckCircle, FaChevronLeft, FaChevronRight, FaFileUpload, FaTrash, FaEye } from 'react-icons/fa';

const ExamRunner: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useContext(AuthContext)!;
    const navigate = useNavigate();

    const [exam, setExam] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<{ [key: number]: any }>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Upload State
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchExam = async () => {
            try {
                const res = await api.get(`/api/exams/${id}`);
                setExam(res.data);
                const parsedQuestions = typeof res.data.questions === 'string'
                    ? JSON.parse(res.data.questions)
                    : res.data.questions;
                setQuestions(parsedQuestions);
                setTimeLeft(res.data.duration * 60);
            } catch (err) {
                console.error(err);
            }
        };
        fetchExam();
    }, [id]);

    useEffect(() => {
        if (timeLeft <= 0) {
            if (exam && timeLeft === 0) handleSubmit();
            return;
        }
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, exam]);

    const handleOptionSelect = (optionIndex: number) => {
        setAnswers({ ...answers, [currentQuestionIndex]: optionIndex });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        if (file) {
            setUploadFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('exam_id', id!);
        formData.append('student_id', user?.id?.toString() || '');
        formData.append('submission_data', JSON.stringify(answers));

        if (uploadFile) {
            formData.append('file', uploadFile);
        }

        try {
            const res = await api.post('/api/exams/submit', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const { submissionId, status, score } = res.data;

            if (status === 'graded') {
                alert(`Exam Submitted Successfully! Your Score: ${score}`);
                navigate(`/student/exam-result/${submissionId}`);
            } else {
                alert('Exam Submitted Successfully! Your digital answers are graded, but handwritten parts are pending instructor review.');
                navigate('/student/tests');
            }
        } catch (err) {
            console.error(err);
            alert('Submission Failed.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!exam) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
        </div>
    );

    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
            {/* Header Sticky */}
            <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-indigo-600 text-white p-2 rounded-xl">
                            <FaCheckCircle size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900 leading-tight">{exam.title}</h2>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{exam.type}</p>
                        </div>
                    </div>

                    <div className={`px-5 py-2 rounded-2xl font-mono text-2xl font-black ${timeLeft < 300 ? 'text-red-500 bg-red-50 animate-pulse' : 'text-indigo-600 bg-indigo-50'}`}>
                        {formatTime(timeLeft)}
                    </div>

                    <button
                        onClick={() => { if (window.confirm('Are you sure you want to exit? Your progress may not be saved.')) navigate('/student/tests') }}
                        className="text-gray-400 hover:text-gray-600 font-bold text-sm transition"
                    >
                        Exit
                    </button>
                </div>
                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-gray-100">
                    <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
            </header>

            <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 pb-32">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Questions Area */}
                    <div className="lg:col-span-2 space-y-8 text-white text-3xl font-bold bg-[#1E293B]">
                        {/* Placeholder for actual premium question card */}
                        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 min-h-[400px] flex flex-col">
                            <div className="mb-10">
                                <span className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                                    Question {currentQuestionIndex + 1} of {questions.length}
                                </span>
                                <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
                                    {currentQuestion?.text}
                                </h3>
                            </div>

                            <div className="space-y-4 flex-1">
                                {currentQuestion?.type === 'mcq' && currentQuestion?.options?.map((opt: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleOptionSelect(idx)}
                                        className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-200 group flex items-start gap-4 ${answers[currentQuestionIndex] === idx
                                            ? 'border-indigo-600 bg-indigo-50 shadow-md shadow-indigo-100'
                                            : 'border-gray-50 bg-[#F8FAFC] hover:border-indigo-200'
                                            }`}
                                    >
                                        <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${answers[currentQuestionIndex] === idx ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                                            }`}>
                                            {answers[currentQuestionIndex] === idx && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                        </div>
                                        <span className={`font-bold ${answers[currentQuestionIndex] === idx ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                            {opt}
                                        </span>
                                    </button>
                                ))}

                                {currentQuestion?.type === 'fib' && (
                                    <div className="space-y-4">
                                        <p className="text-gray-500 font-bold mb-2">Type your answer below:</p>
                                        <input
                                            type="text"
                                            value={answers[currentQuestionIndex] || ''}
                                            onChange={(e) => setAnswers({ ...answers, [currentQuestionIndex]: e.target.value })}
                                            className="w-full p-6 bg-white border-2 border-indigo-100 rounded-3xl text-2xl font-black text-indigo-700 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-none transition-all placeholder:text-gray-200"
                                            placeholder="Write here..."
                                            autoFocus
                                        />
                                    </div>
                                )}

                                {currentQuestion?.type === 'photo' && (
                                    <div className="bg-orange-50 p-10 rounded-3xl border-2 border-dashed border-orange-200 text-center space-y-4">
                                        <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto text-2xl">
                                            <FaFileUpload />
                                        </div>
                                        <div>
                                            <h4 className="text-orange-900 font-black">Handwriting Required</h4>
                                            <p className="text-orange-700/70 text-sm font-medium">Please solve this on paper and upload the photo using the sidebar panel before finishing.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Navigation & Upload */}
                    <div className="space-y-8">
                        {/* Question Grid */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            <h4 className="font-bold text-gray-900 mb-4">Questions Overview</h4>
                            <div className="grid grid-cols-5 gap-2">
                                {questions.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentQuestionIndex(idx)}
                                        className={`h-10 rounded-xl font-bold flex items-center justify-center text-sm transition ${currentQuestionIndex === idx ? 'bg-indigo-600 text-white' :
                                            answers[idx] !== undefined ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-400'
                                            }`}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Photo Upload Section */}
                        {exam.allow_upload && (
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                    <FaFileUpload className="text-indigo-600" /> Handwriting Upload
                                </h4>
                                <p className="text-xs text-gray-400 font-medium leading-relaxed">
                                    Please write your subjective answers on paper, take a photo, and upload it here before submitting.
                                </p>

                                {!previewUrl ? (
                                    <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-200 rounded-3xl hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer transition group">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <FaFileUpload size={32} className="text-gray-300 group-hover:text-indigo-400 transition" />
                                            <p className="mt-2 text-sm text-gray-500 font-bold group-hover:text-indigo-600 transition">Select Image</p>
                                        </div>
                                        <input type='file' className="hidden" accept="image/*" onChange={handleFileChange} />
                                    </label>
                                ) : (
                                    <div className="relative group rounded-3xl overflow-hidden border border-gray-100 shadow-md">
                                        <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover" />
                                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => window.open(previewUrl)} className="p-3 bg-white bg-opacity-20 backdrop-blur-md rounded-full text-white hover:bg-opacity-30 transition">
                                                <FaEye />
                                            </button>
                                            <button onClick={() => { setUploadFile(null); setPreviewUrl(null); }} className="p-3 bg-red-500 rounded-full text-white hover:bg-red-600 transition">
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Bottom Sticky Controls */}
            <footer className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-6 z-40">
                <div className="max-w-6xl mx-auto flex justify-between items-center gap-4">
                    <button
                        disabled={currentQuestionIndex === 0}
                        onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                        className="flex items-center gap-2 px-8 py-3 rounded-2xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 disabled:opacity-50 transition"
                    >
                        <FaChevronLeft /> Previous
                    </button>

                    <div className="flex gap-4">
                        {currentQuestionIndex < questions.length - 1 ? (
                            <button
                                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                                className="flex items-center gap-2 px-10 py-3 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition"
                            >
                                Next Question <FaChevronRight />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className={`flex items-center gap-2 px-12 py-3 rounded-2xl text-white font-black uppercase tracking-widest shadow-xl transition-all ${isSubmitting ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700 shadow-green-100 scale-105'
                                    }`}
                            >
                                {isSubmitting ? 'Submitting...' : 'Finish Exam'}
                            </button>
                        )}
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ExamRunner;
