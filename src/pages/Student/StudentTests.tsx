import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaClock } from 'react-icons/fa';

interface Exam {
    id: number;
    title: string;
    description: string;
    duration: number;
    questions: any; // JSON
    total_marks: number;
    date: string;
}

const StudentTests: React.FC = () => {
    const [exams, setExams] = useState<Exam[]>([]);
    const [activeExam, setActiveExam] = useState<Exam | null>(null);
    const [answers, setAnswers] = useState<number[]>([]);
    const [score, setScore] = useState<number | null>(null);

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const res = await api.get('/exams');
                setExams(res.data);
            } catch (err) {
                console.error("Failed to fetch exams");
            }
        };
        fetchExams();
    }, []);

    const startExam = (exam: Exam) => {
        setActiveExam(exam);
        setAnswers(new Array(exam.questions.length).fill(-1));
        setScore(null);
    };

    const handleOptionSelect = (qIdx: number, oIdx: number) => {
        const newAnswers = [...answers];
        newAnswers[qIdx] = oIdx;
        setAnswers(newAnswers);
    };

    const submitExam = () => {
        if (!activeExam) return;
        let calculatedScore = 0;
        activeExam.questions.forEach((q: any, idx: number) => {
            if (q.correctOption === answers[idx]) {
                calculatedScore += 4; // 4 marks per q
            }
        });
        setScore(calculatedScore);
    };

    if (activeExam) {
        if (score !== null) {
            return (
                <div className="max-w-3xl mx-auto bg-surface p-8 rounded shadow text-center border border-surface-border">
                    <h2 className="text-3xl font-bold mb-4 text-foreground">Exam Completed!</h2>
                    <p className="text-accent-gray mb-6">You scored</p>
                    <div className="text-6xl font-bold text-primary mb-6">{score} / {activeExam.total_marks}</div>
                    <button onClick={() => setActiveExam(null)} className="px-6 py-2 bg-primary text-white rounded font-bold hover:bg-primary-hover transition-colors">Back to List</button>
                </div>
            );
        }

        return (
            <div className="max-w-4xl mx-auto bg-surface p-8 rounded shadow border border-surface-border">
                <div className="flex justify-between items-center mb-6 border-b border-surface-border pb-4">
                    <h2 className="text-2xl font-bold text-foreground">{activeExam.title}</h2>
                    <div className="flex items-center gap-2 text-primary font-bold">
                        <FaClock /> {activeExam.duration} mins
                    </div>
                </div>

                <div className="space-y-8">
                    {activeExam.questions.map((q: any, qIdx: number) => (
                        <div key={qIdx}>
                            <p className="font-bold text-lg mb-3 text-foreground">{qIdx + 1}. {q.text}</p>
                            <div className="space-y-2">
                                {q.options.map((opt: string, oIdx: number) => (
                                    <label key={oIdx} className={`block p-3 border rounded cursor-pointer transition-all ${answers[qIdx] === oIdx ? 'bg-primary/10 border-primary text-primary' : 'border-surface-border text-accent-gray hover:bg-surface-light'}`}>
                                        <input
                                            type="radio" name={`q-${qIdx}`}
                                            className="mr-3 accent-primary"
                                            checked={answers[qIdx] === oIdx}
                                            onChange={() => handleOptionSelect(qIdx, oIdx)}
                                        />
                                        {opt}
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex justify-end">
                    <button onClick={submitExam} className="px-8 py-3 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg hover:bg-primary-hover transition-all">
                        Submit Exam
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Available Tests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exams.map(exam => (
                    <div key={exam.id} className="bg-surface p-6 rounded-lg border border-surface-border shadow hover:shadow-lg transition group">
                        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{exam.title}</h3>
                        <p className="text-sm text-accent-gray mb-4">{new Date(exam.date).toDateString()} • {exam.duration} mins</p>
                        <button onClick={() => startExam(exam)} className="w-full py-2 border border-primary text-primary rounded font-black uppercase tracking-widest text-[10px] hover:bg-primary hover:text-white transition-all">
                            Attempt Now
                        </button>
                    </div>
                ))}
            </div>
            {exams.length === 0 && <p className="text-accent-gray italic">No exams available.</p>}
        </div>
    );
};

export default StudentTests;
