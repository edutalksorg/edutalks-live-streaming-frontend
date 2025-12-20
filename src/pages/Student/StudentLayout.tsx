import React, { useContext } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FaSignOutAlt, FaBookOpen, FaVideo, FaClipboardCheck, FaTrophy, FaThLarge } from 'react-icons/fa';
import logo from '../../assets/logo.png';

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
        { path: '/student/tests', label: 'Tests', icon: FaClipboardCheck },
        { path: '/student/materials', label: 'Materials', icon: FaBookOpen },
        { path: '/student/tournaments', label: 'Tournaments', icon: FaTrophy },
    ];

    const isActive = (path: string) => {
        if (path === '/student') return location.pathname === '/student';
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans">
            {/* Top Navigation */}
            <nav className="bg-white border-b border-gray-100 fixed w-full z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20">
                        <div className="flex items-center gap-12">
                            <Link to="/student" className="flex-shrink-0 flex items-center gap-2">
                                <img src={logo} alt="EduTalks" className="h-10" />
                            </Link>

                            {/* Desktop Nav */}
                            <div className="hidden lg:flex space-x-1">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${isActive(link.path)
                                            ? 'bg-indigo-50 text-indigo-600'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <link.icon className={isActive(link.path) ? 'text-indigo-600' : 'text-gray-400'} />
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <Link to="/student/profile" className="flex items-center gap-3 group p-1.5 pr-4 rounded-full border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50 transition">
                                <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-indigo-100 group-hover:scale-105 transition">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-xs font-bold text-gray-900 leading-none">{user?.name}</p>
                                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-extrabold">{user?.role}</p>
                                </div>
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition shadow-sm border border-gray-100"
                                title="Logout"
                            >
                                <FaSignOutAlt size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="pt-28 pb-12">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Nav (Bottom Bar) */}
            <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 px-6 py-3 flex justify-between z-50">
                {navLinks.slice(0, 4).map((link) => (
                    <Link
                        key={link.path}
                        to={link.path}
                        className={`flex flex-col items-center gap-1 ${isActive(link.path) ? 'text-indigo-600' : 'text-gray-400'
                            }`}
                    >
                        <link.icon size={20} />
                        <span className="text-[10px] font-bold">{link.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default StudentLayout;
