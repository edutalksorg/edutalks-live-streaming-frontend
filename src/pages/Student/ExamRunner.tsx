import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const ExamRunner: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useContext(AuthContext)!;
    const navigate = useNavigate();

    const [exam, setExam] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<{ [key: number]: number }>({}); // MCQ Answers
    const [timeLeft, setTimeLeft] = useState(0);

    // Upload State
    const [uploadFile, setUploadFile] = useState<File | null>(null);

    useEffect(() => {
        const fetchExam = async () => {
            try {
                const res = await api.get(`/exams/${id}`);
                setExam(res.data);
                // Parse questions if they are stringified
                const parsedQuestions = typeof res.data.questions === 'string'
                    ? JSON.parse(res.data.questions)
                    : res.data.questions;
                setQuestions(parsedQuestions);
                setTimeLeft(res.data.duration * 60); // mins to seconds
            } catch (err) {
                console.error(err);
            }
        };
        fetchExam();
    }, [id]);

    // Timer
    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const handleOptionSelect = (optionIndex: number) => {
        setAnswers({ ...answers, [currentQuestionIndex]: optionIndex });
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleSubmit = async () => {
        const formData = new FormData();
        formData.append('exam_id', id!);
        formData.append('student_id', user?.id?.toString() || '');
        formData.append('submission_data', JSON.stringify(answers));

        if (uploadFile) {
            formData.append('file', uploadFile);
        }

        try {
            await api.post('/exams/submit', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Exam Submitted Successfully!');
            navigate('/student/dashboard');
        } catch (err) {
            console.error(err);
            alert('Submission Failed.');
        }
    };

    if (!exam) return <div>Loading Exam...</div>;

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
            <div className="bg-white w-full max-w-4xl rounded-lg shadow-lg p-8 flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center border-b pb-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{exam.title}</h2>
                        <span className="text-sm text-gray-500">Total Questions: {questions.length}</span>
                    </div>
                    <div className="text-3xl font-mono font-bold text-indigo-600">
                        {formatTime(timeLeft)}
                    </div>
                </div>

                {/* Question Area */}
                <div className="flex-1">
                    <div className="mb-6">
                        <span className="text-sm uppercase tracking-wide text-gray-400 font-bold">Question {currentQuestionIndex + 1}</span>
                        <h3 className="text-xl font-medium text-gray-900 mt-2">{currentQuestion.text}</h3>
                    </div>

                    <div className="space-y-3">
                        {currentQuestion.options.map((opt: string, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => handleOptionSelect(idx)}
                                className={`w-full text-left p-4 rounded-lg border-2 transition ${answers[currentQuestionIndex] === idx
                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                        : 'border-gray-200 hover:border-indigo-300'
                                    }`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Upload Section (If Allowed) */}
                {exam.allow_upload && (
                    <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
                        <h4 className="font-bold text-yellow-800 mb-2">Subjective Answer Upload</h4>
                        <p className="text-sm text-yellow-700 mb-3">Please write your detailed answers on paper, take a photo, and upload it here.</p>
                        <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                            className="block w-full text-sm text-slate-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-yellow-100 file:text-yellow-700
                                hover:file:bg-yellow-200"
                        />
                    </div>
                )}

                {/* Footer Controls */}
                <div className="mt-8 flex justify-between pt-6 border-t">
                    <button
                        disabled={currentQuestionIndex === 0}
                        onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                        className="px-6 py-2 rounded border border-gray-300 text-gray-600 disabled:opacity-50 hover:bg-gray-50"
                    >
                        Previous
                    </button>

                    {currentQuestionIndex < questions.length - 1 ? (
                        <button
                            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                            className="px-6 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                        >
                            Next Question
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            className="px-8 py-2 rounded bg-green-600 text-white font-bold hover:bg-green-700 shadow-lg"
                        >
                            Submit Exam
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExamRunner;
