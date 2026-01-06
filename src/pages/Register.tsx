import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FaEye, FaEyeSlash, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import Logo from '../components/Logo';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        grade: '10th',
        role: 'student',
        selected_course_id: ''
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
    const [subjects, setSubjects] = useState<{ id: number; name: string }[]>([]);

    const [showSuccess, setShowSuccess] = useState(false);

    const [educationLevel, setEducationLevel] = useState('');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get('/api/classes/categories');
                setCategories(res.data);
            } catch (err) {
                console.error("Failed to fetch categories");
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchSubjects = async () => {
            if (formData.grade && !['6th Class', '7th Class', '8th Class', '9th Class', '10th Class', '11th Class', '12th Class'].includes(formData.grade)) {
                try {
                    // Encode to handle characters like '&'
                    const encodedGrade = encodeURIComponent(formData.grade);
                    const res = await api.get(`/api/classes/categories/${encodedGrade}/subjects`);
                    setSubjects(res.data);
                } catch (err) {
                    console.error("Failed to fetch subjects");
                    setSubjects([]);
                }
            } else {
                setSubjects([]);
            }
        };
        fetchSubjects();
    }, [formData.grade]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const getFilteredCategories = () => {
        if (!educationLevel) return [];
        if (educationLevel === 'school') {
            return categories.filter(c => c.name.includes('Class'));
        } else {
            // UG or PG - Show Tech Categories
            return categories.filter(c => !c.name.includes('Class'));
        }
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
        <div className="min-h-screen bg-background-dark flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500">
            {/* Theme Toggle Position removed */}

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
                            <>
                                {/* Education Level Selection - NEW */}
                                <div className="space-y-3 animate-slideIn">
                                    <label className="block text-[10px] font-black text-accent-gray uppercase tracking-widest ml-1">
                                        Education Level
                                    </label>
                                    <select
                                        name="educationLevel"
                                        className="w-full"
                                        value={educationLevel}
                                        onChange={(e) => {
                                            setEducationLevel(e.target.value);
                                            setFormData({ ...formData, grade: '', selected_course_id: '' }); // Reset selections
                                        }}
                                        required={formData.role === 'student'}
                                    >
                                        <option value="">Select Level...</option>
                                        <option value="school">School Education (6th-12th)</option>
                                        <option value="ug">Undergraduate (UG)</option>
                                        <option value="pg">Postgraduate (PG)</option>
                                    </select>
                                </div>

                                {/* Filtered Category Selection */}
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-accent-gray uppercase tracking-widest ml-1">
                                        {educationLevel === 'school' ? 'Grade / Class' : 'Course / Stream'}
                                    </label>
                                    <select
                                        name="grade"
                                        className="w-full"
                                        value={formData.grade}
                                        onChange={handleChange}
                                        disabled={!educationLevel}
                                    >
                                        <option value="">Select Option...</option>
                                        {getFilteredCategories().map((cat) => (
                                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}


                        {/* Specific Course Selection - ONLY for School (Classes might have sub-subjects if needed, but for now we hide for UG/PG as Stream=Course) */}
                        {subjects.length > 0 && formData.role === 'student' && educationLevel === 'school' && (
                            <div className="space-y-3 animate-slideIn">
                                <label className="block text-[10px] font-black text-accent-gray uppercase tracking-widest ml-1">
                                    Select Specific Course
                                </label>
                                <select
                                    name="selected_course_id"
                                    className="w-full"
                                    value={formData.selected_course_id}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select a Course...</option>
                                    {subjects.map((sub) => (
                                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                                    ))}
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
                </form >

                <div className="text-center mt-10 pt-6 border-t border-surface-border">
                    <p className="text-[10px] font-black text-accent-gray uppercase tracking-widest">
                        Already have an account?
                        <Link to="/login" className="text-primary hover:text-primary-hover ml-2 underline transition-all">Log in</Link>
                    </p>
                </div>
            </div >

            {showSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-surface p-8 rounded-[2rem] max-w-sm w-full text-center shadow-[0_0_50px_rgba(238,29,35,0.15)] border border-surface-border relative overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="absolute inset-0 bg-primary/5 pointer-events-none"></div>
                        <div className="relative z-10">
                            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-1 ring-green-500/20">
                                <FaCheckCircle className="text-green-500 text-4xl" />
                            </div>
                            <h3 className="text-2xl font-black text-foreground mb-2 italic tracking-tighter">SUCCESS!</h3>
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
        </div >
    );
};

export default Register;
