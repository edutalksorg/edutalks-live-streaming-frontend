import React, { useContext } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FaSignOutAlt, FaBookOpen, FaVideo, FaClipboardCheck, FaTrophy, FaThLarge, FaUserGraduate, FaCrown } from 'react-icons/fa';
import Logo from '../../components/Logo';
import ThemeToggle from '../../components/ThemeToggle';

const StudentLayout: React.FC = () => {
    const { logout, user } = useContext(AuthContext)!;
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinks = [
        { path: '/student', label: 'Dashboard', icon: FaThLarge },
        { path: '/student/classes', label: 'My Classes', icon: FaVideo },
        { path: '/student/super-instructor-classes', label: 'SI Classes', icon: FaUserGraduate },
        { path: '/student/tests', label: 'Tests', icon: FaClipboardCheck },
        { path: '/student/materials', label: 'Materials', icon: FaBookOpen },
        { path: '/student/tournaments', label: 'Tournaments', icon: FaTrophy },
        { path: '/student/subscription', label: 'Plans', icon: FaCrown },
    ];

    const isActive = (path: string) => {
        if (path === '/student') return location.pathname === '/student';
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-surface-dark font-sans text-accent-white antialiased transition-colors duration-500">
            {/* Top Navigation */}
            {/* Top Navigation */}
            <nav className="glass-morphism border-b border-surface-border fixed w-full z-50 shadow-2xl">
                <div className="max-w-[1920px] mx-auto px-6 sm:px-12 lg:px-16">
                    <div className="flex justify-between items-center h-16 md:h-24">
                        {/* Logo Area */}
                        <div className="flex-shrink-0 flex items-center gap-2 w-auto md:w-64">
                            <Logo />
                        </div>

                        {/* Desktop Nav - Centered */}
                        <div className="hidden lg:flex items-center justify-center flex-1 mx-4">
                            <div className="flex space-x-2 bg-surface-light/30 p-2 rounded-full border border-surface-border backdrop-blur-md">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`flex items-center gap-3 px-6 py-3 rounded-full text-sm font-black transition-all duration-300 ${isActive(link.path)
                                            ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                                            : 'text-accent-gray hover:bg-surface hover:text-white'
                                            }`}
                                    >
                                        <link.icon className={isActive(link.path) ? 'text-white' : 'text-accent-gray group-hover:text-white'} size={16} />
                                        <span className="uppercase tracking-wide text-xs">{link.label}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-3 md:gap-6 w-auto md:w-64 justify-end">
                            <ThemeToggle className="scale-75 md:scale-100" />
                            <Link to="/student/profile" className="flex items-center gap-2 md:gap-3 group p-1 md:p-1.5 md:pr-5 rounded-full border border-surface-border hover:border-primary hover:bg-primary/10 transition-all duration-300 bg-surface/50 backdrop-blur-sm">
                                <div className="w-8 h-8 md:w-10 md:h-10 bg-surface-dark rounded-full flex items-center justify-center text-white text-[10px] md:text-xs font-black border-2 border-surface-border shadow-md group-hover:scale-110 group-hover:bg-primary transition-all">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="hidden sm:block xl:block">
                                    <p className="text-[10px] md:text-xs font-black text-accent-white group-hover:text-primary leading-none transition-colors">{user?.name?.split(' ')[0]}</p>
                                    <p className="text-[8px] md:text-[9px] text-accent-gray mt-1 uppercase tracking-widest font-black leading-none">{user?.role}</p>
                                </div>
                            </Link>

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

            {/* Main Content */}
            <div className="pt-24 md:pt-32 pb-24 md:pb-20">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Nav (Bottom Bar) */}
            <div className="lg:hidden fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 w-[95%] md:w-[90%] bg-surface/80 text-white rounded-2xl md:rounded-3xl shadow-2xl px-4 md:px-8 py-3 md:py-5 flex justify-around md:justify-between z-50 border border-white/10 backdrop-blur-xl">
                {navLinks.map((link) => (
                    <Link
                        key={link.path}
                        to={link.path}
                        className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive(link.path) ? 'text-primary scale-110' : 'text-accent-gray hover:text-white'
                            }`}
                    >
                        <link.icon size={isActive(link.path) ? 22 : 20} className="md:size-[22px]" />
                        <span className={`text-[8px] md:text-[10px] font-black tracking-widest uppercase transition-opacity duration-300 ${isActive(link.path) ? 'opacity-100' : 'opacity-60'}`}>
                            {link.label.substring(0, 5)}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default StudentLayout;
