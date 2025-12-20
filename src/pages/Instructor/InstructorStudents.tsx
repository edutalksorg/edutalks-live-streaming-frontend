import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useSearchParams } from 'react-router-dom';
import { FaEnvelope, FaPhone, FaLayerGroup } from 'react-icons/fa';

interface Student {
    id: number;
    name: string;
    email: string;
    phone: string;
    batch_name: string;
    subject_name: string;
}

const InstructorStudents: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const batchIdFilter = searchParams.get('batchId');

    useEffect(() => {
        fetchStudents();
    }, [batchIdFilter]);

    const fetchStudents = async () => {
        try {
            const url = batchIdFilter
                ? `/api/instructor/students?batchId=${batchIdFilter}`
                : '/api/instructor/students';
            const res = await api.get(url);
            setStudents(res.data);
        } catch (err) {
            console.error('Failed to fetch students');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-[400px] text-indigo-600 font-bold">Loading Students...</div>;

    return (
        <div className="max-w-7xl mx-auto">
            <header className="mb-10">
                <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
                    My Students
                </h2>
                <p className="text-gray-500 font-medium">List of all students assigned to your batches across different subjects.</p>
            </header>

            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Student Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Contact Info</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Batch & Subject</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {students.length > 0 ? students.map((student) => (
                                <tr key={student.id} className="hover:bg-indigo-50/30 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                                                {student.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-900">{student.name}</div>
                                                <div className="text-xs text-gray-400">ID: #{student.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                                <FaEnvelope className="text-indigo-400" /> {student.email}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                                <FaPhone className="text-indigo-400" /> {student.phone || 'N/A'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-1">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 w-fit">
                                                <FaLayerGroup className="mr-1" /> {student.batch_name}
                                            </span>
                                            <span className="text-xs text-gray-400 font-medium ml-1">{student.subject_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="text-xs bg-white border border-indigo-200 text-indigo-600 px-4 py-2 rounded-xl font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                                            View Progress
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-gray-400 italic font-medium text-sm">
                                        No students found in your batches.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InstructorStudents;
