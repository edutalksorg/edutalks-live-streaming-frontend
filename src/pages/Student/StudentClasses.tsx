import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import { FaPlayCircle, FaCalendarDay } from 'react-icons/fa';

interface ClassSession {
    id: number;
    title: string;
    description: string;
    start_time: string;
    duration: number;
    status: 'scheduled' | 'live' | 'completed';
    instructor_id: number;
}

const StudentClasses: React.FC = () => {
    const [classes, setClasses] = useState<ClassSession[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch all classes for now (Assume student enrolled in all)
        // Ideally: GET /classes/student/enrolled
        const fetchClasses = async () => {
            try {
                // Determine API endpoint to simulated getting all classes
                // We'll just generic GET /classes (need to implement in backend if not exists) 
                // For now, I'll assume we can view all or I will create a new endpoint.
                // Let's create a temporary backend 'getAllClasses' for students or modify 'getInstructorClasses'.
                // Actually, I'll add a 'getAllClasses' endpoint in ClassController for students.
                const res = await api.get('/classes/all');
                setClasses(res.data);
            } catch (err) {
                console.error("Failed to fetch classes");
            } finally {
                setLoading(false);
            }
        };
        fetchClasses();
    }, []);

    if (loading) return <div>Loading your schedule...</div>;

    const liveClasses = classes.filter(c => c.status === 'live');
    const upcomingClasses = classes.filter(c => c.status === 'scheduled');
    const completedClasses = classes.filter(c => c.status === 'completed');

    return (
        <div className="space-y-10">
            {/* Live Now Section */}
            {liveClasses.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold text-red-600 flex items-center gap-2 mb-6">
                        <span className="animate-pulse">●</span> Live Now
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {liveClasses.map(cls => (
                            <Link key={cls.id} to={`/student/live/${cls.id}`} className="block group">
                                <div className="bg-white rounded-xl shadow-lg border border-red-100 overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-1">
                                    <div className="h-32 bg-gradient-to-r from-red-500 to-pink-600 flex items-center justify-center text-white">
                                        <FaPlayCircle size={48} className="opacity-80 group-hover:scale-110 transition" />
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition">{cls.title}</h3>
                                        <p className="text-sm text-gray-500 mt-2">{cls.description}</p>
                                        <button className="mt-4 w-full py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700">
                                            Join Class
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Upcoming Section */}
            <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FaCalendarDay className="text-indigo-600" /> Upcoming Classes
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingClasses.map(cls => (
                        <div key={cls.id} className="bg-white rounded-xl shadow border-l-4 border-indigo-500 p-6">
                            <h3 className="text-lg font-bold text-gray-900">{cls.title}</h3>
                            <div className="text-indigo-600 text-sm font-semibold mt-1">
                                {new Date(cls.start_time).toLocaleString()}
                            </div>
                            <p className="text-gray-500 text-sm mt-3">{cls.description}</p>
                            <div className="mt-4 flex justify-between items-center text-sm text-gray-400">
                                <span>Duration: {cls.duration} mins</span>
                            </div>
                        </div>
                    ))}
                    {upcomingClasses.length === 0 && <p className="text-gray-500">No upcoming classes scheduled.</p>}
                </div>
            </section>
        </div>
    );
};

export default StudentClasses;
