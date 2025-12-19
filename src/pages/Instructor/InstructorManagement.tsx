import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { FaPlus, FaSearch } from 'react-icons/fa';

interface User {
    id: number;
    name: string;
    email: string;
    role_name: string;
    is_active: number;
}

const InstructorManagement: React.FC = () => {
    const [instructors, setInstructors] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newInstructor, setNewInstructor] = useState({ name: '', email: '', password: '' });

    useEffect(() => {
        fetchInstructors();
    }, []);

    const fetchInstructors = async () => {
        try {
            // Fetch all users and filter for 'instructor' role client-side or use query param if API supports
            const res = await api.get('/users');
            const filtered = res.data.filter((u: User) => u.role_name === 'instructor');
            setInstructors(filtered);
        } catch (err) {
            console.error('Failed to fetch instructors', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/users', { ...newInstructor, role: 'instructor' });
            setShowModal(false);
            setNewInstructor({ name: '', email: '', password: '' });
            fetchInstructors();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to create instructor');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Instructor Management</h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-purple-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-purple-700"
                >
                    <FaPlus /> Add Instructor
                </button>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {instructors.map((instructor) => (
                            <tr key={instructor.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{instructor.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{instructor.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${instructor.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {instructor.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                        <h3 className="text-lg font-bold mb-4">Add New Instructor</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <input
                                className="w-full p-2 border rounded"
                                placeholder="Name"
                                value={newInstructor.name}
                                onChange={e => setNewInstructor({ ...newInstructor, name: e.target.value })}
                                required
                            />
                            <input
                                className="w-full p-2 border rounded"
                                placeholder="Email"
                                type="email"
                                value={newInstructor.email}
                                onChange={e => setNewInstructor({ ...newInstructor, email: e.target.value })}
                                required
                            />
                            <input
                                className="w-full p-2 border rounded"
                                placeholder="Password"
                                type="password"
                                value={newInstructor.password}
                                onChange={e => setNewInstructor({ ...newInstructor, password: e.target.value })}
                                required
                            />
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstructorManagement;
