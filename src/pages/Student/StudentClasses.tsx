import React, { useEffect, useState, useContext } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import { FaPlayCircle, FaCalendarDay, FaUserGraduate } from 'react-icons/fa';
import { io } from 'socket.io-client';
import { AuthContext } from '../../context/AuthContext';
import SubscriptionPopup from '../../components/SubscriptionPopup';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

interface ClassSession {
    id: number;
    title: string;
    description: string;
    start_time: string;
    duration: number;
    status: 'scheduled' | 'live' | 'completed';
    instructor_id?: number;
    super_instructor_id?: number;
    instructor_name?: string;
    subject_name?: string;
    is_super_instructor?: boolean;
}

const StudentClasses: React.FC = () => {
    const { user } = useContext(AuthContext)!;
    const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);
    const [classes, setClasses] = useState<ClassSession[]>([]);
    const [siClasses, setSiClasses] = useState<ClassSession[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchClasses = async () => {
        try {
            const [regularRes, siRes] = await Promise.all([
                api.get('/api/classes/student'),
                api.get('/api/student/super-instructor-classes')
            ]);

            setClasses(regularRes.data.map((c: any) => ({ ...c, is_super_instructor: false })));
            setSiClasses(siRes.data.map((c: any) => ({ ...c, is_super_instructor: true })));
        } catch (err) {
            console.error("Failed to fetch classes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClasses();

        // Socket for real-time updates
        const socket = io(SOCKET_URL);
        socket.on('class_live', () => {
            console.log("Live update received from socket (Classes Page)");
            fetchClasses();
        });
        socket.on('class_ended', () => {
            console.log("Class end received from socket (Classes Page)");
            fetchClasses();
        });
        socket.on('si_class_live', () => {
            console.log("SI Live update received");
            fetchClasses();
        });
        socket.on('si_class_ended', () => {
            console.log("SI Class end received");
            fetchClasses();
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    if (loading) return <div>Loading your schedule...</div>;

    // Combine both regular and SI classes
    const allClasses = [...classes, ...siClasses];
    const liveClasses = allClasses.filter(c => c.status === 'live');
    const upcomingClasses = allClasses.filter(c => c.status === 'scheduled');

    return (
        <div className="animate-in fade-in duration-700 space-y-20">
            {/* Live Now Section */}
            {liveClasses.length > 0 && (
                <section>
                    <div className="mb-8">
                        <h2 className="text-3xl font-black text-primary italic flex items-center gap-4 tracking-tighter uppercase">
                            <span className="relative flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-primary"></span>
                            </span>
                            LIVE <span className="text-accent-white">ENGAGEMENTS</span>
                        </h2>
                        <p className="text-accent-gray text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mt-1 ml-8">Active combat training sessions</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {liveClasses.map(cls => (
                            <div
                                key={`${cls.is_super_instructor ? 'si' : 'reg'}-${cls.id}`}
                                onClick={() => {
                                    if (user?.plan_name === 'Free') {
                                        setShowSubscriptionPopup(true);
                                    }
                                }}
                                className="block group cursor-pointer"
                            >
                                <Link
                                    to={user?.plan_name === 'Free' ? '#' : (cls.is_super_instructor ? `/student/super-instructor-classroom/${cls.id}` : `/student/live/${cls.id}`)}
                                    onClick={(e) => {
                                        if (user?.plan_name === 'Free') {
                                            e.preventDefault();
                                        }
                                    }}
                                >
                                    <div className="premium-card p-0 overflow-hidden border-primary/30 hover:border-primary transition-all duration-500 hover:scale-[1.02]">
                                        <div className="h-40 bg-surface-dark relative flex items-center justify-center overflow-hidden border-b border-surface-border">
                                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div>
                                            <FaPlayCircle size={56} className="text-primary relative z-10 group-hover:scale-125 transition-transform duration-700 shadow-2xl" />
                                            <div className="absolute bottom-4 right-4 bg-primary text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">TRANSMITTING</div>
                                            {cls.is_super_instructor && (
                                                <div className="absolute top-4 left-4 bg-blue-600 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                                                    <FaUserGraduate size={10} /> SI CLASS
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-8">
                                            <h3 className="text-xl font-black text-accent-white italic tracking-tight uppercase group-hover:text-primary transition-colors">{cls.title}</h3>
                                            <p className="text-accent-gray text-sm italic font-medium mt-3 opacity-70 line-clamp-1">{cls.description}</p>
                                            {cls.is_super_instructor && cls.subject_name && (
                                                <p className="text-xs text-blue-400 mt-2 font-bold">{cls.subject_name}</p>
                                            )}
                                            {cls.is_super_instructor && cls.instructor_name && (
                                                <p className="text-[10px] text-accent-gray mt-1">Instructor: {cls.instructor_name}</p>
                                            )}
                                            <div className="mt-8">
                                                <div className="btn-primary w-full py-4 text-[10px] flex items-center justify-center gap-2">
                                                    JOIN FREQUENCY
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Upcoming Section */}
            <section>
                <div className="mb-8">
                    <h2 className="text-3xl font-black text-accent-white italic flex items-center gap-4 tracking-tighter uppercase">
                        <FaCalendarDay className="text-accent-blue" /> UPTIME <span className="text-primary">SCHEDULE</span>
                    </h2>
                    <p className="text-accent-gray text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mt-1 ml-10">Future operational briefings</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {upcomingClasses.map(cls => (
                        <div key={`${cls.is_super_instructor ? 'si' : 'reg'}-${cls.id}`} className="premium-card p-10 flex flex-col justify-between group border-surface-border hover:border-accent-blue/30 transition-all duration-500 relative">
                            {cls.is_super_instructor && (
                                <div className="absolute top-4 right-4 bg-blue-600/20 text-blue-400 text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-blue-600/30">
                                    <FaUserGraduate className="inline mr-1" size={10} /> SI
                                </div>
                            )}
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <h3 className="text-xl font-black text-accent-white italic tracking-tight uppercase group-hover:text-accent-blue transition-colors leading-tight">{cls.title}</h3>
                                    <div className="bg-accent-blue/10 p-2 rounded-xl text-accent-blue border border-accent-blue/20">
                                        <FaCalendarDay size={14} />
                                    </div>
                                </div>
                                <div className="p-4 bg-surface-light border border-surface-border rounded-2xl mb-6">
                                    <div className="text-accent-blue text-[10px] font-black uppercase tracking-widest mb-1 italic">
                                        {new Date(cls.start_time).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                    <div className="text-accent-white text-lg font-black italic tracking-tighter">
                                        {new Date(cls.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                                <p className="text-accent-gray text-sm italic font-medium opacity-60 line-clamp-2">{cls.description}</p>
                                {cls.is_super_instructor && cls.subject_name && (
                                    <p className="text-xs text-blue-400 mt-3 font-bold">{cls.subject_name}</p>
                                )}
                                {cls.is_super_instructor && cls.instructor_name && (
                                    <p className="text-[10px] text-accent-gray mt-1">Instructor: {cls.instructor_name}</p>
                                )}
                            </div>

                            <div className="mt-8 pt-6 border-t border-surface-border flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-accent-gray opacity-40 italic">Duration: {cls.duration}M</span>
                                <span className="bg-surface-light px-3 py-1 rounded-full border border-surface-border text-[8px] font-black text-accent-gray uppercase tracking-widest">LOCKED</span>
                            </div>
                        </div>
                    ))}
                </div>

                {upcomingClasses.length === 0 && (
                    <>
                        {(!user?.plan_name || user.plan_name === 'Free') ? (
                            <div className="premium-card p-12 text-center border-l-4 border-yellow-500 relative overflow-hidden group hover:scale-[1.01] transition-transform duration-500">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
                                <FaCalendarDay className="mx-auto text-yellow-500 text-6xl mb-6 animate-pulse drop-shadow-lg" />
                                <h3 className="text-3xl font-black text-gray-900 dark:text-white italic uppercase tracking-tight mb-4">
                                    Unlock Your <span className="text-yellow-500">Full Potential</span>
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-lg font-medium max-w-2xl mx-auto mb-8 leading-relaxed">
                                    Subscribe to <strong>EduTalks Pro</strong> to access unlimited live classes, exclusive exams, and compete in global tournaments. Don't settle for less.
                                </p>
                                <div className="flex justify-center gap-4">
                                    <Link
                                        to="/student/subscription"
                                        className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-xl font-black uppercase tracking-widest shadow-xl shadow-yellow-500/20 hover:shadow-yellow-500/40 hover:-translate-y-1 transition-all flex items-center gap-2"
                                    >
                                        Upgrade Now
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="premium-card p-24 text-center opacity-50 border-dashed border-2">
                                <FaCalendarDay className="mx-auto text-accent-gray/20 text-7xl mb-6" />
                                <h3 className="text-2xl font-black text-accent-white italic uppercase tracking-tight">No upcoming briefings</h3>
                                <p className="text-accent-gray italic font-medium mt-3">Tactical calendar remains clear for this sector.</p>
                            </div>
                        )}
                    </>
                )}
            </section>
            <SubscriptionPopup isOpen={showSubscriptionPopup} onClose={() => setShowSubscriptionPopup(false)} />
        </div >
    );
};
export default StudentClasses;
