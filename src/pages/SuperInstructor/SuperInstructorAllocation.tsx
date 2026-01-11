
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { FaBook, FaUserTie, FaUsers, FaTimes, FaEye, FaEnvelope, FaPhone, FaUserGraduate, FaTrash, FaArrowLeft } from 'react-icons/fa';
import { useToast } from '../../context/ToastContext';

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
    qualifiedInstructors?: User[];
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


    // Drawer State
    const [selectedBatchDetails, setSelectedBatchDetails] = useState<BatchDetails | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerLoading, setDrawerLoading] = useState(false);

    const { showToast } = useToast();

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

    // Confirmation Modal State
    const [confirmationModal, setConfirmationModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        type: 'info' | 'warning' | 'danger';
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'info'
    });

    const closeConfirmation = () => setConfirmationModal(prev => ({ ...prev, isOpen: false }));

    const handleAssign = async () => {
        if (!selectedSubject || !selectedInstructor) return;
        try {
            await api.post('/api/super-instructor/assign-subject', {
                instructorId: selectedInstructor,
                subjectId: selectedSubject
            });
            showToast("Instructor assigned and batch created successfully!", 'success');
            setSelectedSubject(null);
            setSelectedInstructor('');
            fetchData();
        } catch (err: any) {
            showToast(err.response?.data?.message || "Failed to assign instructor", 'error');
        }
    };

    const handleDistribute = (subjectId: number) => {
        setConfirmationModal({
            isOpen: true,
            title: 'Auto-Distribute Students?',
            message: 'This will automatically distribute unassigned students into available batches sequentially. Are you sure you want to proceed?',
            type: 'info',
            onConfirm: async () => {
                try {
                    const res = await api.post('/api/super-instructor/distribute-students', { subjectId });
                    showToast(res.data.message, 'success');
                    fetchData();
                    closeConfirmation();
                } catch (err: any) {
                    showToast(err.response?.data?.message || "Distribution Failed", 'error');
                    closeConfirmation();
                }
            }
        });
    };

    const handleViewBatch = async (batchId: number) => {
        try {
            setDrawerLoading(true);
            setIsDrawerOpen(true);
            const res = await api.get(`/api/super-instructor/batch/${batchId}/details`);
            setSelectedBatchDetails(res.data);
            setDrawerLoading(false);
        } catch (err) {
            console.error(err);
            showToast("Failed to fetch batch details", 'error');
            setIsDrawerOpen(false);
            setDrawerLoading(false);
        }
    };

    const handleReset = () => {
        setConfirmationModal({
            isOpen: true,
            title: 'Reset Entire System?',
            message: 'WARNING: This will UNASSIGN ALL instructors and DELETE ALL batches for your grade. This action cannot be undone. Are you sure?',
            type: 'danger',
            onConfirm: async () => {
                try {
                    const res = await api.post('/api/super-instructor/reset-assignments');
                    showToast(res.data.message, 'info');
                    fetchData();
                    closeConfirmation();
                } catch (err: any) {
                    console.error(err);
                    showToast("Failed to reset assignments", 'error');
                    closeConfirmation();
                }
            }
        });
    };



    if (loading) return <div className="flex items-center justify-center min-h-[400px] text-primary font-black uppercase tracking-[0.4em] animate-pulse italic">Loading Allocation Data...</div>;

    return (
        <div className="space-y-8 animate-fadeIn transition-colors duration-500">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 premium-card p-8">
                <div>
                    <h2 className="text-3xl font-black text-accent-white italic tracking-tighter">Subject <span className="text-primary">Allocation</span></h2>
                    <p className="text-accent-gray mt-1 font-black uppercase tracking-[0.3em] text-[10px] opacity-70">
                        Manage instructor batches for <span className="text-primary">
                            {(className.includes('Grade') || className.includes('Class') || className.includes('Course')) ? className : `Course ${className}`}
                        </span>
                    </p>
                </div>
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 px-8 py-4 rounded-[2rem] shadow-2xl border border-primary/20 flex items-center gap-4 group">
                    <div className="bg-primary/10 p-3 rounded-2xl border border-primary/20 group-hover:rotate-12 transition-transform shadow-[0_0_20px_rgba(238,29,35,0.1)]">
                        <FaUsers size={24} className="text-primary" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black text-accent-gray uppercase tracking-[0.2em] opacity-80">Total Students</span>
                        <p className="text-3xl font-black leading-none text-accent-white mt-1 italic">{totalStudents}</p>
                    </div>
                </div>
            </div>

            {/* Filters & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-surface p-6 md:p-4 rounded-[2rem] border border-white/5 shadow-2xl animate-fadeIn">
                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto md:ml-auto">
                    <button
                        onClick={handleReset}
                        className="flex items-center justify-center gap-2 px-6 py-4 md:py-3 bg-red-500/10 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-500/20 shadow-lg hover:shadow-red-500/20 active:scale-95"
                    >
                        <FaTrash size={12} /> Reset System
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {subjects.map(sub => (
                    <div key={sub.id} className="premium-card flex flex-col h-full relative overflow-hidden group hover:border-primary/20 transition-all duration-500">

                        {/* Header */}
                        <div className="p-6 border-b border-surface-border bg-white/5 flex items-center justify-between">
                            <h4 className="font-black text-xl flex items-center gap-3 text-accent-white truncate italic" title={sub.name}>
                                <span className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-sm flex-shrink-0 border border-primary/20 shadow-lg"><FaBook /></span>
                                {sub.name}
                            </h4>
                            <span className="bg-surface-dark text-accent-white border border-white/10 text-[9px] px-3 py-1.5 rounded-full font-black uppercase tracking-[0.2em] whitespace-nowrap shadow-md">
                                {sub.batches ? sub.batches.length : 0} {sub.batches?.length === 1 ? 'Batch' : 'Batches'}
                            </span>
                        </div>

                        {/* Batches List */}
                        <div className="p-6 flex-1 flex flex-col gap-4 overflow-y-auto max-h-[350px] no-scrollbar">
                            {sub.batches && sub.batches.length > 0 ? (
                                <div className="space-y-4">
                                    {sub.batches.map((batch: any, index: number) => (
                                        <div key={batch.id} className="bg-surface-dark/50 border border-surface-border rounded-2xl p-4 shadow-xl hover:bg-surface-light/30 transition-colors group/batch">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-sm font-black border border-primary/20 shadow-md transform group-hover/batch:scale-110 transition-transform">
                                                    {(batch.instructor_name || '?').charAt(0)}
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <p className="text-sm font-black text-accent-white truncate italic tracking-tight">{batch.instructor_name}</p>
                                                    <p className="text-[10px] text-accent-gray font-black uppercase tracking-widest mt-1 opacity-50">Batch {index + 1}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleViewBatch(batch.id)}
                                                    className="p-2.5 text-accent-gray hover:text-primary hover:bg-primary/10 rounded-xl transition-all border border-transparent hover:border-primary/20 shadow-sm"
                                                    title="View Batch Details"
                                                >
                                                    <FaEye size={16} />
                                                </button>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="mt-2 p-3 bg-surface-dark rounded-xl border border-surface-border">
                                                <div className="flex justify-between text-[9px] mb-2 font-black uppercase tracking-widest">
                                                    <span className="text-accent-gray">Allocation</span>
                                                    <span className={batch.student_count >= (batch.max_students || 30) ? 'text-emerald-400 opacity-100' : 'text-primary'}>
                                                        {batch.student_count} / {batch.max_students || 30}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-surface-light rounded-full h-2 overflow-hidden shadow-inner">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(238,29,35,0.3)] ${batch.student_count >= (batch.max_students || 30) ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-primary'}`}
                                                        style={{ width: `${Math.min(100, (batch.student_count / (batch.max_students || 30)) * 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 bg-surface-dark/50 border border-surface-border border-dashed rounded-[2rem] text-center my-auto">
                                    <p className="text-[10px] text-accent-gray font-black uppercase tracking-[0.3em] italic opacity-40">No instructors assigned yet.</p>
                                </div>
                            )}
                        </div>

                        {/* Unassigned Students Info */}
                        <div className="px-6 py-4 bg-primary/5 border-t border-white/5 flex justify-between items-center group-hover:bg-primary/10 transition-colors">
                            <span className="text-[10px] font-black text-accent-gray uppercase tracking-[0.3em] flex items-center gap-2">
                                <FaTimes className="text-primary animate-pulse" size={10} /> Unassigned:
                            </span>
                            <span className="text-sm font-black text-accent-white bg-surface-dark px-4 py-1 rounded-xl border border-white/10 shadow-lg">
                                {sub.unassignedCount !== undefined ? sub.unassignedCount : '?'}
                            </span>
                        </div>

                        {/* Footer / Actions */}
                        <div className="p-6 border-t border-surface-border bg-white/5 space-y-4">
                            {/* Distribution Button */}
                            {/* Distribution Button */}
                            {(sub.unassignedCount || 0) > 0 && sub.batches && sub.batches.length > 0 && (
                                <button
                                    onClick={() => handleDistribute(sub.id)}
                                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <FaUsers size={14} className="animate-bounce" /> Auto-Distribute Students
                                </button>
                            )}

                            <div className="space-y-3">
                                {/* Assign Instructor Section */}
                                {selectedSubject === sub.id ? (
                                    <div className="animate-fadeInScale flex flex-col gap-4 bg-surface-dark p-6 rounded-[2rem] border border-primary/20 shadow-2xl">
                                        <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] ml-2">Assign Instructor:</label>
                                        <select
                                            className="text-xs bg-surface border border-surface-border rounded-2xl px-4 py-4 text-accent-white outline-none focus:border-primary/50 transition-all cursor-pointer"
                                            value={selectedInstructor}
                                            onChange={(e) => setSelectedInstructor(e.target.value)}
                                        >
                                            <option value="" className="bg-surface text-accent-white">Choose Instructor...</option>
                                            {instructors.filter(i => i.is_active).map(i => (
                                                <option key={i.id} value={i.id} className="bg-surface text-accent-white">{i.name}</option>
                                            ))}
                                        </select>
                                        <div className="flex gap-3 justify-end pt-2">
                                            <button onClick={() => { setSelectedSubject(null); setSelectedInstructor(''); }} className="text-accent-gray px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">Cancel</button>
                                            <button onClick={handleAssign} disabled={!selectedInstructor} className="bg-primary text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-primary/20 scale-105 active:scale-95">Assign</button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setSelectedSubject(sub.id)}
                                        className="w-full py-4 bg-surface-dark border border-primary/20 text-accent-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-primary/10 hover:border-primary/40 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
                                    >
                                        <span className="text-primary text-lg">+</span> Assign Instructor
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Batch Detail Drawer */}
            {
                isDrawerOpen && (
                    <div className="fixed inset-0 z-50 overflow-hidden">
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-md transition-opacity duration-500" onClick={() => setIsDrawerOpen(false)}></div>
                        <div className="absolute inset-0 flex">
                            <div className="h-full w-full bg-surface border-l border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col animate-slideInRight duration-500">
                                {/* Drawer Header */}
                                <div className="p-10 bg-gradient-to-br from-primary/30 to-surface border-b border-surface-border flex justify-between items-start relative">
                                    <div className="flex items-start gap-6">
                                        <button
                                            onClick={() => setIsDrawerOpen(false)}
                                            className="mt-1 group flex items-center gap-2 text-accent-gray hover:text-primary transition-all font-black uppercase tracking-widest text-[10px]"
                                            title="Back to Dashboard"
                                        >
                                            <div className="w-10 h-10 bg-surface-dark rounded-xl flex items-center justify-center border border-white/5 group-hover:border-primary/30 group-hover:bg-primary/5 transition-all">
                                                <FaArrowLeft size={16} />
                                            </div>
                                        </button>
                                        <div>
                                            <h3 className="text-3xl font-black text-accent-white flex items-center gap-4 italic tracking-tighter">
                                                <FaBook size={32} className="text-primary shadow-glow" />
                                                {drawerLoading ? 'Loading...' : selectedBatchDetails?.subject_name}
                                            </h3>
                                            <p className="text-accent-gray font-black uppercase tracking-[0.4em] text-[10px] mt-4 opacity-70">Batch Details & Allocation</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsDrawerOpen(false)} className="bg-surface-dark p-3 rounded-2xl text-accent-gray hover:text-primary transition-all hover:rotate-90 border border-white/5">
                                        <FaTimes size={24} />
                                    </button>
                                </div>

                                {/* Drawer Content */}
                                <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
                                    {drawerLoading ? (
                                        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-6 text-primary">
                                            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                            <p className="font-black uppercase tracking-[0.3em] text-[10px] italic">Accessing Ecosystem Data...</p>
                                        </div>
                                    ) : selectedBatchDetails ? (
                                        <div className="animate-fadeIn space-y-10">

                                            {/* Instructor Info */}
                                            <div className="bg-surface-dark/50 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform -rotate-12"><FaUserTie size={120} /></div>
                                                <h4 className="text-[10px] font-black text-accent-gray uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                                                    <span className="w-2 h-2 bg-primary rounded-full animate-ping"></span> Assigned Instructor
                                                </h4>
                                                <div className="flex items-center gap-6 relative z-10">
                                                    <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary font-black text-4xl border border-primary/20 shadow-glow">
                                                        {selectedBatchDetails?.instructor_name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-accent-white text-2xl italic tracking-tight">{selectedBatchDetails?.instructor_name}</p>
                                                        <div className="flex items-center gap-2 text-accent-gray text-sm mt-2 italic font-medium">
                                                            <FaEnvelope size={12} className="text-primary/70" /> {selectedBatchDetails?.instructor_email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Students List */}
                                            <div className="space-y-6">
                                                <div className="flex justify-between items-center px-2">
                                                    <h4 className="text-[10px] font-black text-accent-gray uppercase tracking-[0.3em] flex items-center gap-3">
                                                        <FaUserGraduate className="text-primary" /> Students ({selectedBatchDetails?.students.length})
                                                    </h4>
                                                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-glow">
                                                        Active Batch
                                                    </span>
                                                </div>

                                                <div className="bg-surface-dark rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden">
                                                    {selectedBatchDetails?.students && selectedBatchDetails.students.length > 0 ? (
                                                        <div className="divide-y divide-white/5">
                                                            {selectedBatchDetails.students.map((student, idx) => (
                                                                <div key={student.id} className="p-6 hover:bg-white/5 flex items-center gap-6 transition-all group/std">
                                                                    <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-[10px] font-black text-accent-gray border border-white/5 group-hover/std:border-primary/30 transition-colors">
                                                                        {String(idx + 1).padStart(2, '0')}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <p className="text-base font-black text-accent-white italic tracking-tight group-hover/std:text-primary transition-colors">{student.name}</p>
                                                                        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                                                                            <span className="text-[10px] text-accent-gray/60 flex items-center gap-2 font-medium">
                                                                                <FaEnvelope size={10} className="text-white/20" /> {student.email}
                                                                            </span>
                                                                            {student.phone && (
                                                                                <span className="text-[10px] text-accent-gray/60 flex items-center gap-2 font-medium">
                                                                                    <FaPhone size={10} className="text-white/20" /> {student.phone}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="p-20 text-center text-accent-gray italic font-black uppercase tracking-widest opacity-30 text-[10px]">
                                                            No students assigned to this batch yet.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
                                            <FaTimes size={48} className="text-primary opacity-20" />
                                            <p className="text-primary font-black uppercase tracking-widest italic text-[10px]">Failed to Load Ecosystem Node</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Custom Confirmation Modal */}
            {confirmationModal.isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-fadeIn" onClick={closeConfirmation}></div>
                    <div className="bg-surface p-8 rounded-[2rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-sm w-full relative z-10 animate-scaleIn transform hover:scale-[1.02] transition-transform">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow ${confirmationModal.type === 'danger' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-primary/10 text-primary border border-primary/20'}`}>
                            {confirmationModal.type === 'danger' ? <FaTrash size={24} /> : <FaBook size={24} />}
                        </div>
                        <h3 className="text-2xl font-black text-center text-accent-white mb-2 italic tracking-tight">{confirmationModal.title}</h3>
                        <p className="text-center text-accent-gray text-sm mb-8 font-medium leading-relaxed">{confirmationModal.message}</p>
                        <div className="flex gap-4">
                            <button
                                onClick={closeConfirmation}
                                className="flex-1 py-3 rounded-xl bg-surface-dark border border-white/5 text-accent-gray font-black uppercase tracking-widest text-[10px] hover:bg-white/5 hover:text-white transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmationModal.onConfirm}
                                className={`flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] text-white shadow-xl transition-all hover:scale-105 active:scale-95 ${confirmationModal.type === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-primary hover:bg-primary-hover shadow-primary/20'}`}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div >
    );

};

export default SuperInstructorAllocation;
