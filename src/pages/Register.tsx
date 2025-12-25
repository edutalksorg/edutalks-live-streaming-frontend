import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FaEye, FaEyeSlash, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import Logo from '../components/Logo';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        grade: '10th',
        role: 'student'
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [showSuccess, setShowSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/api/auth/register', formData);
            setShowSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''} bg-surface-dark flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500`}>
            {/* Theme Toggle Position */}
            <div className="absolute top-8 right-8">
                <ThemeToggle />
            </div>

            {/* Background Pattern */}
            <div className="fixed inset-0 bg-pattern-dark pointer-events-none -z-10"></div>

            <div className="max-w-xl w-full premium-card p-10 animate-in fade-in zoom-in duration-700">
                <div className="absolute top-8 left-8">
                    <Link to="/" className="flex items-center gap-2 text-accent-gray text-xs font-bold uppercase tracking-wider hover:text-primary transition-all group">
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back
                    </Link>
                </div>
                <div className="text-center mb-10">
                    <Logo size="xl" className="justify-center mb-6 hover:scale-105 transition-all duration-500 drop-shadow-primary-glow" />
                    <h2 className="text-4xl font-black text-accent-white italic mb-2 tracking-tighter">CREATE <span className="text-primary">ACCOUNT</span></h2>
                    <p className="text-accent-gray uppercase tracking-[0.3em] text-[10px] font-black opacity-70">Join the Academic Revolution</p>
                </div>

                {error && (
                    <div className="bg-primary/10 border border-primary/20 text-primary p-5 rounded-2xl mb-8 text-[10px] font-black uppercase tracking-widest animate-pulse text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="bg-surface-light/40 p-8 rounded-[2rem] border border-surface-border">
                        <label className="block text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4 ml-1">Account Role</label>
                        <select
                            name="role"
                            className="w-full"
                            value={formData.role}
                            onChange={handleChange}
                        >
                            <option value="student">Student Account</option>
                            <option value="instructor">Instructor Account</option>
                            <option value="super_instructor">Super Instructor</option>
                            <option value="admin">Administrative Admin</option>
                        </select>
                        <p className="text-[9px] text-accent-gray mt-4 font-bold uppercase tracking-wider ml-1 opacity-70 italic font-medium">
                            {formData.role === 'student'
                                ? '• Instant academic access'
                                : '• Requires Super Admin verification'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-accent-gray uppercase tracking-widest ml-1">Your Name</label>
                            <input
                                type="text" name="name" required
                                className="w-full"
                                value={formData.name} onChange={handleChange}
                                placeholder="Aaditya Verma"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-accent-gray uppercase tracking-widest ml-1">Email Node</label>
                            <input
                                type="email" name="email" required
                                className="w-full"
                                value={formData.email} onChange={handleChange}
                                placeholder="aaditya@edutalks.com"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-accent-gray uppercase tracking-widest ml-1">Phone Line</label>
                            <input
                                type="tel" name="phone" required
                                className="w-full"
                                value={formData.phone} onChange={handleChange}
                                placeholder="+91 00000 00000"
                            />
                        </div>

                        {(formData.role === 'student' || formData.role === 'instructor' || formData.role === 'super_instructor') && (
                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-accent-gray uppercase tracking-widest ml-1">
                                    {formData.role === 'student' ? 'Current Grade' : 'Teaching Level'}
                                </label>
                                <select
                                    name="grade"
                                    className="w-full"
                                    value={formData.grade} onChange={handleChange}
                                >
                                    <option value="6th">6th Grade</option>
                                    <option value="7th">7th Grade</option>
                                    <option value="8th">8th Grade</option>
                                    <option value="9th">9th Grade</option>
                                    <option value="10th">10th Grade</option>
                                    <option value="11th">11th Grade</option>
                                    <option value="12th">12th Grade</option>
                                </select>
                            </div>
                        )}

                        <div className="md:col-span-2 space-y-3">
                            <label className="block text-[10px] font-black text-accent-gray uppercase tracking-widest ml-1">Secure Encryption</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    required
                                    className="w-full pr-16"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-6 flex items-center text-accent-gray hover:text-primary transition-all active:scale-95"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full btn-primary py-6"
                    >
                        {formData.role === 'student' ? 'Access Learning Hub' : 'Initialize Registration'}
                    </button>
                </form>

                <div className="text-center mt-10 pt-6 border-t border-surface-border">
                    <p className="text-[10px] font-black text-accent-gray uppercase tracking-widest">
                        Already have an account?
                        <Link to="/login" className="text-primary hover:text-primary-hover ml-2 underline transition-all">Log in</Link>
                    </p>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-surface p-8 rounded-[2rem] max-w-sm w-full text-center shadow-[0_0_50px_rgba(238,29,35,0.15)] border border-white/10 relative overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="absolute inset-0 bg-primary/5 pointer-events-none"></div>
                        <div className="relative z-10">
                            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-1 ring-green-500/20">
                                <FaCheckCircle className="text-green-500 text-4xl" />
                            </div>
                            <h3 className="text-2xl font-black text-accent-white mb-2 italic tracking-tighter">SUCCESS!</h3>
                            <p className="text-accent-gray text-xs font-bold uppercase tracking-widest mb-8 leading-relaxed">
                                {formData.role === 'student'
                                    ? 'Your account has been created successfully.'
                                    : 'Registration submitted for Admin approval.'}
                            </p>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full btn-primary py-4 hover:scale-105 active:scale-95 shadow-lg shadow-primary/25"
                            >
                                CONTINUE TO LOGIN
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Register;
