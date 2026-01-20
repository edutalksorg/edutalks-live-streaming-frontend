import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FaUsers, FaWallet, FaChalkboardTeacher, FaCheckCircle, FaExclamationCircle, FaChartLine, FaGraduationCap } from 'react-icons/fa';

const SuperAdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({
        total_classes: 0,
        total_instructors: 0,
        total_students: 0,
        paid_students: 0,
        unpaid_students: 0,
        total_revenue: 0
    });
    const [classAssignments, setClassAssignments] = useState<any[]>([]);
    const [enrollment, setEnrollment] = useState<any[]>([]);
    const [paidStudents, setPaidStudents] = useState<any[]>([]);
    const [unpaidStudents, setUnpaidStudents] = useState<any[]>([]);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [summaryRes, assignmentsRes, enrollmentRes, paidRes, unpaidRes] = await Promise.all([
                    api.get('/api/admin/analytics/dashboard-summary'),
                    api.get('/api/admin/analytics/class-assignments'),
                    api.get('/api/admin/analytics/student-enrollment'),
                    api.get('/api/admin/analytics/payment-details?status=paid'),
                    api.get('/api/admin/analytics/payment-details?status=unpaid')
                ]);

                setSummary(summaryRes.data);
                setClassAssignments(assignmentsRes.data.classes || []);
                setEnrollment(enrollmentRes.data.enrollment || []);
                setPaidStudents(paidRes.data.students || []);
                setUnpaidStudents(unpaidRes.data.students || []);
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="p-10 text-center text-primary lg:text-3xl font-black uppercase tracking-widest animate-pulse italic">Loading Analytics...</div>;

    return (
        <div className="space-y-8 transition-colors duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-12 gap-6">
                <div>
                    <h2 className="text-4xl font-black text-foreground tracking-tighter italic uppercase">Master <span className="text-primary">Control</span></h2>
                    <p className="text-accent-gray mt-2 font-bold uppercase tracking-[0.2em] text-[10px] opacity-70">Comprehensive Analytics Dashboard</p>
                </div>
                <button
                    onClick={() => navigate('/super-admin/users', { state: { openCreateModal: true } })}
                    className="btn-primary flex items-center gap-4 px-10 py-5 scale-100 hover:scale-[1.05] active:scale-95 text-[10px] font-black uppercase tracking-widest shadow-primary/30"
                >
                    <span className="text-2xl leading-none">+</span> CREATE NEW USER
                </button>
            </div>

            {/* Summary Cards */}
            <div id="dashboard-overview" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { label: 'Total Classes', value: summary.total_classes, accent: 'text-accent-purple', border: 'border-accent-purple', icon: FaChalkboardTeacher, target: 'dashboard-assignments' },
                    { label: 'Total Instructors', value: summary.total_instructors, accent: 'text-accent-blue', border: 'border-accent-blue', icon: FaGraduationCap, target: 'dashboard-assignments' },
                    { label: 'Total Students', value: summary.total_students, accent: 'text-accent-indigo', border: 'border-accent-indigo', icon: FaUsers, target: 'dashboard-enrollment' },
                    { label: 'Paid Students', value: summary.paid_students, accent: 'text-accent-emerald', border: 'border-accent-emerald', icon: FaCheckCircle, target: 'dashboard-payments' },
                    { label: 'Unpaid Students', value: summary.unpaid_students, accent: 'text-accent-amber', border: 'border-accent-amber', icon: FaExclamationCircle, target: 'dashboard-payments' },
                    { label: 'Total Revenue', value: `₹ ${summary.total_revenue.toLocaleString()}`, accent: 'text-accent-emerald', border: 'border-accent-emerald', icon: FaWallet, target: 'dashboard-payments' }
                ].map((item, idx) => (
                    <div
                        key={idx}
                        onClick={() => item.target && scrollToSection(item.target)}
                        className={`relative overflow-hidden bg-surface p-8 rounded-[2rem] shadow-premium border border-surface-border border-l-8 ${item.border} hover:shadow-premium-hover hover:-translate-y-2 transition-all group cursor-pointer`}
                    >
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <div className="text-accent-gray text-[10px] font-black uppercase tracking-widest mb-3 group-hover:text-accent-white transition-colors">{item.label}</div>
                                <div className={`text-4xl font-black italic tracking-tighter ${item.accent} ${item.label.includes('Revenue') ? 'font-mono' : ''}`}>{item.value}</div>
                            </div>
                            <div className={`p-4 bg-surface-light rounded-2xl border border-surface-border shadow-xl group-hover:rotate-12 transition-transform ${item.accent}`}>
                                <item.icon size={24} />
                            </div>
                        </div>
                        <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors"></div>
                    </div>
                ))}
            </div>

            {/* Class Assignments Panel */}
            <div id="dashboard-assignments" className="premium-card overflow-hidden">
                <div className="p-6 border-b border-surface-border bg-surface-light/30">
                    <h3 className="text-xl font-black text-accent-white italic flex items-center gap-3">
                        <FaChartLine className="text-primary" /> Class-Instructor Assignments
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-surface-dark text-accent-white font-black uppercase tracking-widest text-[10px]">
                            <tr>
                                <th className="p-4">Class Name</th>
                                <th className="p-4">Instructor Count</th>
                                <th className="p-4">Assigned Instructors</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-border">
                            {classAssignments.map((cls) => (
                                <tr key={cls.class_id} className="hover:bg-primary/5 transition-colors">
                                    <td className="p-4 font-black text-accent-white italic">{cls.class_name}</td>
                                    <td className="p-4">
                                        <span className="px-3 py-1 rounded-full bg-accent-blue/10 text-accent-blue text-[10px] font-black uppercase tracking-widest border border-accent-blue/20">
                                            {cls.instructor_count}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-2">
                                            {cls.instructors.length > 0 ? (
                                                cls.instructors.map((instructor: any) => (
                                                    <span key={instructor.id} className="px-3 py-1 rounded-full bg-surface-dark border border-surface-border text-[9px] text-accent-gray">
                                                        {instructor.name} ({instructor.subject || 'N/A'})
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-accent-gray italic text-xs">No instructors assigned</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Student Enrollment Panel */}
            <div id="dashboard-enrollment" className="premium-card overflow-hidden">
                <div className="p-6 border-b border-surface-border bg-surface-light/30">
                    <h3 className="text-xl font-black text-accent-white italic flex items-center gap-3">
                        <FaUsers className="text-primary" /> Student Enrollment by Course/Class
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-surface-dark text-accent-white font-black uppercase tracking-widest text-[10px]">
                            <tr>
                                <th className="p-4">Class</th>
                                <th className="p-4">Course</th>
                                <th className="p-4">Total Students</th>
                                <th className="p-4">Paid</th>
                                <th className="p-4">Unpaid</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-border">
                            {enrollment.map((enroll, idx) => (
                                <tr key={idx} className="hover:bg-primary/5 transition-colors">
                                    <td className="p-4 font-black text-accent-white italic">{enroll.class_name}</td>
                                    <td className="p-4 text-accent-gray">{enroll.course_name}</td>
                                    <td className="p-4">
                                        <span className="px-3 py-1 rounded-full bg-accent-indigo/10 text-accent-indigo text-[10px] font-black uppercase tracking-widest border border-accent-indigo/20">
                                            {enroll.total_students}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className="px-3 py-1 rounded-full bg-accent-emerald/10 text-accent-emerald text-[10px] font-black uppercase tracking-widest border border-accent-emerald/20">
                                            {enroll.paid_students}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className="px-3 py-1 rounded-full bg-accent-amber/10 text-accent-amber text-[10px] font-black uppercase tracking-widest border border-accent-amber/20">
                                            {enroll.unpaid_students}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payment Status Panels - Side by Side */}
            <div id="dashboard-payments" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Paid Students Panel */}
                <div className="premium-card overflow-hidden border-l-8 border-accent-emerald">
                    <div className="p-6 border-b border-surface-border bg-accent-emerald/5">
                        <h3 className="text-lg font-black text-accent-emerald italic flex items-center gap-3">
                            <FaCheckCircle /> Paid Students ({paidStudents.length})
                        </h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="sticky top-0 bg-surface-dark text-accent-white font-black uppercase tracking-widest text-[9px]">
                                <tr>
                                    <th className="p-3">Name</th>
                                    <th className="p-3">Contact</th>
                                    <th className="p-3">Class</th>
                                    <th className="p-3">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-border">
                                {paidStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-accent-emerald/5 transition-colors">
                                        <td className="p-3 font-bold text-accent-white">{student.name}</td>
                                        <td className="p-3 text-accent-gray text-[10px] mono">{student.phone || 'N/A'}</td>
                                        <td className="p-3 text-accent-gray italic">{student.grade}</td>
                                        <td className="p-3 font-mono text-accent-emerald">₹{student.amount_paid?.toLocaleString() || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Unpaid Students Panel */}
                <div className="premium-card overflow-hidden border-l-8 border-accent-amber">
                    <div className="p-6 border-b border-surface-border bg-accent-amber/5">
                        <h3 className="text-lg font-black text-accent-amber italic flex items-center gap-3">
                            <FaExclamationCircle /> Unpaid Students ({unpaidStudents.length})
                        </h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="sticky top-0 bg-surface-dark text-accent-white font-black uppercase tracking-widest text-[9px]">
                                <tr>
                                    <th className="p-3">Name</th>
                                    <th className="p-3">Contact</th>
                                    <th className="p-3">Class</th>
                                    <th className="p-3">Enrolled</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-border">
                                {unpaidStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-accent-amber/5 transition-colors">
                                        <td className="p-3 font-bold text-accent-white">{student.name}</td>
                                        <td className="p-3 text-accent-gray text-[10px] mono">{student.phone || 'N/A'}</td>
                                        <td className="p-3 text-accent-gray italic">{student.grade}</td>
                                        <td className="p-3 text-accent-gray text-[10px]">
                                            {new Date(student.enrollment_date).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
