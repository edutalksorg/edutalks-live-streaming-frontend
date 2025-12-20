import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

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

    if (loading) return <div className="p-6">Loading dashboard data...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Dashboard Overview</h2>
                <button
                    onClick={() => navigate('/super-admin/users', { state: { openCreateModal: true } })}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg shadow transition-colors flex items-center gap-2"
                >
                    <span className="text-xl">+</span> Create New User
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div
                    onClick={() => navigate('/super-admin/users')}
                    className="bg-white p-6 rounded-lg shadow border-l-4 border-indigo-500 cursor-pointer hover:shadow-md transition-all"
                >
                    <div className="text-gray-500">Total Users</div>
                    <div className="text-2xl font-bold">{stats.totalUsers}</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
                    <div className="text-gray-500">Total Revenue</div>
                    <div className="text-2xl font-bold">₹ {stats.totalRevenue}</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
                    <div className="text-gray-500">Active Classes</div>
                    <div className="text-2xl font-bold">{stats.activeClasses}</div>
                </div>
                <div
                    onClick={() => navigate('/super-admin/users?filter=pending')}
                    className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500 cursor-pointer hover:shadow-md transition-all"
                >
                    <div className="text-gray-500">Pending Approvals</div>
                    <div className="text-2xl font-bold">{stats.pendingUsers}</div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
