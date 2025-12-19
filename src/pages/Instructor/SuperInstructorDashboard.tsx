import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const SuperInstructorDashboard: React.FC = () => {
    const { user } = React.useContext(AuthContext)!;

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-8">
                Super Instructor Overview 
                {user?.assignedClass && <span className="ml-4 text-xl text-purple-600 font-normal">(Class: {user.assignedClass.name})</span>}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
                    <h3 className="text-xl font-bold text-gray-700">Total Classes Conducted</h3>
                    <p className="text-3xl font-bold text-purple-600 mt-2">124</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                    <h3 className="text-xl font-bold text-gray-700">Student Engagement</h3>
                    <p className="text-3xl font-bold text-blue-600 mt-2">87%</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                    <h3 className="text-xl font-bold text-gray-700">Upcoming Exams</h3>
                    <p className="text-3xl font-bold text-green-600 mt-2">5</p>
                </div>
            </div>

            <div className="mt-10 bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-4">Department Performance</h3>
                <div className="h-64 bg-gray-50 flex items-center justify-center text-gray-400">
                    Chart Placeholder
                </div>
            </div>
        </div>
    );
};

export default SuperInstructorDashboard;
