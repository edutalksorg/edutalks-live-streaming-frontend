import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { FaVideo, FaClipboardList, FaUsers, FaMedal, FaBookOpen } from 'react-icons/fa';
import api from '../../services/api';

const InstructorDashboard: React.FC = () => {
    const { user } = useContext(AuthContext)!;
    const [stats, setStats] = useState({ totalStudents: 0, classesCount: 0, activeExams: 0, pendingReviews: 0 });
    const [batches, setBatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const res = await api.get('/api/instructor/dashboard');
            setStats(res.data.stats);
            setBatches(res.data.batches);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-full text-indigo-600 font-bold">Loading Premium Dashboard...</div>;

    return (
        <div className="max-w-7xl mx-auto">
            <header className="mb-10">
                <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
                    Welcome back, {user?.name}
                </h2>
                <p className="text-gray-500 font-medium">Manage your batches, conduct live classes, and review students.</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[
                    { label: 'Assigned Students', value: stats.totalStudents, icon: FaUsers, color: 'from-blue-500 to-indigo-600' },
                    { label: 'Classes Conducted', value: stats.classesCount, icon: FaVideo, color: 'from-purple-500 to-pink-600' },
                    { label: 'Active Exams', value: stats.activeExams, icon: FaClipboardList, color: 'from-emerald-500 to-teal-600' },
                    { label: 'Pending Reviews', value: stats.pendingReviews, icon: FaMedal, color: 'from-orange-500 to-red-600' },
                ].map((item, i) => (
                    <div key={i} className={`relative overflow-hidden bg-white p-6 rounded-3xl shadow-xl shadow-gray-100 border border-gray-50 transition-all hover:-translate-y-1 hover:shadow-2xl`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
                                <h3 className="text-3xl font-black text-gray-800">{item.value}</h3>
                            </div>
                            <div className={`p-3 rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-lg`}>
                                <item.icon className="text-xl" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* My Batches */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-lg border border-gray-50">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
                            My Assigned Batches
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {batches.length > 0 ? batches.map((batch: any) => (
                            <div key={batch.id} className="group bg-white p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all border border-gray-50 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 group-hover:bg-indigo-100 transition-colors"></div>
                                <h4 className="font-bold text-lg text-gray-800 mb-1 relative z-10">{batch.name}</h4>
                                <p className="text-indigo-600 text-sm font-semibold mb-4 relative z-10">{batch.subject_name}</p>
                                <div className="flex justify-between items-center relative z-10">
                                    <div className="text-sm text-gray-500 font-medium">
                                        <span className="text-indigo-700 font-bold">{batch.student_count}</span> Students
                                    </div>
                                    <Link to={`/instructor/students?batchId=${batch.id}`} className="text-xs bg-gray-100 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-full font-bold transition-colors">
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-2 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-10 text-center">
                                <p className="text-gray-400 font-medium">No batches assigned yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions & Live */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-700 to-purple-800 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <FaVideo className="text-9xl rotate-12" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Go Live Now</h3>
                        <p className="text-indigo-100 text-sm mb-6">Conduct a session for your assigned students and answer doubts in real-time.</p>
                        <Link to="/instructor/classes" className="inline-block bg-white text-indigo-700 font-bold px-8 py-3 rounded-2xl shadow-lg hover:scale-105 transition-transform">
                            Start Streaming
                        </Link>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-50">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Upcoming Schedule</h3>
                        <div className="space-y-4">
                            <p className="text-gray-400 text-sm italic">Connect with students and share notes to help them prepare for exams.</p>
                            <Link to="/instructor/notes" className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all">
                                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                                    <FaBookOpen />
                                </div>
                                <span className="font-semibold text-gray-700">Upload Study Material</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstructorDashboard;
