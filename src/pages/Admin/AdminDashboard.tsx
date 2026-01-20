import React, { useEffect, useState } from 'react';
import { FaChalkboardTeacher, FaUserGraduate, FaCheckCircle, FaExclamationCircle, FaChartLine, FaUsers, FaWallet, FaGraduationCap } from 'react-icons/fa';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

const AdminDashboard: React.FC = () => {
    const { theme } = useTheme();
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

    if (loading) return <div className="p-10 text-center text-primary font-black uppercase lg:text-3xl italic animate-pulse">Loading Dashboard...</div>;

    return (
        <div className={`space-y-8 transition-colors duration-500 ${theme === 'dark' ? 'dark' : ''}`}>
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-extrabold text-accent-white tracking-tight italic">Admin <span className="text-primary italic">Dashboard</span></h2>
                    <p className="text-accent-gray mt-1 text-xs font-bold uppercase tracking-widest opacity-70">Analytics & Insights</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div id="dashboard-overview" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { label: 'Total Classes', value: summary.total_classes, icon: FaChalkboardTeacher, border: 'border-accent-purple', accent: 'text-accent-purple', target: 'dashboard-assignments' },
                    { label: 'Total Instructors', value: summary.total_instructors, icon: FaGraduationCap, border: 'border-accent-blue', accent: 'text-accent-blue', target: 'dashboard-assignments' },
                    { label: 'Total Students', value: summary.total_students, icon: FaUserGraduate, border: 'border-accent-indigo', accent: 'text-accent-indigo', target: 'dashboard-enrollment' },
                    { label: 'Paid Students', value: summary.paid_students, icon: FaCheckCircle, border: 'border-accent-emerald', accent: 'text-accent-emerald', target: 'dashboard-payments' },
                    { label: 'Unpaid Students', value: summary.unpaid_students, icon: FaExclamationCircle, border: 'border-accent-amber', accent: 'text-accent-amber', target: 'dashboard-payments' },
                    { label: 'Total Revenue', value: `₹${summary.total_revenue.toLocaleString()}`, icon: FaWallet, border: 'border-accent-emerald', accent: 'text-accent-emerald', target: 'dashboard-payments' }
                ].map((stat, idx) => (
                    <div
                        key={idx}
                        onClick={() => stat.target && scrollToSection(stat.target)}
                        className={`relative overflow-hidden rounded-[2rem] p-8 shadow-premium bg-surface border-l-8 ${stat.border} border border-surface-border transition transform hover:-translate-y-2 hover:shadow-premium-hover cursor-pointer`}
                    >
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors"></div>
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-gray mb-3">{stat.label}</p>
                                <h3 className={`text-4xl font-black mt-2 italic tracking-tighter ${stat.accent} ${stat.label.includes('Revenue') ? 'font-mono' : ''}`}>{stat.value}</h3>
                            </div>
                            <div className={`p-5 bg-surface-light rounded-3xl border border-surface-border shadow-xl`}>
                                <stat.icon size={28} className={stat.accent} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Class Assignments Panel */}
            <div id="dashboard-assignments" className="premium-card overflow-hidden">
                <div className="p-8 border-b border-surface-border flex justify-between items-center bg-surface-light/30">
                    <h3 className="text-xl font-black text-accent-white italic flex items-center gap-3">
                        <FaChartLine className="text-primary" /> Class-Instructor Assignments
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-accent-gray">
                        <thead className="bg-surface-dark text-accent-white font-black uppercase tracking-widest text-[10px]">
                            <tr>
                                <th className="p-6">Class Name</th>
                                <th className="p-6">Instructor Count</th>
                                <th className="p-6">Assigned Instructors</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-border">
                            {classAssignments.map((cls) => (
                                <tr key={cls.class_id} className="hover:bg-primary/5 transition-colors group">
                                    <td className="p-6 font-black text-accent-white italic">{cls.class_name}</td>
                                    <td className="p-6">
                                        <span className="px-3 py-1 rounded-full bg-accent-blue/10 text-accent-blue text-[10px] font-black uppercase tracking-widest border border-accent-blue/20">
                                            {cls.instructor_count}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex flex-wrap gap-2">
                                            {cls.instructors.length > 0 ? (
                                                cls.instructors.map((instructor: any) => (
                                                    <span key={instructor.id} className="px-3 py-1 rounded-full bg-surface-dark border border-surface-border text-[9px] uppercase font-black tracking-widest text-accent-gray">
                                                        {instructor.name} ({instructor.subject || 'N/A'})
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-accent-gray italic text-xs opacity-50">No instructors assigned</span>
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
                <div className="p-8 border-b border-surface-border bg-surface-light/30">
                    <h3 className="text-xl font-black text-accent-white italic flex items-center gap-3">
                        <FaUsers className="text-primary" /> Student Enrollment by Course & Class
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-surface-dark text-accent-white font-black uppercase tracking-widest text-[10px]">
                            <tr>
                                <th className="p-6">Class</th>
                                <th className="p-6">Course</th>
                                <th className="p-6">Total Students</th>
                                <th className="p-6">Paid</th>
                                <th className="p-6">Unpaid</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-border">
                            {enrollment.map((enroll, idx) => (
                                <tr key={idx} className="hover:bg-primary/5 transition-colors">
                                    <td className="p-6 font-black text-accent-white italic">{enroll.class_name}</td>
                                    <td className="p-6 opacity-70 italic">{enroll.course_name}</td>
                                    <td className="p-6">
                                        <span className="px-3 py-1 rounded-full bg-accent-indigo/10 text-accent-indigo text-[10px] font-black uppercase tracking-widest border border-accent-indigo/20">
                                            {enroll.total_students}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                            {enroll.paid_students}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
                                            {enroll.unpaid_students}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payment Status Panels */}
            <div id="dashboard-payments" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Paid Students Panel */}
                <div className="premium-card overflow-hidden border-l-8 border-emerald-500">
                    <div className="p-6 border-b border-surface-border bg-emerald-500/5">
                        <h3 className="text-lg font-black text-emerald-500 italic flex items-center gap-3">
                            <FaCheckCircle /> Paid Students ({paidStudents.length})
                        </h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="sticky top-0 bg-surface-dark text-accent-white font-black uppercase tracking-widest text-[9px]">
                                <tr>
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Contact</th>
                                    <th className="p-4">Class</th>
                                    <th className="p-4">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-border">
                                {paidStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-emerald-500/5 transition-colors">
                                        <td className="p-4 font-bold text-accent-white">{student.name}</td>
                                        <td className="p-4 text-accent-gray text-[10px] opacity-70">{student.email}</td>
                                        <td className="p-4 text-accent-gray text-[10px] mono">{student.phone || 'N/A'}</td>
                                        <td className="p-4 text-accent-gray italic">{student.grade}</td>
                                        <td className="p-4 font-mono text-emerald-500 font-bold">₹{student.amount_paid?.toLocaleString() || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Unpaid Students Panel */}
                <div className="premium-card overflow-hidden border-l-8 border-amber-500">
                    <div className="p-6 border-b border-surface-border bg-amber-500/5">
                        <h3 className="text-lg font-black text-amber-500 italic flex items-center gap-3">
                            <FaExclamationCircle /> Unpaid Students ({unpaidStudents.length})
                        </h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="sticky top-0 bg-surface-dark text-accent-white font-black uppercase tracking-widest text-[9px]">
                                <tr>
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Contact</th>
                                    <th className="p-4">Class</th>
                                    <th className="p-4">Enrolled</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-border">
                                {unpaidStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-amber-500/5 transition-colors">
                                        <td className="p-4 font-bold text-accent-white">{student.name}</td>
                                        <td className="p-4 text-accent-gray text-[10px] opacity-70">{student.email}</td>
                                        <td className="p-4 text-accent-gray text-[10px] mono">{student.phone || 'N/A'}</td>
                                        <td className="p-4 text-accent-gray italic">{student.grade}</td>
                                        <td className="p-4 text-accent-gray text-[10px]">
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

export default AdminDashboard;
