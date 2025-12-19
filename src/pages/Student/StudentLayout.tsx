import React, { useContext } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FaSignOutAlt, FaBookOpen, FaVideo, FaClipboardCheck, FaUserCircle } from 'react-icons/fa';

const StudentLayout: React.FC = () => {
    const { logout, user } = useContext(AuthContext)!;
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path: string) => {
        return location.pathname === path ? 'text-indigo-600 border-indigo-600' : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300';
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Top Navigation */}
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center gap-2">
                                <div className="bg-indigo-600 text-white p-1.5 rounded"><FaBookOpen /></div>
                                <span className="text-xl font-bold text-gray-800">EduTalks Student</span>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <Link to="/student" className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/student')}`}>
                                    <FaVideo className="mr-2" /> My Classes
                                </Link>
                                <Link to="/student/tests" className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/student/tests')}`}>
                                    <FaClipboardCheck className="mr-2" /> Tests & Results
                                </Link>
                                <Link to="/student/materials" className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/student/materials')}`}>
                                    <FaBookOpen className="mr-2" /> Study Material
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="flex items-center gap-2 mr-4 text-sm text-gray-600">
                                <FaUserCircle size={20} />
                                <span className="font-medium">{user?.name}</span>
                                <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">{user?.role}</span>
                            </div>
                            <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-gray-100 transition">
                                <FaSignOutAlt />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="py-10">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default StudentLayout;
