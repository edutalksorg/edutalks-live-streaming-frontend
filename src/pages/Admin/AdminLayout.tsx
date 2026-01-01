import React, { useContext, useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FaSignOutAlt, FaEye, FaBars, FaTimes } from 'react-icons/fa';
import Logo from '../../components/Logo';

const AdminLayout: React.FC = () => {
    const { logout, user } = useContext(AuthContext)!;
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path: string) => {
        return location.pathname === path
            ? 'bg-primary border-l-4 border-accent-white text-white'
            : 'hover:bg-surface-light text-accent-gray';
    };

    return (
        <div className="flex flex-col lg:flex-row h-screen bg-surface-dark transition-colors duration-500 overflow-hidden">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between px-6 h-16 bg-surface border-b border-surface-border z-50">
                <Link to="/admin" onClick={() => setIsSidebarOpen(false)}>
                    <Logo />
                </Link>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 text-accent-white hover:text-primary transition-colors"
                    >
                        {isSidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                    </button>
                </div>
            </div>

            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 w-64 bg-surface text-accent-white flex flex-col shadow-2xl border-r border-surface-border transition-all duration-300 z-50
                lg:relative lg:translate-x-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-6 text-2xl font-black hidden lg:flex items-center gap-2 border-b border-surface-border">
                    <Link to="/admin">
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
                                <p className="text-xs font-bold text-accent-white leading-none">{user?.name}</p>
                                <p className="text-[10px] text-primary mt-1 uppercase tracking-widest font-black">Admin</p>
                            </div>
                        </div>
                    </div>
                </div>
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <Link
                        to="/admin"
                        onClick={() => setIsSidebarOpen(false)}
                        className={`block py-3 px-4 rounded-xl transition duration-200 font-bold text-sm ${isActive('/admin')}`}
                    >
                        <div className="flex items-center gap-3"><FaEye size={18} /> Overview</div>
                    </Link>
                </nav>
                <div className="p-4 border-t border-surface-border">
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-surface-dark hover:bg-primary transition-all duration-300 font-bold text-sm shadow-lg text-accent-white">
                        <FaSignOutAlt /> Logout
                    </button>
                    <p className="text-[10px] text-center text-accent-gray mt-4 uppercase tracking-[0.2em] font-black"> EduTalks © 2025</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto bg-surface-dark transition-colors duration-500">
                <div className="p-4 md:p-6 lg:p-10">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
