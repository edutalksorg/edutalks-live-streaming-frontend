import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FaTrophy, FaMedal, FaClock, FaCheckCircle, FaTachometerAlt } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import { useContext } from 'react';

const TournamentResult: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext)!;

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const res = await api.get(`/api/tournaments/${id}/my-result`);
                setResult(res.data);
            } catch (err) {
                console.error('Error fetching tournament result:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchResult();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-surface-dark flex items-center justify-center">
                <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="min-h-screen bg-surface-dark flex flex-col items-center justify-center p-8 text-center">
                <FaTrophy size={64} className="text-accent-gray/20 mb-6" />
                <h2 className="text-3xl font-black text-accent-white italic uppercase mb-2">Result Unavailable</h2>
                <p className="text-accent-gray mb-8">No participation record found for this tournament.</p>
                <button
                    onClick={() => navigate(user?.role === 'student' ? '/student/tournaments' : '/instructor/tournaments')}
                    className="btn-primary"
                >
                    BACK TO TOURNAMENTS
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface-dark p-6 md:p-12 lg:p-20 overflow-x-hidden">
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-block p-4 bg-primary/10 rounded-full border border-primary/20 mb-6">
                        <FaTrophy size={48} className="text-primary" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-accent-white italic uppercase tracking-tighter">
                        {result.tournament_name}
                    </h1>
                    <p className="text-primary font-black uppercase tracking-[0.5em] text-xs">Mission Intelligence Report</p>
                </div>

                {/* Main Stats Card */}
                <div className="premium-card p-8 md:p-16 border-primary/20 bg-gradient-to-br from-surface to-surface-dark relative overflow-hidden text-center shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -z-10"></div>

                    <div className="relative mb-12">
                        <div className="text-accent-gray font-black uppercase tracking-[0.3em] text-[10px] mb-4">Tactical Standing</div>
                        <div className="flex items-center justify-center gap-6">
                            <span className="text-7xl md:text-9xl font-black text-accent-white italic leading-none">
                                #{result.ranking}
                            </span>
                            <div className="h-20 w-[2px] bg-primary/30"></div>
                            <div className="text-left">
                                <div className="text-primary font-black italic text-2xl uppercase leading-tight">Global<br />Rank</div>
                                <div className="text-accent-gray text-[10px] font-bold uppercase mt-1">Combat Tier</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-surface-border pt-12">
                        <div className="space-y-2">
                            <div className="flex items-center justify-center gap-2 text-accent-gray/60 mb-2">
                                <FaCheckCircle size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Efficiency</span>
                            </div>
                            <div className="text-4xl font-black text-accent-white italic">{result.score}</div>
                            <div className="text-[10px] text-accent-gray uppercase font-bold tracking-widest">Points Secured</div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-center gap-2 text-accent-gray/60 mb-2">
                                <FaTachometerAlt size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Precision</span>
                            </div>
                            <div className="text-4xl font-black text-accent-white italic">{result.accuracy}%</div>
                            <div className="text-[10px] text-accent-gray uppercase font-bold tracking-widest">Sync Ratio</div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-center gap-2 text-accent-gray/60 mb-2">
                                <FaClock size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Duration</span>
                            </div>
                            <div className="text-4xl font-black text-accent-white italic">{Math.floor(result.time_taken / 60)}m {result.time_taken % 60}s</div>
                            <div className="text-[10px] text-accent-gray uppercase font-bold tracking-widest">Engagement Time</div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col md:flex-row gap-6">
                    <button
                        onClick={() => navigate(user?.role === 'student' ? `/student/tournament-leaderboard/${id}` : `/instructor/tournament-leaderboard/${id}`)}
                        className="flex-1 bg-surface-dark border-2 border-primary/40 text-primary py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-primary/10 hover:border-primary transition-all flex items-center justify-center gap-3"
                    >
                        <FaMedal /> VIEW LEADERBOARD
                    </button>
                    <button
                        onClick={() => navigate(user?.role === 'student' ? '/student/tournaments' : '/instructor/tournaments')}
                        className="flex-1 bg-accent-blue text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-accent-blue/80 transition-all shadow-xl shadow-accent-blue/20"
                    >
                        RETURN TO HUB
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TournamentResult;
