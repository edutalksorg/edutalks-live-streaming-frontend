import React, { useContext } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FaUserShield, FaUsers, FaMoneyBillWave, FaSignOutAlt, FaChartPie } from 'react-icons/fa';
import logo from '../../assets/logo.png';

const SuperAdminLayout: React.FC = () => {
    const { logout, user } = useContext(AuthContext)!;
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path: string) => {
        return location.pathname === path ? 'bg-indigo-800' : 'hover:bg-indigo-700';
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-indigo-900 text-white flex flex-col">
                <div className="p-4 text-2xl font-bold flex items-center gap-2 border-b border-indigo-800">
                    <img src={logo} alt="EduTalks" className="h-8 filter brightness-0 invert" />
                </div>
                <div className="p-4 border-b border-indigo-800 text-sm">
                    Welcome, {user?.name}
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link to="/super-admin" className={`block py-2.5 px-4 rounded transition duration-200 ${isActive('/super-admin')}`}>
                        <div className="flex items-center gap-2"><FaChartPie /> Dashboard</div>
                    </Link>
                    <Link to="/super-admin/users" className={`block py-2.5 px-4 rounded transition duration-200 ${isActive('/super-admin/users')}`}>
                        <div className="flex items-center gap-2"><FaUsers /> Manage Users</div>
                    </Link>
                    <Link to="/super-admin/payments" className={`block py-2.5 px-4 rounded transition duration-200 ${isActive('/super-admin/payments')}`}>
                        <div className="flex items-center gap-2"><FaMoneyBillWave /> Payments</div>
                    </Link>
                </nav>
                <div className="p-4 border-t border-indigo-800">
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 py-2 px-4 rounded hover:bg-red-600 transition duration-200">
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default SuperAdminLayout;
