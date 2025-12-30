import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const ResetPassword: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            await api.post('/api/auth/reset-password', { token, newPassword });
            setMessage('Password reset successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-4">
            <div className="premium-card p-8 max-w-md w-full border-surface-border">
                <h2 className="text-3xl font-black text-accent-white italic tracking-tighter uppercase mb-6">
                    RESET <span className="text-primary">PASSWORD</span>
                </h2>
                <p className="text-accent-gray text-sm mb-6">
                    Enter your new password below.
                </p>

                {message && (
                    <div className="p-4 rounded-lg mb-6 bg-accent-emerald/10 text-accent-emerald">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="p-4 rounded-lg mb-6 bg-primary/10 text-primary">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-accent-gray text-xs font-bold uppercase tracking-widest mb-2">
                            New Password
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-surface-dark border border-surface-border rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-accent-gray text-xs font-bold uppercase tracking-widest mb-2">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-surface-dark border border-surface-border rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-bold uppercase tracking-wider text-sm transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword;
