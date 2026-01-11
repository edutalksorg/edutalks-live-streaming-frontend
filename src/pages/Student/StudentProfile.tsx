import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaUser, FaEnvelope, FaPhone, FaSchool, FaCrown, FaCreditCard, FaLock, FaExclamationCircle, FaCalendarAlt, FaArrowRight, FaWhatsapp } from 'react-icons/fa';
import { useModal } from '../../context/ModalContext';

interface ProfileData {
    user: {
        name: string;
        email: string;
        phone: string;
        grade: string;
        course_name?: string;
        plan_name: string;
        subscription_expires_at: string;
        created_at: string;
    };
    payments: any[];
}

const StudentProfile: React.FC = () => {
    const { showAlert } = useModal();
    const [data, setData] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        phone: ''
    });

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

    const handleEditClick = () => {
        if (data?.user) {
            setEditForm({
                name: data.user.name,
                email: data.user.email,
                phone: data.user.phone || ''
            });
            setIsEditing(true);
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.put('/api/student/profile', editForm);
            showAlert('Profile updated successfully!', 'success');
            setIsEditing(false);
            fetchProfile(); // Refresh data
        } catch (err: any) {
            console.error("Failed to update profile", err);
            showAlert(err.response?.data?.message || 'Failed to update profile', 'error');
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
            <div className="flex justify-between items-center">
                <h2 className="text-4xl font-black text-accent-white italic tracking-tighter uppercase">OPERATIONAL <span className="text-gradient-red">PROFILE</span></h2>
                <button
                    onClick={handleEditClick}
                    className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg font-bold uppercase tracking-wider text-sm transition-colors"
                >
                    Edit Profile
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* User Info Card */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="premium-card p-0 overflow-hidden border-surface-border">
                        <div className="bg-gradient-to-r from-primary/80 to-primary-hover h-40 relative">
                            <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
                            <div className="absolute -bottom-12 left-10">
                                <div className="w-32 h-32 bg-surface rounded-[2rem] shadow-2xl border-4 border-surface-dark flex items-center justify-center text-primary overflow-hidden relative group">
                                    <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
                                    <FaUser size={56} className="relative z-10" />
                                </div>
                            </div>
                        </div>
                        <div className="pt-20 pb-10 px-10">
                            <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-6">
                                <div>
                                    <h3 className="text-3xl font-black text-accent-white italic tracking-tighter uppercase">{user?.name}</h3>
                                    <p className="text-accent-gray italic font-medium mt-2 opacity-60">
                                        {user?.course_name ? 'PROFESSIONAL COURSE' : (user?.grade?.toLowerCase().includes('class') ? 'SCHOOL STUDENT' : 'STUDENT')} • ACTIVE SINCE {new Date(user?.created_at || '').toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="bg-primary/10 text-primary px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] border border-primary/20 flex items-center gap-2 shadow-lg shadow-primary/5">
                                    <FaCrown className="text-primary animate-pulse" /> {user?.plan_name} ACCESS
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-accent-gray uppercase tracking-[0.3em] flex items-center gap-3 opacity-40">
                                        <FaEnvelope className="text-primary" /> COMMUNICATION FREQUENCY
                                    </p>
                                    <p className="text-accent-white font-black italic text-lg tracking-tight">{user?.email}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-accent-gray uppercase tracking-[0.3em] flex items-center gap-3 opacity-40">
                                        <FaPhone className="text-primary" /> VOICE DOWNLINK
                                    </p>
                                    <p className="text-accent-white font-black italic text-lg tracking-tight">{user?.phone || 'NOT CONFIGURED'}</p>
                                </div>
                                <div className="space-y-2 relative group">
                                    <p className="text-[10px] font-black text-accent-gray uppercase tracking-[0.3em] flex items-center gap-3 opacity-40">
                                        <FaSchool className="text-primary" /> OPERATIONAL SECTOR
                                    </p>
                                    <p className="text-primary font-black italic text-xl md:text-2xl tracking-tighter uppercase break-words">{user?.course_name || user?.grade}</p>
                                    <div className="absolute right-0 top-0 text-[8px] font-black text-accent-gray uppercase tracking-widest bg-surface-dark px-3 py-1 rounded-full border border-surface-border flex items-center gap-2 opacity-60">
                                        <FaLock /> SYSTEM LOCKED
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-accent-gray uppercase tracking-[0.3em] flex items-center gap-3 opacity-40">
                                        <FaCalendarAlt className="text-primary" /> DEPLOYMENT EXPIRY
                                    </p>
                                    <p className={`text-lg font-black italic tracking-tight ${user?.subscription_expires_at ? 'text-accent-emerald' : 'text-accent-gray opacity-30'}`}>
                                        {user?.subscription_expires_at ? new Date(user.subscription_expires_at).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Grade Change Notification */}
                        <div className="bg-primary/5 p-6 border-t border-surface-border flex items-center gap-4 group">
                            <div className="bg-primary/10 p-3 rounded-xl border border-primary/20 group-hover:scale-110 transition-transform">
                                <FaExclamationCircle className="text-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] text-accent-white font-black uppercase tracking-widest leading-relaxed">Sector Reassignment Required?</p>
                                <p className="text-[9px] text-accent-gray italic font-medium opacity-60">Operational command verification needed: <a href="tel:9640111233" className="text-primary font-black hover:underline">9640111233</a></p>
                            </div>
                        </div>
                    </div>

                    {/* Payment History Card */}
                    <div className="premium-card p-10 border-surface-border">
                        <h4 className="text-xl font-black text-accent-white italic tracking-tighter uppercase mb-8 flex items-center gap-4">
                            <FaCreditCard className="text-primary" /> TRANSACTION LOGS
                        </h4>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-surface-border text-[9px] font-black text-accent-gray uppercase tracking-[0.3em] opacity-40">
                                        <th className="pb-6">ORDER ID</th>
                                        <th className="pb-6">TIMESTAMP</th>
                                        <th className="pb-6 text-right">MAGNITUDE</th>
                                        <th className="pb-6 text-center">STATUS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-border/50">
                                    {data?.payments.map((p, i) => (
                                        <tr key={i} className="text-[11px] group hover:bg-white/5 transition-colors">
                                            <td className="py-6 font-black text-primary italic tracking-widest">{p.order_id}</td>
                                            <td className="py-6 text-accent-gray italic font-medium opacity-60">{new Date(p.created_at).toLocaleDateString()}</td>
                                            <td className="py-6 text-right font-black text-accent-white text-sm italic tracking-tight">₹{parseFloat(p.amount).toLocaleString()}</td>
                                            <td className="py-6 text-center">
                                                <span className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${p.status === 'completed' ? 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20' :
                                                    p.status === 'failed' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-surface-light text-accent-gray border-surface-border'
                                                    }`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {data?.payments.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="py-20 text-center text-accent-gray italic font-medium opacity-30">No historical data found in this sector.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-10 lg:sticky lg:top-36 self-start">
                    <div className="bg-gradient-to-br from-primary via-primary-hover to-primary/90 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000"></div>
                        <h4 className="text-2xl font-black italic tracking-tighter uppercase mb-6 leading-tight">TACTICAL SUPPORT</h4>
                        <p className="text-white/70 italic text-sm mb-10 font-medium leading-relaxed">Engaged in operational difficulties? Our elite response team is standing by for extraction 24/7.</p>
                        <ul className="space-y-6">
                            <li className="flex items-center gap-5 group/item">
                                <div className="bg-white/10 p-3 rounded-xl border border-white/20 group-hover/item:bg-white/20 transition-colors"><FaPhone size={14} /></div>
                                <a href="tel:9640111233" className="font-black italic tracking-widest text-[11px] text-white hover:text-white transition-colors">9640111233</a>
                            </li>
                            <li className="flex items-center gap-5 group/item">
                                <div className="bg-white/10 p-3 rounded-xl border border-white/20 group-hover/item:bg-white/20 transition-colors"><FaPhone size={14} /></div>
                                <a href="tel:9505111233" className="font-black italic tracking-widest text-[11px] text-white hover:text-white transition-colors">9505111233</a>
                            </li>
                            <li className="flex items-center gap-5 group/item">
                                <div className="bg-white/10 p-3 rounded-xl border border-white/20 group-hover/item:bg-white/20 transition-colors"><FaEnvelope size={14} /></div>
                                <a href="mailto:contact@edutalksacademy.in" className="font-black italic tracking-widest text-[11px] text-white hover:text-white transition-colors">contact@edutalksacademy.in</a>
                            </li>
                        </ul>
                        <a
                            href="https://wa.me/917995674266"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full mt-12 bg-white text-[#25D366] py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:shadow-[0_10px_30px_-5px_rgba(255,255,255,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <FaWhatsapp size={24} />
                        </a>
                    </div>

                    <div className="premium-card p-10 border-surface-border shadow-2xl">
                        <h4 className="text-lg font-black text-accent-white italic tracking-tighter uppercase mb-4 flex items-center gap-3">
                            <FaLock className="text-primary" /> ENCRYPTION
                        </h4>
                        <p className="text-xs text-accent-gray italic font-medium opacity-60 leading-relaxed mb-8">All operational data is secured via end-to-end proprietary protocol.</p>
                        <button className="text-primary font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors flex items-center gap-3">
                            SECURITY MANIFEST <FaArrowRight size={10} className="animate-pulse" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-surface border border-surface-border rounded-2xl p-8 max-w-md w-full relative animate-in zoom-in duration-300">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="absolute top-4 right-4 text-accent-gray hover:text-white"
                        >
                            ✕
                        </button>

                        <h3 className="text-2xl font-black text-accent-white uppercase italic tracking-tighter mb-6">Edit Profile</h3>

                        <form onSubmit={handleSaveProfile} className="space-y-6">
                            <div>
                                <label className="block text-accent-gray text-xs font-bold uppercase tracking-widest mb-2">Name</label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full bg-surface-dark border border-surface-border rounded-lg px-4 py-3 text-accent-white focus:border-primary focus:outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-accent-gray text-xs font-bold uppercase tracking-widest mb-2">Email</label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                    className="w-full bg-surface-dark border border-surface-border rounded-lg px-4 py-3 text-accent-white focus:border-primary focus:outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-accent-gray text-xs font-bold uppercase tracking-widest mb-2">Phone</label>
                                <input
                                    type="tel"
                                    value={editForm.phone}
                                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                                    className="w-full bg-surface-dark border border-surface-border rounded-lg px-4 py-3 text-accent-white focus:border-primary focus:outline-none"
                                />
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 bg-surface-light border border-surface-border text-accent-gray py-3 rounded-lg font-bold uppercase tracking-wider text-sm hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-bold uppercase tracking-wider text-sm transition-colors"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentProfile;
