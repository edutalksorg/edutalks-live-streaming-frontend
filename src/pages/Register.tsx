import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FaUserGraduate, FaEye, FaEyeSlash } from 'react-icons/fa';

const Register: React.FC = () => {
    const navigate = useNavigate();
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/api/auth/register', formData);
            alert('Registration Successful! Please login.');
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-indigo-600 py-6 px-8 text-center">
                    <FaUserGraduate className="mx-auto text-white text-4xl mb-2" />
                    <h2 className="text-2xl font-bold text-white">Create Account</h2>
                    <p className="text-indigo-200 text-sm mt-1">Join EduTalks today</p>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded text-sm mb-4 border border-red-100">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Register As</label>
                            <select
                                name="role"
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                value={formData.role}
                                onChange={handleChange}
                            >
                                <option value="student">Student</option>
                                <option value="instructor">Instructor</option>
                                <option value="super_instructor">Super Instructor</option>
                                <option value="admin">Admin</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                {formData.role === 'student'
                                    ? 'Instant access. Payment required for premium.'
                                    : 'Account requires Super Admin approval.'}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input
                                type="text" name="name" required
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                value={formData.name} onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input
                                type="email" name="email" required
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                value={formData.email} onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <input
                                type="tel" name="phone" required
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                value={formData.phone} onChange={handleChange}
                            />
                        </div>

                        {formData.role === 'student' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Grade / Class</label>
                                <select
                                    name="grade"
                                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                    value={formData.grade} onChange={handleChange}
                                >
                                    <option value="6th">6th Grade</option>
                                    <option value="7th">7th Grade</option>
                                    <option value="8th">8th Grade</option>
                                    <option value="9th">9th Grade</option>
                                    <option value="10th">10th Grade</option>
                                    <option value="11th">11th Grade</option>
                                    <option value="12th">12th Grade</option>
                                    <option value="NEET">NEET Dropper</option>
                                    <option value="JEE">JEE Mains</option>
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    required
                                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-indigo-600 focus:outline-none"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow transition duration-200"
                        >
                            {formData.role === 'student' ? 'Register & Pay' : 'Submit Request'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-600">
                        Already have an account? <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">Log in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
