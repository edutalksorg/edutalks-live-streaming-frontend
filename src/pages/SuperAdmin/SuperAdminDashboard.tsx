import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FaUsers, FaWallet, FaVideo, FaBell } from 'react-icons/fa';

const DashboardHome: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalRevenue: 0,
        activeClasses: 0,
        pendingUsers: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/api/super-admin/dashboard/stats');
                setStats(response.data);
            } catch (error) {
                console.error('Failed to fetch admin stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="p-10 text-center text-primary lg:text-3xl font-black uppercase tracking-widest animate-pulse italic">Accessing Master Control...</div>;

    return (
        <div className="transition-colors duration-500">
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-12 gap-6">
                <div>
                    <h2 className="text-4xl font-black text-foreground tracking-tighter italic uppercase">Master <span className="text-primary">Control</span></h2>
                    <p className="text-accent-gray mt-2 font-bold uppercase tracking-[0.2em] text-[10px] opacity-70">Overseeing the EduTalks Ecosystem</p>
                </div>
                <button
                    onClick={() => navigate('/super-admin/users', { state: { openCreateModal: true } })}
                    className="btn-primary flex items-center gap-4 px-10 py-5 scale-100 hover:scale-[1.05] active:scale-95 text-[10px] font-black uppercase tracking-widest shadow-primary/30"
                >
                    <span className="text-2xl leading-none">+</span> CREATE NEW USER
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: 'Total Users', value: stats.totalUsers, accent: 'text-accent-blue', border: 'border-accent-blue', icon: FaUsers, path: '/super-admin/users' },
                    { label: 'Total Revenue', value: `₹ ${stats.totalRevenue.toLocaleString()}`, accent: 'text-accent-emerald', border: 'border-accent-emerald', icon: FaWallet, path: '#' },
                    { label: 'Active Classes', value: stats.activeClasses, accent: 'text-accent-purple', border: 'border-accent-purple', icon: FaVideo, path: '#' },
                    { label: 'Pending Approvals', value: stats.pendingUsers, accent: 'text-primary', border: 'border-primary', icon: FaBell, path: '/super-admin/users', filter: 'pending' }
                ].map((item, idx) => (
                    <div
                        key={idx}
                        onClick={() => item.path !== '#' && navigate(`${item.path}${item.filter ? `?filter=${item.filter}` : ''}`)}
                        className={`relative overflow-hidden bg-surface p-10 rounded-[2.5rem] shadow-premium border border-surface-border border-l-8 ${item.border} cursor-pointer hover:shadow-premium-hover hover:-translate-y-2 transition-all group`}
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
        </div>
    );
};

export default DashboardHome;
