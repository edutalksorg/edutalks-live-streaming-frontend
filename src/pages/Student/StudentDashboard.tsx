import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FaVideo, FaBook, FaChevronDown, FaChevronUp, FaFileAlt, FaCheckCircle, FaPlayCircle, FaHourglassHalf, FaTimes } from 'react-icons/fa';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

interface Subject {
    id: number;
    name: string;
    instructor_name?: string;
    exams: {
        id: number;
        title: string;
        status: string;
        score: number | null;
        total_marks: number;
        attempts_done: number;
        attempts_allowed: number;
        review_text?: string;
        all_attempts?: any[];
    }[];
    notes: any[];
}

interface DashboardData {
    grade: string;
    stats: {
        liveNow: number;
        upcomingExams: number;
        studyMaterials: number;
    };
    upcomingClasses: any[];
    recentResults: {
        score: number;
        submitted_at: string;
        title: string;
        total_marks: number;
        subject_name: string;
        submission_id: number;
        review_text?: string;
        file_path?: string;
    }[];
}

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

const StudentDashboard: React.FC = () => {
    const { user } = useContext(AuthContext)!;
    const { theme } = useTheme();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [liveClasses, setLiveClasses] = useState<ClassSession[]>([]);
    const [showLivePopup, setShowLivePopup] = useState(false);
    const [loading, setLoading] = useState(true);
    const [expandedSubject, setExpandedSubject] = useState<number | null>(null);

    const fetchData = async () => {
        try {
            const [dashRes, subRes, classesRes, siClassesRes] = await Promise.all([
                api.get('/api/student/dashboard'),
                api.get('/api/student/subjects-full'),
                api.get('/api/classes/student'),
                api.get('/api/student/super-instructor-classes')
            ]);

            setDashboardData(dashRes.data);
            setSubjects(subRes.data);
            if (subRes.data.length > 0) setExpandedSubject(subRes.data[0].id);

            // Process Live Classes
            const regularLive = classesRes.data.filter((c: any) => c.status === 'live').map((c: any) => ({ ...c, is_super_instructor: false }));
            const siLive = siClassesRes.data.filter((c: any) => c.status === 'live').map((c: any) => ({ ...c, is_super_instructor: true }));
            const allLive = [...regularLive, ...siLive];

            setLiveClasses(allLive);
            if (allLive.length > 0) {
                setShowLivePopup(true);
            }
        } catch (err) {
            console.error("Failed to fetch dashboard data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Socket for real-time updates
        const socket = io(SOCKET_URL);

        socket.on('global_sync', (payload) => {
            console.log("[StudentDashboard] Global sync received:", payload);
            fetchData();
        });

        socket.on('class_live', () => fetchData());
        socket.on('class_ended', () => fetchData());

        return () => {
            socket.disconnect();
        };
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    if (!dashboardData) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="text-2xl font-black text-accent-gray opacity-50 uppercase tracking-widest">Unable to load dashboard</div>
            <button onClick={fetchData} className="px-6 py-2 rounded-xl bg-primary/10 text-primary font-black uppercase tracking-widest hover:bg-primary/20 transition-all">Retry Uplink</button>
        </div>
    );

    return (
        <div className={`space-y-12 pb-20 max-w-7xl mx-auto px-4 md:px-0 relative transition-colors duration-500 ${theme === 'dark' ? 'dark' : ''}`}>
            {/* Background Pattern Layer */}
            <div className="fixed inset-0 bg-pattern-dark pointer-events-none -z-10 opacity-10"></div>

            {/* Decorative Floating Marks - Hidden on small mobile to reduce clutter */}
            <div className={`hidden sm:block absolute top-10 right-0 text-[120px] md:text-[180px] font-black ${theme === 'dark' ? 'text-primary/10' : 'text-primary/5'} select-none -z-10 animate-pulse`}>L</div>
            <div className={`hidden sm:block absolute top-[600px] left-[-50px] text-[150px] md:text-[220px] font-black ${theme === 'dark' ? 'text-white/5' : 'text-black/5'} select-none -z-10 -rotate-12`}>I</div>
            <div className={`hidden sm:block absolute top-[1200px] right-[-30px] text-[100px] md:text-[150px] font-black ${theme === 'dark' ? 'text-primary/10' : 'text-primary/5'} select-none -z-10 rotate-45`}>V</div>

            {/* Premium Hero Section */}
            <div className="relative overflow-hidden bg-surface rounded-[2rem] md:rounded-[3.5rem] p-8 md:p-20 text-accent-white shadow-premium border border-surface-border group transition-all duration-500">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/10 -skew-x-12 translate-x-1/2 opacity-30"></div>
                <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-[radial-gradient(circle_at_top_right,_rgba(238,29,35,0.2),_transparent_70%)]' : 'bg-[radial-gradient(circle_at_top_right,_rgba(238,29,35,0.05),_transparent_70%)]'}`}></div>

                <div className="relative z-10">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                        <div className="max-w-2xl space-y-6 md:space-y-8">
                            <span className="inline-block px-4 md:px-6 py-2 rounded-full bg-primary text-white text-[8px] md:text-[10px] font-black tracking-[0.3em] uppercase shadow-lg shadow-primary/40 border border-white/10">
                                {dashboardData?.grade || 'Student'} HUB
                            </span>
                            <h1 className="text-4xl md:text-6xl lg:text-8xl font-black leading-[0.9] tracking-tighter">
                                <span className="text-gradient-red italic">Hello,</span> <br />
                                <span className="text-accent-white">{user?.name?.split(' ')[0]}</span>
                            </h1>
                            <p className="text-accent-gray text-base md:text-xl leading-relaxed max-w-md font-medium">
                                Ready for excellence? You have <span className="text-primary font-black animate-pulse opacity-100">{liveClasses.length} Live Sessions</span> to conquer.
                            </p>
                        </div>
                        {/* Status Bubbles - visible on all screens as smaller grid on mobile */}
                        <div className="flex flex-row lg:flex-col gap-4 md:gap-6 overflow-x-auto pb-4 lg:pb-0 lg:overflow-visible no-scrollbar">
                            <Link to="/student/tests" className="flex-shrink-0 bg-surface-light/50 backdrop-blur-3xl border border-surface-border p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] text-center w-40 md:w-64 hover:border-primary/30 transition-all cursor-pointer group/card shadow-premium block">
                                <div className="text-4xl md:text-7xl font-black text-primary italic tracking-tighter group-hover/card:scale-110 transition-transform">{dashboardData?.stats.upcomingExams}</div>
                                <div className="text-[8px] md:text-[10px] uppercase font-black text-accent-gray tracking-[0.4em] mt-2 whitespace-nowrap">Active Exams</div>
                            </Link>
                            <Link to="/student/materials" className="flex-shrink-0 bg-surface-light/50 backdrop-blur-3xl border border-surface-border p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] text-center w-40 md:w-64 hover:border-primary/30 transition-all cursor-pointer group/card lg:translate-x-10 shadow-premium block">
                                <div className="text-4xl md:text-7xl font-black text-accent-white italic tracking-tighter group-hover/card:scale-110 transition-transform">{dashboardData?.stats.studyMaterials}</div>
                                <div className="text-[8px] md:text-[10px] uppercase font-black text-accent-gray tracking-[0.4em] mt-2 whitespace-nowrap">Materials</div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            {/* Live Class Popup Modal - Small Floating Popup */}
            {showLivePopup && liveClasses.length > 0 && (
                <div className="fixed bottom-8 right-8 z-[60] max-w-sm w-full animate-in slide-in-from-bottom-10 duration-500">
                    <div className="bg-surface border border-primary/30 p-6 rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(238,29,35,0.4)] relative overflow-hidden">
                        {/* Background Effects */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -z-10"></div>

                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full animate-pulse"></div>
                                    <FaVideo size={24} className="text-primary relative z-10" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-accent-white italic tracking-tight leading-none">
                                        LIVE <span className="text-primary">NOW</span>
                                    </h2>
                                    <p className="text-[9px] text-accent-gray font-bold tracking-widest uppercase mt-1">
                                        Broadcast Active
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowLivePopup(false)}
                                className="text-accent-gray hover:text-white transition-colors"
                            >
                                <FaTimes size={14} />
                            </button>
                        </div>

                        <div className="space-y-3 mb-4 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                            {liveClasses.map((cls) => (
                                <div key={cls.id} className="bg-surface-dark/50 border border-surface-border p-4 rounded-2xl group hover:border-primary/30 transition-all">
                                    <h4 className="text-sm font-black text-accent-white italic truncate">{cls.title}</h4>
                                    {cls.instructor_name && <p className="text-[8px] text-accent-gray uppercase tracking-widest mt-1 mb-3">By {cls.instructor_name}</p>}
                                    <Link
                                        to={cls.is_super_instructor ? `/student/super-instructor-classroom/${cls.id}` : `/student/live/${cls.id}`}
                                        className="btn-primary w-full py-2 text-[9px] shadow-lg shadow-primary/10 group-hover:shadow-primary/30 flex items-center justify-center gap-2"
                                    >
                                        <FaPlayCircle size={10} /> JOIN STREAM
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 pt-10">
                {/* Left Side: Subject Hub */}
                <div className="lg:col-span-8 space-y-8 md:space-y-12">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-3xl md:text-5xl font-black text-accent-white tracking-tighter">
                            <span className="text-gradient-red italic">Subject</span> Hub
                        </h2>
                        <div className="w-16 md:w-20 h-1.5 md:h-2 bg-primary rounded-full shadow-primary-glow"></div>
                    </div>

                    <div className="grid grid-cols-1 gap-10">
                        {subjects.map((subject) => (
                            <div
                                key={subject.id}
                                className={`group overflow-hidden bg-surface rounded-[2rem] md:rounded-[3.5rem] border-2 transition-all duration-700 ${expandedSubject === subject.id
                                    ? 'shadow-premium-hover border-primary/40'
                                    : 'shadow-premium border-surface-border hover:border-primary/20'
                                    }`}
                            >
                                <div
                                    onClick={() => setExpandedSubject(expandedSubject === subject.id ? null : subject.id)}
                                    className="p-6 md:p-12 flex items-center justify-between cursor-pointer select-none group/header hover:bg-surface-light/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4 md:gap-10">
                                        <div className={`w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-[2.5rem] flex items-center justify-center transition-all duration-700 ${expandedSubject === subject.id ? 'bg-primary text-white rotate-12 shadow-2xl shadow-primary/40' : 'bg-surface-dark text-accent-white border-2 border-surface-border group-hover/header:bg-primary group-hover/header:rotate-12 shadow-xl'
                                            }`}>
                                            <FaBook size={24} className="md:size-[36px]" />
                                        </div>
                                        <div className="space-y-1 md:space-y-2">
                                            <h3 className="text-xl md:text-4xl font-black text-accent-white tracking-tight italic group-hover/header:text-primary transition-colors">{subject.name}</h3>
                                            <div className="flex items-center gap-2 md:gap-4 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-accent-gray flex-wrap">
                                                <span className="text-primary">{subject.exams.length} TESTS</span>
                                                <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-surface-border rounded-full"></div>
                                                <span>{subject.notes.length} DOCS</span>
                                                {subject.instructor_name && (
                                                    <>
                                                        <div className="hidden sm:block w-1 h-1 md:w-1.5 md:h-1.5 bg-surface-border rounded-full"></div>
                                                        <span className="text-accent-white/70 italic block sm:inline">By {subject.instructor_name}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-700 ${expandedSubject === subject.id ? 'rotate-180 bg-primary border-primary text-white shadow-xl' : 'bg-surface-dark border-surface-border text-accent-gray'
                                        }`}>
                                        {expandedSubject === subject.id ? <FaChevronUp size={10} className="md:size-[14px]" /> : <FaChevronDown size={10} className="md:size-[14px]" />}
                                    </div>
                                </div>

                                {expandedSubject === subject.id && (
                                    <div className="px-6 md:px-12 pb-8 md:pb-12 pt-4 space-y-8 md:space-y-12 animate-in fade-in slide-in-from-top-10 duration-1000">
                                        <div className="h-px bg-surface-border"></div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                                            {/* Exams */}
                                            <div className="space-y-6 md:space-y-8">
                                                <h4 className="text-[10px] md:text-[12px] font-black text-primary uppercase tracking-[0.4em] mb-6 md:mb-10 italic">Tests & Assessments</h4>
                                                <div className="space-y-4 md:space-y-5">
                                                    {subject.exams.map((exam: any, idx) => (
                                                        <React.Fragment key={idx}>
                                                            <div className="bg-surface-dark p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border border-surface-border flex flex-col sm:flex-row items-center justify-between gap-4 group/exam hover:bg-surface-light hover:border-primary/20 transition-all duration-500">
                                                                <div className="flex items-center gap-4 md:gap-6 w-full sm:w-auto">
                                                                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover/exam:rotate-12 flex-shrink-0 ${exam.status === 'Completed' ? 'bg-accent-emerald text-white shadow-accent-emerald/20' :
                                                                        exam.status === 'Pending' ? 'bg-surface text-accent-white border border-surface-border' :
                                                                            exam.status === 'Expired' ? 'bg-surface-dark text-accent-gray border border-surface-border opacity-50' :
                                                                                'bg-primary text-white animate-pulse shadow-primary/40'
                                                                        }`}>
                                                                        {exam.status === 'Completed' ? <FaCheckCircle size={20} /> :
                                                                            exam.status === 'Pending' ? <FaHourglassHalf size={20} /> :
                                                                                exam.status === 'Expired' ? <FaTimes size={20} /> :
                                                                                    <FaPlayCircle size={24} />}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <div className="text-base md:text-lg font-black text-accent-white tracking-tight truncate">{exam.title}</div>
                                                                        <div className="text-[9px] md:text-[10px] text-accent-gray font-black uppercase tracking-widest mt-1 flex flex-wrap items-center gap-x-2 md:gap-x-3">
                                                                            <span className={`${exam.status === 'Completed' ? 'text-emerald-500' : exam.status === 'Expired' ? 'text-primary' : ''}`}>{exam.status}</span>
                                                                            {exam.score !== null && <span className="opacity-50 whitespace-nowrap">• {exam.score}/{exam.total_marks} Marks</span>}
                                                                            <span className="opacity-50 whitespace-nowrap">• {exam.attempts_done || 0}/{exam.attempts_allowed || 1} Att.</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                                                                    <Link to={exam.status === 'Attempt Now' ? `/student/exam/${exam.id}` : (exam.attempts_done > 0 ? `/student/exam-result/${exam.id}` : '#')}
                                                                        className={`flex-1 sm:flex-none text-center px-4 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black tracking-[0.2em] transition-all transform hover:scale-105 ${exam.status === 'Attempt Now'
                                                                            ? 'bg-primary text-white hover:bg-primary-hover shadow-xl shadow-primary/30 uppercase'
                                                                            : 'bg-surface border border-surface-border text-accent-gray cursor-default uppercase'
                                                                            }`}>
                                                                        {exam.status === 'Attempt Now' ? 'START' : (exam.status === 'Expired' ? 'EXPIRED' : 'RESULT')}
                                                                    </Link>
                                                                    {exam.status === 'Completed' && (
                                                                        <div className="relative group/upload">
                                                                            <input
                                                                                type="file"
                                                                                id={`upload-${exam.id}`}
                                                                                className="hidden"
                                                                                accept="image/*"
                                                                                onChange={async (e) => {
                                                                                    const file = e.target.files?.[0];
                                                                                    if (!file || !exam.all_attempts?.[0]?.id) return;
                                                                                    const formData = new FormData();
                                                                                    formData.append('file', file);
                                                                                    try {
                                                                                        await api.post(`/api/exams/submissions/${exam.all_attempts[0].id}/upload-worksheet`, formData);
                                                                                        alert('Tactical Intel Uploaded Successfully!');
                                                                                        window.location.reload();
                                                                                    } catch (err) {
                                                                                        console.error(err);
                                                                                        alert('Upload Failure');
                                                                                    }
                                                                                }}
                                                                            />
                                                                            <label
                                                                                htmlFor={`upload-${exam.id}`}
                                                                                className={`cursor-pointer px-6 py-3 rounded-2xl text-[9px] font-black tracking-widest transition-all flex items-center gap-3 shadow-lg ${exam.all_attempts?.[0]?.file_path
                                                                                    ? 'bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20 hover:bg-accent-emerald/20'
                                                                                    : 'bg-primary text-white hover:bg-primary-hover shadow-primary/30'
                                                                                    }`}
                                                                            >
                                                                                <FaVideo size={14} className={exam.all_attempts?.[0]?.file_path ? '' : 'animate-bounce'} />
                                                                                {exam.all_attempts?.[0]?.file_path ? 'PHOTO ATTACHED' : 'UPLOAD WORKSHEET'}
                                                                            </label>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {exam.review_text && (
                                                                <div className="mx-6 mb-6 p-6 rounded-2xl bg-primary/5 border border-primary/10 animate-in fade-in slide-in-from-top-2 duration-500">
                                                                    <div className="text-[8px] font-black text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                                                                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                                                                        Instructor Feedback
                                                                    </div>
                                                                    <p className="text-xs text-accent-white italic font-medium leading-relaxed">
                                                                        "{exam.review_text}"
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </React.Fragment>
                                                    ))}
                                                    {subject.exams.length === 0 && <p className="text-[10px] text-accent-gray font-black uppercase tracking-widest italic pl-4">No exams available yet.</p>}
                                                </div>
                                            </div>

                                            {/* Materials */}
                                            <div className="space-y-6 md:space-y-8">
                                                <h4 className="text-[10px] md:text-[12px] font-black text-accent-white uppercase tracking-[0.4em] mb-6 md:mb-10 italic">Premium Materials</h4>
                                                <div className="space-y-4 md:space-y-5">
                                                    {subject.notes.map((note, idx) => (
                                                        <div key={idx} className="bg-surface-dark p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border border-surface-border flex items-center justify-between group/note hover:bg-surface-light transition-all duration-500">
                                                            <div className="flex items-center gap-4 md:gap-6">
                                                                <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-surface text-accent-white flex items-center justify-center shadow-xl group-hover/note:bg-primary group-hover/note:text-white transition-all border border-surface-border">
                                                                    <FaFileAlt size={16} className="md:size-[20px]" />
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm md:text-lg font-black text-accent-white tracking-tight group-hover/note:text-primary transition-colors">{note.title}</div>
                                                                    <div className="text-[8px] md:text-[10px] text-accent-gray font-black uppercase tracking-widest mt-1">Resource</div>
                                                                </div>
                                                            </div>
                                                            <a href={`http://localhost:5000${note.file_path}`} target="_blank" rel="noreferrer" className="bg-surface border border-surface-border text-accent-white px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-black text-[8px] md:text-[10px] tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm">
                                                                PDF
                                                            </a>
                                                        </div>
                                                    ))}
                                                    {subject.notes.length === 0 && <p className="text-[10px] text-accent-gray font-black uppercase tracking-widest italic pl-4">No resources available yet.</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Schedule */}
                <div className="lg:col-span-4 space-y-16">


                    {/* Test Results Section */}
                    <div className="bg-surface rounded-[2rem] md:rounded-[3.5rem] shadow-premium border border-surface-border p-8 md:p-12 space-y-8 md:space-y-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-3xl -z-10 transition-all duration-1000 group-hover:scale-150 group-hover:bg-emerald-500/20"></div>
                        <h2 className="text-2xl md:text-3xl font-black text-accent-white flex items-center gap-4 italic tracking-tight">
                            <FaCheckCircle className="text-emerald-500 animate-pulse" /> Performance
                        </h2>
                        <div className="space-y-4 md:space-y-6">
                            {dashboardData?.recentResults && dashboardData.recentResults.length > 0 ? (
                                dashboardData.recentResults.map((result: any, i: number) => (
                                    <div key={i} className="flex flex-col gap-3 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] bg-surface-dark border border-surface-border hover:border-emerald-500/20 transition-all duration-500 group/result">
                                        <div className="flex justify-between items-start">
                                            <div className="min-w-0">
                                                <h5 className="font-black text-lg text-accent-white truncate tracking-tight mb-1">{result.title}</h5>
                                                <p className="text-[9px] font-black text-accent-gray uppercase tracking-widest">{result.subject_name}</p>
                                            </div>
                                            <div className="text-right flex flex-col items-end gap-2">
                                                <div className="flex items-center gap-3">
                                                    {!result.file_path && (
                                                        <div className="relative group/mini-upload">
                                                            <input
                                                                type="file"
                                                                id={`mini-upload-${result.submission_id}`}
                                                                className="hidden"
                                                                accept="image/*"
                                                                onChange={async (e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (!file) return;
                                                                    const formData = new FormData();
                                                                    formData.append('file', file);
                                                                    try {
                                                                        await api.post(`/api/exams/submissions/${result.submission_id}/upload-worksheet`, formData);
                                                                        alert('Uplink Established!');
                                                                        window.location.reload();
                                                                    } catch (err) {
                                                                        console.error(err);
                                                                        alert('Uplink Failed');
                                                                    }
                                                                }}
                                                            />
                                                            <label
                                                                htmlFor={`mini-upload-${result.submission_id}`}
                                                                className="cursor-pointer p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all animate-pulse"
                                                                title="Upload Worksheet"
                                                            >
                                                                <FaVideo size={10} />
                                                            </label>
                                                        </div>
                                                    )}
                                                    <div className="text-xl font-black text-emerald-500 italic">{result.score}/{result.total_marks}</div>
                                                </div>
                                                <div className="text-[8px] font-black text-accent-gray uppercase tracking-widest mt-1">
                                                    {new Date(result.submitted_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        {/* Score Percentage Bar */}
                                        <div className="w-full bg-surface-light rounded-full h-1.5 overflow-hidden shadow-inner mt-1">
                                            <div
                                                className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                                style={{ width: `${(result.score / result.total_marks) * 100}%` }}
                                            ></div>
                                        </div>
                                        {result.review_text && (
                                            <div className="mt-3 text-[9px] text-accent-white italic opacity-70 border-l-2 border-emerald-500/30 pl-3 leading-relaxed">
                                                "{result.review_text}"
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 bg-surface-dark rounded-[3rem] border-4 border-dashed border-surface-border">
                                    <FaHourglassHalf size={60} className="mx-auto text-accent-gray/20 mb-6" />
                                    <p className="text-[10px] text-accent-gray font-black uppercase tracking-[0.4em]">No tests taken yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-primary rounded-[2rem] md:rounded-[3.5rem] p-8 md:p-12 text-white relative overflow-hidden group shadow-[0_30px_60px_-10px_rgba(238,29,35,0.5)] border border-white/10">
                        <div className="absolute top-0 right-0 w-48 h-full bg-white/10 -skew-x-[20deg] translate-x-1/2"></div>
                        <div className="relative z-10 space-y-6">
                            <h3 className="text-2xl font-black italic tracking-tight">Prime Tip</h3>
                            <p className="text-lg text-white leading-relaxed font-bold italic opacity-95">
                                "Visualizing success is the first step. Picture your goals every morning before class!"
                            </p>
                        </div>
                        <div className="absolute -bottom-10 -right-10 p-6 opacity-20 group-hover:rotate-[30deg] group-hover:scale-125 transition-all duration-1000">
                            <FaVideo size={200} />
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default StudentDashboard;
