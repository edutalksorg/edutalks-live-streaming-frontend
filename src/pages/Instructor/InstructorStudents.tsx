import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useSearchParams } from 'react-router-dom';
import { FaEnvelope, FaPhone, FaLayerGroup } from 'react-icons/fa';
import { useModal } from '../../context/ModalContext';

interface Student {
    id: number;
    name: string;
    email: string;
    phone: string;
    batch_name: string;
    subject_name: string;
}

interface ExamResult {
    submission_id: number;
    exam_title: string;
    auto_score: number;
    submitted_at: string;
    reviewed_score: number | null;
    review_text: string | null;
    total_marks: number;
}

const ProgressModal: React.FC<{ student: Student; results: ExamResult[]; onClose: () => void }> = ({ student, results, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#0f0f0f] w-full max-w-4xl max-h-[95vh] rounded-3xl border border-surface-border shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 relative">
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-surface-border bg-surface-light/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent opacity-50"></div>
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white text-xl md:text-2xl font-black italic shadow-lg shadow-primary/20">
                            {student.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="text-xl md:text-3xl font-black text-white italic tracking-tighter uppercase">{student.name}</h3>
                            <p className="text-accent-gray font-bold tracking-widest text-[10px] md:text-xs uppercase mt-1">
                                <span className="text-primary">{student.batch_name}</span> • {student.subject_name}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white transition-all shadow-lg hover:shadow-red-600/50 z-50"
                        title="Close"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar space-y-8 flex-1">
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-primary/50 transition-colors">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <FaLayerGroup size={40} className="text-primary" />
                            </div>
                            <p className="text-accent-gray text-[10px] font-black uppercase tracking-widest">Exams Attempted</p>
                            <p className="text-4xl font-black text-white italic tracking-tighter mt-1">{results.length}</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-green-500/50 transition-colors">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <FaLayerGroup size={40} className="text-green-500" />
                            </div>
                            <p className="text-accent-gray text-[10px] font-black uppercase tracking-widest">Average Score</p>
                            <p className="text-4xl font-black text-white italic tracking-tighter mt-1">
                                {results.length > 0
                                    ? Math.round(results.reduce((acc, curr) => acc + ((curr.reviewed_score ?? curr.auto_score) / curr.total_marks) * 100, 0) / results.length)
                                    : 0}%
                            </p>
                        </div>
                    </div>

                    {/* Results Table */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-black text-accent-gray uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            Performance History
                        </h4>

                        {results.length > 0 ? (
                            <div className="border border-surface-border rounded-xl overflows-hidden bg-surface-light/20">
                                <table className="w-full text-left">
                                    <thead className="bg-black/20 border-b border-white/5">
                                        <tr>
                                            <th className="px-4 md:px-6 py-4 text-[10px] font-black text-accent-gray uppercase tracking-widest opacity-60">Exam Title</th>
                                            <th className="px-4 md:px-6 py-4 text-[10px] font-black text-accent-gray uppercase tracking-widest opacity-60 hidden sm:table-cell">Date</th>
                                            <th className="px-4 md:px-6 py-4 text-[10px] font-black text-accent-gray uppercase tracking-widest opacity-60 text-right">Score</th>
                                            <th className="px-4 md:px-6 py-4 text-[10px] font-black text-accent-gray uppercase tracking-widest opacity-60 text-right hidden md:table-cell">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {results.map((res) => {
                                            const finalScore = res.reviewed_score ?? res.auto_score;
                                            const percentage = (finalScore / res.total_marks) * 100;
                                            const scoreColor = percentage >= 80 ? 'text-green-400' : percentage >= 50 ? 'text-yellow-400' : 'text-red-400';

                                            return (
                                                <tr key={res.submission_id} className="hover:bg-white/5 transition-colors">
                                                    <td className="px-4 md:px-6 py-4 font-bold text-white text-sm">{res.exam_title}</td>
                                                    <td className="px-4 md:px-6 py-4 text-xs text-accent-gray font-mono hidden sm:table-cell">{new Date(res.submitted_at).toLocaleDateString()}</td>
                                                    <td className="px-4 md:px-6 py-4 text-right">
                                                        <span className={`font-black italic text-lg ${scoreColor}`}>
                                                            {finalScore}<span className="text-xs text-white/30 font-medium not-italic ml-1">/ {res.total_marks}</span>
                                                        </span>
                                                    </td>
                                                    <td className="px-4 md:px-6 py-4 text-right hidden md:table-cell">
                                                        {res.reviewed_score !== null ? (
                                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20 uppercase tracking-widest">
                                                                Reviewed
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-widest">
                                                                Auto-Graded
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12 border border-dashed border-surface-border rounded-xl">
                                <p className="text-accent-gray italic opacity-50 text-sm">No exam submissions found for this student.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-surface-border bg-surface-light/30 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all"
                    >
                        Close Dossier
                    </button>
                </div>
            </div>
        </div>
    );
};

const InstructorStudents: React.FC = () => {
    const { showAlert } = useModal();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const batchIdFilter = searchParams.get('batchId');

    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [progressResults, setProgressResults] = useState<ExamResult[]>([]);
    const [fetchingProgress, setFetchingProgress] = useState(false);

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

    const handleVerifyProgress = async (student: Student) => {
        setFetchingProgress(true);
        try {
            const res = await api.get(`/api/instructor/students/${student.id}/progress`);
            setProgressResults(res.data);
            setSelectedStudent(student);
        } catch (err) {
            console.error("Failed to fetch progress:", err);
            showAlert("Failed to load student progress. Please try again.", "error");
        } finally {
            setFetchingProgress(false);
        }
    };


    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-primary font-black uppercase tracking-widest text-xs italic">Synchronizing Student Data...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
            <header>
                <h2 className="text-2xl md:text-4xl font-black text-accent-white italic tracking-tighter uppercase">OPERATIONAL <span className="text-gradient-red">ROSTER</span></h2>
                <p className="text-accent-gray italic font-medium mt-1 md:mt-2 opacity-80 text-[10px] md:text-sm">DEPLOYED STUDENT ASSETS WITHIN YOUR TACTICAL SECTORS</p>
            </header>

            {/* Desktop Table View */}
            <div className="hidden md:block premium-card p-0 overflow-hidden border-surface-border shadow-2xl">
                <table className="w-full text-left">
                    <thead className="bg-surface-dark/50 border-b border-surface-border">
                        <tr>
                            <th className="px-8 py-6 text-[10px] font-black text-accent-gray uppercase tracking-[0.3em] opacity-70">STUDENT IDENTIFIER</th>
                            <th className="px-8 py-6 text-[10px] font-black text-accent-gray uppercase tracking-[0.3em] opacity-70 hidden lg:table-cell">COMMUNICATION FREQUENCY</th>
                            <th className="px-8 py-6 text-[10px] font-black text-accent-gray uppercase tracking-[0.3em] opacity-70">BATCH & SECTOR</th>
                            <th className="px-8 py-6 text-[10px] font-black text-accent-gray uppercase tracking-[0.3em] opacity-70 text-right">OPERATIONS</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border/50">
                        {students.length > 0 ? students.map((student) => (
                            <tr key={student.id} className="hover:bg-white/5 transition-all duration-300 group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white font-black italic shadow-lg shadow-primary/20 transform group-hover:scale-110 group-hover:rotate-3 transition-transform">
                                            {student.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-base font-black text-accent-white italic tracking-tighter uppercase group-hover:text-primary transition-colors">{student.name}</div>
                                            <div className="text-[9px] text-accent-gray font-black tracking-widest opacity-60 mt-1 uppercase">ID: EXT-{student.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 hidden lg:table-cell">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3 text-[11px] text-accent-gray italic font-medium group-hover:text-accent-white transition-colors">
                                            <FaEnvelope className="text-primary opacity-60" /> {student.email}
                                        </div>
                                        <div className="flex items-center gap-3 text-[11px] text-accent-gray italic font-medium group-hover:text-accent-white transition-colors">
                                            <FaPhone className="text-primary opacity-60" /> {student.phone || 'VOICE DOWNLINK SECURED'}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex flex-col gap-2">
                                        <span className="inline-flex items-center px-4 py-1 rounded-xl text-[9px] font-black bg-primary/10 text-primary border border-primary/20 w-fit uppercase tracking-widest">
                                            <FaLayerGroup className="mr-2" /> {student.batch_name}
                                        </span>
                                        <span className="text-[10px] text-accent-gray font-black italic uppercase tracking-tighter ml-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                            {student.subject_name}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <button
                                        onClick={() => handleVerifyProgress(student)}
                                        disabled={fetchingProgress}
                                        className="text-[9px] font-black uppercase tracking-[0.2em] bg-surface-light border border-surface-border text-accent-white px-6 py-3 rounded-xl hover:bg-primary hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {fetchingProgress && selectedStudent?.id === student.id ? 'Loading...' : 'REVIEW PROGRESS'}
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="px-8 py-24 text-center">
                                    <p className="text-accent-gray italic font-medium opacity-20 tracking-widest uppercase text-sm">ROSTER IS VOID IN THIS SECTOR.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Vertical Card View */}
            <div className="md:hidden space-y-4">
                {students.length > 0 ? students.map((student) => (
                    <div key={student.id} className="premium-card p-6 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white font-black italic shadow-lg shadow-primary/20">
                                {student.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="text-lg font-black text-accent-white italic tracking-tighter uppercase">{student.name}</h4>
                                <p className="text-[9px] text-accent-gray font-black tracking-widest opacity-60 uppercase">ID: EXT-{student.id}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 pt-4 border-t border-surface-border">
                            <div className="flex items-center gap-3 text-xs text-accent-gray italic font-medium">
                                <FaEnvelope className="text-primary opacity-60" /> {student.email}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-accent-gray italic font-medium">
                                <FaPhone className="text-primary opacity-60" /> {student.phone || 'VOICE SECURED'}
                            </div>
                        </div>

                        <div className="pt-4 space-y-3">
                            <div className="flex flex-col gap-1">
                                <p className="text-[8px] font-black text-accent-gray uppercase tracking-widest opacity-50">Assigned Sector</p>
                                <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black bg-primary/10 text-primary border border-primary/20 w-fit uppercase tracking-widest">
                                    <FaLayerGroup className="mr-2" /> {student.batch_name}
                                </span>
                            </div>
                            <p className="text-[11px] text-accent-white font-bold italic uppercase tracking-tight">
                                {student.subject_name}
                            </p>
                        </div>

                        <button
                            onClick={() => handleVerifyProgress(student)}
                            disabled={fetchingProgress}
                            className="w-full text-[10px] font-black uppercase tracking-[0.2em] bg-primary text-white py-4 rounded-xl shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50"
                        >
                            {fetchingProgress && selectedStudent?.id === student.id ? 'Loading...' : 'REVIEW STUDENT PROGRESS'}
                        </button>
                    </div>
                )) : (
                    <div className="premium-card p-12 text-center">
                        <p className="text-accent-gray italic font-medium opacity-20 tracking-widest uppercase text-sm">NO ASSETS DEPLOYED</p>
                    </div>
                )}
            </div>


            {
                selectedStudent && (
                    <ProgressModal
                        student={selectedStudent}
                        results={progressResults}
                        onClose={() => setSelectedStudent(null)}
                    />
                )
            }
        </div >
    );
};

export default InstructorStudents;
