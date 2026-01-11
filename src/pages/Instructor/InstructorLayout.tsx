import React, { useContext } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FaChalkboardTeacher, FaCalendarAlt, FaClipboardList, FaSignOutAlt, FaUserGraduate, FaBookOpen, FaMedal, FaBars, FaTimes } from 'react-icons/fa';
import Logo from '../../components/Logo';
import ThemeToggle from '../../components/ThemeToggle';

const InstructorLayout: React.FC = () => {
    const { logout, user } = useContext(AuthContext)!;
    const navigate = useNavigate();
    const location = useLocation();

    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path: string) => {
        return location.pathname === path
            ? 'bg-primary border-l-4 border-accent-white text-white'
            : 'text-accent-gray hover:bg-surface-light hover:text-accent-white';
    };

    return (
        <div className="flex flex-col xl:flex-row h-screen bg-background-dark antialiased font-sans transition-colors duration-500 overflow-hidden text-foreground">
            {/* Mobile Header */}
            <div className="xl:hidden flex items-center justify-between p-4 bg-surface border-b border-surface-border z-50">
                <Link to="/instructor" onClick={() => setIsSidebarOpen(false)}>
                    <Logo />
                </Link>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 text-accent-white hover:bg-surface-light rounded-lg transition-colors"
                    >
                        {isSidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                    </button>
                </div>
            </div>

            {/* Sidebar Overlay */}
            {
                isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 xl:hidden animate-in fade-in duration-300"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )
            }

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 w-64 bg-surface text-accent-white flex flex-col shadow-2xl z-50 border-r border-surface-border transition-all duration-300 transform
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                xl:relative xl:translate-x-0 xl:flex
            `}>
                <div className="hidden xl:flex p-6 text-2xl font-black items-center gap-2 border-b border-surface-border">
                    <Link to="/instructor">
                        <Logo />
                    </Link>
                </div>
                <div className="p-6 border-b border-surface-border bg-surface-dark/50 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black text-white shadow-lg">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-xs font-black text-accent-white leading-none">{user?.name}</p>
                                <p className="text-[10px] text-primary mt-1 uppercase tracking-widest font-black">Instructor</p>
                            </div>
                        </div>
                        <ThemeToggle />
                    </div>
                </div>
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                    {[
                        { to: "/instructor", icon: FaChalkboardTeacher, label: "Dashboard" },
                        { to: "/instructor/classes", icon: FaCalendarAlt, label: "My Classes" },
                        { to: "/instructor/students", icon: FaUserGraduate, label: "Students" },
                        { to: "/instructor/notes", icon: FaBookOpen, label: "Study Material" },
                        { to: "/instructor/exams", icon: FaClipboardList, label: "Exams" },
                        { to: "/instructor/tournaments", icon: FaMedal, label: "Tournaments" },
                    ].map((item) => (
                        <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setIsSidebarOpen(false)}
                            className={`block py-3 px-4 rounded-xl transition-all duration-300 font-bold text-sm ${isActive(item.to)}`}
                        >
                            <div className="flex items-center gap-3"><item.icon size={18} /> <span>{item.label}</span></div>
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t border-surface-border">
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-surface-dark hover:bg-primary transition-all duration-300 font-black text-sm shadow-lg text-accent-white group">
                        <FaSignOutAlt className="group-hover:rotate-12 transition-transform" /> Logout
                    </button>
                    <p className="text-[9px] text-center text-accent-gray mt-4 uppercase tracking-[0.25em] font-black italic"> Premium EdTech Platform </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto bg-background transition-colors duration-500">
                <div className="p-4 md:p-6 xl:p-10 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </div>
        </div >
    );
};

export default InstructorLayout;
