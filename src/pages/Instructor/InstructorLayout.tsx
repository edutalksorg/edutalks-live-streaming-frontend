import React, { useContext } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FaChalkboardTeacher, FaCalendarAlt, FaVideo, FaClipboardList, FaSignOutAlt, FaUserGraduate, FaBookOpen } from 'react-icons/fa';

const InstructorLayout: React.FC = () => {
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
                    <FaChalkboardTeacher /> Instructor
                </div>
                <div className="p-4 border-b border-indigo-800 text-sm">
                    {user?.name} <span className="text-xs text-indigo-300 block">({user?.role})</span>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link to="/instructor" className={`block py-2.5 px-4 rounded transition duration-200 ${isActive('/instructor')}`}>
                        <div className="flex items-center gap-2"><FaChalkboardTeacher /> Dashboard</div>
                    </Link>
                    <Link to="/instructor/classes" className={`block py-2.5 px-4 rounded transition duration-200 ${isActive('/instructor/classes')}`}>
                        <div className="flex items-center gap-2"><FaCalendarAlt /> My Classes</div>
                    </Link>
                    <Link to="/instructor/students" className={`block py-2.5 px-4 rounded transition duration-200 ${isActive('/instructor/students')}`}>
                        <div className="flex items-center gap-2"><FaUserGraduate /> Students</div>
                    </Link>
                    <Link to="/instructor/notes" className={`block py-2.5 px-4 rounded transition duration-200 ${isActive('/instructor/notes')}`}>
                        <div className="flex items-center gap-2"><FaBookOpen /> Study Material</div>
                    </Link>
                    <Link to="/instructor/exams" className={`block py-2.5 px-4 rounded transition duration-200 ${isActive('/instructor/exams')}`}>
                        <div className="flex items-center gap-2"><FaClipboardList /> Exams</div>
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

export default InstructorLayout;
