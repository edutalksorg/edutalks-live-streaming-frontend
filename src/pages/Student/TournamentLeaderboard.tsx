import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FaArrowLeft, FaAward, FaUserCircle, FaTrophy } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import { useContext } from 'react';

const TournamentLeaderboard: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext)!;

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await api.get(`/api/tournaments/${id}/leaderboard`);
                setLeaderboard(res.data);
            } catch (err) {
                console.error('Error fetching leaderboard:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-surface-dark flex items-center justify-center">
                <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full shadow-lg shadow-primary/20"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface-dark p-6 md:p-12 lg:p-20 overflow-x-hidden">
            <div className="max-w-5xl mx-auto space-y-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <button
                            onClick={() => navigate(user?.role === 'student' ? '/student/tournaments' : '/instructor/tournaments')}
                            className="flex items-center gap-2 text-accent-gray hover:text-primary transition-colors text-xs font-black uppercase tracking-[0.3em] mb-6 mb-b-2"
                        >
                            <FaArrowLeft /> HUB ACCESS
                        </button>
                        <h1 className="text-4xl md:text-7xl font-black text-accent-white italic uppercase tracking-tighter leading-none">
                            {leaderboard[0]?.is_official ? (
                                <><span className="text-primary">Official</span> Rankings</>
                            ) : (
                                <>Operational <span className="text-primary">Matrix</span></>
                            )}
                        </h1>
                        <p className="text-accent-gray text-xs font-bold uppercase tracking-[0.4em] mt-2 opacity-60">
                            {leaderboard[0]?.is_official ? 'Tournament Finalized - Global synchronization complete' : 'Global Leaderboard Synchronization - LIVE DATA'}
                        </p>
                    </div>
                </div>

                {/* Top 3 Podium */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    {/* Rank 2 */}
                    {leaderboard[1] && (
                        <div className="order-2 md:order-1 premium-card p-10 border-surface-border text-center group bg-surface/40 hover:-translate-y-2 transition-transform h-fit mt-12">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-surface-light border-4 border-surface-border rounded-full w-20 h-20 flex items-center justify-center mx-auto group-hover:border-accent-gray/40 transition-colors">
                                    <FaUserCircle size={40} className="text-accent-gray" />
                                </div>
                                <div className="absolute -bottom-2 right-1/2 translate-x-1/2 bg-accent-gray text-white w-8 h-8 rounded-full border-4 border-surface-dark flex items-center justify-center font-black italic shadow-lg">2</div>
                            </div>
                            <div className="text-xl font-black text-accent-white italic uppercase mb-2 line-clamp-1 px-2">{leaderboard[1].student_name}</div>
                            <div className="text-3xl font-black text-accent-gray italic">{leaderboard[1].score}</div>
                            <div className="text-[10px] text-accent-gray font-bold uppercase tracking-widest mt-1 opacity-50">Points Secured</div>
                        </div>
                    )}

                    {/* Rank 1 */}
                    {leaderboard[0] && (
                        <div className="order-1 md:order-2 premium-card p-12 border-primary/30 text-center scale-110 shadow-3xl shadow-primary/20 bg-surface/60 relative overflow-hidden group hover:scale-[1.12] transition-transform">
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-[60px] -z-10"></div>
                            <div className="relative mb-8">
                                <div className="absolute inset-0 bg-primary/20 border-4 border-primary/50 rounded-full w-28 h-28 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                    <FaAward size={56} className="text-primary" />
                                </div>
                                <div className="absolute -bottom-4 right-1/2 translate-x-1/2 bg-primary text-white w-12 h-12 rounded-full border-4 border-surface-dark flex items-center justify-center font-black italic text-xl shadow-2xl">1</div>
                            </div>
                            <div className="text-2xl font-black text-accent-white italic uppercase mb-2 line-clamp-1 px-4">{leaderboard[0].student_name}</div>
                            <div className="text-5xl font-black text-primary italic drop-shadow-[0_0_15px_rgba(238,29,35,0.4)]">{leaderboard[0].score}</div>
                            <div className="text-[11px] text-accent-gray font-bold uppercase tracking-[0.3em] mt-3 italic opacity-80">Prime Champion</div>
                        </div>
                    )}

                    {/* Rank 3 */}
                    {leaderboard[2] && (
                        <div className="order-3 premium-card p-8 border-surface-border text-center group bg-surface/40 hover:-translate-y-2 transition-transform h-fit md:mt-16">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-surface-light border-4 border-surface-border rounded-full w-16 h-16 flex items-center justify-center mx-auto group-hover:border-orange-500/40 transition-colors">
                                    <FaUserCircle size={32} className="text-orange-500/60" />
                                </div>
                                <div className="absolute -bottom-2 right-1/2 translate-x-1/2 bg-orange-700 text-white w-8 h-8 rounded-full border-4 border-surface-dark flex items-center justify-center font-black italic shadow-lg">3</div>
                            </div>
                            <div className="text-lg font-black text-accent-white italic uppercase mb-2 line-clamp-1 px-2">{leaderboard[2].student_name}</div>
                            <div className="text-2xl font-black text-orange-500/80 italic">{leaderboard[2].score}</div>
                            <div className="text-[10px] text-accent-gray font-bold uppercase tracking-widest mt-1 opacity-50">Points Secured</div>
                        </div>
                    )}
                </div>

                {/* Rest of Leaderboard Table */}
                <div className="premium-card border-surface-border overflow-hidden bg-surface/30 backdrop-blur-3xl shadow-2xl">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr className="bg-surface-light/50 border-b border-surface-border">
                                    <th className="px-6 py-6 text-[10px] font-black italic text-accent-gray uppercase tracking-[0.4em]">Standing</th>
                                    <th className="px-6 py-6 text-[10px] font-black italic text-accent-gray uppercase tracking-[0.4em]">Operative</th>
                                    <th className="px-6 py-6 text-[10px] font-black italic text-accent-gray uppercase tracking-[0.4em]">Precision</th>
                                    <th className="px-6 py-6 text-[10px] font-black italic text-accent-gray uppercase tracking-[0.4em]">Duration</th>
                                    <th className="px-6 py-6 text-[10px] font-black italic text-accent-gray uppercase tracking-[0.4em] text-right">Intel Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-border">
                                {leaderboard.slice(3).map((entry, idx) => (
                                    <tr key={entry.student_id} className="group hover:bg-surface-light/20 transition-colors">
                                        <td className="px-6 py-6">
                                            <span className="text-base font-black text-accent-gray italic group-hover:text-accent-white transition-colors">#{idx + 4}</span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-surface-dark border border-surface-border flex items-center justify-center text-accent-gray group-hover:text-primary group-hover:border-primary/40 transition-all flex-shrink-0">
                                                    <FaUserCircle size={14} />
                                                </div>
                                                <span className="text-sm font-black text-accent-white uppercase italic tracking-tighter truncate max-w-[150px]">{entry.student_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className="text-xs font-bold text-accent-gray italic">{entry.accuracy}%</span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className="text-xs font-bold text-accent-gray italic">{Math.floor(entry.time_taken / 60)}m {entry.time_taken % 60}s</span>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <span className="text-lg font-black text-accent-white italic tracking-tighter group-hover:text-primary transition-colors">{entry.score}</span>
                                        </td>
                                    </tr>
                                ))}
                                {leaderboard.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center text-accent-gray italic">
                                            <FaTrophy className="text-4xl mx-auto mb-4 opacity-20" />
                                            No rankings available yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TournamentLeaderboard;
