import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaTrophy, FaMedal } from 'react-icons/fa';

const StudentTournaments: React.FC = () => {
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [viewingLeaderboard, setViewingLeaderboard] = useState<number | null>(null);

    useEffect(() => {
        fetchTournaments();
    }, []);

    const fetchTournaments = async () => {
        try {
            const res = await api.get('/api/tournaments/student');
            setTournaments(res.data);
        } catch (err) { }
    };

    const fetchLeaderboard = async (id: number) => {
        try {
            const res = await api.get(`/tournaments/leaderboard/${id}`);
            setLeaderboard(res.data);
            setViewingLeaderboard(id);
        } catch (err) { }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><FaTrophy className="text-yellow-500" /> Live Tournaments</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tournaments.map(t => (
                    <div key={t.id} className="bg-white p-6 rounded shadow hover:shadow-lg transition border-l-4 border-yellow-400">
                        <h3 className="text-xl font-bold">{t.title}</h3>
                        <p className="text-gray-600 mb-2">{t.description}</p>
                        <div className="flex justify-between items-center mt-4">
                            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-sm font-bold">Prize: {t.prize}</span>
                            <div className="flex gap-2">
                                <button className="bg-indigo-600 text-white px-4 py-2 rounded text-sm">Register</button>
                                <button onClick={() => fetchLeaderboard(t.id)} className="border border-indigo-600 text-indigo-600 px-4 py-2 rounded text-sm">Leaderboard</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {viewingLeaderboard && (
                <div className="mt-8 bg-white p-6 rounded shadow border border-gray-200">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><FaMedal className="text-orange-400" /> Leaderboard</h3>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-2">Rank</th>
                                <th className="p-2">Student</th>
                                <th className="p-2">Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.map((l, idx) => (
                                <tr key={idx} className="border-b">
                                    <td className="p-2 font-bold text-gray-700">#{l.rank}</td>
                                    <td className="p-2">{l.name}</td>
                                    <td className="p-2 font-mono">{l.score}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default StudentTournaments;
