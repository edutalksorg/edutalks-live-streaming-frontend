import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';

interface Submission {
    id: number;
    student_name: string;
    score: number | null;
    status: 'pending' | 'graded';
    submission_data: any; // Answers JSON
    file_url: string | null;
}

const InstructorGrading: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // Exam ID
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [grade, setGrade] = useState<number | ''>('');

    useEffect(() => {
        fetchSubmissions();
    }, [id]);

    const fetchSubmissions = async () => {
        try {
            const res = await api.get(`/exams/${id}/submissions`);
            setSubmissions(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleGrade = async () => {
        if (!selectedSubmission || grade === '') return;
        try {
            await api.put(`/exams/submissions/${selectedSubmission.id}/grade`, { score: grade });
            alert('Graded Successfully');
            setGrade('');
            setSelectedSubmission(null);
            fetchSubmissions();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="p-6 h-screen flex gap-6">
            {/* List of Submissions */}
            <div className="w-1/3 bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                <div className="p-4 bg-gray-100 font-bold border-b">Student Submissions</div>
                <div className="flex-1 overflow-y-auto">
                    {submissions.length === 0 ? (
                        <p className="p-4 text-gray-500">No submissions yet.</p>
                    ) : (
                        submissions.map(sub => (
                            <div
                                key={sub.id}
                                onClick={() => setSelectedSubmission(sub)}
                                className={`p-4 border-b cursor-pointer hover:bg-indigo-50 transition ${selectedSubmission?.id === sub.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''}`}
                            >
                                <div className="font-bold flex justify-between">
                                    {sub.student_name}
                                    <span className={`text-xs px-2 py-0.5 rounded ${sub.status === 'graded' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {sub.status.toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex justify-between mt-1 text-sm text-gray-600">
                                    <span>Score: {sub.score !== null ? sub.score : '-'}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Grading Area */}
            <div className="flex-1 bg-white rounded-lg shadow-md p-6 flex flex-col">
                {selectedSubmission ? (
                    <>
                        <h2 className="text-2xl font-bold mb-4 border-b pb-2">Grading: {selectedSubmission.student_name}</h2>
                        <div className="flex-1 overflow-y-auto mb-4">

                            {/* MCQ / Text Answers */}
                            <div className="mb-6">
                                <h3 className="font-bold text-gray-700 mb-2">MCQ Answers (JSON)</h3>
                                <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
                                    {JSON.stringify(selectedSubmission.submission_data, null, 2)}
                                </pre>
                            </div>

                            {/* Photo Evidence */}
                            {selectedSubmission.file_url ? (
                                <div>
                                    <h3 className="font-bold text-gray-700 mb-2">Attached Answer Sheet</h3>
                                    <div className="border rounded p-2 bg-gray-50 flex justify-center">
                                        <img
                                            src={`http://localhost:5000${selectedSubmission.file_url}`}
                                            alt="Student Submission"
                                            className="max-h-[500px] object-contain shadow-lg"
                                        />
                                    </div>
                                    <a href={`http://localhost:5000${selectedSubmission.file_url}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 text-sm mt-2 block underline">Open Original Image</a>
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No file attached.</p>
                            )}
                        </div>

                        {/* Action Area */}
                        <div className="border-t pt-4 flex items-end gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-bold text-gray-700 mb-1">Assign Score</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border rounded font-bold text-lg"
                                    placeholder="Enter Marks"
                                    value={grade}
                                    onChange={e => setGrade(parseInt(e.target.value))}
                                />
                            </div>
                            <button
                                onClick={handleGrade}
                                className="px-6 py-3 bg-green-600 text-white font-bold rounded hover:bg-green-700 shadow"
                            >
                                Submit Grade
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        Select a submission to grade
                    </div>
                )}
            </div>
        </div>
    );
};

export default InstructorGrading;
