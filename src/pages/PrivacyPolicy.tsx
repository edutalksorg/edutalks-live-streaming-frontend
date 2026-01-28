import React, { useEffect } from 'react';
import Footer from '../components/Footer';
import Logo from '../components/Logo';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaLock, FaUserSecret, FaDatabase, FaCookieBite, FaEnvelopeOpenText, FaWhatsapp } from 'react-icons/fa';

const PrivacyPolicy: React.FC = () => {
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
                    <span className="px-5 py-2 bg-primary/10 text-primary text-[10px] font-black tracking-[0.3em] uppercase rounded-full border border-primary/20 inline-block mb-6">Legal Information</span>
                    <h1 className="text-4xl lg:text-7xl font-black leading-[1.0] tracking-tighter text-accent-white mb-6">
                        Privacy <span className="text-gradient-red italic">Policy</span>
                    </h1>
                    <p className="text-accent-gray font-medium italic opacity-60 uppercase tracking-widest text-[10px]">Last Updated: January 28, 2026</p>
                </header>

                <div className="space-y-12 relative z-10">
                    {/* Introduction Section */}
                    <section className="premium-card p-8 lg:p-12 border border-surface-border rounded-[2.5rem] bg-surface/50 backdrop-blur-xl">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center shadow-lg border border-primary/20">
                                <FaShieldAlt size={24} />
                            </div>
                            <h2 className="text-2xl lg:text-4xl font-black text-accent-white italic tracking-tight">Introduction</h2>
                        </div>
                        <p className="text-accent-gray leading-relaxed text-lg font-medium opacity-90">
                            At <span className="text-primary font-bold italic">EduTalks Learning Pvt. Ltd.</span> ("EduTalks", "we", "us", or "our"), we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our live streaming platform, website, and related services.
                        </p>
                    </section>

                    {/* Data Collection Section */}
                    <section className="space-y-8">
                        <div className="flex items-center gap-4 mb-4 px-4">
                            <div className="w-10 h-10 bg-surface-light text-accent-white rounded-xl flex items-center justify-center border border-white/5">
                                <FaDatabase size={20} />
                            </div>
                            <h2 className="text-xl lg:text-3xl font-black text-accent-white uppercase tracking-tighter italic">Information We Collect</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-surface p-8 rounded-[2rem] border border-white/5 hover:border-primary/20 transition-all group">
                                <h3 className="text-xl font-black text-accent-white mb-4 flex items-center gap-3">
                                    <div className="w-2 h-2 bg-primary rounded-full"></div> Personal Information
                                </h3>
                                <p className="text-accent-gray text-sm leading-relaxed opacity-80">
                                    Name, email address, phone number, and account credentials when you register for an account.
                                </p>
                            </div>

                            <div className="bg-surface p-8 rounded-[2rem] border border-white/5 hover:border-primary/20 transition-all group">
                                <h3 className="text-xl font-black text-accent-white mb-4 flex items-center gap-3">
                                    <div className="w-2 h-2 bg-primary rounded-full"></div> Educational Data
                                </h3>
                                <p className="text-accent-gray text-sm leading-relaxed opacity-80">
                                    Class participation, exam submissions, tournament results, and academic progress tracking.
                                </p>
                            </div>

                            <div className="bg-surface p-8 rounded-[2rem] border border-white/5 hover:border-primary/20 transition-all group">
                                <h3 className="text-xl font-black text-accent-white mb-4 flex items-center gap-3">
                                    <div className="w-2 h-2 bg-primary rounded-full"></div> Interaction Data
                                </h3>
                                <p className="text-accent-gray text-sm leading-relaxed opacity-80">
                                    Whiteboard activities, voice recordings during live sessions, doubt session history, and chat messages.
                                </p>
                            </div>

                            <div className="bg-surface p-8 rounded-[2rem] border border-white/5 hover:border-primary/20 transition-all group">
                                <h3 className="text-xl font-black text-accent-white mb-4 flex items-center gap-3">
                                    <div className="w-2 h-2 bg-primary rounded-full"></div> Payment Details
                                </h3>
                                <p className="text-accent-gray text-sm leading-relaxed opacity-80">
                                    Transaction history and subscription details. We process payments through secure third-party gateways (e.g., Razorpay) and do not store your full card numbers.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* How We Use Your Data Section */}
                    <section className="premium-card p-8 lg:p-12 border border-surface-border rounded-[2.5rem] bg-surface/50 backdrop-blur-xl">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center shadow-lg border border-primary/20">
                                <FaLock size={24} />
                            </div>
                            <h2 className="text-2xl lg:text-4xl font-black text-accent-white italic tracking-tight">How We Use Your Information</h2>
                        </div>
                        <ul className="space-y-6">
                            {[
                                "To provide and maintain our services, including live classroom functionality.",
                                "To manage your account and subscription plans.",
                                "To process academic results for exams and global tournaments.",
                                "To improve platform performance and personalize your learning experience.",
                                "To communicate updates, security alerts, and promotional offers.",
                                "To ensure platform safety and prevent unauthorized recording or use of intellectual property."
                            ].map((item, idx) => (
                                <li key={idx} className="flex gap-4 items-start">
                                    <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-1">
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_#ee1d23]"></div>
                                    </div>
                                    <span className="text-accent-gray font-medium leading-relaxed">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* Security & Data Sharing */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <section className="bg-surface p-8 rounded-[2.5rem] border border-white/5">
                            <div className="flex items-center gap-4 mb-6">
                                <FaUserSecret className="text-primary" size={24} />
                                <h3 className="text-xl font-black text-accent-white italic">Third-Party Sharing</h3>
                            </div>
                            <p className="text-accent-gray text-sm leading-relaxed opacity-80">
                                We do not sell your personal data. We share information only with trusted service providers (like hosting partners and payment processors) who assist us in operating our platform, subject to strict confidentiality agreements.
                            </p>
                        </section>

                        <section className="bg-surface p-8 rounded-[2.5rem] border border-white/5">
                            <div className="flex items-center gap-4 mb-6">
                                <FaCookieBite className="text-primary" size={24} />
                                <h3 className="text-xl font-black text-accent-white italic">Cookies & Tracking</h3>
                            </div>
                            <p className="text-accent-gray text-sm leading-relaxed opacity-80">
                                We use cookies and similar tracking technologies to track platform activity and store certain information to enhance your session stability and authentication security.
                            </p>
                        </section>
                    </div>

                    {/* Contact Section */}
                    <section className="bg-surface-dark border border-white/10 p-8 lg:p-12 rounded-[3rem] text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                        <FaEnvelopeOpenText className="text-primary mx-auto mb-6 scale-125 opacity-30 group-hover:opacity-100 transition-all" size={48} />
                        <h2 className="text-3xl font-black text-accent-white mb-4 italic">Questions or Concerns?</h2>
                        <p className="text-accent-gray font-medium mb-8 max-w-lg mx-auto">
                            If you have any questions about this Privacy Policy or our data practices, please reach out to our legal team.
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

export default PrivacyPolicy;
