import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { FaEdit } from 'react-icons/fa';

interface Batch {
    id: number;
    name: string;
    subject_name: string;
    class_name: string;
    instructor_name: string | null;
    instructor_email: string | null;
    instructor_id: number | null;
    student_count: number;
    max_students: number;
}

interface User {
    id: number;
    name: string;
}

const BatchManagement: React.FC = () => {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [instructors, setInstructors] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
    const [selectedInstructor, setSelectedInstructor] = useState<string>('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [batchesRes, usersRes] = await Promise.all([
                api.get('/api/batches'),
                api.get('/api/super-instructor/instructors')
            ]);

            setBatches(batchesRes.data);
            setInstructors(usersRes.data);
        } catch (err) {
            console.error('Failed to fetch data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!editingBatch || !selectedInstructor) return;
        try {
            await api.put(`/batches/${editingBatch.id}/instructor`, { instructor_id: parseInt(selectedInstructor) });
            setEditingBatch(null);
            fetchData();
        } catch (err) {
            alert('Failed to update instructor');
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Batch Management</h2>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {batches.map((batch) => (
                            <tr key={batch.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{batch.class_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{batch.subject_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{batch.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${batch.student_count >= 30 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                        {batch.student_count} / {batch.max_students || 2}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {batch.instructor_name ? (
                                        <div>
                                            <div className="font-medium">{batch.instructor_name}</div>
                                            <div className="text-xs text-gray-400">{batch.instructor_email}</div>
                                        </div>
                                    ) : (
                                        <span className="text-red-500 italic">Unassigned</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => { setEditingBatch(batch); setSelectedInstructor(batch.instructor_id?.toString() || ''); }}
                                        className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                                    >
                                        <FaEdit /> Assign
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {editingBatch && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                        <h3 className="text-lg font-bold mb-4">Assign Instructor</h3>
                        <p className="mb-4 text-sm text-gray-600">Assigning instructor to <strong>{editingBatch.name}</strong> ({editingBatch.subject_name})</p>

                        <select
                            className="w-full p-2 border rounded mb-4"
                            value={selectedInstructor}
                            onChange={(e) => setSelectedInstructor(e.target.value)}
                        >
                            <option value="">Select Instructor</option>
                            {instructors.map(inst => (
                                <option key={inst.id} value={inst.id}>{inst.name}</option>
                            ))}
                        </select>

                        <div className="flex justify-end gap-2">
                            <button onClick={() => setEditingBatch(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                            <button onClick={handleAssign} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BatchManagement;
