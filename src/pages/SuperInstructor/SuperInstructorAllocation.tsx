
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { FaBook, FaUserTie, FaUsers, FaCheck, FaTimes, FaEye, FaEnvelope, FaPhone, FaUserGraduate, FaTrash } from 'react-icons/fa';

interface User {
    id: number;
    name: string;
    email: string;
    is_active: number | boolean;
}

interface Subject {
    id: number;
    name: string;
    instructors: User[];
    batches?: {
        id: number;
        instructor_id: number;
        instructor_name: string;
        student_count: number;
        max_students: number;
    }[];
    unassignedCount?: number;
    curriculum?: string;
}

interface BatchDetails {
    id: number;
    batch_name: string;
    instructor_name: string;
    instructor_email: string;
    subject_name: string;
    students: {
        id: number;
        name: string;
        email: string;
        phone: string;
    }[];
}

const SuperInstructorAllocation: React.FC = () => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [instructors, setInstructors] = useState<User[]>([]);
    const [totalStudents, setTotalStudents] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [className, setClassName] = useState<string>('');

    // Modal / Selection State
    const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
    const [selectedInstructor, setSelectedInstructor] = useState<string>('');

    // Filter State
    const [filter, setFilter] = useState<'All' | 'State' | 'Central'>('All');

    // Drawer State
    const [selectedBatchDetails, setSelectedBatchDetails] = useState<BatchDetails | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerLoading, setDrawerLoading] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [dashRes, instRes] = await Promise.all([
                api.get('/api/super-instructor/dashboard'),
                api.get('/api/super-instructor/instructors')
            ]);

            setClassName(dashRes.data.className);
            setTotalStudents(dashRes.data.stats?.totalStudents || 0);
            setSubjects(dashRes.data.subjects || []);
            setInstructors(instRes.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch allocation data", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAssign = async () => {
        if (!selectedSubject || !selectedInstructor) return;
        try {
            await api.post('/api/super-instructor/assign-subject', {
                instructorId: selectedInstructor,
                subjectId: selectedSubject
            });
            alert("Instructor Assigned Successfully!");
            setSelectedSubject(null);
            setSelectedInstructor('');
            fetchData();
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to assign instructor");
        }
    };

    const handleDistribute = async (subjectId: number) => {
        if (!window.confirm("Auto-distribute students to batches for this subject? Unassigned students will be filled into available batches sequentially.")) return;
        try {
            const res = await api.post('/api/super-instructor/distribute-students', { subjectId });
            alert(res.data.message);
            fetchData();
        } catch (err: any) {
            alert(err.response?.data?.message || "Distribution Failed");
        }
    }

    const handleViewBatch = async (batchId: number) => {
        try {
            setDrawerLoading(true);
            setIsDrawerOpen(true);
            const res = await api.get(`/api/super-instructor/batch/${batchId}/details`);
            setSelectedBatchDetails(res.data);
            setDrawerLoading(false);
        } catch (err) {
            console.error(err);
            alert("Failed to fetch batch details");
            setIsDrawerOpen(false);
            setDrawerLoading(false);
        }
    };



    const handleReset = async () => {
        if (!window.confirm("WARNING: This will UNASSIGN ALL instructors and DELETE ALL batches for your grade. This action cannot be undone. Are you sure?")) return;
        try {
            const res = await api.post('/api/super-instructor/reset-assignments');
            alert(res.data.message);
            fetchData();
        } catch (err: any) {
            console.error(err);
            alert("Failed to reset assignments");
        }
    };

    const filteredSubjects = subjects.filter(sub => {
        if (filter === 'All') return true;
        // Backend provides 'curriculum' field now
        if (sub.curriculum) return sub.curriculum === filter;
        // Fallback checks if backend meta missing
        if (filter === 'State') return sub.name.toLowerCase().includes('(state)');
        if (filter === 'Central') return sub.name.toLowerCase().includes('(central)');
        return true;
    });

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Allocations...</div>;

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Subject Allocation & Batching</h2>
                    <p className="text-gray-500">Manage instructor batches for <span className="font-bold text-indigo-600">Grade {className}</span></p>
                </div>
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-3 rounded-xl shadow-md flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                        <FaUsers size={20} className="text-white" />
                    </div>
                    <div>
                        <span className="text-xs font-medium opacity-80 uppercase tracking-wide">Total Students</span>
                        <p className="text-2xl font-bold leading-none">{totalStudents}</p>
                    </div>
                </div>
            </div>



            {/* Filters & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm animate-fadeIn">

                {/* Curriculum Tabs */}
                <div className="flex p-1 bg-gray-100 rounded-lg">
                    {['All', 'State', 'Central'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-6 py-2 rounded-md text-sm font-bold transition-all duration-200 ${filter === f
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {f} Subjects
                        </button>
                    ))}
                </div>

                {/* Reset Action */}
                <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition border border-red-100 hover:border-red-200"
                >
                    <FaTrash size={12} /> Reset All Allocations
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSubjects.map(sub => (
                    <div key={sub.id} className="border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition duration-200 flex flex-col h-full relative overflow-hidden group">

                        {/* Header */}
                        <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                            <h4 className="font-bold text-lg flex items-center gap-2 text-gray-800 truncate" title={sub.name}>
                                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs flex-shrink-0"><FaBook /></span>
                                {sub.name}
                            </h4>
                            <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider whitespace-nowrap">
                                {sub.batches ? sub.batches.length : 0} Batches
                            </span>
                        </div>

                        {/* Batches List */}
                        <div className="p-5 flex-1 flex flex-col gap-3 overflow-y-auto max-h-[300px]">
                            {sub.batches && sub.batches.length > 0 ? (
                                <div className="space-y-3">
                                    {sub.batches.map((batch: any, index: number) => (
                                        <div key={batch.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-bold border border-gray-200">
                                                    {(batch.instructor_name || '?').charAt(0)}
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <p className="text-sm font-bold text-gray-800 truncate">{batch.instructor_name}</p>
                                                    <p className="text-[10px] text-gray-400 truncate">Batch {index + 1}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleViewBatch(batch.id)}
                                                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition"
                                                    title="View Batch Details"
                                                >
                                                    <FaEye size={14} />
                                                </button>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="mt-1">
                                                <div className="flex justify-between text-[10px] mb-1 font-medium text-gray-500">
                                                    <span>Students Assigned</span>
                                                    <span className={batch.student_count >= (batch.max_students || 2) ? 'text-green-600 font-bold' : 'text-indigo-600'}>
                                                        {batch.student_count} / {batch.max_students || 2}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${batch.student_count >= (batch.max_students || 2) ? 'bg-green-500' : 'bg-indigo-500'}`}
                                                        style={{ width: `${Math.min(100, (batch.student_count / (batch.max_students || 2)) * 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 bg-gray-50 border border-gray-100 border-dashed rounded-lg text-center my-auto">
                                    <p className="text-sm text-gray-400 font-medium">No instructors assigned yet.</p>
                                </div>
                            )}
                        </div>

                        {/* Unassigned Students Info */}
                        <div className="px-5 py-3 bg-yellow-50 border-t border-yellow-100 flex justify-between items-center">
                            <span className="text-xs font-bold text-yellow-700 uppercase tracking-wide flex items-center gap-1">
                                <FaTimes size={10} /> Unassigned:
                            </span>
                            <span className="text-sm font-bold text-yellow-800 bg-white px-2 py-0.5 rounded border border-yellow-200">
                                {sub.unassignedCount !== undefined ? sub.unassignedCount : '?'}
                            </span>
                        </div>

                        {/* Footer / Actions */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-3">
                            {/* Distribution Button */}
                            {(sub.unassignedCount || 0) > 0 && sub.batches && sub.batches.length > 0 && (
                                <button
                                    onClick={() => handleDistribute(sub.id)}
                                    className="w-full py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-lg hover:shadow-md transition shadow-sm flex items-center justify-center gap-2 mb-2"
                                >
                                    <FaUsers size={12} /> Auto-Distribute Students
                                </button>
                            )}

                            {selectedSubject === sub.id ? (
                                <div className="animate-fadeIn flex flex-col gap-2 bg-white p-3 rounded-lg border border-indigo-100 shadow-sm">
                                    <label className="text-[10px] font-bold text-indigo-800 uppercase tracking-wide">Select Available Instructor:</label>
                                    <select
                                        className="text-xs border border-indigo-200 rounded px-2 py-2 outline-none focus:ring-2 ring-indigo-500 bg-gray-50 w-full"
                                        value={selectedInstructor}
                                        onChange={(e) => setSelectedInstructor(e.target.value)}
                                    >
                                        <option value="">Choose...</option>
                                        {instructors.filter(i => i.is_active).map(i => (
                                            <option key={i.id} value={i.id}>{i.name}</option>
                                        ))}
                                    </select>
                                    <div className="flex gap-2 justify-end mt-1">
                                        <button onClick={() => { setSelectedSubject(null); setSelectedInstructor(''); }} className="text-gray-500 px-3 py-1 text-[10px] hover:bg-gray-100 border border-gray-200 rounded transition font-medium">Cancel</button>
                                        <button onClick={handleAssign} disabled={!selectedInstructor} className="bg-indigo-600 text-white px-4 py-1.5 rounded text-[10px] font-bold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm uppercase tracking-wide">Confirm</button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setSelectedSubject(sub.id)}
                                    className="w-full py-2 bg-white border border-indigo-200 text-indigo-600 text-sm font-bold rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition shadow-sm flex items-center justify-center gap-2"
                                >
                                    {sub.batches && sub.batches.length > 0 ? '+ Add Instructor (New Batch)' : '+ Assign First Instructor'}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Batch Detail Drawer */}
            {
                isDrawerOpen && (
                    <div className="fixed inset-0 z-50 overflow-hidden">
                        <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsDrawerOpen(false)}></div>
                        <div className="absolute inset-y-0 right-0 max-w-md w-full flex">
                            <div className="h-full w-full bg-white shadow-2xl flex flex-col animate-slideInRight">
                                {/* Drawer Header */}
                                <div className="p-6 bg-indigo-600 text-white flex justify-between items-start shadow-md">
                                    <div>
                                        <h3 className="text-xl font-bold flex items-center gap-2">
                                            <FaBook className="opacity-80" />
                                            {drawerLoading ? 'Loading...' : selectedBatchDetails?.subject_name}
                                        </h3>
                                        <p className="text-indigo-200 text-sm mt-1">Batch Details & Allocation</p>
                                    </div>
                                    <button onClick={() => setIsDrawerOpen(false)} className="text-white/70 hover:text-white transition">
                                        <FaTimes size={24} />
                                    </button>
                                </div>

                                {/* Drawer Content */}
                                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                                    {drawerLoading ? (
                                        <div className="flex items-center justify-center h-40 text-gray-400">Loading details...</div>
                                    ) : selectedBatchDetails ? (
                                        <div className="space-y-6">

                                            {/* Instructor Info */}
                                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                    <FaUserTie /> Assigned Instructor
                                                </h4>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl">
                                                        {selectedBatchDetails?.instructor_name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-800 text-lg">{selectedBatchDetails?.instructor_name}</p>
                                                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                                                            <FaEnvelope size={12} /> {selectedBatchDetails?.instructor_email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Students List */}
                                            <div>
                                                <div className="flex justify-between items-end mb-3">
                                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                                        <FaUserGraduate /> Students ({selectedBatchDetails?.students.length})
                                                    </h4>
                                                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                                                        Active Batch
                                                    </span>
                                                </div>

                                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                                    {selectedBatchDetails?.students && selectedBatchDetails.students.length > 0 ? (
                                                        <div className="divide-y divide-gray-100">
                                                            {selectedBatchDetails.students.map((student, idx) => (
                                                                <div key={student.id} className="p-3 hover:bg-gray-50 flex items-center gap-3 transition">
                                                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                                                                        {idx + 1}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <p className="text-sm font-bold text-gray-800">{student.name}</p>
                                                                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-0.5">
                                                                            <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                                                                <FaEnvelope size={8} /> {student.email}
                                                                            </span>
                                                                            {student.phone && (
                                                                                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                                                                    <FaPhone size={8} /> {student.phone}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="p-8 text-center text-gray-400 text-sm">
                                                            No students assigned to this batch yet.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                        </div>
                                    ) : (
                                        <div className="text-center text-red-500">Failed to load details</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default SuperInstructorAllocation;
