import React, { useContext } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FaChalkboardTeacher, FaCalendarAlt, FaClipboardList, FaSignOutAlt, FaUserGraduate, FaBookOpen, FaMedal } from 'react-icons/fa';
import logo from '../../assets/logo.png';

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
                    <img src={logo} alt="EduTalks" className="h-8 filter brightness-0 invert" />
                </div>
                <div className="p-4 border-b border-indigo-800 text-sm">
                    {user?.name} <span className="text-xs text-indigo-300 block">({user?.role})</span>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link to="/instructor" className={`block py-2.5 px-4 rounded-xl transition duration-200 ${isActive('/instructor')}`}>
                        <div className="flex items-center gap-3"><FaChalkboardTeacher className="text-xl" /> <span className="font-medium">Dashboard</span></div>
                    </Link>
                    <Link to="/instructor/classes" className={`block py-2.5 px-4 rounded-xl transition duration-200 ${isActive('/instructor/classes')}`}>
                        <div className="flex items-center gap-3"><FaCalendarAlt className="text-xl" /> <span className="font-medium">My Classes</span></div>
                    </Link>
                    <Link to="/instructor/students" className={`block py-2.5 px-4 rounded-xl transition duration-200 ${isActive('/instructor/students')}`}>
                        <div className="flex items-center gap-3"><FaUserGraduate className="text-xl" /> <span className="font-medium">Students</span></div>
                    </Link>
                    <Link to="/instructor/notes" className={`block py-2.5 px-4 rounded-xl transition duration-200 ${isActive('/instructor/notes')}`}>
                        <div className="flex items-center gap-3"><FaBookOpen className="text-xl" /> <span className="font-medium">Study Material</span></div>
                    </Link>
                    <Link to="/instructor/exams" className={`block py-2.5 px-4 rounded-xl transition duration-200 ${isActive('/instructor/exams')}`}>
                        <div className="flex items-center gap-3"><FaClipboardList className="text-xl" /> <span className="font-medium">Exams</span></div>
                    </Link>
                    <Link to="/instructor/tournaments" className={`block py-2.5 px-4 rounded-xl transition duration-200 ${isActive('/instructor/tournaments')}`}>
                        <div className="flex items-center gap-3"><FaMedal className="text-xl" /> <span className="font-medium">Tournaments</span></div>
                    </Link>
                </nav>
                <div className="p-4 border-t border-indigo-800">
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition duration-200">
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
