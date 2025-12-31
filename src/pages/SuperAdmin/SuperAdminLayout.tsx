import React, { useContext } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FaUsers, FaMoneyBillWave, FaSignOutAlt, FaChartPie } from 'react-icons/fa';
import Logo from '../../components/Logo';
import { useTheme } from '../../context/ThemeContext';
import ThemeToggle from '../../components/ThemeToggle';

const SuperAdminLayout: React.FC = () => {
    const { logout, user } = useContext(AuthContext)!;
    const { theme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path: string) => {
        const active = path === '/super-admin'
            ? location.pathname === path
            : location.pathname.startsWith(path);

        return active
            ? 'bg-primary text-white shadow-lg shadow-primary/20'
            : 'text-accent-gray hover:bg-surface-light hover:text-accent-white';
    };

    return (
        <div className={`flex flex-col lg:flex-row h-screen ${theme === 'dark' ? 'dark' : ''} bg-surface-dark antialiased transition-colors duration-500 overflow-hidden`}>

            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between p-4 bg-surface border-b border-surface-border z-50">
                <div className="flex items-center gap-2">
                    <Logo />
                </div>
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 text-accent-white hover:bg-surface-light rounded-lg transition-colors"
                    >
                        {isSidebarOpen ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 w-64 bg-surface text-accent-white flex flex-col shadow-2xl border-r border-surface-border transition-all duration-300 transform z-50
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:relative lg:translate-x-0 lg:flex
            `}>
                <div className="hidden lg:flex p-6 text-2xl font-black items-center gap-2 border-b border-surface-border">
                    <Logo />
                </div>
                <div className="p-6 border-b border-surface-border bg-surface-dark/50 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black text-white shadow-lg">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-accent-white leading-none">{user?.name}</p>
                                <p className="text-[10px] text-primary mt-1 uppercase tracking-widest font-black">Super Admin</p>
                            </div>
                        </div>
                        <div className="hidden lg:block">
                            <ThemeToggle className="scale-75 origin-right" />
                        </div>
                    </div>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    <Link
                        to="/super-admin"
                        onClick={() => setIsSidebarOpen(false)}
                        className={`block py-3 px-4 rounded-xl transition-all duration-300 font-bold text-sm ${isActive('/super-admin')}`}
                    >
                        <div className="flex items-center gap-3"><FaChartPie size={18} /> <span>Dashboard</span></div>
                    </Link>
                    <Link
                        to="/super-admin/users"
                        onClick={() => setIsSidebarOpen(false)}
                        className={`block py-3 px-4 rounded-xl transition-all duration-300 font-bold text-sm ${isActive('/super-admin/users')}`}
                    >
                        <div className="flex items-center gap-3"><FaUsers size={18} /> <span>Manage Users</span></div>
                    </Link>
                    <Link
                        to="/super-admin/payments"
                        onClick={() => setIsSidebarOpen(false)}
                        className={`block py-3 px-4 rounded-xl transition-all duration-300 font-bold text-sm ${isActive('/super-admin/payments')}`}
                    >
                        <div className="flex items-center gap-2"><FaMoneyBillWave size={18} /> <span>Payments</span></div>
                    </Link>
                </nav>
                <div className="p-4 border-t border-surface-border">
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-surface-dark hover:bg-primary transition-all duration-300 font-black text-sm shadow-lg text-accent-white group">
                        <FaSignOutAlt className="group-hover:rotate-12 transition-transform" /> Logout
                    </button>
                    <p className="text-[10px] text-center text-accent-gray mt-4 uppercase tracking-[0.2em] font-black"> EduTalks © 2025</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto bg-surface-dark transition-colors duration-500">
                <div className="p-4 md:p-10">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default SuperAdminLayout;
