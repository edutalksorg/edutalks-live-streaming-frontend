import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { FaClock, FaClipboardCheck, FaPlay } from 'react-icons/fa';

interface Exam {
    id: number;
    title: string;
    description: string;
    date: string;
    duration: number;
    type: 'normal' | 'olympiad';
}

const StudentExamList: React.FC = () => {
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExams = async () => {
            try {
                // Determine if we should filter by class/subject? For now fetch all active.
                // ideally backend filters by student's class.
                const res = await api.get('/exams');
                setExams(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchExams();
    }, []);

    if (loading) return <div>Loading available exams...</div>;

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Available Exams & Olympiads</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exams.map(exam => (
                    <div key={exam.id} className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${exam.type === 'olympiad' ? 'border-yellow-500' : 'border-indigo-500'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{exam.title}</h3>
                            {exam.type === 'olympiad' && (
                                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded font-bold">OLYMPIAD</span>
                            )}
                        </div>
                        <p className="text-gray-600 mb-4 text-sm">{exam.description || 'No description provided.'}</p>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                            <div className="flex items-center gap-1"><FaClock /> {exam.duration} mins</div>
                            <div className="flex items-center gap-1"><FaClipboardCheck /> {new Date(exam.date).toLocaleString()}</div>
                        </div>

                        <Link to={`/student/exam/${exam.id}`} className={`block w-full text-center py-2 rounded text-white font-bold transition ${exam.type === 'olympiad' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                            <div className="flex items-center justify-center gap-2">
                                <FaPlay /> Start Exam
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentExamList;
