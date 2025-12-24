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

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-primary font-black uppercase tracking-widest text-xs italic">Synchronizing Student Data...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
            <header>
                <h2 className="text-4xl font-black text-accent-white italic tracking-tighter uppercase">OPERATIONAL <span className="text-gradient-red">ROSTER</span></h2>
                <p className="text-accent-gray italic font-medium mt-2 opacity-60">DEPLOYED STUDENT ASSETS WITHIN YOUR TACTICAL SECTORS</p>
            </header>

            <div className="premium-card p-0 overflow-hidden border-surface-border shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-surface-dark/50 border-b border-surface-border">
                            <tr>
                                <th className="px-8 py-6 text-[10px] font-black text-accent-gray uppercase tracking-[0.3em] opacity-40">STUDENT IDENTIFIER</th>
                                <th className="px-8 py-6 text-[10px] font-black text-accent-gray uppercase tracking-[0.3em] opacity-40">COMMUNICATION FREQUENCY</th>
                                <th className="px-8 py-6 text-[10px] font-black text-accent-gray uppercase tracking-[0.3em] opacity-40">BATCH & SECTOR</th>
                                <th className="px-8 py-6 text-[10px] font-black text-accent-gray uppercase tracking-[0.3em] opacity-40 text-right">OPERATIONS</th>
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
                                                <div className="text-[9px] text-accent-gray font-black tracking-widest opacity-30 mt-1 uppercase">ID: EXT-{student.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
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
                                            <span className="text-[10px] text-accent-gray font-black italic uppercase tracking-tighter ml-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                                {student.subject_name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="text-[9px] font-black uppercase tracking-[0.2em] bg-surface-light border border-surface-border text-accent-white px-6 py-3 rounded-xl hover:bg-primary hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95">
                                            VERIFY PROGRESS
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
            </div>
        </div>
    );
};

export default InstructorStudents;
