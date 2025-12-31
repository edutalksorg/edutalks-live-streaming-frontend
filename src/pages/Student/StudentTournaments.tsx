import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FaTrophy, FaMedal, FaCheckCircle, FaPlayCircle } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import SubscriptionPopup from '../../components/SubscriptionPopup';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL.replace('/api', '');

interface Tournament {
    id: number;
    name: string;
    description: string;
    level_name: string;
    level_category: string;
    subject_name: string;
    instructor_name: string;
    registration_start: string;
    registration_end: string;
    exam_start: string;
    exam_end: string;
    duration: number;
    total_questions: number;
    total_marks: number;
    max_participants: number | null;
    prize: string | null;
    certificate_enabled: boolean;
    status: 'DRAFT' | 'UPCOMING' | 'LIVE' | 'COMPLETED' | 'RESULT_PUBLISHED';
    is_free: boolean;
    registered_count: number;
    is_registered: boolean;
    has_attempted: boolean;
}

const StudentTournaments: React.FC = () => {
    const { user } = useContext(AuthContext)!;
    const { showAlert } = useModal();
    const navigate = useNavigate();

    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [filteredTournaments, setFilteredTournaments] = useState<Tournament[]>([]);
    const [activeTab, setActiveTab] = useState<'available' | 'registered' | 'completed'>('available');
    const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        fetchTournaments();

        const socket = io(SOCKET_URL);
        socket.on('global_sync', (payload) => {
            console.log('[StudentTournaments] Sync received:', payload);
            if (payload.type === 'tournaments') {
                fetchTournaments();
            }
        });

        // Heartbeat for auto-activating tournaments
        const ticker = setInterval(() => {
            setCurrentTime(new Date());
        }, 10000);

        return () => {
            socket.disconnect();
            clearInterval(ticker);
        };
    }, []);

    useEffect(() => {
        filterTournaments();
    }, [tournaments, activeTab, currentTime]);

    const fetchTournaments = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/tournaments/student/available');
            setTournaments(res.data);
        } catch (err) {
            console.error('Error fetching tournaments:', err);
        } finally {
            setLoading(false);
        }
    };

    const filterTournaments = () => {
        switch (activeTab) {
            case 'available':
                setFilteredTournaments(
                    tournaments.filter(t => {
                        const isExpired = currentTime >= new Date(t.exam_end);
                        return !isExpired && !t.is_registered;
                    })
                );
                break;
            case 'registered':
                setFilteredTournaments(
                    tournaments.filter(t => {
                        const isExpired = currentTime >= new Date(t.exam_end);
                        return t.is_registered && !isExpired;
                    })
                );
                break;
            case 'completed':
                setFilteredTournaments(
                    tournaments.filter(t => {
                        const isExpired = currentTime >= new Date(t.exam_end);
                        return isExpired || t.status === 'COMPLETED' || t.status === 'RESULT_PUBLISHED';
                    })
                );
                break;
        }
    };

    const checkAccess = (action: () => void) => {
        const isFree = !user?.plan_name || user.plan_name === 'Free';
        if (isFree) {
            setShowSubscriptionPopup(true);
        } else {
            action();
        }
    };

    const handleRegister = async (tournamentId: number) => {
        checkAccess(async () => {
            try {
                await api.post(`/api/tournaments/${tournamentId}/register`);
                showAlert('Successfully registered for tournament!', 'success');
                fetchTournaments(); // Refresh to update registration status
            } catch (err: any) {
                showAlert(err.response?.data?.message || 'Registration failed', 'error');
            }
        });
    };

    const handleStartExam = (tournamentId: number) => {
        checkAccess(() => {
            navigate(`/student/tournament-exam/${tournamentId}`);
        });
    };

    const handleViewLeaderboard = (tournamentId: number) => {
        checkAccess(() => {
            navigate(`/student/tournament-leaderboard/${tournamentId}`);
        });
    };

    const handleViewResult = (tournamentId: number) => {
        checkAccess(() => {
            navigate(`/student/tournament-result/${tournamentId}`);
        });
    };

    const getTimeRemaining = (targetDate: string): string => {
        const nowMs = currentTime.getTime();
        const target = new Date(targetDate).getTime();
        const difference = target - nowMs;

        if (difference < 0) return 'Started';

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const getStatusBadge = (tournament: Tournament) => {
        const regEnd = new Date(tournament.registration_end);
        const examStart = new Date(tournament.exam_start);
        const examEnd = new Date(tournament.exam_end);

        if (tournament.status === 'RESULT_PUBLISHED') {
            return <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">Results Out</span>;
        }
        if (tournament.status === 'COMPLETED') {
            return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">Completed</span>;
        }
        if ((tournament.status === 'LIVE' || (tournament.status === 'UPCOMING' && currentTime >= examStart)) && currentTime <= examEnd) {
            return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 animate-pulse">🔴 LIVE NOW</span>;
        }
        if (tournament.status === 'UPCOMING' && currentTime < regEnd) {
            return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Open for Registration</span>;
        }
        if (tournament.status === 'UPCOMING' && currentTime >= regEnd && currentTime < examStart) {
            return <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">Registration Closed</span>;
        }
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">{tournament.status}</span>;
    };

    const TournamentCard = ({ tournament }: { tournament: Tournament }) => {
        const regEnd = new Date(tournament.registration_end);
        const examStart = new Date(tournament.exam_start);
        const examEnd = new Date(tournament.exam_end);
        const canRegister = currentTime >= new Date(tournament.registration_start) && currentTime < regEnd && !tournament.is_registered;

        // Resilience: Allow starting if status is LIVE OR if status is UPCOMING but exam has started
        const isLiveOrStarted = (tournament.status === 'LIVE' || (tournament.status === 'UPCOMING' && currentTime >= examStart)) && currentTime <= examEnd;
        const canAttempt = tournament.is_registered && isLiveOrStarted && !tournament.has_attempted;

        return (
            <div className="bg-white dark:bg-surface-dark rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border-l-4 border-yellow-500 overflow-hidden">
                {/* Header */}
                <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{tournament.name}</h3>
                        {getStatusBadge(tournament)}
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{tournament.description}</p>

                    {/* Timing Matrix */}
                    <div className="mb-4 text-[11px] space-y-3 bg-gray-50 dark:bg-surface-light/20 p-3 rounded-lg border border-gray-100 dark:border-surface-border">
                        <div className="space-y-1">
                            <span className="font-black uppercase tracking-widest text-primary/60 block mb-1">Registration Window</span>
                            <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                                <span>Starts:</span>
                                <span className="font-bold">{new Date(tournament.registration_start).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                                <span>Ends:</span>
                                <span className="font-bold">{new Date(tournament.registration_end).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                            </div>
                        </div>
                        <div className="h-[1px] bg-gray-200 dark:bg-surface-border"></div>
                        <div className="space-y-1">
                            <span className="font-black uppercase tracking-widest text-indigo-500/60 block mb-1">Examination Window</span>
                            <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                                <span>Starts:</span>
                                <span className="font-bold text-indigo-600 dark:text-indigo-400">{new Date(tournament.exam_start).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                                <span>Ends:</span>
                                <span className="font-bold text-indigo-600 dark:text-indigo-400">{new Date(tournament.exam_end).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Prize */}
                    {tournament.prize && (
                        <div className="mb-4">
                            <span className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold">
                                <FaTrophy /> Prize: {tournament.prize}
                            </span>
                        </div>
                    )}

                    {/* Countdown */}
                    {tournament.status === 'UPCOMING' && (
                        <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                {now < regEnd ? 'Registration closes in:' : 'Exam starts in:'}
                            </p>
                            <p className="text-lg font-mono font-bold text-blue-600 dark:text-blue-400">
                                {now < regEnd ? getTimeRemaining(tournament.registration_end) : getTimeRemaining(tournament.exam_start)}
                            </p>
                        </div>
                    )}

                    {(tournament.status === 'LIVE' || (tournament.status === 'UPCOMING' && now >= examStart)) && tournament.is_registered && (
                        <div className="mb-4 bg-green-50 dark:bg-green-900/20 p-3 rounded animate-pulse">
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Exam ends in:</p>
                            <p className="text-lg font-mono font-bold text-green-600 dark:text-green-400">
                                {getTimeRemaining(tournament.exam_end)}
                            </p>
                        </div>
                    )}

                    {/* Registration Status */}
                    {tournament.is_registered && (
                        <div className="mb-4 flex items-center gap-2 text-green-600 dark:text-green-400">
                            <FaCheckCircle />
                            <span className="text-sm font-semibold">You are registered</span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                        {/* 1. Register Button (Before registration ends) */}
                        {canRegister && (
                            <button
                                onClick={() => handleRegister(tournament.id)}
                                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition"
                            >
                                Register Now
                            </button>
                        )}

                        {/* 2. Registered & Waiting (Between registration end and exam start) */}
                        {tournament.is_registered && now < examStart && (
                            <div className="flex-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 px-4 py-2 rounded-lg font-bold text-center text-xs uppercase tracking-widest flex flex-col justify-center">
                                <span>Exam Starts In</span>
                                <span className="font-black">{getTimeRemaining(tournament.exam_start)}</span>
                            </div>
                        )}

                        {!tournament.is_registered && now > regEnd && now < examStart && (
                            <div className="flex-1 bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-2 rounded-lg font-bold text-center text-xs uppercase tracking-widest flex flex-col justify-center">
                                <span>Registration Closed</span>
                                <span className="text-[10px] opacity-60">You missed the window</span>
                            </div>
                        )}

                        {/* 3. Start Exam (During live window) */}
                        {canAttempt && (
                            <button
                                onClick={() => handleStartExam(tournament.id)}
                                className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-green-700 hover:to-teal-700 transition flex items-center justify-center gap-2 animate-pulse"
                            >
                                <FaPlayCircle /> Start Exam
                            </button>
                        )}

                        {/* 4. Submitted / Result (If attempted and results are out) */}
                        {tournament.has_attempted && tournament.status === 'RESULT_PUBLISHED' && (
                            <button
                                onClick={() => handleViewResult(tournament.id)}
                                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition"
                            >
                                View My Result
                            </button>
                        )}

                        {/* 5. Leaderboard (After exam ends or results published) */}
                        {/* View Leaderboard results - Visible for LIVE, COMPLETED, or RESULT_PUBLISHED */}
                        {(now >= examEnd || tournament.status === 'RESULT_PUBLISHED' || tournament.status === 'LIVE') && (
                            <button
                                onClick={() => handleViewLeaderboard(tournament.id)}
                                className="flex-1 border-2 border-primary text-primary px-4 py-2 rounded-lg font-bold hover:bg-primary hover:text-white transition-all uppercase italic text-sm tracking-tight flex items-center justify-center gap-2"
                            >
                                <FaMedal /> View Leaderboard
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-4 md:p-6">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-gray-900 dark:text-white mb-2">
                    <FaTrophy className="text-yellow-500" />
                    Tournaments
                </h2>
                <p className="text-gray-600 dark:text-gray-400">Compete, learn, and win amazing prizes!</p>
            </div>

            {/* Tabs */}
            <div className="mb-6 flex gap-2 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('available')}
                    className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition ${activeTab === 'available'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                >
                    Available
                </button>
                <button
                    onClick={() => setActiveTab('registered')}
                    className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition ${activeTab === 'registered'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                >
                    My Registrations
                </button>
                <button
                    onClick={() => setActiveTab('completed')}
                    className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition ${activeTab === 'completed'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                >
                    Completed
                </button>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading tournaments...</p>
                </div>
            )}

            {/* Empty State with Upgrade Prompt for Free Users */}
            {!loading && filteredTournaments.length === 0 && (!user?.plan_name || user.plan_name === 'Free') && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-8 rounded-lg shadow-md text-center border border-yellow-200 dark:border-yellow-700">
                    <FaTrophy className="text-6xl text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Unlock Tournaments & Compete!</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-6">
                        Join exciting tournaments, compete with students nationwide, and win amazing prizes with EduTalks Pro.
                    </p>
                    <button
                        onClick={() => navigate('/student/subscription')}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-3 rounded-lg font-bold uppercase tracking-wider hover:from-yellow-600 hover:to-orange-600 transition shadow-lg"
                    >
                        Upgrade to Pro
                    </button>
                </div>
            )}

            {/* Tournament Grid */}
            {!loading && filteredTournaments.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredTournaments.map(tournament => (
                        <TournamentCard key={tournament.id} tournament={tournament} />
                    ))}
                </div>
            )}

            {/* Empty State for Paid Users / Restricted Access */}
            {!loading && filteredTournaments.length === 0 && (
                <div className="text-center py-12">
                    <FaTrophy className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Tournaments Found</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        {!user?.plan_name || user.plan_name === 'Free'
                            ? "Tournaments are exclusive to our Pro members. Upgrade to participate!"
                            : (activeTab === 'available' ? 'No tournaments available at the moment. Check back later!' : "You haven't participated in any tournaments yet.")}
                    </p>
                </div>
            )}

            {/* Subscription Popup */}
            <SubscriptionPopup isOpen={showSubscriptionPopup} onClose={() => setShowSubscriptionPopup(false)} />
        </div>
    );
};

export default StudentTournaments;
