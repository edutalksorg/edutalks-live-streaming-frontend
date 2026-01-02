import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { FaMoneyBillWave, FaCalendarAlt } from 'react-icons/fa';

interface Payment {
    id: number;
    user_name: string;
    user_email: string;
    order_id: string;
    payment_id: string;
    amount: number;
    currency: string;
    status: string;
    created_at: string;
}

const PaymentManagement: React.FC = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const res = await api.get('/api/payments');
            setPayments(res.data);
        } catch (err) {
            console.error('Failed to fetch payments', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading payments...</div>;

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-accent-white mb-6 flex items-center gap-2">
                <FaMoneyBillWave className="text-emerald-500" /> Payment History
            </h2>

            <div className="md:hidden space-y-4">
                {payments.length === 0 ? (
                    <div className="bg-surface p-6 rounded-lg shadow-premium text-center text-accent-gray border border-surface-border">
                        No payments found.
                    </div>
                ) : (
                    payments.map((payment) => (
                        <div key={payment.id} className="bg-surface p-4 rounded-lg shadow-premium border border-surface-border">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h4 className="font-bold text-accent-white">{payment.user_name}</h4>
                                    <p className="text-sm text-accent-gray">{payment.user_email}</p>
                                </div>
                                <span className={`px-3 py-1 text-xs font-black rounded-full uppercase tracking-widest
                                    ${payment.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                        payment.status === 'failed' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>
                                    {payment.status}
                                </span>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-accent-gray">Amount:</span>
                                    <span className="font-bold text-accent-white">{payment.currency} {payment.amount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-accent-gray">Order ID:</span>
                                    <span className="font-mono text-accent-white/70 text-xs">{payment.order_id}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-surface-border mt-2">
                                    <span className="text-accent-gray text-xs">Date:</span>
                                    <div className="flex items-center gap-1 text-accent-gray text-xs">
                                        <FaCalendarAlt /> {new Date(payment.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="hidden md:block bg-surface shadow-premium rounded-xl overflow-hidden border border-surface-border">
                <table className="min-w-full divide-y divide-surface-border">
                    <thead className="bg-surface-light">
                        <tr>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-accent-gray uppercase tracking-widest">User</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-accent-gray uppercase tracking-widest">Order ID</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-accent-gray uppercase tracking-widest">Amount</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-accent-gray uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-accent-gray uppercase tracking-widest">Date</th>
                        </tr>
                    </thead>
                    <tbody className="bg-surface divide-y divide-surface-border">
                        {payments.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No payments found.</td>
                            </tr>
                        ) : (
                            payments.map((payment) => (
                                <tr key={payment.id}>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-accent-white">{payment.user_name}</div>
                                        <div className="text-sm text-accent-gray">{payment.user_email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-accent-gray">
                                        {payment.order_id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-accent-white">
                                        {payment.currency} {payment.amount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-[10px] font-black rounded-full uppercase tracking-widest
                                            ${payment.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                payment.status === 'failed' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-accent-gray flex items-center gap-2">
                                        <FaCalendarAlt className="opacity-50" /> {new Date(payment.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PaymentManagement;
