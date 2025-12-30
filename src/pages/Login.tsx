import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import Logo from '../components/Logo';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext)!;
    const { theme } = useTheme();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/api/auth/login', { email, password });
            const { token, user } = res.data;
            login(token, user);

            switch (user.role) {
                case 'super_admin': navigate('/super-admin'); break;
                case 'admin': navigate('/admin'); break;
                case 'super_instructor': navigate('/super-instructor'); break;
                case 'instructor': navigate('/instructor'); break;
                case 'student': navigate('/student'); break;
                default: navigate('/');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''} bg-surface-dark flex items-center justify-center relative overflow-hidden transition-colors duration-500`}>
            {/* Theme Toggle Position */}
            <div className="absolute top-8 right-8">
                <ThemeToggle />
            </div>

            {/* Background Pattern */}
            <div className="fixed inset-0 bg-pattern-dark pointer-events-none -z-10"></div>

            <div className="max-w-md w-full premium-card p-10 animate-in fade-in zoom-in duration-700 relative">
                <div className="absolute top-6 left-6">
                    <Link to="/" className="flex items-center gap-2 text-accent-gray/60 text-[10px] font-black uppercase tracking-widest hover:text-primary transition-all group">
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back
                    </Link>
                </div>
                <div className="text-center mb-10">
                    <Logo size="lg" className={`justify-center mb-6 ${theme === 'dark' ? 'drop-shadow-[0_0_8px_rgba(238,29,35,0.2)]' : 'hover:scale-105 transition-transform'}`} />
                    <h2 className="text-3xl font-black text-accent-white italic mb-2">Welcome Back</h2>
                    <p className="text-accent-gray uppercase tracking-[0.2em] text-[10px] font-black">Sign in to your account</p>
                </div>

                {error && (
                    <div className="bg-primary/10 border border-primary/20 text-primary p-4 rounded-xl mb-6 text-xs font-bold animate-pulse text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-accent-gray uppercase tracking-widest ml-1 italic">Email Address</label>
                            <input
                                type="email"
                                className="w-full bg-surface-dark border-surface-border rounded-xl px-5 py-4 focus:ring-primary transition-all"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="name@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-accent-gray uppercase tracking-widest ml-1 italic">Password</label>
                            <input
                                type="password"
                                className="w-full bg-surface-dark border-surface-border rounded-xl px-5 py-4 focus:ring-primary transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="text-right">
                            <Link to="/forgot-password" className="text-[10px] font-black text-primary hover:text-primary-hover uppercase tracking-widest transition-colors">
                                Forgot Password?
                            </Link>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-5 text-sm font-black uppercase tracking-[0.3em] shadow-xl hover:-translate-y-1 mt-4"
                    >
                        {loading ? 'Authenticating...' : 'Secure Access'}
                    </button>
                </form>

                <div className="mt-10 pt-8 border-t border-surface-border text-center">
                    <p className="text-[10px] font-black text-accent-gray uppercase tracking-[0.2em]">
                        Don't have an account?
                        <Link to="/register" className="text-primary hover:text-primary-hover ml-2 underline transition-all">Join EduTalks</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
