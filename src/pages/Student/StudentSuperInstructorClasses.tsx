import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { FaPlayCircle, FaCalendarDay, FaClock, FaBook } from 'react-icons/fa';
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
    instructor_name: string;
    grade: string;
}

const StudentSuperInstructorClasses: React.FC = () => {
    const { user } = useContext(AuthContext)!;
    const [classes, setClasses] = useState<ClassSession[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<string>('all');

    useEffect(() => {
        fetchClasses();

        const socket = io(SOCKET_URL);
        socket.on('si_class_live', () => fetchClasses());
        socket.on('si_class_ended', () => fetchClasses());

        return () => {
            socket.disconnect();
        };
    }, []);

    const fetchClasses = async () => {
        try {
            const res = await api.get('/api/student/super-instructor-classes');
            setClasses(res.data);
        } catch (err) {
            console.error('Error fetching classes:', err);
        }
    };

    const liveClasses = classes.filter(c => c.status === 'live');
    const scheduledClasses = classes.filter(c => c.status === 'scheduled');
    const completedClasses = classes.filter(c => c.status === 'completed');

    const subjects = Array.from(new Set(classes.map(c => c.subject_name).filter(Boolean)));

    const filterBySubject = (classList: ClassSession[]) => {
        if (selectedSubject === 'all') return classList;
        return classList.filter(c => c.subject_name === selectedSubject);
    };

    return (
        <div className="min-h-screen bg-surface p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-primary">Super Instructor Classes</h1>
                    <p className="text-text-secondary mt-1">
                        Grade-wide live sessions from your Super Instructor
                    </p>
                </div>

                {/* Subject Filter */}
                {subjects.length > 0 && (
                    <div className="mb-6 flex gap-2 flex-wrap">
                        <button
                            onClick={() => setSelectedSubject('all')}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${selectedSubject === 'all'
                                    ? 'bg-primary text-white'
                                    : 'bg-white text-primary border border-primary hover:bg-primary/10'
                                }`}
                        >
                            All Subjects
                        </button>
                        {subjects.map(subject => (
                            <button
                                key={subject}
                                onClick={() => setSelectedSubject(subject!)}
                                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${selectedSubject === subject
                                        ? 'bg-primary text-white'
                                        : 'bg-white text-primary border border-primary hover:bg-primary/10'
                                    }`}
                            >
                                {subject}
                            </button>
                        ))}
                    </div>
                )}

                {/* Live Classes */}
                {liveClasses.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                            Live Now
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filterBySubject(liveClasses).map(cls => (
                                <div key={cls.id} className="premium-card p-6 border-l-4 border-red-500 animate-pulse-border">
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="text-lg font-bold text-primary">{cls.title}</h3>
                                        <div className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                            LIVE
                                        </div>
                                    </div>
                                    <p className="text-text-secondary text-sm mb-3">{cls.description}</p>
                                    <div className="space-y-2 mb-4">
                                        {cls.subject_name && (
                                            <div className="flex items-center gap-2 text-sm text-accent">
                                                <FaBook className="text-xs" />
                                                {cls.subject_name}
                                            </div>
                                        )}
                                        <p className="text-xs text-text-secondary">
                                            Instructor: {cls.instructor_name}
                                        </p>
                                    </div>
                                    <Link
                                        to={`/student/super-instructor-classroom/${cls.id}`}
                                        className="block w-full bg-red-500 text-white text-center py-3 rounded-lg hover:bg-red-600 transition-colors font-semibold flex items-center justify-center gap-2"
                                    >
                                        <FaPlayCircle /> Join Live Class
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Scheduled Classes */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-primary mb-4">Upcoming Classes</h2>
                    {filterBySubject(scheduledClasses).length === 0 ? (
                        <div className="premium-card p-8 text-center text-text-secondary">
                            No upcoming classes scheduled.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filterBySubject(scheduledClasses).map(cls => (
                                <div key={cls.id} className="premium-card p-6">
                                    <h3 className="text-lg font-bold text-primary mb-2">{cls.title}</h3>
                                    <p className="text-text-secondary text-sm mb-3">{cls.description}</p>
                                    <div className="space-y-2 mb-4">
                                        {cls.subject_name && (
                                            <div className="flex items-center gap-2 text-sm text-accent">
                                                <FaBook className="text-xs" />
                                                {cls.subject_name}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                                            <FaClock />
                                            {new Date(cls.start_time).toLocaleString()}
                                        </div>
                                        <p className="text-xs text-text-secondary">
                                            Instructor: {cls.instructor_name}
                                        </p>
                                    </div>
                                    <div className="bg-blue-50 text-blue-700 text-center py-2 rounded-lg text-sm font-semibold">
                                        Scheduled
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Completed Classes */}
                <div>
                    <h2 className="text-xl font-bold text-primary mb-4">Past Classes</h2>
                    {filterBySubject(completedClasses).length === 0 ? (
                        <div className="premium-card p-8 text-center text-text-secondary">
                            No completed classes yet.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filterBySubject(completedClasses).map(cls => (
                                <div key={cls.id} className="premium-card p-6 opacity-75">
                                    <h3 className="text-lg font-bold text-primary mb-2">{cls.title}</h3>
                                    <p className="text-text-secondary text-sm mb-3">{cls.description}</p>
                                    <div className="space-y-2">
                                        {cls.subject_name && (
                                            <div className="flex items-center gap-2 text-sm text-accent">
                                                <FaBook className="text-xs" />
                                                {cls.subject_name}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                                            <FaCalendarDay />
                                            {new Date(cls.start_time).toLocaleDateString()}
                                        </div>
                                        <p className="text-xs text-text-secondary">
                                            Instructor: {cls.instructor_name}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentSuperInstructorClasses;
