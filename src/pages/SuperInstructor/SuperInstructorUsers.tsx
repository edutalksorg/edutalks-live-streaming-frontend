
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { FaUserTie, FaUserGraduate, FaChalkboardTeacher, FaCheck } from 'react-icons/fa';

interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    is_active: number | boolean;
    created_at: string;
}

const SuperInstructorUsers: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'instructors' | 'students'>('instructors');
    const [instructors, setInstructors] = useState<User[]>([]);
    const [students, setStudents] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [instRes, studRes] = await Promise.all([
                api.get('/api/super-instructor/instructors'),
                api.get('/api/super-instructor/students')
            ]);
            setInstructors(instRes.data);
            setStudents(studRes.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch user data", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApprove = async (id: number) => {
        if (!window.confirm("Approve this instructor?")) return;
        try {
            await api.post('/api/super-instructor/approve-instructor', { instructorId: id });
            alert("Instructor Approved!");
            fetchData();
        } catch (err) {
            alert("Failed to approve");
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Users...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
                <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                    <button
                        onClick={() => setActiveTab('instructors')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'instructors' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        Instructors
                    </button>
                    <button
                        onClick={() => setActiveTab('students')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'students' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        Students
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
                {activeTab === 'instructors' && (
                    <div className="animate-fadeIn">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-700 flex items-center gap-2"><FaChalkboardTeacher /> All Instructors</h3>
                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-bold">{instructors.length} Instructors</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 font-bold text-gray-700 uppercase text-xs">
                                    <tr>
                                        <th className="p-4">Name</th>
                                        <th className="p-4">Email</th>
                                        <th className="p-4">Phone</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {instructors.map(inst => (
                                        <tr key={inst.id} className="hover:bg-gray-50">
                                            <td className="p-4 font-medium text-gray-900">{inst.name}</td>
                                            <td className="p-4">{inst.email}</td>
                                            <td className="p-4">{inst.phone || '-'}</td>
                                            <td className="p-4">
                                                {inst.is_active ?
                                                    <span className="text-green-700 font-bold text-xs bg-green-100 px-2 py-1 rounded-full flex items-center gap-1 w-fit"><FaCheck size={10} /> Active</span>
                                                    : <span className="text-yellow-700 font-bold text-xs bg-yellow-100 px-2 py-1 rounded-full flex items-center gap-1 w-fit">Pending</span>}
                                            </td>
                                            <td className="p-4 text-center">
                                                {!inst.is_active && (
                                                    <button onClick={() => handleApprove(inst.id)} className="text-green-600 hover:text-green-800 font-bold text-xs border border-green-200 hover:bg-green-50 px-3 py-1 rounded transition">
                                                        Approve
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {instructors.length === 0 && (
                                        <tr><td colSpan={5} className="p-8 text-center text-gray-400 italic">No instructors found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'students' && (
                    <div className="animate-fadeIn">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-700 flex items-center gap-2"><FaUserGraduate /> Students</h3>
                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-bold">{students.length} Students</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 font-bold text-gray-700 uppercase text-xs">
                                    <tr>
                                        <th className="p-4">Name</th>
                                        <th className="p-4">Email</th>
                                        <th className="p-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {students.map(st => (
                                        <tr key={st.id} className="hover:bg-gray-50">
                                            <td className="p-4 font-medium text-gray-900">{st.name}</td>
                                            <td className="p-4">{st.email}</td>
                                            <td className="p-4">{st.is_active ? <span className="text-green-600 font-bold text-xs bg-green-100 px-2 py-1 rounded-full">Active</span> : <span className="text-red-600 font-bold text-xs bg-red-100 px-2 py-1 rounded-full">Inactive</span>}</td>
                                        </tr>
                                    ))}
                                    {students.length === 0 && (
                                        <tr><td colSpan={3} className="p-8 text-center text-gray-400 italic">No students found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuperInstructorUsers;

