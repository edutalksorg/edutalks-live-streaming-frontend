import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FaTrophy, FaClock, FaChevronLeft, FaChevronRight, FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';
import { useModal } from '../../context/ModalContext';

const TournamentExamRunner: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showAlert, showConfirm } = useModal();

    const [tournament, setTournament] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<{ [key: string]: any }>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tabSwitches, setTabSwitches] = useState(0);


    // Fetch Tournament & Questions
    useEffect(() => {
        const fetchTournament = async () => {
            try {
                // Unified start call returns both attempt and tournament data
                const res = await api.post(`/api/tournaments/${id}/start`);
                const { attempt, tournament: tournamentData } = res.data;

                setTournament(tournamentData);

                const parsedQuestions = typeof tournamentData.questions === 'string'
                    ? JSON.parse(tournamentData.questions)
                    : tournamentData.questions;

                setQuestions(parsedQuestions);
                setTimeLeft(tournamentData.duration * 60);

                const savedAnswers = attempt.answers ? JSON.parse(attempt.answers) : {};
                setAnswers(savedAnswers);
                setTabSwitches(attempt.tab_switches || 0);

            } catch (err: any) {
                console.error('Tournament Fetch Error:', err);
                const errorMsg = err.response?.data?.message || 'Unable to start tournament. Ensure you are registered and the exam is LIVE.';

                if (errorMsg.includes('already submitted')) {
                    navigate(`/student/tournament-result/${id}`);
                    return;
                }

                showAlert(errorMsg, 'error', 'ACCESS DENIED').then(() => {
                    navigate('/student/tournaments');
                });
            }
        };
        fetchTournament();
    }, [id, navigate]);

    // Timer Logic
    useEffect(() => {
        if (timeLeft <= 0) {
            if (tournament && timeLeft === 0) handleSubmit();
            return;
        }
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, tournament]);

    // Anti-Cheat: Visibility Change & Blur
    const logActivity = useCallback(async (action: string, details: string) => {
        try {
            await api.post(`/api/tournaments/${id}/log-activity`, { action, details });
        } catch (err) {
            console.error('Activity Log Error:', err);
        }
    }, [id]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                const newCount = tabSwitches + 1;
                setTabSwitches(newCount);
                logActivity('tab_switch', `User left the page. Total switches: ${newCount}`);

                if (tournament?.tab_switch_limit && newCount >= tournament.tab_switch_limit) {
                    showAlert('You have exceeded the tab switch limit. Your exam will be submitted automatically.', 'warning', 'SECURITY BREACH').then(() => {
                        handleSubmit();
                    });
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [tabSwitches, tournament, logActivity]);

    const handleOptionSelect = (optionIndex: number) => {
        const currentQuestion = questions[currentQuestionIndex];
        if (!currentQuestion) return;
        setAnswers({ ...answers, [currentQuestion.id]: optionIndex });
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const res = await api.post(`/api/tournaments/${id}/submit`, { answers });
            showAlert(`Your results are being calculated. Score: ${res.data.score}`, 'success', 'TOURNAMENT COMPLETE').then(() => {
                navigate(`/student/tournament-result/${id}`);
            });
        } catch (err) {
            console.error('Submit Error:', err);
            showAlert('Failed to submit tournament. Please try again or contact support.', 'error', 'SYNC ERROR');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!tournament) {
        return (
            <div className="min-h-screen bg-surface-dark flex items-center justify-center">
                <div className="animate-spin h-16 w-16 border-4 border-primary border-t-transparent rounded-full shadow-lg shadow-primary/20"></div>
            </div>
        );
    }

    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="fixed inset-0 z-[100] bg-surface-dark flex flex-col lg:flex-row overflow-hidden italic-content">
            {/* Header / Mobile Timer */}
            <div className="lg:hidden flex items-center justify-between px-6 h-20 bg-surface border-b border-surface-border shrink-0 z-50">
                <div className="flex items-center gap-3">
                    <FaTrophy className="text-primary" />
                    <h2 className="text-sm font-black text-accent-white uppercase italic tracking-tighter">{tournament.name}</h2>
                </div>
                <div className={`px-5 py-2 rounded-2xl font-black text-xl italic tracking-tight border shadow-sm transition-all duration-500 ${timeLeft < 300 ? 'text-primary bg-primary/10 border-primary animate-pulse' : 'text-accent-blue bg-accent-blue/10 border-accent-blue/20'}`}>
                    {formatTime(timeLeft)}
                </div>
            </div>

            {/* Left operational Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-surface-dark relative min-h-0 overflow-hidden">
                <div className="hidden lg:flex p-10 pb-4 items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="bg-primary/10 text-primary p-3 rounded-2xl border border-primary/20 shadow-lg shadow-primary/5">
                            <FaShieldAlt size={22} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-accent-white leading-none italic tracking-tighter uppercase">{tournament.name}</h2>
                            <p className="text-[10px] text-primary font-black uppercase tracking-[0.4em] opacity-80 italic mt-2">SECURE TOURNAMENT ENVIRONMENT</p>
                        </div>
                    </div>
                    {tournament.tab_switch_limit && (
                        <div className="flex items-center gap-3 px-6 py-3 bg-surface border border-surface-border rounded-2xl">
                            <FaExclamationTriangle className={tabSwitches > 0 ? 'text-primary' : 'text-accent-gray'} />
                            <span className="text-[11px] font-black text-accent-gray uppercase tracking-widest leading-none">
                                Tabs: <span className={tabSwitches > 0 ? 'text-primary' : 'text-accent-white'}>{tabSwitches}</span> / {tournament.tab_switch_limit}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-12 lg:px-20 pb-32 pt-6 lg:pt-0">
                    <div className="max-w-4xl mx-auto space-y-10">
                        <div className="premium-card p-8 md:p-12 lg:p-16 border-surface-border relative overflow-hidden group min-h-[300px] md:min-h-[450px] flex flex-col justify-center shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] bg-surface/50 backdrop-blur-3xl">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -z-10"></div>

                            <span className="inline-block px-4 py-2 bg-surface-light text-accent-white/40 border border-surface-border rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-8 italic">
                                QUESTION {currentQuestionIndex + 1} <span className="text-primary mx-3">/</span> {questions.length}
                            </span>

                            <h3 className="text-2xl md:text-4xl lg:text-5xl font-black text-accent-white leading-[1.15] italic uppercase tracking-tighter mb-12">
                                {currentQuestion?.question}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full">
                                {currentQuestion?.options?.map((opt: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleOptionSelect(idx)}
                                        className={`w-full text-left p-5 md:p-7 rounded-[1.5rem] border-2 transition-all duration-300 group/opt flex items-center gap-5 ${answers[currentQuestion.id] === idx
                                            ? 'border-primary bg-primary/10 shadow-2xl shadow-primary/20 scale-[1.02]'
                                            : 'border-surface-border bg-surface-dark/50 hover:border-primary/40 hover:bg-surface-light'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-500 ${answers[currentQuestion.id] === idx ? 'border-primary bg-primary rotate-90 scale-110' : 'border-surface-border bg-surface-dark group-hover/opt:border-primary'
                                            }`}>
                                            {answers[currentQuestion.id] === idx && <div className="w-2.5 md:w-3 h-2.5 md:h-3 bg-white rounded-full"></div>}
                                        </div>
                                        <span className={`text-base md:text-xl font-black italic tracking-tight transition-colors ${answers[currentQuestion.id] === idx ? 'text-accent-white' : 'text-accent-gray group-hover/opt:text-accent-white'
                                            }`}>
                                            {opt.toUpperCase()}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mt-6 pb-12">
                            <button
                                disabled={currentQuestionIndex === 0}
                                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                                className="w-full md:w-auto flex items-center justify-center gap-4 px-10 py-5 rounded-2xl bg-surface-dark border border-surface-border text-accent-gray font-black uppercase tracking-widest text-[11px] hover:text-accent-white hover:border-primary/40 disabled:opacity-20 transition-all active:scale-95"
                            >
                                <FaChevronLeft size={14} /> PREVIOUS
                            </button>

                            <div className="flex gap-4 w-full md:w-auto">
                                {currentQuestionIndex < questions.length - 1 ? (
                                    <button
                                        onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-4 px-14 py-5 rounded-2xl bg-accent-blue text-white font-black uppercase tracking-widest text-[11px] hover:bg-accent-blue/80 shadow-[0_20px_40px_-10px_rgba(42,157,244,0.4)] transition-all active:scale-95"
                                    >
                                        NEXT <FaChevronRight size={14} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className={`flex-1 md:flex-none flex items-center justify-center gap-4 px-20 py-5 rounded-2xl text-white font-black uppercase tracking-widest text-[11px] shadow-2xl transition-all active:scale-95 ${isSubmitting ? 'bg-surface-dark text-accent-gray' : 'bg-primary hover:bg-primary-hover shadow-[0_20px_40px_-10px_rgba(238,29,35,0.4)] scale-110'
                                            }`}
                                    >
                                        {isSubmitting ? 'UPLOADING...' : 'COMPLETE MISSION'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 w-full h-1.5 bg-surface-light overflow-hidden z-20">
                    <div className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(238,29,35,1)]" style={{ width: `${progress}%` }}></div>
                </div>
            </main>

            {/* Right Operational Sidebar */}
            <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-surface-border bg-surface flex flex-col shrink-0 overflow-y-auto lg:overflow-visible h-[300px] lg:h-auto">
                <div className="hidden lg:block p-10 border-b border-surface-border relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                    <div className="mb-8 flex items-center justify-between">
                        <span className="text-[11px] font-black text-accent-gray uppercase tracking-[0.4em] italic opacity-50">Clock Cycles</span>
                        <FaClock size={16} className="text-primary animate-pulse" />
                    </div>
                    <div className={`px-8 py-5 rounded-3xl font-black text-5xl tracking-tighter italic border-2 transition-all duration-500 text-center ${timeLeft < 300 ? 'text-primary bg-primary/10 border-primary shadow-[0_0_40px_rgba(238,29,35,0.4)] animate-pulse' : 'text-accent-blue bg-accent-blue/10 border-accent-blue/20'}`}>
                        {formatTime(timeLeft)}
                    </div>
                </div>

                <div className="flex-1 flex flex-col min-h-0 bg-surface/30 backdrop-blur-xl">
                    <div className="px-10 py-8 flex items-center justify-between">
                        <h4 className="text-[11px] font-black text-accent-white uppercase tracking-[0.4em] italic opacity-50">Operational Matrix</h4>
                        <span className="text-[11px] font-black text-primary italic uppercase">{progress.toFixed(0)}%</span>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar px-10 pb-10">
                        <div className="grid grid-cols-5 sm:grid-cols-10 lg:grid-cols-5 gap-3">
                            {questions.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentQuestionIndex(idx)}
                                    className={`h-10 lg:h-12 rounded-xl font-black italic text-sm transition-all duration-300 hover:scale-110 active:scale-90 ${currentQuestionIndex === idx
                                        ? 'bg-primary text-white shadow-xl shadow-primary/30 border border-white/30'
                                        : answers[questions[idx].id] !== undefined
                                            ? 'bg-accent-blue/20 text-accent-blue border border-accent-blue/40'
                                            : 'bg-surface-dark text-accent-gray/40 border border-surface-border hover:bg-surface-light'
                                        }`}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-10 border-t border-surface-border">
                        <button
                            onClick={async () => {
                                const confirmed = await showConfirm(
                                    'Operational progress will be lost and your score will be zero. Termination is final.',
                                    'warning',
                                    'ABORT TOURNAMENT?'
                                );
                                if (confirmed) {
                                    navigate('/student/tournaments');
                                }
                            }}
                            className="w-full text-accent-gray hover:text-primary font-black text-[11px] uppercase tracking-[0.5em] transition-all py-5 bg-surface-dark border border-surface-border rounded-2xl hover:bg-surface-light flex items-center justify-center gap-3 overflow-hidden relative group"
                        >
                            <span className="relative z-10">TERMINATE</span>
                            <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default TournamentExamRunner;
