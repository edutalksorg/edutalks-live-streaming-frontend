import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import api from '../../services/api';
import { FaPlayCircle, FaCalendarDay, FaEdit, FaTrash, FaPlus, FaClock } from 'react-icons/fa';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

interface ClassSession {
    id: number;
    title: string;
    description: string;
    start_time: string;
    duration: number;
    status: 'scheduled' | 'live' | 'completed';
    super_instructor_id: number;
    subject_id: number | null;
    subject_name: string | null;
    grade: string;
}

const SuperInstructorClasses: React.FC = () => {

    const navigate = useNavigate();
    const [classes, setClasses] = useState<ClassSession[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingClass, setEditingClass] = useState<ClassSession | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        start_time: '',
        duration: 60,
        subject_id: ''
    });

    const [showStartModal, setShowStartModal] = useState(false);
    const [immediateTitle, setImmediateTitle] = useState('');
    const [immediateSubjectId, setImmediateSubjectId] = useState('');

    useEffect(() => {
        fetchClasses();
        fetchSubjects();

        const socket = io(SOCKET_URL);
        socket.on('si_class_live', () => fetchClasses());
        socket.on('si_class_ended', () => fetchClasses());

        return () => {
            socket.disconnect();
        };
    }, []);

    const fetchClasses = async () => {
        try {
            const res = await api.get('/api/super-instructor/classes');
            setClasses(res.data);
        } catch (err) {
            console.error('Error fetching classes:', err);
        }
    };

    const fetchSubjects = async () => {
        try {
            const res = await api.get('/api/super-instructor/subjects');
            setClasses(prev => prev); // Trigger re-render if needed, though state update does it
            setSubjects(res.data);
        } catch (err) {
            console.error('Error fetching subjects:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingClass) {
                await api.put(`/api/super-instructor/classes/${editingClass.id}`, formData);
            } else {
                await api.post('/api/super-instructor/classes', formData);
            }
            setShowModal(false);
            setEditingClass(null);
            setFormData({ title: '', description: '', start_time: '', duration: 60, subject_id: '' });
            fetchClasses();
        } catch (err) {
            console.error('Error saving class:', err);
            alert('Failed to save class');
        }
    };

    const handleEdit = (cls: ClassSession) => {
        setEditingClass(cls);
        setFormData({
            title: cls.title,
            description: cls.description,
            start_time: new Date(cls.start_time).toISOString().slice(0, 16),
            duration: cls.duration,
            subject_id: cls.subject_id?.toString() || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this class?')) return;
        try {
            await api.delete(`/api/super-instructor/classes/${id}`);
            fetchClasses();
        } catch (err) {
            console.error('Error deleting class:', err);
            alert('Failed to delete class');
        }
    };

    const handleStartImmediate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/api/super-instructor/classes/start-immediate', {
                title: immediateTitle,
                subject_id: immediateSubjectId || null
            });
            navigate(`/super-instructor/classroom/${res.data.id}`);
        } catch (err) {
            console.error('Error starting immediate class:', err);
            alert('Failed to start class');
        }
    };

    const liveClasses = classes.filter(c => c.status === 'live');
    const scheduledClasses = classes.filter(c => c.status === 'scheduled');
    const completedClasses = classes.filter(c => c.status === 'completed');

    return (
        <div className="min-h-screen bg-surface p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-primary">Live Classes</h1>
                        <p className="text-text-secondary mt-1">Manage your grade-wide live sessions</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowStartModal(true)}
                            className="bg-red-600 text-white px-8 py-4 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-3 font-bold text-lg shadow-lg"
                        >
                            <FaPlayCircle size={24} /> GO LIVE NOW
                        </button>
                        <button
                            onClick={() => {
                                setEditingClass(null);
                                setFormData({ title: '', description: '', start_time: '', duration: 60, subject_id: '' });
                                setShowModal(true);
                            }}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-semibold shadow-md"
                        >
                            <FaPlus /> Schedule Class
                        </button>
                    </div>
                </div>

                {/* Live Classes */}
                {liveClasses.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                            Live Now
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {liveClasses.map(cls => (
                                <div key={cls.id} className="premium-card p-6 border-l-4 border-red-500">
                                    <h3 className="text-lg font-bold text-primary mb-2">{cls.title}</h3>
                                    <p className="text-text-secondary text-sm mb-4">{cls.description}</p>
                                    {cls.subject_name && (
                                        <p className="text-xs text-accent mb-2">Subject: {cls.subject_name}</p>
                                    )}
                                    <Link
                                        to={`/super-instructor/classroom/${cls.id}`}
                                        className="block w-full bg-red-500 text-white text-center py-2 rounded-lg hover:bg-red-600 transition-colors font-semibold"
                                    >
                                        Join Live Class
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Scheduled Classes */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-primary mb-4">Scheduled Classes</h2>
                    {scheduledClasses.length === 0 ? (
                        <div className="premium-card p-8 text-center text-text-secondary">
                            No scheduled classes. Click "Schedule Class" to create one.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {scheduledClasses.map(cls => (
                                <div key={cls.id} className="premium-card p-6">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-lg font-bold text-primary">{cls.title}</h3>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(cls)}
                                                className="text-accent hover:text-accent-dark"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cls.id)}
                                                className="text-red-500 hover:text-red-600"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-text-secondary text-sm mb-3">{cls.description}</p>
                                    {cls.subject_name && (
                                        <p className="text-xs text-accent mb-2">Subject: {cls.subject_name}</p>
                                    )}
                                    <div className="flex items-center gap-2 text-sm text-text-secondary mb-4">
                                        <FaClock />
                                        {new Date(cls.start_time).toLocaleString()}
                                    </div>
                                    <Link
                                        to={`/super-instructor/classroom/${cls.id}`}
                                        className="block w-full bg-primary text-white text-center py-2 rounded-lg hover:bg-primary-dark transition-colors font-semibold"
                                    >
                                        Enter Classroom
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Completed Classes */}
                <div>
                    <h2 className="text-xl font-bold text-primary mb-4">Completed Classes</h2>
                    {completedClasses.length === 0 ? (
                        <div className="premium-card p-8 text-center text-text-secondary">
                            No completed classes yet.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {completedClasses.map(cls => (
                                <div key={cls.id} className="premium-card p-6 opacity-75">
                                    <h3 className="text-lg font-bold text-primary mb-2">{cls.title}</h3>
                                    <p className="text-text-secondary text-sm mb-3">{cls.description}</p>
                                    {cls.subject_name && (
                                        <p className="text-xs text-accent mb-2">Subject: {cls.subject_name}</p>
                                    )}
                                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                                        <FaCalendarDay />
                                        {new Date(cls.start_time).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Start Immediate Modal */}
            {showStartModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-surface rounded-lg p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold text-primary mb-6">Start Immediate Class</h2>
                        <form onSubmit={handleStartImmediate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-primary mb-2">Title</label>
                                <input
                                    type="text"
                                    value={immediateTitle}
                                    onChange={(e) => setImmediateTitle(e.target.value)}
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="e.g. Doubts Clearing Session"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-primary mb-2">Subject</label>
                                <select
                                    value={immediateSubjectId}
                                    onChange={(e) => setImmediateSubjectId(e.target.value)}
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="">General (All subjects)</option>
                                    {subjects.map(subject => (
                                        <option key={subject.id} value={subject.id}>{subject.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition-colors font-semibold"
                                >
                                    Start Now
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowStartModal(false)}
                                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-surface rounded-lg p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold text-primary mb-6">
                            {editingClass ? 'Edit Class' : 'Schedule New Class'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-primary mb-2">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-primary mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-primary mb-2">Subject</label>
                                <select
                                    value={formData.subject_id}
                                    onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="">General (All subjects)</option>
                                    {subjects.map(subject => (
                                        <option key={subject.id} value={subject.id}>{subject.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-primary mb-2">Start Time</label>
                                <input
                                    type="datetime-local"
                                    value={formData.start_time}
                                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-primary mb-2">Duration (minutes)</label>
                                <input
                                    type="number"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    min="15"
                                    step="15"
                                    required
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition-colors font-semibold"
                                >
                                    {editingClass ? 'Update' : 'Schedule'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingClass(null);
                                    }}
                                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperInstructorClasses;
