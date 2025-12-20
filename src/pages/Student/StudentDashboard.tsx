import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import {
    FaVideo, FaGraduationCap, FaBook, FaCalendarAlt,
    FaPlayCircle, FaChevronDown,
    FaFileAlt, FaCheckCircle, FaHourglassHalf
} from 'react-icons/fa';

interface Subject {
    id: number;
    name: string;
    notes: any[];
    exams: any[];
}

interface DashboardData {
    grade: string;
    stats: {
        liveNow: number;
        upcomingExams: number;
        studyMaterials: number;
    };
    upcomingClasses: any[];
}

const StudentDashboard: React.FC = () => {
    const { user } = useContext(AuthContext)!;
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedSubject, setExpandedSubject] = useState<number | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [dashRes, subRes] = await Promise.all([
                    api.get('/api/student/dashboard'),
                    api.get('/api/student/subjects-full')
                ]);
                setDashboardData(dashRes.data);
                setSubjects(subRes.data);
                if (subRes.data.length > 0) setExpandedSubject(subRes.data[0].id);
            } catch (err) {
                console.error("Failed to fetch dashboard data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="space-y-10 pb-20 max-w-7xl mx-auto px-4 md:px-0">
            {/* Premium Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-indigo-950 to-indigo-900 rounded-[2.5rem] p-10 md:p-16 text-white shadow-2xl border border-white/5">
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="max-w-xl">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-sm font-bold mb-6 tracking-wide uppercase">
                                Student Portal • {dashboardData?.grade || 'N/A'}
                            </span>
                            <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight tracking-tight">
                                Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{user?.name}</span>!
                            </h1>
                            <p className="text-indigo-100/70 text-lg mb-8 leading-relaxed max-w-md">
                                Your learning journey is on track. You have <span className="text-white font-bold">{dashboardData?.stats.liveNow} live sessions</span> happening right now.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link to="/student/live-now" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-lg shadow-indigo-600/20 transition-all active:scale-95">
                                    <FaVideo className="animate-pulse" /> Join Live Now
                                </Link>
                                <Link to="/student/profile" className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white px-8 py-4 rounded-2xl font-bold transition-all active:scale-95">
                                    View Profile
                                </Link>
                            </div>
                        </div>
                        {/* Summary Card */}
                        <div className="hidden lg:grid grid-cols-2 gap-4">
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl text-center">
                                <div className="text-3xl font-black text-indigo-400 mb-1">{dashboardData?.stats.upcomingExams}</div>
                                <div className="text-xs uppercase font-bold text-gray-400 tracking-wider">Tests</div>
                            </div>
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl text-center">
                                <div className="text-3xl font-black text-purple-400 mb-1">{dashboardData?.stats.studyMaterials}</div>
                                <div className="text-xs uppercase font-bold text-gray-400 tracking-wider">Notes</div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Abstract Background Shapes */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]"></div>
                <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/10 rounded-full blur-[80px]"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Side: Subject Hub (Main Focus) */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Your Subject Hub</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {subjects.map((subject) => (
                            <div
                                key={subject.id}
                                className={`group overflow-hidden bg-white rounded-[2rem] border transition-all duration-300 ${expandedSubject === subject.id
                                    ? 'shadow-2xl shadow-indigo-100 border-indigo-200'
                                    : 'shadow-sm border-gray-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-gray-100'
                                    }`}
                            >
                                {/* Subject Header Card */}
                                <div
                                    onClick={() => setExpandedSubject(expandedSubject === subject.id ? null : subject.id)}
                                    className="p-8 flex items-center justify-between cursor-pointer select-none"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={`p-4 rounded-2xl transition-colors ${expandedSubject === subject.id ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'
                                            }`}>
                                            <FaBook size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900">{subject.name}</h3>
                                            <p className="text-sm text-gray-500 font-medium">
                                                {subject.exams.length} Exams • {subject.notes.length} Study Materials
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`p-2 rounded-full border transition-all duration-500 ${expandedSubject === subject.id ? 'rotate-180 bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-gray-50 border-gray-100 text-gray-400'
                                        }`}>
                                        <FaChevronDown />
                                    </div>
                                </div>

                                {/* Expanded Content Hub */}
                                {expandedSubject === subject.id && (
                                    <div className="px-8 pb-8 pt-2 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                                        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Exams Section */}
                                            <div className="space-y-4">
                                                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                    <FaGraduationCap className="text-indigo-500" /> Subject Tests
                                                </h4>
                                                <div className="space-y-3">
                                                    {subject.exams.map((exam, idx) => (
                                                        <div key={idx} className="bg-gray-50 p-4 rounded-2xl border border-gray-200/50 flex items-center justify-between group/exam hover:bg-white hover:shadow-lg hover:border-indigo-100 transition-all">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${exam.status === 'Completed' ? 'bg-green-100 text-green-600' :
                                                                    exam.status === 'Pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-indigo-100 text-indigo-600'
                                                                    }`}>
                                                                    {exam.status === 'Completed' ? <FaCheckCircle /> :
                                                                        exam.status === 'Pending' ? <FaHourglassHalf /> : <FaPlayCircle />}
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-bold text-gray-800">{exam.title}</div>
                                                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                                                                        {exam.status} {exam.score !== null ? `• Score: ${exam.score}/${exam.total_marks}` : ''}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <Link to={exam.status === 'Attempt Now' ? `/student/exam/${exam.id}` : '#'}
                                                                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${exam.status === 'Attempt Now'
                                                                    ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-200'
                                                                    : 'bg-gray-200 text-gray-400 cursor-default'
                                                                    }`}>
                                                                {exam.status === 'Attempt Now' ? 'START' : 'VIEW'}
                                                            </Link>
                                                        </div>
                                                    ))}
                                                    {subject.exams.length === 0 && <p className="text-xs text-gray-400 italic">No exams available for this subject.</p>}
                                                </div>
                                            </div>

                                            {/* Materials Section */}
                                            <div className="space-y-4">
                                                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                    <FaFileAlt className="text-purple-500" /> Study Materials
                                                </h4>
                                                <div className="space-y-3">
                                                    {subject.notes.map((note, idx) => (
                                                        <div key={idx} className="bg-gray-50 p-4 rounded-2xl border border-gray-200/50 flex items-center justify-between hover:bg-white hover:shadow-lg hover:border-purple-100 transition-all">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                                                                    <FaFileAlt />
                                                                </div>
                                                                <div className="max-w-[120px]">
                                                                    <div className="text-sm font-bold text-gray-800 truncate">{note.title}</div>
                                                                    <div className="text-[10px] text-gray-400 font-bold uppercase">Material</div>
                                                                </div>
                                                            </div>
                                                            <a href={`http://localhost:5000${note.file_path}`} target="_blank" rel="noreferrer" className="text-purple-600 font-black text-xs hover:underline decoration-2">
                                                                VIEW DOC
                                                            </a>
                                                        </div>
                                                    ))}
                                                    {subject.notes.length === 0 && <p className="text-xs text-gray-400 italic">No materials uploaded for this subject.</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Quick Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Live Schedule Card */}
                    <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8 space-y-6">
                        <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                            <FaCalendarAlt className="text-indigo-600" /> Live Schedule
                        </h2>
                        <div className="space-y-4">
                            {dashboardData?.upcomingClasses.map((cls, i) => (
                                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-indigo-50/50 transition-colors border border-transparent hover:border-indigo-100">
                                    <div className="flex flex-col items-center justify-center px-3 py-2 bg-white rounded-xl shadow-sm min-w-[55px]">
                                        <span className="text-[10px] font-black uppercase text-indigo-400">{new Date(cls.start_time).toLocaleString('default', { month: 'short' })}</span>
                                        <span className="text-lg font-black text-gray-800 leading-none">{new Date(cls.start_time).getDate()}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h5 className="font-bold text-gray-900 truncate">{cls.title}</h5>
                                        <p className="text-xs text-gray-400 font-bold uppercase truncate">{cls.subject_name} • {new Date(cls.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                            ))}
                            {(!dashboardData?.upcomingClasses || dashboardData.upcomingClasses.length === 0) && (
                                <div className="text-center py-6">
                                    <div className="text-gray-200 mb-2"><FaCalendarAlt size={32} className="mx-auto" /></div>
                                    <p className="text-sm text-gray-400 font-medium italic">No classes today.</p>
                                </div>
                            )}
                        </div>
                        <button className="w-full py-4 rounded-2xl bg-gray-900 text-white font-bold text-sm tracking-wide hover:bg-gray-800 transition active:scale-95">
                            VIEW FULL CALENDAR
                        </button>
                    </div>

                    {/* Quick Tips or Announcements */}
                    <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-lg shadow-indigo-600/20">
                        <div className="relative z-10">
                            <h3 className="text-lg font-black mb-3 italic">Study Tip of the Day</h3>
                            <p className="text-sm text-indigo-100 leading-relaxed font-medium">
                                "The best way to learn is to teach others. Try explaining a complex topic to your friends after class!"
                            </p>
                        </div>
                        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:rotate-12 transition-transform duration-500">
                            <FaVideo size={80} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
