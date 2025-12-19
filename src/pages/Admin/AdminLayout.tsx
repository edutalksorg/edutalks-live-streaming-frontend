import React, { useContext } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FaUserTie, FaChalkboardTeacher, FaUserGraduate, FaSignOutAlt, FaEye } from 'react-icons/fa';

const AdminLayout: React.FC = () => {
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
                    <FaUserTie /> Admin Panel
                </div>
                <div className="p-4 border-b border-indigo-800 text-sm">
                    {user?.name}
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link to="/admin" className={`block py-2.5 px-4 rounded transition duration-200 ${isActive('/admin')}`}>
                        <div className="flex items-center gap-2"><FaEye /> Overview</div>
                    </Link>
                    <Link to="/admin/instructors" className={`block py-2.5 px-4 rounded transition duration-200 ${isActive('/admin/instructors')}`}>
                        <div className="flex items-center gap-2"><FaChalkboardTeacher /> Instructors</div>
                    </Link>
                    <Link to="/admin/students" className={`block py-2.5 px-4 rounded transition duration-200 ${isActive('/admin/students')}`}>
                        <div className="flex items-center gap-2"><FaUserGraduate /> Students</div>
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

export default AdminLayout;
