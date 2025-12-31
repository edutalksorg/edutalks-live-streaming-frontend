import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { FaEdit } from 'react-icons/fa';
import { useModal } from '../../context/ModalContext';

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
    students?: {
        id: number;
        name: string;
        plan_name: string;
    }[];
}

interface User {
    id: number;
    name: string;
}

const BatchManagement: React.FC = () => {
    const { showAlert } = useModal();
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
            showAlert('Failed to update instructor', 'error');
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-[400px] text-primary font-black uppercase tracking-widest animate-pulse italic">Accessing Batch Grid...</div>;

    return (
        <div className="animate-fadeIn">
            <h2 className="text-3xl font-black text-accent-white tracking-tighter italic mb-10">Batch <span className="text-gradient-red">Management</span></h2>

            <div className="premium-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-surface-border">
                        <thead className="bg-surface-dark/50">
                            <tr>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-accent-white uppercase tracking-[0.2em]">Class</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-accent-white uppercase tracking-[0.2em]">Subject</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-accent-white uppercase tracking-[0.2em]">Batch Name</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-accent-white uppercase tracking-[0.2em]">Assigned Students</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-accent-white uppercase tracking-[0.2em]">Instructor</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-accent-white uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-border">
                            {batches.map((batch) => (
                                <tr key={batch.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-accent-white italic">{batch.class_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-accent-gray/70 font-medium">{batch.subject_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-accent-gray/70 font-medium">{batch.name}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg border shadow-sm ${batch.student_count >= (batch.max_students || 30) ? 'bg-primary/20 text-primary border-primary/20' : 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20'}`}>
                                                {batch.student_count} / {batch.max_students || 30} Filled
                                            </span>
                                        </div>
                                        {/* Student List with Plans */}
                                        {batch.students && batch.students.length > 0 ? (
                                            <div className="flex flex-col gap-2 mt-2">
                                                {batch.students.map(student => (
                                                    <div key={student.id} className="flex items-center gap-2 text-xs bg-surface-dark/50 px-2 py-1 rounded-md border border-white/5">
                                                        <span className="text-accent-white font-bold">{student.name}</span>
                                                        <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-black tracking-wider ${student.plan_name === 'Free' ? 'bg-gray-500/20 text-gray-400' :
                                                            student.plan_name === 'Pro' ? 'bg-amber-500/20 text-amber-500' :
                                                                'bg-emerald-500/20 text-emerald-400'
                                                            }`}>
                                                            {student.plan_name}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-accent-gray/50 italic">No students yet</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {batch.instructor_name ? (
                                            <div>
                                                <div className="font-black text-accent-white text-sm italic">{batch.instructor_name}</div>
                                                <div className="text-[10px] text-accent-gray italic opacity-50">{batch.instructor_email}</div>
                                            </div>
                                        ) : (
                                            <span className="text-primary text-[10px] font-black uppercase tracking-widest animate-pulse">Unassigned</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => { setEditingBatch(batch); setSelectedInstructor(batch.instructor_id?.toString() || ''); }}
                                            className="flex items-center gap-2 px-4 py-2 bg-surface-dark border border-white/5 text-accent-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:border-primary/50 transition-all shadow-lg active:scale-95"
                                        >
                                            <FaEdit className="text-primary" /> Assign
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {editingBatch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-md transition-opacity" onClick={() => setEditingBatch(null)}></div>
                    <div className="bg-surface p-8 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10 w-full max-w-md relative z-10 animate-fadeInTransform">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black text-accent-white italic tracking-tighter">Assign <span className="text-primary">Instructor</span></h3>
                            <button onClick={() => setEditingBatch(null)} className="text-accent-gray hover:text-white transition-colors">✕</button>
                        </div>
                        <p className="mb-8 text-[10px] font-black uppercase tracking-[0.2em] text-accent-gray leading-relaxed">
                            Assigning instructor to <span className="text-accent-white italic">{editingBatch.name}</span> <br />
                            Subject: <span className="text-primary italic">{editingBatch.subject_name}</span>
                        </p>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-accent-gray uppercase tracking-widest ml-2">Available Instructors</label>
                                <select
                                    className="w-full bg-surface-dark border border-white/5 rounded-2xl p-4 text-accent-white focus:border-primary/50 outline-none transition-all appearance-none cursor-pointer"
                                    value={selectedInstructor}
                                    onChange={(e) => setSelectedInstructor(e.target.value)}
                                >
                                    <option value="">Select Instructor...</option>
                                    {instructors.map(inst => (
                                        <option key={inst.id} value={inst.id}>{inst.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button onClick={() => setEditingBatch(null)} className="flex-1 px-4 py-4 text-[10px] font-black uppercase tracking-widest text-accent-gray hover:text-white transition-colors border border-white/5 rounded-2xl hover:bg-white/5">Cancel</button>
                                <button onClick={handleAssign} className="flex-1 btn-primary py-4 scale-100 hover:scale-105 active:scale-95 transition-all">SAVE CHANGES</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BatchManagement;
