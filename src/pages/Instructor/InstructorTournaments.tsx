import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { FaTrophy, FaPlus } from 'react-icons/fa';

const InstructorTournaments: React.FC = () => {
    const { user } = useContext(AuthContext)!;
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);

    // Form
    const [title, setTitle] = useState('');
    const [prize, setPrize] = useState('');
    const [date, setDate] = useState('');

    useEffect(() => {
        fetchTournaments();
    }, []);

    const fetchTournaments = async () => {
        try {
            const res = await api.get('/tournaments');
            setTournaments(res.data);
        } catch (err) { }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/tournaments', { title, prize, date, instructor_id: user?.id, questions: [] }); // Empty questions for now
            setShowModal(false);
            fetchTournaments();
        } catch (err) { }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><FaTrophy className="text-yellow-500" /> Tournaments</h2>
                <button onClick={() => setShowModal(true)} className="bg-yellow-600 text-white px-4 py-2 rounded">
                    <FaPlus /> Create Tournament
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tournaments.map(t => (
                    <div key={t.id} className="bg-white p-6 rounded-lg shadow border-t-4 border-yellow-500">
                        <h3 className="font-bold text-lg">{t.title}</h3>
                        <p className="text-gray-500">Prize: {t.prize}</p>
                        <p className="text-sm text-gray-400 mt-2">{new Date(t.date).toLocaleString()}</p>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded w-96">
                        <h3 className="font-bold text-lg mb-4">New Tournament</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <input placeholder="Title" className="w-full border p-2 rounded" value={title} onChange={e => setTitle(e.target.value)} />
                            <input placeholder="Prize (e.g. ₹5000)" className="w-full border p-2 rounded" value={prize} onChange={e => setPrize(e.target.value)} />
                            <input type="datetime-local" className="w-full border p-2 rounded" value={date} onChange={e => setDate(e.target.value)} />
                            <button className="w-full bg-yellow-600 text-white py-2 rounded">Create</button>
                        </form>
                        <button onClick={() => setShowModal(false)} className="mt-2 text-sm text-gray-500">Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstructorTournaments;
