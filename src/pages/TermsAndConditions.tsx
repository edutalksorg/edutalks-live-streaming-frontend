import React, { useEffect } from 'react';
import Footer from '../components/Footer';
import Logo from '../components/Logo';
import { Link } from 'react-router-dom';
import { FaGavel, FaExclamationTriangle, FaRegHandshake, FaMoneyCheckAlt, FaBan, FaUserCheck, FaWhatsapp, FaEnvelopeOpenText } from 'react-icons/fa';

const TermsAndConditions: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="font-sans text-accent-white bg-surface-dark min-h-screen relative overflow-x-hidden transition-colors duration-500">
            {/* Background Pattern Layer */}
            <div className="fixed inset-0 bg-pattern-dark pointer-events-none -z-10"></div>

            {/* Simple Header */}
            <nav className="fixed w-full z-50 glass-morphism border-b border-surface-border shadow-2xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <Link to="/" className="flex items-center">
                            <Logo size="md" className="drop-shadow-[0_0_8px_rgba(238,29,35,0.2)]" />
                        </Link>
                        <Link to="/" className="text-accent-gray font-black text-xs uppercase tracking-widest hover:text-primary transition-all">
                            Back to Home
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
                <header className="text-center mb-16 animate-in fade-in slide-in-from-top duration-1000">
                    <span className="px-5 py-2 bg-primary/10 text-primary text-[10px] font-black tracking-[0.3em] uppercase rounded-full border border-primary/20 inline-block mb-6">Terms of Service</span>
                    <h1 className="text-4xl lg:text-7xl font-black leading-[1.0] tracking-tighter text-accent-white mb-6">
                        Terms & <span className="text-gradient-red italic">Conditions</span>
                    </h1>
                    <p className="text-accent-gray font-medium italic opacity-60 uppercase tracking-widest text-[10px]">Effective Date: January 28, 2026</p>
                </header>

                <div className="space-y-12 relative z-10">
                    {/* Agreement Section */}
                    <section className="premium-card p-8 lg:p-12 border border-surface-border rounded-[2.5rem] bg-surface/50 backdrop-blur-xl">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center shadow-lg border border-primary/20">
                                <FaRegHandshake size={24} />
                            </div>
                            <h2 className="text-2xl lg:text-4xl font-black text-accent-white italic tracking-tight">Agreement to Terms</h2>
                        </div>
                        <p className="text-accent-gray leading-relaxed text-lg font-medium opacity-90">
                            By accessing or using the <span className="text-primary font-bold italic">EduTalks</span> platform, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our services. These terms apply to all visitors, students, instructors, and others who access the platform.
                        </p>
                    </section>

                    {/* User Accounts Section */}
                    <section className="space-y-8">
                        <div className="flex items-center gap-4 mb-4 px-4">
                            <div className="w-10 h-10 bg-surface-light text-accent-white rounded-xl flex items-center justify-center border border-white/5">
                                <FaUserCheck size={20} />
                            </div>
                            <h2 className="text-xl lg:text-3xl font-black text-accent-white uppercase tracking-tighter italic">User Responsibilities</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-surface p-8 rounded-[2rem] border border-white/5 hover:border-primary/20 transition-all group">
                                <h3 className="text-xl font-black text-accent-white mb-4 italic flex items-center gap-3">
                                    Account Security
                                </h3>
                                <p className="text-accent-gray text-sm leading-relaxed opacity-80">
                                    You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                                </p>
                            </div>

                            <div className="bg-surface p-8 rounded-[2rem] border border-white/5 hover:border-primary/20 transition-all group">
                                <h3 className="text-xl font-black text-accent-white mb-4 italic flex items-center gap-3">
                                    Accurate Information
                                </h3>
                                <p className="text-accent-gray text-sm leading-relaxed opacity-80">
                                    You must provide accurate and complete information when creating an account and keep it updated at all times.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Intellectual Property */}
                    <section className="premium-card p-8 lg:p-12 border border-surface-border rounded-[2.5rem] bg-surface/50 backdrop-blur-xl">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center shadow-lg border border-primary/20">
                                <FaGavel size={24} />
                            </div>
                            <h2 className="text-2xl lg:text-4xl font-black text-accent-white italic tracking-tight">Intellectual Property</h2>
                        </div>
                        <p className="text-accent-gray leading-relaxed text-lg font-medium opacity-90 mb-6">
                            The EduTalks platform and its original content (including but not limited to live streams, course materials, whiteboard captures, and tournament structures) are the exclusive property of <span className="text-primary font-bold italic">EduTalks Learning Pvt. Ltd.</span>
                        </p>
                        <ul className="space-y-4">
                            <li className="flex gap-4 items-center line-through opacity-50 decoration-primary decoration-2">
                                <FaBan className="text-primary shrink-0" size={16} />
                                <span className="text-accent-white font-medium">Recording or distributing live class sessions without prior consent.</span>
                            </li>
                            <li className="flex gap-4 items-center line-through opacity-50 decoration-primary decoration-2">
                                <FaBan className="text-primary shrink-0" size={16} />
                                <span className="text-accent-white font-medium">Commercial use of educational materials provided on the platform.</span>
                            </li>
                        </ul>
                    </section>

                    {/* Prohibited Activities */}
                    <section className="space-y-8">
                        <div className="flex items-center gap-4 mb-4 px-4">
                            <div className="w-10 h-10 bg-surface-light text-accent-white rounded-xl flex items-center justify-center border border-white/5">
                                <FaExclamationTriangle size={20} />
                            </div>
                            <h2 className="text-xl lg:text-3xl font-black text-accent-white uppercase tracking-tighter italic text-primary">Prohibited Conduct</h2>
                        </div>

                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                "Engaging in any form of harassment within live chats or doubt sessions.",
                                "Circumventing screen protection or recording prevention mechanisms.",
                                "Sharing account credentials with third parties (One user per account).",
                                "Disturbing the learning environment during live interactive sessions.",
                                "Attempting to reverse-engineer or hack the platform infrastructure.",
                                "Using scripts or automated tools to scrape platform content."
                            ].map((item, idx) => (
                                <li key={idx} className="bg-surface/30 p-4 rounded-xl border border-white/5 text-sm text-accent-gray flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full shrink-0"></div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* Subscriptions & Payments */}
                    <section className="premium-card p-8 lg:p-12 border border-surface-border rounded-[2.5rem] bg-surface/50 backdrop-blur-xl">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center shadow-lg border border-primary/20">
                                <FaMoneyCheckAlt size={24} />
                            </div>
                            <h2 className="text-2xl lg:text-4xl font-black text-accent-white italic tracking-tight">Subscriptions & Payments</h2>
                        </div>
                        <div className="space-y-6 text-accent-gray font-medium leading-relaxed">
                            <p>
                                <span className="text-accent-white font-bold italic block mb-2">Billing:</span>
                                Subscriptions are billed on a recurring basis as per the selected plan (Monthly or Yearly). Rates are inclusive of applicable taxes unless stated otherwise.
                            </p>
                            <p>
                                <span className="text-accent-white font-bold italic block mb-2">Cancellations:</span>
                                You may cancel your subscription at any time. However, sums already paid for the current billing cycle are non-refundable.
                            </p>
                            <p>
                                <span className="text-accent-white font-bold italic block mb-2">Free Trial:</span>
                                Free users may be granted limited access (e.g., 5-minute voice call trial) which is subject to change at our discretion.
                            </p>
                        </div>
                    </section>

                    {/* Limitation of Liability */}
                    {/* Contact Section */}
                    <section className="bg-surface-dark border border-white/10 p-8 lg:p-12 rounded-[3rem] text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                        <FaEnvelopeOpenText className="text-primary mx-auto mb-6 scale-125 opacity-30 group-hover:opacity-100 transition-all" size={48} />
                        <h2 className="text-3xl font-black text-accent-white mb-4 italic">Questions or Concerns?</h2>
                        <p className="text-accent-gray font-medium mb-8 max-w-lg mx-auto">
                            If you have any questions about these Terms and Conditions, please reach out to our legal team.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                            <a href="mailto:contact@edutalks.tech" className="btn-primary min-w-[200px] py-4 text-[10px] font-black uppercase tracking-widest italic shadow-xl shadow-primary/20">
                                Email Legal Team
                            </a>
                            <a
                                href="https://wa.me/917995674266"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 bg-[#25D366]/10 text-[#25D366] min-w-[200px] justify-center py-4 rounded-xl border border-[#25D366]/20 font-black uppercase tracking-widest text-[10px] hover:bg-[#25D366] hover:text-white transition-all shadow-xl hover:shadow-[#25D366]/20 group"
                            >
                                <FaWhatsapp size={20} className="group-hover:rotate-12 transition-transform" />
                                <span>WhatsApp Support</span>
                            </a>
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default TermsAndConditions;
