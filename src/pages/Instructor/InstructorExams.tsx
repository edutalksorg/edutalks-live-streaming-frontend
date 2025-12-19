import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { FaPlus, FaTrash, FaClipboardList } from 'react-icons/fa';

interface Question {
    text: string;
    options: string[];
    correctOption: number;
}

interface Exam {
    id: number;
    title: string;
    date: string;
    duration: number;
}

const InstructorExams: React.FC = () => {
    const { user } = useContext(AuthContext)!;
    const [exams, setExams] = useState<Exam[]>([]);
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [duration, setDuration] = useState(60);
    const [examType, setExamType] = useState('normal');
    const [allowUpload, setAllowUpload] = useState(false);
    const [questions, setQuestions] = useState<Question[]>([
        { text: '', options: ['', '', '', ''], correctOption: 0 }
    ]);

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            const res = await api.get('/exams');
            setExams(res.data);
        } catch (err) {
            console.error("Failed to fetch exams");
        }
    };

    const handleQuestionChange = (index: number, field: keyof Question, value: any) => {
        const newQuestions = [...questions];
        (newQuestions[index] as any)[field] = value;
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuestions(newQuestions);
    };

    const addQuestion = () => {
        setQuestions([...questions, { text: '', options: ['', '', '', ''], correctOption: 0 }]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/exams', {
                title, date, duration, questions,
                instructor_id: user?.id,
                total_marks: questions.length * 4,
                type: examType,
                allow_upload: allowUpload
            });
            setShowModal(false);
            fetchExams();
            alert('Exam Created Successfully');
        } catch (err) {
            console.error("Failed to create exam");
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Exam Management</h2>
                <button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 flex items-center gap-2">
                    <FaPlus /> Create New Exam
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {exams.map(exam => (
                    <div key={exam.id} className="bg-white p-4 rounded shadow flex justify-between items-center border-l-4 border-indigo-500">
                        <div>
                            <h3 className="text-lg font-bold">{exam.title}</h3>
                            <div className="flex gap-2">
                                <span className="text-sm text-gray-500">Date: {new Date(exam.date).toLocaleString()} | Duration: {exam.duration} mins</span>
                                <a href={`/instructor/exams/${exam.id}/grading`} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-200">
                                    View Submissions
                                </a>
                            </div>
                        </div>
                        <div className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm">Active</div>
                    </div>
                ))}
            </div>

            {/* Create Exam Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-auto z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">Create New Exam</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="text" placeholder="Exam Title" className="w-full p-2 border rounded" value={title} onChange={e => setTitle(e.target.value)} required />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="datetime-local" className="w-full p-2 border rounded" value={date} onChange={e => setDate(e.target.value)} required />
                                <input type="number" placeholder="Duration (mins)" className="w-full p-2 border rounded" value={duration} onChange={e => setDuration(parseInt(e.target.value))} required />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium">Exam Type</label>
                                    <select className="w-full p-2 border rounded" value={examType} onChange={e => setExamType(e.target.value)}>
                                        <option value="normal">Normal Exam</option>
                                        <option value="olympiad">Olympiad</option>
                                    </select>
                                </div>
                                <div className="flex items-center">
                                    <input type="checkbox" id="allowUpload" className="mr-2" checked={allowUpload} onChange={e => setAllowUpload(e.target.checked)} />
                                    <label htmlFor="allowUpload" className="text-sm font-medium">Allow Photo Upload</label>
                                </div>
                            </div>

                            <hr className="my-4" />

                            <h4 className="font-bold">Questions</h4>
                            {questions.map((q, qIdx) => (
                                <div key={qIdx} className="bg-gray-50 p-4 rounded border">
                                    <div className="flex justify-between mb-2">
                                        <label className="text-sm font-bold">Question {qIdx + 1}</label>
                                        {questions.length > 1 && (
                                            <button type="button" onClick={() => setQuestions(questions.filter((_, i) => i !== qIdx))} className="text-red-500 text-sm">Remove</button>
                                        )}
                                    </div>
                                    <input
                                        type="text" placeholder="Question Text" className="w-full p-2 border rounded mb-2"
                                        value={q.text} onChange={(e) => handleQuestionChange(qIdx, 'text', e.target.value)} required
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        {q.options.map((opt, oIdx) => (
                                            <input
                                                key={oIdx} type="text" placeholder={`Option ${oIdx + 1}`}
                                                className={`w-full p-2 border rounded ${q.correctOption === oIdx ? 'border-green-500 ring-1 ring-green-500' : ''}`}
                                                value={opt} onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)} required
                                            />
                                        ))}
                                    </div>
                                    <div className="mt-2 text-sm">
                                        Correct Option (0-3):
                                        <select
                                            value={q.correctOption}
                                            onChange={(e) => handleQuestionChange(qIdx, 'correctOption', parseInt(e.target.value))}
                                            className="ml-2 border rounded p-1"
                                        >
                                            <option value={0}>Option 1</option>
                                            <option value={1}>Option 2</option>
                                            <option value={2}>Option 3</option>
                                            <option value={3}>Option 4</option>
                                        </select>
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={addQuestion} className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded hover:bg-gray-50">
                                + Add Question
                            </button>

                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Create Exam</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstructorExams;
