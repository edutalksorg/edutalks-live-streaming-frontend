import React, { useContext, useEffect, useState } from 'react';
import api from '../../services/api';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FaSignOutAlt, FaBookOpen, FaVideo, FaClipboardCheck, FaTrophy, FaThLarge, FaUserGraduate, FaCrown, FaQuestionCircle } from 'react-icons/fa';
import Logo from '../../components/Logo';
import ThemeToggle from '../../components/ThemeToggle';

const StudentLayout: React.FC = () => {
    const { logout, user, socket } = useContext(AuthContext)!;
    const navigate = useNavigate();
    const location = useLocation();

    const [stats, setStats] = useState({ liveNow: 0, upcomingExams: 0, pendingDoubts: 0 });

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const fetchStats = async () => {
        try {
            const res = await api.get('/api/student/dashboard');
            const doubtsRes = await api.get('/api/doubts/student');
            const pendingDoubts = doubtsRes.data.filter((d: any) => d.status === 'pending').length;

            setStats({
                liveNow: res.data.stats.liveNow || 0,
                upcomingExams: res.data.stats.upcomingExams || 0,
                pendingDoubts: pendingDoubts
            });
        } catch (error) {
            console.error("Student layout stats fetch error:", error);
        }
    };

    useEffect(() => {
        fetchStats();

        if (socket) {
            const handleSync = () => {
                fetchStats();
            };
            socket.on('global_sync', handleSync);
            return () => {
                socket.off('global_sync', handleSync);
            };
        }
    }, [socket]);

    const navLinks = [
        { path: '/student', label: 'Dashboard', icon: FaThLarge },
        { path: '/student/classes', label: 'My Classes', icon: FaVideo, count: stats.liveNow },
        { path: '/student/super-instructor-classes', label: 'SI Classes', icon: FaUserGraduate },
        { path: '/student/tests', label: 'Tests', icon: FaClipboardCheck, count: stats.upcomingExams },
        { path: '/student/materials', label: 'Materials', icon: FaBookOpen },
        { path: '/student/tournaments', label: 'Tournaments', icon: FaTrophy },
        { path: '/student/doubts', label: 'Doubts', icon: FaQuestionCircle, count: stats.pendingDoubts },
        { path: '/student/subscription', label: 'Plans', icon: FaCrown },
    ];

    const isActive = (path: string) => {
        if (path === '/student') return location.pathname === '/student';
        return location.pathname.startsWith(path);
    };

    return (
        <div className="h-screen w-full bg-background font-sans text-foreground antialiased transition-colors duration-500 overflow-hidden relative">
            {/* Top Navigation */}
            <nav className="glass-morphism border-b border-surface-border fixed top-0 left-0 w-full z-50 shadow-2xl">
                <div className="max-w-[1920px] mx-auto px-6 sm:px-12 lg:px-16">
                    <div className="flex justify-between items-center h-16 md:h-24">
                        {/* Logo Area */}
                        <div className="flex-shrink-0 flex items-center gap-2 w-auto md:w-64">
                            <Logo />
                        </div>

                        {/* Desktop Nav - Centered */}
                        <div className="hidden lg:flex items-center justify-center flex-1 mx-2 min-w-0 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                            <div className="flex space-x-1 bg-surface-light/30 p-1.5 rounded-full border border-surface-border backdrop-blur-md flex-nowrap shrink-0">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`group relative flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black transition-all duration-300 whitespace-nowrap ${isActive(link.path)
                                            ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                                            : 'text-accent-gray hover:bg-primary/10 hover:text-primary'
                                            }`}
                                    >
                                        <link.icon className={isActive(link.path) ? 'text-white' : 'text-accent-gray group-hover:text-primary'} size={16} />
                                        <span className="uppercase tracking-wide text-xs">{link.label}</span>
                                        {link.count !== undefined && link.count > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black shadow-lg animate-pulse">
                                                {link.count}
                                            </span>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-3 md:gap-6 w-auto justify-end flex-shrink-0">
                            <Link to="/student/profile" className="flex items-center gap-2 md:gap-3 group p-1 md:p-1.5 md:pr-5 rounded-full border border-primary transition-all duration-300 bg-surface/50 backdrop-blur-sm">
                                <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-full flex items-center justify-center text-white text-[10px] md:text-xs font-black border-2 border-surface-border shadow-md transition-all">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="hidden sm:block xl:block">
                                    <p className="text-[10px] md:text-xs font-black text-primary leading-none transition-colors">{user?.name?.split(' ')[0]}</p>
                                    <p className="text-[8px] md:text-[9px] text-accent-gray mt-1 uppercase tracking-widest font-black leading-none">{user?.role}</p>
                                </div>
                            </Link>

                            <ThemeToggle />

                            <button
                                onClick={handleLogout}
                                className="w-9 h-9 md:w-11 md:h-11 flex items-center justify-center rounded-xl md:rounded-2xl bg-surface text-accent-gray hover:bg-primary hover:text-white transition-all duration-300 shadow-sm border border-surface-border hover:border-primary active:scale-90"
                                title="Logout"
                            >
                                <FaSignOutAlt size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content Scroll Container */}
            <div className="h-full w-full overflow-y-auto overflow-x-hidden pt-24 md:pt-32 pb-2">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Nav - REMOVED per user request */}
        </div>
    );
};

export default StudentLayout;
