import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FaTrophy, FaArrowLeft, FaCheckCircle, FaQuestionCircle } from 'react-icons/fa';

interface Question {
    id: string;
    question: string;
    options: string[];
    correct_answer: number;
    marks: number;
}

interface Tournament {
    id: number;
    name: string;
    description: string;
    level_name: string;
    subject_name: string;
    instructor_name: string;
    duration: number;
    total_questions: number;
    total_marks: number;
    questions: Question[] | string;
    status: string;
    grade: string;
}

const TournamentPreview: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTournament();
    }, [id]);

    const fetchTournament = async () => {
        try {
            const res = await api.get(`/api/tournaments/${id}`);
            setTournament(res.data);
        } catch (err) {
            console.error('Error fetching tournament details:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!tournament) {
        return (
            <div className="min-h-screen bg-background p-8 text-center">
                <p className="text-accent-gray italic">Tournament not found.</p>
                <button onClick={() => navigate(-1)} className="mt-4 text-primary hover:underline flex items-center gap-2 mx-auto justify-center font-bold uppercase tracking-widest text-xs">
                    <FaArrowLeft /> Go Back
                </button>
            </div>
        );
    }

    const questions: Question[] = typeof tournament.questions === 'string'
        ? JSON.parse(tournament.questions)
        : (tournament.questions || []);

    return (
        <div className="min-h-screen bg-background p-4 md:p-10">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-accent-gray hover:text-primary transition-colors mb-6 font-bold uppercase tracking-widest text-xs"
                >
                    <FaArrowLeft /> Back
                </button>

                <div className="bg-surface rounded-2xl shadow-xl overflow-hidden mb-8 border border-surface-border">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
                        <div className="flex items-center gap-4 mb-4">
                            <FaTrophy className="text-4xl text-yellow-400" />
                            <div>
                                <h1 className="text-3xl font-bold">{tournament.name}</h1>
                                <p className="opacity-90">{tournament.description}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                                <p className="text-xs uppercase opacity-70 mb-1">Grade</p>
                                <p className="font-bold">{tournament.grade}</p>
                            </div>
                            <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                                <p className="text-xs uppercase opacity-70 mb-1">Duration</p>
                                <p className="font-bold">{tournament.duration} Mins</p>
                            </div>
                            <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                                <p className="text-xs uppercase opacity-70 mb-1">Questions</p>
                                <p className="font-bold">{tournament.total_questions}</p>
                            </div>
                            <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                                <p className="text-xs uppercase opacity-70 mb-1">Total Marks</p>
                                <p className="font-bold">{tournament.total_marks}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="flex items-center gap-3 mb-8 border-b border-surface-border pb-4">
                            <FaQuestionCircle className="text-primary text-2xl" />
                            <h2 className="text-2xl font-bold text-accent-white italic uppercase tracking-tight">Test Questions</h2>
                        </div>

                        <div className="space-y-8">
                            {questions.map((q, idx) => (
                                <div key={q.id || idx} className="bg-surface-dark/50 rounded-xl p-6 border border-surface-border">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-lg font-bold text-accent-white italic tracking-tight">
                                            Q{idx + 1}. {q.question}
                                        </h3>
                                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold border border-primary/20">
                                            {q.marks} Marks
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {q.options.map((opt, optIdx) => (
                                            <div
                                                key={optIdx}
                                                className={`p-3 rounded-lg border flex items-center gap-3 transition-all ${optIdx === q.correct_answer
                                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                                    : 'bg-surface border-surface-border text-accent-gray'
                                                    }`}
                                            >
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${optIdx === q.correct_answer ? 'bg-emerald-500 text-white' : 'bg-surface-dark text-accent-gray border border-surface-border'
                                                    }`}>
                                                    {String.fromCharCode(65 + optIdx)}
                                                </div>
                                                <span className="font-medium">{opt}</span>
                                                {optIdx === q.correct_answer && <FaCheckCircle className="ml-auto text-emerald-500" />}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TournamentPreview;
