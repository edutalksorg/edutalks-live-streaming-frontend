import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import { FaPlus, FaTrash, FaClipboardList } from 'react-icons/fa';

interface Question {
    text: string;
    type: 'mcq' | 'fib' | 'photo';
    options?: string[]; // For MCQ
    correctOption?: number; // For MCQ
    correctAnswer?: string; // For FIB
}

interface Exam {
    id: number;
    title: string;
    date: string;
    expiry_date?: string;
    duration: number;
    type: string;
    subject_name?: string;
    attempts_allowed: number;
}

const InstructorExams: React.FC = () => {
    const [exams, setExams] = useState<Exam[]>([]);
    const [batches, setBatches] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editingExam, setEditingExam] = useState<Exam | null>(null);
    const [successModal, setSuccessModal] = useState<{ show: boolean, message: string }>({ show: false, message: '' });

    // Form State
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [duration, setDuration] = useState(60);
    const [examType, setExamType] = useState('hourly');
    const [subjectId, setSubjectId] = useState('');
    const [attemptsAllowed, setAttemptsAllowed] = useState(1);
    const [questions, setQuestions] = useState<Question[]>([
        { text: '', type: 'mcq', options: ['', '', '', ''], correctOption: 0 }
    ]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [examRes, dashboardRes] = await Promise.all([
                api.get('/api/instructor/exams'),
                api.get('/api/instructor/dashboard')
            ]);
            setExams(examRes.data);
            setBatches(dashboardRes.data.batches);
            if (dashboardRes.data.batches.length > 0 && !subjectId) {
                setSubjectId(dashboardRes.data.batches[0].subject_id.toString());
            }
        } catch (err) {
            console.error("Failed to fetch initial data");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (exam: any) => {
        setEditingExam(exam);
        setTitle(exam.title);
        setDate(new Date(exam.date).toISOString().slice(0, 16));
        setExpiryDate(exam.expiry_date ? new Date(exam.expiry_date).toISOString().slice(0, 16) : '');
        setDuration(exam.duration);
        setExamType(exam.type);
        setSubjectId(exam.subject_id?.toString() || '');
        setQuestions(typeof exam.questions === 'string' ? JSON.parse(exam.questions) : exam.questions);
        setAttemptsAllowed(exam.attempts_allowed || 1);
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this exam?')) return;
        try {
            await api.delete(`/api/instructor/exams/${id}`);
            fetchInitialData();
            alert('Exam Deleted');
        } catch (err) {
            console.error("Failed to delete exam");
        }
    };

    const handleQuestionChange = (index: number, field: keyof Question, value: any) => {
        const newQuestions = [...questions];
        (newQuestions[index] as any)[field] = value;
        setQuestions(newQuestions);
    };

    const addQuestion = (type: 'mcq' | 'fib' | 'photo', index?: number) => {
        const newQ: Question = { text: '', type };
        if (type === 'mcq') {
            newQ.options = ['', '', '', ''];
            newQ.correctOption = 0;
        } else if (type === 'fib') {
            newQ.correctAnswer = '';
        }

        if (typeof index === 'number') {
            const newQuestions = [...questions];
            newQuestions.splice(index + 1, 0, newQ);
            setQuestions(newQuestions);
        } else {
            setQuestions([...questions, newQ]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subjectId) return alert('Please select a subject');
        try {
            const payload = {
                title, date, duration, questions,
                expiry_date: expiryDate || null,
                subject_id: parseInt(subjectId),
                total_marks: questions.length,
                type: examType,
                attempts_allowed: attemptsAllowed,
                allow_upload: questions.some(q => q.type === 'photo')
            };

            if (editingExam) {
                await api.put(`/api/instructor/exams/${editingExam.id}`, payload);
                setSuccessModal({ show: true, message: 'Exam Updated Successfully' });
            } else {
                await api.post('/api/instructor/exams', payload);
                setSuccessModal({ show: true, message: 'Exam Created Successfully' });
            }

            setShowModal(false);
            setEditingExam(null);
            resetForm();
            fetchInitialData();
        } catch (err) {
            console.error("Failed to save exam");
        }
    };

    const resetForm = () => {
        setTitle('');
        setDate('');
        setExpiryDate('');
        setDuration(60);
        setExamType('hourly');
        setAttemptsAllowed(1);
        setQuestions([{ text: '', type: 'mcq', options: ['', '', '', ''], correctOption: 0 }]);
    };

    if (loading) return <div className="p-8 text-center text-indigo-600 font-bold">Loading Exams...</div>;

    return (
        <div className="animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div>
                    <h2 className="text-4xl font-black text-accent-white italic mb-2 tracking-tighter uppercase">EXAM <span className="text-primary">ENGINE</span></h2>
                    <p className="text-accent-gray uppercase tracking-[0.3em] text-[10px] font-black opacity-70">Architecture & Assessment Management</p>
                </div>
                <button
                    onClick={() => { resetForm(); setEditingExam(null); setShowModal(true); }}
                    className="btn-primary"
                >
                    <FaPlus /> CREATE NEW EXAMINATION
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {exams.map(exam => (
                    <div key={exam.id} className="premium-card p-8 flex flex-col justify-between group">
                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-full">{exam.type}</span>
                                <span className="text-xs text-accent-gray font-black uppercase tracking-tighter opacity-50">{new Date(exam.date).toLocaleDateString()}</span>
                            </div>
                            <h3 className="text-xl font-black text-accent-white italic mb-3 uppercase leading-tight">{exam.title}</h3>
                            <div className="flex flex-wrap items-center gap-4 mb-4">
                                <div className="flex items-center gap-2 text-accent-gray italic font-medium text-sm">
                                    <FaClipboardList className="text-accent-blue" />
                                    <span>{exam.duration} MINS</span>
                                </div>
                                <div className="px-3 py-1 bg-surface-light border border-surface-border rounded-lg text-[10px] font-black text-accent-gray uppercase tracking-widest">
                                    {exam.subject_name || 'GENERAL'}
                                </div>
                            </div>
                            {exam.expiry_date && (
                                <div className="bg-primary/5 border border-primary/10 p-3 rounded-xl mb-4">
                                    <p className="text-[10px] text-primary font-black uppercase tracking-widest">Lethal Expiry: {new Date(exam.expiry_date).toLocaleString()}</p>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-3 mt-6 pt-6 border-t border-surface-border">
                            <Link to={`/instructor/exams/${exam.id}/grading`} className="flex-1 btn-outline py-2.5 text-[9px]">
                                RESULTS
                            </Link>
                            <button onClick={() => handleEdit(exam)} className="flex-1 btn-primary py-2.5 text-[9px] bg-accent-blue hover:bg-accent-blue/80 shadow-accent-blue/20">
                                EDIT
                            </button>
                            <button onClick={() => handleDelete(exam.id)} className="p-3 bg-surface-light hover:bg-primary/20 text-primary rounded-xl transition-all duration-300">
                                <FaTrash size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create/Edit Exam Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-surface flex flex-col animate-in zoom-in duration-300">
                    <div className="p-8 border-b border-surface-border flex justify-between items-center bg-surface-light/30">
                        <div>
                            <h3 className="text-2xl font-black text-accent-white italic tracking-tighter uppercase">{editingExam ? 'MODIFY' : 'INITIALIZE'} <span className="text-primary">EXAMINATION</span></h3>
                            <p className="text-[10px] text-accent-gray font-black uppercase tracking-[0.2em] opacity-70">Configuration Dashboard</p>
                        </div>
                        <button onClick={() => { setShowModal(false); setEditingExam(null); }} className="p-3 bg-surface-light hover:bg-primary/20 text-accent-gray hover:text-primary rounded-2xl transition-all font-black text-2xl leading-none">×</button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar bg-surface-dark/50">
                        <div className="max-w-5xl mx-auto p-10 space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-accent-gray uppercase tracking-widest ml-1">Examination Title</label>
                                    <input type="text" placeholder="e.g. Advanced Quantum Mechanics" className="w-full" value={title} onChange={e => setTitle(e.target.value)} required />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-accent-gray uppercase tracking-widest ml-1">Target Subject Node</label>
                                    <select className="w-full" value={subjectId} onChange={e => setSubjectId(e.target.value)} required>
                                        <option value="">Select Batch...</option>
                                        {batches.map(b => (
                                            <option key={b.id} value={b.subject_id?.toString() || ''}>{b.subject_name} ({b.name})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-accent-gray uppercase tracking-widest ml-1">Lifecycle Start (Date/Time)</label>
                                    <input type="datetime-local" className="w-full" value={date} onChange={e => setDate(e.target.value)} required />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-accent-gray uppercase tracking-widest ml-1">Lifecycle Termination (Expiry)</label>
                                    <input type="datetime-local" className="w-full" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-accent-gray uppercase tracking-widest ml-1">Operational Duration (Mins)</label>
                                    <input type="number" className="w-full" value={duration} onChange={e => setDuration(parseInt(e.target.value))} required />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-accent-gray uppercase tracking-widest ml-1">Assessment Category</label>
                                    <select className="w-full" value={examType} onChange={e => setExamType(e.target.value)}>
                                        <option value="hourly">Hourly Test</option>
                                        <option value="weekly">Weekly Assessment</option>
                                        <option value="board">Pre-Board Mock</option>
                                        <option value="olympiad">Weekly Olympiad</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-accent-gray uppercase tracking-widest ml-1">Execution Limit (Attempts)</label>
                                    <input type="number" min="1" className="w-full font-black text-primary" value={attemptsAllowed} onChange={e => setAttemptsAllowed(parseInt(e.target.value))} required />
                                </div>
                            </div>

                            <div className="relative py-4">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-surface-border"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-surface-dark px-6 text-[10px] font-black text-primary uppercase tracking-[0.4em]">Question Architecture</span>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-surface rounded-3xl border border-surface-border shadow-sm">
                                    <h4 className="text-xs font-black text-accent-white uppercase tracking-widest mr-4">Initialize Component:</h4>
                                    <p className="text-[10px] text-accent-gray">Select a node type to begin or manage existing nodes below.</p>
                                </div>

                                <div className="space-y-6">
                                    {questions.map((q, qIdx) => (
                                        <div key={qIdx} className="premium-card p-10 relative group bg-surface">
                                            <div className="flex justify-between items-center mb-8">
                                                <div className="flex items-center gap-4">
                                                    <span className="w-12 h-12 flex items-center justify-center bg-primary text-white font-black italic rounded-xl text-xl shadow-lg shadow-primary/20">
                                                        {qIdx + 1}
                                                    </span>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black uppercase text-accent-gray tracking-[0.2em] mb-1">NODE TYPE</span>
                                                        <select
                                                            value={q.type}
                                                            onChange={(e) => {
                                                                const newType = e.target.value as any;
                                                                const newQ = { ...q, type: newType };
                                                                if (newType === 'mcq') {
                                                                    newQ.options = ['', '', '', ''];
                                                                    newQ.correctOption = 0;
                                                                    delete newQ.correctAnswer;
                                                                } else if (newType === 'fib') {
                                                                    newQ.correctAnswer = '';
                                                                    delete newQ.options;
                                                                    delete newQ.correctOption;
                                                                } else {
                                                                    delete newQ.options;
                                                                    delete newQ.correctOption;
                                                                    delete newQ.correctAnswer;
                                                                }
                                                                const newQuestions = [...questions];
                                                                newQuestions[qIdx] = newQ;
                                                                setQuestions(newQuestions);
                                                            }}
                                                            className="bg-surface-light border-none text-xs font-black text-accent-white uppercase tracking-wider py-1 pl-2 pr-8 rounded-lg cursor-pointer hover:bg-surface-light/80 transition-colors focus:ring-1 focus:ring-primary"
                                                        >
                                                            <option value="mcq">MCQ UNIT</option>
                                                            <option value="fib">BLANK UNIT</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                {questions.length > 1 && (
                                                    <button type="button" onClick={() => setQuestions(questions.filter((_, i) => i !== qIdx))} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Delete Question">
                                                        <FaTrash size={14} />
                                                    </button>
                                                )}
                                            </div>
                                            <input
                                                type="text" placeholder="Deploy question query string..." className="w-full mb-8 font-medium text-lg p-4"
                                                value={q.text} onChange={(e) => handleQuestionChange(qIdx, 'text', e.target.value)} required
                                            />

                                            {q.type === 'mcq' && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {q.options?.map((opt, oIdx) => (
                                                        <div key={oIdx} className="flex gap-4 items-center bg-surface-light/30 p-2 pl-4 rounded-2xl border border-surface-border group/opt focus-within:border-primary/50 transition-colors h-16">
                                                            <input
                                                                type="radio" name={`correct-${qIdx}`} checked={q.correctOption === oIdx}
                                                                onChange={() => handleQuestionChange(qIdx, 'correctOption', oIdx)}
                                                                className="w-5 h-5 accent-primary cursor-pointer shrink-0"
                                                            />
                                                            <input
                                                                type="text" placeholder={`Option Sequence ${oIdx + 1}`}
                                                                className="flex-1 bg-transparent border-none py-3 px-2 focus:ring-0 text-sm font-bold text-accent-white placeholder:text-accent-gray/50 h-full w-full"
                                                                value={opt} onChange={(e) => {
                                                                    const opts = [...(q.options || [])];
                                                                    opts[oIdx] = e.target.value;
                                                                    handleQuestionChange(qIdx, 'options', opts);
                                                                }} required
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {q.type === 'fib' && (
                                                <div className="bg-accent-purple/5 border-2 border-dashed border-accent-purple/20 p-6 rounded-2xl">
                                                    <label className="block text-[9px] font-black text-accent-purple uppercase tracking-[0.2em] mb-3 ml-1">Validation String (Correct Answer)</label>
                                                    <input
                                                        type="text" placeholder="Expected String..." className="w-full bg-surface border-none text-accent-purple font-black p-4"
                                                        value={q.correctAnswer} onChange={(e) => handleQuestionChange(qIdx, 'correctAnswer', e.target.value)} required
                                                    />
                                                </div>
                                            )}

                                            {q.type === 'photo' && (
                                                <div className="bg-accent-emerald/5 p-8 rounded-2xl flex items-center gap-6 border border-accent-emerald/20 border-dashed">
                                                    <div className="w-16 h-16 flex items-center justify-center bg-accent-emerald/10 text-accent-emerald rounded-full">
                                                        <FaClipboardList className="text-2xl" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h5 className="text-accent-emerald font-black uppercase tracking-widest mb-1">Visual Authentication Node</h5>
                                                        <p className="text-accent-emerald text-[11px] font-black italic uppercase leading-relaxed tracking-wider">Visual Authentication Required: Student must upload high-resolution photographic evidence of handwritten synthesis.</p>
                                                    </div>
                                                </div>
                                            )}

                                        </div>
                                    ))}

                                    <div className="flex flex-wrap gap-4 items-center justify-center p-8 bg-surface-light/20 border-2 border-dashed border-surface-border rounded-3xl hover:border-primary/30 transition-all">
                                        <span className="text-[10px] font-black text-accent-gray uppercase tracking-widest mr-2">Append New Node:</span>
                                        <button type="button" onClick={() => addQuestion('mcq')} className="btn-outline py-3 px-8 text-[10px] border-accent-blue text-accent-blue hover:bg-accent-blue hover:text-white transition-all shadow-lg shadow-accent-blue/5 hover:shadow-accent-blue/20">+ MCQ UNIT</button>
                                        <button type="button" onClick={() => addQuestion('fib')} className="btn-outline py-3 px-8 text-[10px] border-accent-purple text-accent-purple hover:bg-accent-purple hover:text-white transition-all shadow-lg shadow-accent-purple/5 hover:shadow-accent-purple/20">+ BLANK UNIT</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-surface/90 backdrop-blur-xl border-t border-surface-border">
                            <div className="max-w-5xl mx-auto px-10 py-6 flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="text-[10px] font-black text-accent-gray uppercase tracking-widest hidden md:block">
                                    Total Nodes: <span className="text-accent-white text-base ml-2">{questions.length}</span>
                                </div>
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <button type="button" onClick={() => { setShowModal(false); setEditingExam(null); }} className="px-8 py-4 text-accent-gray font-black uppercase tracking-widest text-[10px] hover:text-primary transition-all rounded-xl hover:bg-surface-light">TERMINATE SESSION</button>
                                    <button type="submit" className="btn-primary px-12 py-4 shadow-lg shadow-primary/20 hover:shadow-primary/40">
                                        {editingExam ? 'COMPLETE UPDATE' : 'DEPLOY EXAMINATION'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Success Modal */}
            {successModal.show && (
                <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-surface border border-surface-border p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center space-y-6 animate-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-accent-white uppercase tracking-tight mb-2">Success!</h3>
                            <p className="text-accent-gray font-medium">{successModal.message}</p>
                        </div>
                        <button
                            onClick={() => setSuccessModal({ show: false, message: '' })}
                            className="btn-primary w-full py-3 shadow-lg shadow-primary/20 hover:shadow-primary/40"
                        >
                            ACKNOWLEDGE
                        </button>
                    </div>
                </div>
            )}
        </div >
    );
};

export default InstructorExams;
