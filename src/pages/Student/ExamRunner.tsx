import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { FaCheckCircle, FaChevronLeft, FaChevronRight, FaFileUpload, FaTrash, FaEye } from 'react-icons/fa';
import { useModal } from '../../context/ModalContext';

const ExamRunner: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useContext(AuthContext)!;
    const navigate = useNavigate();
    const { showAlert, showConfirm } = useModal();

    const [exam, setExam] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<{ [key: number]: any }>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);


    useEffect(() => {
        const fetchExam = async () => {
            try {
                const res = await api.get(`/api/exams/${id}`);
                // Protection: Check start time
                if (new Date() < new Date(res.data.date)) {
                    showAlert('Access Denied: This assessment has not commenced yet.', 'error', 'TEMPORAL LOCK');
                    navigate('/student/tests');
                    return;
                }

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
                showAlert(`Exam Submitted Successfully! Final Score: ${score}`, 'success', 'EXTRACTION COMPLETE').then(() => {
                    navigate(`/student/exam-result/${submissionId}`);
                });
            } else {
                showAlert('Exam Submitted Successfully! Digital answers are graded, handwritten parts are pending review.', 'success', 'INTEL SYNCED').then(() => {
                    navigate('/student/tests');
                });
            }
        } catch (err) {
            console.error(err);
            showAlert('Submission failed. Please check your connection and retry extraction.', 'error', 'UPLINK FAILURE');
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
        <div className="fixed inset-0 z-[100] bg-surface-dark flex flex-col lg:flex-row animate-in fade-in duration-700 overflow-hidden">
            {/* Mobile Header with Timer */}
            <div className="lg:hidden flex items-center justify-between px-4 h-16 bg-surface border-b border-surface-border shrink-0 z-50">
                <div className="flex items-center gap-2 truncate">
                    <div className="bg-primary/10 text-primary p-1.5 rounded-lg border border-primary/20">
                        <FaCheckCircle size={14} />
                    </div>
                    <h2 className="text-sm font-black text-accent-white truncate uppercase italic tracking-tighter">{exam.title}</h2>
                </div>
                <div className={`px-4 py-1.5 rounded-xl font-black text-lg italic tracking-tight border shadow-sm transition-all duration-500 ${timeLeft < 300 ? 'text-primary bg-primary/10 border-primary animate-pulse' : 'text-accent-blue bg-accent-blue/10 border-accent-blue/20'}`}>
                    {formatTime(timeLeft)}
                </div>
            </div>

            {/* Left Operational Area: Question Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-surface-dark relative min-h-0 overflow-hidden">
                {/* Desktop Top Info Area */}
                <div className="hidden lg:flex p-8 pb-4 items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/10 text-primary p-2.5 rounded-xl border border-primary/20 shadow-sm">
                            <FaCheckCircle size={18} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-accent-white leading-none italic tracking-tighter uppercase">{exam.title}</h2>
                            <p className="text-[10px] text-primary font-black uppercase tracking-[0.3em] opacity-80 italic mt-1">{exam.type} ASSESSMENT</p>
                        </div>
                    </div>
                </div>

                {/* Question Area (Scrollable) */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-8 lg:px-12 pb-32 pt-4 lg:pt-0">
                    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
                        <div className="premium-card p-6 md:p-10 lg:p-12 border-surface-border relative overflow-hidden group min-h-[250px] md:min-h-[400px] flex flex-col justify-center shadow-2xl">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -z-10"></div>

                            <div className="mb-6 md:mb-10">
                                <span className="inline-block px-3 py-1 md:px-4 md:py-1.5 bg-surface-light text-accent-white/40 border border-surface-border rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] mb-4 md:mb-6 italic">
                                    BLOCK {currentQuestionIndex + 1} <span className="text-primary mx-2">/</span> {questions.length}
                                </span>
                                <h3 className="text-xl md:text-3xl lg:text-5xl font-black text-accent-white leading-tight italic uppercase tracking-tighter">
                                    {currentQuestion?.text}
                                </h3>
                            </div>

                            <div className="space-y-4 flex-1 w-full max-w-2xl">
                                {currentQuestion?.type === 'mcq' && (
                                    <div className="grid grid-cols-1 gap-3">
                                        {currentQuestion?.options?.map((opt: string, idx: number) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleOptionSelect(idx)}
                                                className={`w-full text-left p-4 md:p-5 rounded-xl md:rounded-2xl border-2 transition-all duration-300 group/opt flex items-center gap-3 md:gap-5 ${answers[currentQuestionIndex] === idx
                                                    ? 'border-primary bg-primary/5 shadow-xl shadow-primary/10 scale-[1.01]'
                                                    : 'border-surface-border bg-surface-dark/50 hover:border-primary/40 hover:bg-surface-light'
                                                    }`}
                                            >
                                                <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-500 ${answers[currentQuestionIndex] === idx ? 'border-primary bg-primary rotate-90' : 'border-surface-border bg-surface-dark group-hover/opt:border-primary/60'
                                                    }`}>
                                                    {answers[currentQuestionIndex] === idx && <div className="w-2 md:w-2.5 h-2 md:h-2.5 bg-white rounded-full"></div>}
                                                </div>
                                                <span className={`text-sm md:text-lg font-bold italic tracking-tight transition-colors ${answers[currentQuestionIndex] === idx ? 'text-accent-white' : 'text-accent-gray group-hover/opt:text-accent-white'}`}>
                                                    {opt.toUpperCase()}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {currentQuestion?.type === 'fib' && (
                                    <div className="bg-surface-dark/50 p-6 rounded-3xl border border-surface-border">
                                        <input
                                            type="text"
                                            value={answers[currentQuestionIndex] || ''}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setAnswers(prev => ({ ...prev, [currentQuestionIndex]: val }));
                                            }}
                                            className="w-full p-6 bg-surface-light border-2 border-surface-border rounded-xl text-xl md:text-2xl font-black text-primary italic focus:border-primary focus:shadow-[0_0_30px_rgba(238,29,35,0.1)] outline-none transition-all placeholder:text-accent-gray/20 uppercase tracking-tighter"
                                            placeholder="TYPE RESPONSE..."
                                            autoFocus
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Integrated Navigation below question area */}
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 pb-8 lg:pb-0">
                            <button
                                disabled={currentQuestionIndex === 0}
                                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 rounded-xl bg-surface-dark border border-surface-border text-accent-gray font-black uppercase tracking-widest text-[8px] md:text-[10px] hover:text-accent-white hover:border-primary/40 disabled:opacity-20 transition-all active:scale-95"
                            >
                                <FaChevronLeft size={10} className="md:w-[12px]" /> REWIND
                            </button>

                            <div className="flex gap-2 md:gap-4 w-full sm:w-auto">
                                {currentQuestionIndex < questions.length - 1 ? (
                                    <button
                                        onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-3 md:gap-4 px-8 md:px-12 py-3.5 md:py-5 rounded-xl md:rounded-2xl bg-accent-blue text-white font-black uppercase tracking-widest text-[8px] md:text-[10px] hover:bg-accent-blue/80 shadow-[0_15px_30px_-5px_rgba(42,157,244,0.4)] transition-all active:scale-95 leading-none"
                                    >
                                        FORWARD <FaChevronRight size={10} className="md:w-[12px]" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className={`flex-1 sm:flex-none flex items-center justify-center gap-3 md:gap-4 px-10 md:px-16 py-3.5 md:py-5 rounded-xl md:rounded-2xl text-white font-black uppercase tracking-widest text-[9px] md:text-[11px] shadow-2xl transition-all active:scale-95 leading-none ${isSubmitting ? 'bg-surface-dark text-accent-gray cursor-not-allowed opacity-50' : 'bg-primary hover:bg-primary-hover shadow-[0_15px_30px_-5px_rgba(238,29,35,0.4)] md:scale-105'
                                            }`}
                                    >
                                        {isSubmitting ? 'UPLOADING...' : 'COMPLETE'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lateral Progress Bar (Visual depth) */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-surface-light overflow-hidden z-20">
                    <div className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(238,29,35,0.8)]" style={{ width: `${progress}%` }}></div>
                </div>
            </main>

            {/* Sidebar: Integrated Controls & Matrix (Right Column) */}
            <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-surface-border bg-surface flex flex-col shrink-0 overflow-y-auto lg:overflow-visible h-[250px] lg:h-auto">
                {/* Timer Section (Hidden on mobile as it is in header) */}
                <div className="hidden lg:block p-8 border-b border-surface-border">
                    <div className="mb-6 flex items-center justify-between">
                        <span className="text-[10px] font-black text-accent-gray uppercase tracking-[0.3em] italic opacity-50">Operation Time</span>
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-primary animate-ping"></div>
                        </div>
                    </div>
                    <div className={`px-6 py-4 rounded-2xl font-black text-4xl tracking-tighter italic border-2 transition-all duration-500 text-center ${timeLeft < 300 ? 'text-primary bg-primary/10 border-primary shadow-[0_0_30px_rgba(238,29,35,0.3)] animate-pulse' : 'text-accent-blue bg-accent-blue/10 border-accent-blue/20'}`}>
                        {formatTime(timeLeft)}
                    </div>
                </div>

                {/* Matrix Section (Small & Scrollable) */}
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="px-6 md:px-8 py-4 lg:py-6 flex items-center justify-between">
                        <h4 className="text-[10px] font-black text-accent-white uppercase tracking-[0.3em] italic opacity-50">Operational Matrix</h4>
                        <span className="text-[10px] font-black text-primary italic uppercase">{progress.toFixed(0)}%</span>
                    </div>

                    {/* Matrix Grid with Scroll Container */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-8 pb-4 lg:pb-8">
                        <div className="grid grid-cols-6 sm:grid-cols-10 lg:grid-cols-5 gap-2">
                            {questions.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentQuestionIndex(idx)}
                                    className={`h-8 lg:h-10 rounded-lg font-black italic text-xs transition-all duration-300 hover:scale-110 ${currentQuestionIndex === idx ? 'bg-primary text-white shadow-lg shadow-primary/30 border border-white/20' :
                                        answers[idx] !== undefined ? 'bg-accent-blue/20 text-accent-blue border border-accent-blue/30' : 'bg-surface-dark text-accent-gray/40 border border-surface-border hover:bg-surface-light'
                                        }`}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Integrated Extraction / Exit at Bottom Partition */}
                    <div className="p-6 md:p-8 border-t border-surface-border space-y-4">
                        {exam.allow_upload && !previewUrl && (
                            <label className="flex flex-col items-center justify-center p-4 md:p-6 border-2 border-dashed border-surface-border rounded-xl md:rounded-2xl hover:border-primary/40 hover:bg-primary/5 cursor-pointer transition-all duration-500 group shadow-inner bg-surface-dark/30">
                                <FaFileUpload size={20} className="md:size-[24px] text-accent-gray/30 group-hover:text-primary transition-colors mb-2" />
                                <p className="text-[8px] md:text-[9px] text-accent-gray font-black uppercase tracking-widest group-hover:text-accent-white text-center">Attach Intel (Photo)</p>
                                <input type='file' className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        )}
                        {previewUrl && (
                            <div className="relative group rounded-xl md:rounded-2xl overflow-hidden border border-surface-border shadow-lg">
                                <img src={previewUrl} alt="Preview" className="w-full h-24 md:h-32 object-cover" />
                                <div className="absolute inset-0 bg-surface-dark/80 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm">
                                    <button onClick={() => window.open(previewUrl)} className="p-2 bg-white/10 border border-white/20 rounded-full text-white hover:bg-primary transition-all">
                                        <FaEye size={12} />
                                    </button>
                                    <button onClick={() => { setUploadFile(null); setPreviewUrl(null); }} className="p-2 bg-red-500/80 border border-red-500 rounded-full text-white hover:bg-red-600 transition-all">
                                        <FaTrash size={12} />
                                    </button>
                                </div>
                            </div>
                        )}
                        <button
                            onClick={async () => {
                                const confirmed = await showConfirm(
                                    'Operational progress will be lost. Are you sure you want to terminate the session?',
                                    'warning',
                                    'ABORT OPERATION?'
                                );
                                if (confirmed) {
                                    navigate('/student/tests');
                                }
                            }}
                            className="w-full text-accent-gray hover:text-primary font-black text-[10px] uppercase tracking-[0.4em] transition-colors py-3 md:py-4 bg-surface-dark border border-surface-border rounded-xl hover:bg-surface-light flex items-center justify-center gap-2 group"
                        >
                            <span className="group-hover:translate-x-[-4px] transition-transform">←</span> ABORT MISSION
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ExamRunner;
