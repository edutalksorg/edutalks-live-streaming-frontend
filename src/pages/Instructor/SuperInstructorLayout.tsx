import React, { useContext } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FaUserTie, FaChalkboardTeacher, FaCalendarAlt, FaClipboardList, FaSignOutAlt, FaChartLine } from 'react-icons/fa';

const SuperInstructorLayout: React.FC = () => {
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
            {/* Sidebar with distinct color for Super Instructor */}
            <div className="w-64 bg-purple-900 text-white flex flex-col">
                <div className="p-4 text-2xl font-bold flex items-center gap-2 border-b border-purple-800">
                    <FaUserTie /> Super Instructor
                </div>
                <div className="p-4 border-b border-purple-800 text-sm">
                    {user?.name}
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link to="/super-instructor" className={`block py-2.5 px-4 rounded transition duration-200 ${isActive('/super-instructor')}`}>
                        <div className="flex items-center gap-2"><FaChartLine /> Analytics & Overview</div>
                    </Link>
                    <Link to="/super-instructor/classes" className={`block py-2.5 px-4 rounded transition duration-200 ${isActive('/super-instructor/classes')}`}>
                        <div className="flex items-center gap-2"><FaCalendarAlt /> All Classes</div>
                    </Link>
                    <Link to="/super-instructor/exams" className={`block py-2.5 px-4 rounded transition duration-200 ${isActive('/super-instructor/exams')}`}>
                        <div className="flex items-center gap-2"><FaClipboardList /> Exam Management</div>
                    </Link>
                    <Link to="/super-instructor/users" className={`block py-2.5 px-4 rounded transition duration-200 ${isActive('/super-instructor/users')}`}>
                        <div className="flex items-center gap-2"><FaUserTie /> Users</div>
                    </Link>
                </nav>
                <div className="p-4 border-t border-purple-800">
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

export default SuperInstructorLayout;
