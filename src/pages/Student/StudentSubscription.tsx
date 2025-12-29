import React, { useState, useContext, useEffect } from 'react';
import api from '../../services/api';
import { FaCrown, FaCheck, FaTimes } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StudentSubscription: React.FC = () => {
    const { user, login } = useContext(AuthContext)!;
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Load Razorpay Script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        }
    }, []);

    const handleBuy = async (amount: number, planName: string) => {
        setLoading(true);
        try {
            // 1. Create Order
            const orderRes = await api.post('/api/payments/create-order', {
                amount: amount,
                currency: 'INR',
                planName: planName
            });
            const { id: order_id, amount: order_amount, currency, key_id } = orderRes.data;

            // 2. Open Razorpay Checkout
            const options = {
                key: key_id,
                amount: order_amount,
                currency: currency,
                name: 'EduTalks Academy',
                description: `${planName} Subscription`,
                order_id: order_id,
                handler: async function (response: any) {
                    try {
                        const verifyRes = await api.post('/api/payments/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            planName: planName
                        });

                        if (verifyRes.data.success) {
                            alert('Payment Successful! Premium Plan Activated.');
                            // Update local user context
                            if (user) {
                                const updatedUser = { ...user, plan_name: 'Pro' }; // You might want to be more specific if planName varies
                                login(localStorage.getItem('token') || '', updatedUser);
                            }
                            navigate('/student/profile');
                        }
                    } catch (verifyErr) {
                        console.error(verifyErr);
                        alert('Payment Verification Failed');
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                    contact: user?.phone || '',
                },
                theme: {
                    color: '#EE1D23'
                }
            };

            const rzp1 = new (window as any).Razorpay(options);
            rzp1.on('payment.failed', function (response: any) {
                alert(response.error.description);
            });
            rzp1.open();
            setLoading(false);

        } catch (err) {
            console.error(err);
            setLoading(false);
            alert('Failed to initiate payment.');
        }
    };

    return (
        <div className="min-h-screen pt-24 px-4 pb-20 max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-4">
                <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tighter">
                    Unlock <span className="text-yellow-500 italic">Excellence</span>
                </h1>
                <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                    Get unlimited access to live classes, premium materials, and competitive tournaments.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {/* Free Plan */}
                <div className={`bg-white dark:bg-surface-dark rounded-[2.5rem] p-8 border ${(!user?.plan_name || user.plan_name === 'Free') ? 'border-primary ring-4 ring-primary/10' : 'border-gray-200 dark:border-gray-800'} relative group hover:border-gray-400 transition-all`}>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Basic</h3>
                    <div className="text-4xl font-black text-gray-900 dark:text-white mb-6">Free</div>
                    <p className="text-sm text-gray-500 mb-8 font-medium">Get a taste of excellence with limited access.</p>
                    <ul className="space-y-4 mb-10 text-gray-600 dark:text-gray-400 font-bold text-sm">
                        <li className="flex items-center gap-3"><FaCheck className="text-green-500" /> Dashboard Access</li>
                        <li className="flex items-center gap-3"><FaCheck className="text-green-500" /> Basic Profile</li>
                        <li className="flex items-center gap-3 opacity-50"><FaTimes className="text-red-500" /> No Live Classes</li>
                        <li className="flex items-center gap-3 opacity-50"><FaTimes className="text-red-500" /> No Exams</li>
                    </ul>
                    <button
                        disabled={!user?.plan_name || user.plan_name === 'Free'}
                        className={`w-full py-3 rounded-xl border-2 font-bold transition-all ${(!user?.plan_name || user.plan_name === 'Free') ? 'bg-primary/10 border-primary text-primary cursor-default' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'}`}
                    >
                        {(!user?.plan_name || user.plan_name === 'Free') ? 'Current Plan' : 'Free Plan'}
                    </button>
                </div>

                {/* Monthly Plan */}
                <div className={`bg-white dark:bg-surface-dark rounded-[2.5rem] p-8 border-2 ${user?.plan_name === 'Monthly' ? 'border-primary ring-4 ring-primary/20' : 'border-primary'} relative shadow-2xl shadow-primary/20 transform hover:-translate-y-2 transition-transform`}>
                    <div className="absolute top-0 right-0 bg-primary text-white font-bold px-4 py-1 rounded-bl-xl text-[10px] uppercase tracking-widest">Most Popular</div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Pro Monthly</h3>
                    <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-4xl font-black text-gray-900 dark:text-white">₹1</span>
                        <span className="text-gray-500 dark:text-gray-400 font-bold text-sm">/month</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-8 font-medium">Perfect for short-term learning goals.</p>

                    <ul className="space-y-4 mb-10 text-gray-600 dark:text-gray-300 font-bold text-sm">
                        <li className="flex items-center gap-3"><FaCheck className="text-green-500" /> Unlimited Live Classes</li>
                        <li className="flex items-center gap-3"><FaCheck className="text-green-500" /> All Exams & Results</li>
                        <li className="flex items-center gap-3"><FaCheck className="text-green-500" /> Premium Materials</li>
                        <li className="flex items-center gap-3"><FaCheck className="text-green-500" /> Tournaments</li>
                    </ul>
                    <button
                        onClick={() => handleBuy(1, 'Monthly')}
                        disabled={loading || user?.plan_name === 'Monthly'}
                        className={`w-full py-3 rounded-xl font-bold transition-all disabled:opacity-70 ${user?.plan_name === 'Monthly' ? 'bg-green-500 text-white cursor-default' : 'bg-primary text-white hover:bg-primary-hover'}`}
                    >
                        {loading ? 'Processing...' : (user?.plan_name === 'Monthly' ? 'Current Plan' : 'Choose Monthly')}
                    </button>
                </div>

                {/* Yearly Plan */}
                <div className={`bg-white dark:bg-surface-dark rounded-[2.5rem] p-8 border-2 ${user?.plan_name === 'Yearly' ? 'border-yellow-500 ring-4 ring-yellow-500/20' : 'border-yellow-500'} relative shadow-2xl shadow-yellow-500/20 transform hover:-translate-y-2 transition-transform overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl -z-10"></div>
                    <div className="absolute top-0 right-0 bg-yellow-500 text-white font-bold px-4 py-1 rounded-bl-xl text-[10px] uppercase tracking-widest">Best Value</div>

                    <div className="flex items-center gap-2 mb-2">
                        <FaCrown className="text-yellow-500" />
                        <h3 className="text-xl font-black text-gray-900 dark:text-white">Pro Yearly</h3>
                    </div>
                    <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-4xl font-black text-gray-900 dark:text-white">₹4,999</span>
                        <span className="text-gray-500 dark:text-gray-400 font-bold text-sm">/year</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-8 font-medium">Save money with annual commitment.</p>

                    <ul className="space-y-4 mb-10 text-gray-600 dark:text-gray-300 font-bold text-sm">
                        <li className="flex items-center gap-3"><div className="p-1 rounded-full bg-yellow-100 text-yellow-600"><FaCheck size={10} /></div> All Monthly Features</li>
                        <li className="flex items-center gap-3"><div className="p-1 rounded-full bg-yellow-100 text-yellow-600"><FaCheck size={10} /></div> Priority Support</li>
                        <li className="flex items-center gap-3"><div className="p-1 rounded-full bg-yellow-100 text-yellow-600"><FaCheck size={10} /></div> Mentorship Access</li>
                        <li className="flex items-center gap-3"><div className="p-1 rounded-full bg-yellow-100 text-yellow-600"><FaCheck size={10} /></div> Save ~20%</li>
                    </ul>

                    <button
                        onClick={() => handleBuy(4999, 'Yearly')}
                        disabled={loading || user?.plan_name === 'Yearly'}
                        className={`w-full py-3 rounded-xl font-bold transition-all disabled:opacity-70 ${user?.plan_name === 'Yearly' ? 'bg-green-500 text-white cursor-default' : 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white hover:shadow-lg hover:shadow-yellow-500/30'}`}
                    >
                        {loading ? 'Processing...' : (user?.plan_name === 'Yearly' ? 'Current Plan' : 'Choose Yearly')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentSubscription;

