import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaUser, FaEnvelope, FaPhone, FaSchool, FaCrown, FaCreditCard, FaLock, FaExclamationCircle, FaCalendarAlt, FaArrowRight } from 'react-icons/fa';

interface ProfileData {
    user: {
        name: string;
        email: string;
        phone: string;
        grade: string;
        plan_name: string;
        subscription_expires_at: string;
        created_at: string;
    };
    payments: any[];
}

const StudentProfile: React.FC = () => {
    const [data, setData] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/api/student/profile');
            setData(res.data);
        } catch (err) {
            console.error("Failed to fetch profile");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    const user = data?.user;

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <h2 className="text-3xl font-extrabold text-gray-900">My Account</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Info Card */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-indigo-600 h-32 relative">
                            <div className="absolute -bottom-10 left-8">
                                <div className="w-24 h-24 bg-white rounded-2xl shadow-lg border-4 border-white flex items-center justify-center text-indigo-600 overflow-hidden">
                                    <FaUser size={48} />
                                </div>
                            </div>
                        </div>
                        <div className="pt-16 pb-8 px-8">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">{user?.name}</h3>
                                    <p className="text-gray-500 font-medium">Student • Member since {new Date(user?.created_at || '').toLocaleDateString()}</p>
                                </div>
                                <div className="bg-indigo-50 text-indigo-600 px-4 py-1 rounded-full text-sm font-bold border border-indigo-100 flex items-center gap-1">
                                    <FaCrown className="text-yellow-500" /> {user?.plan_name}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                        <FaEnvelope /> Email Address
                                    </p>
                                    <p className="text-gray-700 font-medium">{user?.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                        <FaPhone /> Phone Number
                                    </p>
                                    <p className="text-gray-700 font-medium">{user?.phone || 'Not provided'}</p>
                                </div>
                                <div className="space-y-1 relative group">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                        <FaSchool /> Current Grade
                                    </p>
                                    <p className="text-gray-900 font-bold text-lg">{user?.grade}</p>
                                    <div className="absolute right-0 top-0 text-gray-400 opacity-0 group-hover:opacity-100 transition flex items-center gap-1 text-[10px] bg-gray-100 px-2 py-1 rounded">
                                        <FaLock /> Read Only
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                        <FaCalendarAlt /> Plan Expiry
                                    </p>
                                    <p className={`font-bold ${user?.subscription_expires_at ? 'text-green-600' : 'text-gray-600'}`}>
                                        {user?.subscription_expires_at ? new Date(user.subscription_expires_at).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Grade Change Notification */}
                        <div className="bg-yellow-50 p-4 border-t border-yellow-100 flex items-start gap-3">
                            <FaExclamationCircle className="text-yellow-600 mt-0.5" />
                            <div>
                                <p className="text-sm text-yellow-800 font-medium">To change your grade/class, please contact our support team.</p>
                                <p className="text-xs text-yellow-700 mt-1 font-bold">Customer Care: +91 98765 43210</p>
                            </div>
                        </div>
                    </div>

                    {/* Payment History Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                        <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <FaCreditCard className="text-indigo-600" /> Payment History
                        </h4>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        <th className="pb-4">Order ID</th>
                                        <th className="pb-4">Date</th>
                                        <th className="pb-4 text-right">Amount</th>
                                        <th className="pb-4 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {data?.payments.map((p, i) => (
                                        <tr key={i} className="text-sm">
                                            <td className="py-4 font-mono text-xs">{p.order_id}</td>
                                            <td className="py-4 text-gray-500">{new Date(p.created_at).toLocaleDateString()}</td>
                                            <td className="py-4 text-right font-bold text-gray-900">₹{parseFloat(p.amount).toLocaleString()}</td>
                                            <td className="py-4 text-center">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${p.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                    p.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {data?.payments.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="py-12 text-center text-gray-400 italic">No payment record found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-700 to-purple-800 rounded-3xl p-8 text-white shadow-xl">
                        <h4 className="text-xl font-bold mb-4">EduTalks Support</h4>
                        <p className="text-indigo-100 text-sm mb-6 leading-relaxed">Need help with your subscription or have a question about your classes? Our team is here for you 24/7.</p>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-center gap-3">
                                <div className="bg-white bg-opacity-10 p-2 rounded-lg"><FaPhone /></div>
                                <span className="font-bold">+91 98765 43210</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="bg-white bg-opacity-10 p-2 rounded-lg"><FaEnvelope /></div>
                                <span className="font-bold">support@edutalks.com</span>
                            </li>
                        </ul>
                        <button className="w-full mt-8 bg-white text-indigo-600 py-3 rounded-2xl font-bold hover:bg-opacity-90 transition">
                            Chat with us
                        </button>
                    </div>

                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                        <h4 className="text-lg font-bold text-gray-900 mb-4">Privacy & Security</h4>
                        <p className="text-sm text-gray-500 mb-6">Your data is secured with enterprise-grade encryption.</p>
                        <button className="text-indigo-600 font-bold text-sm hover:underline flex items-center gap-2">
                            Learn more <FaArrowRight size={10} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentProfile;
