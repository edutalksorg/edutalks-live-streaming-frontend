import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            await api.post('/api/auth/forgot-password', { email });
            setMessage('If that email exists, a password reset link has been sent.');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            setMessage(err.response?.data?.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-4">
            <div className="premium-card p-8 max-w-md w-full border-surface-border">
                <h2 className="text-3xl font-black text-accent-white italic tracking-tighter uppercase mb-6">
                    FORGOT <span className="text-primary">PASSWORD</span>
                </h2>
                <p className="text-accent-gray text-sm mb-6">
                    Enter your email address and we'll send you a link to reset your password.
                </p>

                {message && (
                    <div className={`p-4 rounded-lg mb-6 ${message.includes('sent') ? 'bg-accent-emerald/10 text-accent-emerald' : 'bg-primary/10 text-primary'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-accent-gray text-xs font-bold uppercase tracking-widest mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-surface-dark border border-surface-border rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-bold uppercase tracking-wider text-sm transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="w-full bg-surface-light border border-surface-border text-accent-gray py-3 rounded-lg font-bold uppercase tracking-wider text-sm hover:text-white transition-colors"
                    >
                        Back to Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
