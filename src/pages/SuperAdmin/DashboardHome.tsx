import React from 'react';

const DashboardHome: React.FC = () => {
    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-indigo-500">
                    <div className="text-gray-500">Total Users</div>
                    <div className="text-2xl font-bold">120</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
                    <div className="text-gray-500">Total Revenue</div>
                    <div className="text-2xl font-bold">₹ 54,000</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
                    <div className="text-gray-500">Active Classes</div>
                    <div className="text-2xl font-bold">8</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
                    <div className="text-gray-500">Pending Doubts</div>
                    <div className="text-2xl font-bold">45</div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
