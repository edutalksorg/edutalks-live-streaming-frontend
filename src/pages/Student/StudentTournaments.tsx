import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { FaTrophy, FaMedal } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import SubscriptionPopup from '../../components/SubscriptionPopup';

const StudentTournaments: React.FC = () => {
    const { user } = useContext(AuthContext)!;
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [viewingLeaderboard, setViewingLeaderboard] = useState<number | null>(null);
    const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);

    useEffect(() => {
        fetchTournaments();
    }, []);

    const fetchTournaments = async () => {
        try {
            const res = await api.get('/api/tournaments/student');
            setTournaments(res.data);
        } catch (err) { }
    };

    const checkAccess = (action: () => void) => {
        const isFree = !user?.plan_name || user.plan_name === 'Free';
        if (isFree) {
            setShowSubscriptionPopup(true);
        } else {
            action();
        }
    };

    const fetchLeaderboard = async (id: number) => {
        checkAccess(async () => {
            try {
                const res = await api.get(`/tournaments/leaderboard/${id}`);
                setLeaderboard(res.data);
                setViewingLeaderboard(id);
            } catch (err) { }
        });
    };

    return (
        <div className="p-6 relative">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><FaTrophy className="text-yellow-500" /> Live Tournaments</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tournaments.length === 0 && (!user?.plan_name || user.plan_name === 'Free') && (
                    <div className="bg-white dark:bg-surface-dark p-8 rounded shadow border-l-4 border-yellow-500 col-span-full text-center">
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Compete & Win</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">Join global tournaments and win prizes with EduTalks Pro.</p>
                        <button onClick={() => window.location.href = '/student/subscription'} className="bg-yellow-500 text-white px-6 py-2 rounded font-bold uppercase tracking-widest hover:bg-yellow-600 transition">Upgrade to Compete</button>
                    </div>
                )}
                {tournaments.map(t => (
                    <div key={t.id} className="bg-white p-6 rounded shadow hover:shadow-lg transition border-l-4 border-yellow-400">
                        <h3 className="text-xl font-bold">{t.title}</h3>
                        <p className="text-gray-600 mb-2">{t.description}</p>
                        <div className="flex justify-between items-center mt-4">
                            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-sm font-bold">Prize: {t.prize}</span>
                            <div className="flex gap-2">
                                <button onClick={() => checkAccess(() => alert('Registration Coming Soon'))} className="bg-indigo-600 text-white px-4 py-2 rounded text-sm">Register</button>
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

            <SubscriptionPopup isOpen={showSubscriptionPopup} onClose={() => setShowSubscriptionPopup(false)} />
        </div>
    );
};

export default StudentTournaments;

