import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FaTrophy, FaPlus, FaEdit, FaTrash, FaUsers, FaClock, FaChartBar, FaCheckCircle, FaUserGraduate } from 'react-icons/fa';
import TournamentForm from '../../components/TournamentForm.tsx';
import { AuthContext } from '../../context/AuthContext';

interface Tournament {
    id: number;
    name: string;
    description: string;
    level_name: string;
    subject_name: string;
    registered_count: number;
    registration_start: string;
    registration_end: string;
    exam_start: string;
    exam_end: string;
    duration: number;
    status: 'DRAFT' | 'UPCOMING' | 'LIVE' | 'COMPLETED' | 'RESULT_PUBLISHED';
    prize: string | null;
    grade: string;
    instructor_id: number;
}

const InstructorTournaments: React.FC = () => {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext)!;
    const navigate = useNavigate();

    useEffect(() => {
        fetchTournaments();
    }, []);

    const fetchTournaments = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/tournaments/instructor/my-tournaments');
            setTournaments(res.data);
        } catch (err) {
            console.error('Error fetching tournaments:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingTournament(null);
        setShowForm(true);
    };

    const handleEdit = (tournament: Tournament) => {
        setEditingTournament(tournament);
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this tournament?')) return;

        try {
            await api.delete(`/api/tournaments/${id}`);
            alert('Tournament deleted successfully');
            fetchTournaments();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete tournament');
        }
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingTournament(null);
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingTournament(null);
        fetchTournaments();
    };

    const handlePublish = async (id: number) => {
        if (!window.confirm('Are you sure you want to publish this tournament? This will make it visible to students.')) return;

        try {
            await api.put(`/api/tournaments/${id}`, { status: 'UPCOMING' });
            alert('Tournament published successfully!');
            fetchTournaments();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to publish tournament');
        }
    };

    const handlePublishResults = async (id: number) => {
        if (!window.confirm('Are you sure you want to publish results? This cannot be undone.')) return;

        try {
            await api.post(`/api/tournaments/${id}/publish-results`);
            alert('Results published successfully!');
            fetchTournaments();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to publish results');
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            DRAFT: 'bg-gray-100 text-gray-700',
            UPCOMING: 'bg-blue-100 text-blue-700',
            LIVE: 'bg-green-100 text-green-700',
            COMPLETED: 'bg-orange-100 text-orange-700',
            RESULT_PUBLISHED: 'bg-purple-100 text-purple-700'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status as keyof typeof styles]}`}>
                {status.replace('_', ' ')}
            </span>
        );
    };

    const TournamentCard = ({ tournament }: { tournament: Tournament }) => {
        const now = new Date();
        const examEnd = new Date(tournament.exam_end);
        const isPastExam = now > examEnd;

        const isOwner = tournament.instructor_id === user?.id;

        const canEdit = isOwner && ['DRAFT', 'UPCOMING'].includes(tournament.status);
        const canDelete = isOwner && tournament.status === 'DRAFT';
        const canPublish = isOwner && tournament.status === 'DRAFT';
        const canPublishResults = isOwner && (tournament.status === 'COMPLETED' || (tournament.status === 'LIVE' && isPastExam));

        return (
            <div className="bg-white dark:bg-surface-dark rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border-l-4 border-yellow-500 overflow-hidden">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{tournament.name}</h3>
                        {getStatusBadge(tournament.status)}
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{tournament.description}</p>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                            <FaTrophy className="text-yellow-500" />
                            <span className="text-gray-700 dark:text-gray-300">{tournament.level_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <FaClock className="text-blue-500" />
                            <span className="text-gray-700 dark:text-gray-300">{tournament.duration} mins</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <FaUsers className="text-green-500" />
                            <span className="text-gray-700 dark:text-gray-300">{tournament.registered_count} students</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <FaChartBar className="text-purple-500" />
                            <span className="text-gray-700 dark:text-gray-300">{tournament.subject_name || 'All Subjects'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <FaUserGraduate className="text-indigo-500" />
                            <span className="text-gray-700 dark:text-gray-300 font-bold">{tournament.grade} Class</span>
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

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                        {isOwner && canEdit && (
                            <button
                                onClick={() => handleEdit(tournament)}
                                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                            >
                                <FaEdit /> Edit
                            </button>
                        )}

                        {isOwner && canPublish && (
                            <button
                                onClick={() => handlePublish(tournament.id)}
                                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                            >
                                <FaCheckCircle /> Publish
                            </button>
                        )}

                        {isOwner && canDelete && (
                            <button
                                onClick={() => handleDelete(tournament.id)}
                                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
                            >
                                <FaTrash /> Delete
                            </button>
                        )}

                        {isOwner && canPublishResults && (
                            <button
                                onClick={() => handlePublishResults(tournament.id)}
                                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition"
                            >
                                <FaCheckCircle /> Publish Results
                            </button>
                        )}

                        {/* Monitor/Real-time Results - Visible for LIVE (Owner) or Any Instructor of Same Grade */}
                        {(tournament.status === 'LIVE' || (isPastExam && tournament.status !== 'RESULT_PUBLISHED')) && (
                            <button
                                onClick={() => navigate(`/instructor/tournament-monitor/${tournament.id}`)}
                                className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-teal-700 transition"
                            >
                                <FaUsers /> Monitor Students
                            </button>
                        )}

                        {/* View Results/Leaderboard - Visible after results are published or exam ends */}
                        {(tournament.status === 'COMPLETED' || tournament.status === 'RESULT_PUBLISHED' || isPastExam) && (
                            <button
                                onClick={() => navigate(`/instructor/tournament-leaderboard/${tournament.id}`)}
                                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
                            >
                                <FaChartBar /> View Results
                            </button>
                        )}

                        {/* View Questions - For non-owners to see what the test is about */}
                        {!isOwner && tournament.status === 'UPCOMING' && (
                            <button
                                onClick={() => navigate(`/instructor/tournament-preview/${tournament.id}`)}
                                className="flex items-center gap-2 border-2 border-gray-400 text-gray-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
                            >
                                <FaTrophy /> View Test
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
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-gray-900 dark:text-white mb-2">
                        <FaTrophy className="text-yellow-500" />
                        My Tournaments
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">Create and manage your tournament competitions</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-lg font-bold hover:from-yellow-600 hover:to-orange-600 transition shadow-lg"
                >
                    <FaPlus /> Create Tournament
                </button>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading tournaments...</p>
                </div>
            )}

            {/* Empty State */}
            {!loading && tournaments.length === 0 && (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <FaTrophy className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Tournaments Yet</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first tournament to start engaging your students!</p>
                    <button
                        onClick={handleCreate}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-lg font-bold hover:from-yellow-600 hover:to-orange-600 transition"
                    >
                        <FaPlus /> Create Your First Tournament
                    </button>
                </div>
            )}

            {/* Tournament Grid */}
            {!loading && tournaments.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {tournaments.map(tournament => (
                        <TournamentCard key={tournament.id} tournament={tournament} />
                    ))}
                </div>
            )}

            {/* Tournament Form Modal */}
            {showForm && (
                <TournamentForm
                    tournament={editingTournament}
                    onClose={handleFormClose}
                    onSuccess={handleFormSuccess}
                />
            )}
        </div>
    );
};

export default InstructorTournaments;
