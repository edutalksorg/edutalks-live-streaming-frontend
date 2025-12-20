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

    const addQuestion = (type: 'mcq' | 'fib' | 'photo') => {
        const newQ: Question = { text: '', type };
        if (type === 'mcq') {
            newQ.options = ['', '', '', ''];
            newQ.correctOption = 0;
        } else if (type === 'fib') {
            newQ.correctAnswer = '';
        }
        setQuestions([...questions, newQ]);
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
                alert('Exam Updated Successfully');
            } else {
                await api.post('/api/instructor/exams', payload);
                alert('Exam Created Successfully');
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
        <div className="max-w-6xl mx-auto p-4">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-800">Exam Management</h2>
                    <p className="text-gray-500">Create and manage your tests, quizzes, and olympiads.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setEditingExam(null); setShowModal(true); }}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-2xl hover:shadow-lg transition-all flex items-center gap-2 font-bold"
                >
                    <FaPlus /> Create New Exam
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exams.map(exam => (
                    <div key={exam.id} className="bg-white p-6 rounded-3xl shadow-lg border border-gray-50 flex flex-col justify-between hover:shadow-2xl transition-all border-t-4 border-indigo-500">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-xs font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2 py-1 rounded">{exam.type}</span>
                                <span className="text-xs text-gray-400 font-medium">{new Date(exam.date).toLocaleDateString()}</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{exam.title}</h3>
                            <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                                <FaClipboardList className="text-indigo-300" /> {exam.duration} mins • {exam.subject_name || 'Subject'}
                            </p>
                            {exam.expiry_date && (
                                <p className="text-[10px] text-red-500 font-bold uppercase mb-2">Expires: {new Date(exam.expiry_date).toLocaleString()}</p>
                            )}
                        </div>
                        <div className="flex gap-2 mt-4">
                            <Link to={`/instructor/exams/${exam.id}/grading`} className="px-3 py-2 bg-gray-50 text-indigo-700 rounded-xl font-bold text-xs hover:bg-indigo-50 transition-colors">
                                Results
                            </Link>
                            <button onClick={() => handleEdit(exam)} className="px-3 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition-colors">
                                Edit
                            </button>
                            <button onClick={() => handleDelete(exam.id)} className="p-2 text-red-400 hover:text-red-600">
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create/Edit Exam Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center overflow-auto z-50">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl m-4 max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-8 border-b flex justify-between items-center">
                            <h3 className="text-2xl font-black text-gray-800">{editingExam ? 'Edit Examination' : 'New Examination'}</h3>
                            <button onClick={() => { setShowModal(false); setEditingExam(null); }} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Exam Title</label>
                                    <input type="text" placeholder="e.g. Midterm Maths Quiz" className="w-full p-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all" value={title} onChange={e => setTitle(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Select Subject (Batch)</label>
                                    <select className="w-full p-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all" value={subjectId} onChange={e => setSubjectId(e.target.value)} required>
                                        <option value="">Choose Batch...</option>
                                        {batches.map(b => (
                                            <option key={b.id} value={b.subject_id?.toString() || ''}>{b.subject_name} ({b.name})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Start Date & Time</label>
                                    <input type="datetime-local" className="w-full p-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all" value={date} onChange={e => setDate(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Expiry Date & Time</label>
                                    <input type="datetime-local" className="w-full p-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Duration (Minutes)</label>
                                    <input type="number" className="w-full p-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all" value={duration} onChange={e => setDuration(parseInt(e.target.value))} required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Exam Category</label>
                                    <select className="w-full p-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all" value={examType} onChange={e => setExamType(e.target.value)}>
                                        <option value="hourly">Hourly Test</option>
                                        <option value="weekly">Weekly Assessment</option>
                                        <option value="board">Pre-Board Mock</option>
                                        <option value="olympiad">Weekly Olympiad</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Attempts Allowed</label>
                                    <input type="number" min="1" className="w-full p-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-indigo-600" value={attemptsAllowed} onChange={e => setAttemptsAllowed(parseInt(e.target.value))} required />
                                </div>
                            </div>

                            <hr className="my-8" />

                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-xl font-bold text-gray-800">Question Palette</h4>
                                <div className="flex gap-2 text-xs">
                                    <button type="button" onClick={() => addQuestion('mcq')} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all">+ MCQ</button>
                                    <button type="button" onClick={() => addQuestion('fib')} className="px-3 py-1 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-600 hover:text-white transition-all">+ Fill-in-blanks</button>
                                    <button type="button" onClick={() => addQuestion('photo')} className="px-3 py-1 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-600 hover:text-white transition-all">+ Handwriting (Photo)</button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {questions.map((q, qIdx) => (
                                    <div key={qIdx} className="bg-gray-50 p-6 rounded-3xl border border-gray-100 relative group animate-in slide-in-from-bottom-2 duration-300">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-xs font-black uppercase text-gray-400">Q{qIdx + 1} • {q.type}</span>
                                            {questions.length > 1 && (
                                                <button type="button" onClick={() => setQuestions(questions.filter((_, i) => i !== qIdx))} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">Remove</button>
                                            )}
                                        </div>
                                        <input
                                            type="text" placeholder="Enter question text..." className="w-full p-3 bg-white border-none rounded-2xl mb-4 focus:ring-2 focus:ring-indigo-500"
                                            value={q.text} onChange={(e) => handleQuestionChange(qIdx, 'text', e.target.value)} required
                                        />

                                        {q.type === 'mcq' && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {q.options?.map((opt, oIdx) => (
                                                    <div key={oIdx} className="flex gap-2 items-center">
                                                        <input
                                                            type="radio" name={`correct-${qIdx}`} checked={q.correctOption === oIdx}
                                                            onChange={() => handleQuestionChange(qIdx, 'correctOption', oIdx)}
                                                            className="text-indigo-600"
                                                        />
                                                        <input
                                                            type="text" placeholder={`Option ${oIdx + 1}`}
                                                            className="flex-1 p-2 bg-white border-none rounded-xl text-sm"
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
                                            <input
                                                type="text" placeholder="Correct Answer" className="w-full p-3 bg-white border-2 border-dashed border-indigo-100 rounded-2xl text-indigo-700 font-bold"
                                                value={q.correctAnswer} onChange={(e) => handleQuestionChange(qIdx, 'correctAnswer', e.target.value)} required
                                            />
                                        )}

                                        {q.type === 'photo' && (
                                            <div className="bg-orange-50 p-4 rounded-2xl flex items-center justify-center border-2 border-dashed border-orange-200">
                                                <p className="text-orange-600 text-sm font-medium italic">Student will be required to upload a photo of their handwritten answer for this question.</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="pt-6 flex justify-end gap-4 border-t sticky bottom-0 bg-white">
                                <button type="button" onClick={() => { setShowModal(false); setEditingExam(null); }} className="px-8 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl">Discard</button>
                                <button type="submit" className="px-10 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all">
                                    {editingExam ? 'Update Exam' : 'Create Exam'}
                                </button>
                            </div>
                        </form>
                    </div >
                </div >
            )}
        </div >
    );
};

export default InstructorExams;
