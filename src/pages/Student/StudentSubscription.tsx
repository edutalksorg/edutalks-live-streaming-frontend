import React, { useState } from 'react';
import api from '../../services/api';
import { FaCrown, FaCheck } from 'react-icons/fa';

const StudentSubscription: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [active, setActive] = useState(false);

    const handleBuy = async () => {
        setLoading(true);
        try {
            // 1. Create Order
            const orderRes = await api.post('/payments/create-order', { amount: 4999, currency: 'INR' });
            const { id } = orderRes.data;

            // 2. Simulate Payment Process (Mock)
            setTimeout(async () => {
                // 3. Verify Payment
                await api.post('/payments/verify', {
                    orderId: id,
                    paymentId: 'pay_' + Math.random().toString(36).substr(2, 9),
                    signature: 'mock_sig'
                });

                setActive(true);
                setLoading(false);
                alert('Payment Successful! Premium Plan Activated.');
            }, 2000);

        } catch (err) {
            console.error(err);
            setLoading(false);
            alert('Payment Failed');
        }
    };

    if (active) {
        return (
            <div className="p-8 text-center bg-white rounded shadow m-6">
                <div className="text-green-500 text-6xl mb-4 flex justify-center"><FaCheck /></div>
                <h2 className="text-3xl font-bold">Premium Active</h2>
                <p className="text-gray-600">You have full access to all courses and tournaments.</p>
            </div>
        );
    }

    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold mb-8 text-center">Upgrade to Premium</h2>
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg border border-indigo-100 overflow-hidden">
                <div className="bg-indigo-600 p-6 text-white text-center">
                    <FaCrown className="text-5xl mx-auto mb-2 text-yellow-400" />
                    <h3 className="text-2xl font-bold">EduTalks Pro</h3>
                    <p className="opacity-90">Unlock Your Potential</p>
                </div>
                <div className="p-8">
                    <div className="text-center mb-6">
                        <span className="text-4xl font-bold text-gray-900">₹4,999</span>
                        <span className="text-gray-500">/year</span>
                    </div>
                    <ul className="space-y-3 mb-8 text-gray-600">
                        <li className="flex items-center gap-2"><FaCheck className="text-green-500" /> Unlimited Live Classes</li>
                        <li className="flex items-center gap-2"><FaCheck className="text-green-500" /> All Exam Series</li>
                        <li className="flex items-center gap-2"><FaCheck className="text-green-500" /> Premium Notes Download</li>
                        <li className="flex items-center gap-2"><FaCheck className="text-green-500" /> 1-on-1 Mentorship</li>
                    </ul>
                    <button
                        onClick={handleBuy}
                        disabled={loading}
                        className="w-full py-3 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : 'Buy Now'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentSubscription;
