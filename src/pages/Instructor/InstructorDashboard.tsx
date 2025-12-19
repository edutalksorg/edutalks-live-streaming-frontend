import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { FaVideo, FaClipboardList, FaUsers, FaMedal } from 'react-icons/fa';
import api from '../../services/api';

const InstructorDashboard: React.FC = () => {
    const { user } = useContext(AuthContext)!;
    const [stats, setStats] = useState({ classes: 0, students: 0, exams: 0 });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // Mock stats for now or fetch real ones if endpoints exist
            // const res = await api.get('/instructor/stats');
            setStats({ classes: 12, students: 30, exams: 2 });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Welcome, {user?.name}</h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500">Assigned Students</p>
                            <h3 className="text-2xl font-bold text-gray-800">{stats.students}</h3>
                        </div>
                        <FaUsers className="text-3xl text-blue-300" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500">Classes Conducted</p>
                            <h3 className="text-2xl font-bold text-gray-800">{stats.classes}</h3>
                        </div>
                        <FaVideo className="text-3xl text-purple-300" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500">Active Exams</p>
                            <h3 className="text-2xl font-bold text-gray-800">{stats.exams}</h3>
                        </div>
                        <FaClipboardList className="text-3xl text-green-300" />
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link to="/instructor/classes" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition flex items-center gap-4">
                    <div className="bg-purple-100 p-3 rounded-full text-purple-600">
                        <FaVideo />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-700">Schedule Class</h4>
                        <p className="text-sm text-gray-500">Create a new live session</p>
                    </div>
                </Link>
                <Link to="/instructor/exams" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-full text-green-600">
                        <FaClipboardList />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-700">Create Exam</h4>
                        <p className="text-sm text-gray-500">Set up a new test or quiz</p>
                    </div>
                </Link>
                <Link to="/instructor/tournaments" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition flex items-center gap-4">
                    <div className="bg-yellow-100 p-3 rounded-full text-yellow-600">
                        <FaMedal />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-700">Manage Tournaments</h4>
                        <p className="text-sm text-gray-500">Weekly olympiads</p>
                    </div>
                </Link>
            </div>

            {/* Recent Schedule */}
            <div className="mt-10 bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-4">Today's Schedule</h3>
                <p className="text-gray-500">No classes scheduled for today.</p>
            </div>
        </div>
    );
};

export default InstructorDashboard;
