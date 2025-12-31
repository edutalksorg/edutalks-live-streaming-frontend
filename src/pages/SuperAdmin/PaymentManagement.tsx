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
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                <FaMoneyBillWave className="text-green-600" /> Payment History
            </h2>

            <div className="md:hidden space-y-4">
                {payments.length === 0 ? (
                    <div className="bg-white dark:bg-surface p-6 rounded-lg shadow text-center text-gray-500 dark:text-gray-400">
                        No payments found.
                    </div>
                ) : (
                    payments.map((payment) => (
                        <div key={payment.id} className="bg-white dark:bg-surface p-4 rounded-lg shadow border border-gray-200 dark:border-surface-border">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-gray-100">{payment.user_name}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{payment.user_email}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                                    ${payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        payment.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {payment.status}
                                </span>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Amount:</span>
                                    <span className="font-bold text-gray-900 dark:text-gray-100">{payment.currency} {payment.amount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Order ID:</span>
                                    <span className="font-mono text-gray-700 dark:text-gray-300 text-xs">{payment.order_id}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-surface-border mt-2">
                                    <span className="text-gray-500 dark:text-gray-400 text-xs">Date:</span>
                                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs">
                                        <FaCalendarAlt /> {new Date(payment.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="hidden md:block bg-white dark:bg-surface shadow rounded-lg overflow-hidden border border-gray-200 dark:border-surface-border">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-surface-light">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-surface divide-y divide-gray-200 dark:divide-gray-700">
                        {payments.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No payments found.</td>
                            </tr>
                        ) : (
                            payments.map((payment) => (
                                <tr key={payment.id}>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{payment.user_name}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{payment.user_email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {payment.order_id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-gray-100">
                                        {payment.currency} {payment.amount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                payment.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                        <FaCalendarAlt /> {new Date(payment.created_at).toLocaleDateString()}
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
