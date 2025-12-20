import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { FaVideo, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface ClassSession {
    id: number;
    title: string;
    description: string;
    start_time: string;
    duration: number;
    status: 'scheduled' | 'live' | 'completed';
    agora_channel: string;
}

const InstructorClasses: React.FC = () => {
    const { user } = useContext(AuthContext)!;
    const [classes, setClasses] = useState<ClassSession[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [newClass, setNewClass] = useState({ title: '', description: '', start_time: '', duration: 60 });
    const navigate = useNavigate();

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const res = await api.get(`/api/classes/instructor/${user?.id}`);
            setClasses(res.data);
        } catch (err) {
            console.error('Failed to fetch classes');
        }
    };

    const handleCreateClass = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/api/classes', { ...newClass, instructor_id: user?.id });
            setShowModal(false);
            fetchClasses();
        } catch (err) {
            console.error('Failed to create class');
        }
    };

    const startClass = async (classId: number) => {
        // Navigate to the Live Room
        navigate(`/instructor/live/${classId}`);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">My Classes</h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-indigo-700"
                >
                    <FaPlus /> Schedule Class
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map(cls => (
                    <div key={cls.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
                        <h3 className="text-xl font-bold text-gray-900">{cls.title}</h3>
                        <p className="text-gray-500 text-sm mb-4">{new Date(cls.start_time).toLocaleString()}</p>
                        <p className="text-gray-600 mb-4">{cls.description}</p>

                        <div className="flex justify-between items-center mt-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${cls.status === 'live' ? 'bg-red-100 text-red-800 animate-pulse' : 'bg-green-100 text-green-800'}`}>
                                {cls.status.toUpperCase()}
                            </span>

                            {cls.status !== 'completed' && (
                                <button
                                    onClick={() => startClass(cls.id)}
                                    className="bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-red-700"
                                >
                                    <FaVideo /> {cls.status === 'live' ? 'Resume' : 'Start Live'}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                        <h3 className="text-lg font-bold mb-4">Schedule Class</h3>
                        <form onSubmit={handleCreateClass} className="space-y-4">
                            <input
                                type="text" placeholder="Class Title" required
                                className="w-full p-2 border rounded"
                                value={newClass.title} onChange={e => setNewClass({ ...newClass, title: e.target.value })}
                            />
                            <textarea
                                placeholder="Description"
                                className="w-full p-2 border rounded"
                                value={newClass.description} onChange={e => setNewClass({ ...newClass, description: e.target.value })}
                            />
                            <input
                                type="datetime-local" required
                                className="w-full p-2 border rounded"
                                value={newClass.start_time} onChange={e => setNewClass({ ...newClass, start_time: e.target.value })}
                            />
                            <input
                                type="number" placeholder="Duration (mins)" required
                                className="w-full p-2 border rounded"
                                value={newClass.duration} onChange={e => setNewClass({ ...newClass, duration: parseInt(e.target.value) })}
                            />
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Schedule</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstructorClasses;
