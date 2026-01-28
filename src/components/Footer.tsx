import React from 'react';
import Logo from './Logo';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaWhatsapp } from 'react-icons/fa';

const Footer: React.FC = () => {
    return (
        <footer className="bg-surface py-16 lg:py-24 border-t border-white/5 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-8 mb-16 items-start">
                    {/* Brand Section */}
                    <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-6">
                        <Logo size="lg" className="drop-shadow-[0_0_10px_rgba(238,29,35,0.3)] transition-transform hover:scale-105" />
                        <p className="text-accent-gray text-xs md:text-sm leading-relaxed font-medium opacity-80 max-w-xs">
                            Where Education Meets Conversation. Empowering the next generation of professionals through innovation and mentorship.
                        </p>
                        <div className="flex gap-3">
                            {[
                                { icon: FaFacebookF, href: "https://www.facebook.com/people/Edutalks/61578676177087/" },
                                { icon: FaInstagram, href: "https://www.instagram.com/edutalks_tech?igsh=MXZjcm5mcDB0MzNi" },
                                { icon: FaLinkedinIn, href: "https://www.linkedin.com/company/edutalks-pvt-ltd/posts/?feedView=all" }
                            ].map((social, i) => (
                                <a
                                    key={i}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-surface-light border border-white/5 flex items-center justify-center text-accent-gray hover:bg-primary hover:text-white hover:-translate-y-1 transition-all shadow-lg"
                                >
                                    <social.icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                        <h4 className="text-accent-white font-black text-[10px] md:text-xs uppercase tracking-[0.3em] mb-6 md:mb-8 italic">Quick Links</h4>
                        <ul className="space-y-3 md:space-y-4">
                            <li><a href="#about" className="text-accent-gray text-xs md:text-sm font-bold hover:text-primary transition-colors tracking-wide">About Us</a></li>
                            <li><a href="#features" className="text-accent-gray text-xs md:text-sm font-bold hover:text-primary transition-colors tracking-wide">Features</a></li>
                            <li><a href="#plans" className="text-accent-gray text-xs md:text-sm font-bold hover:text-primary transition-colors tracking-wide">Plans</a></li>
                            <li><Link to="/register" className="text-accent-gray text-xs md:text-sm font-bold hover:text-primary transition-colors tracking-wide">Join Now</Link></li>
                        </ul>
                    </div>

                    {/* Legal & Support */}
                    <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                        <h4 className="text-accent-white font-black text-[10px] md:text-xs uppercase tracking-[0.3em] mb-6 md:mb-8 italic">Legal & Support</h4>
                        <ul className="space-y-3 md:space-y-4">
                            <li><Link to="/privacy-policy" className="text-accent-gray text-xs md:text-sm font-bold hover:text-primary transition-colors tracking-wide">Privacy Policy</Link></li>
                            <li><Link to="/terms-and-conditions" className="text-accent-gray text-xs md:text-sm font-bold hover:text-primary transition-colors tracking-wide">Terms of Service</Link></li>
                            <li><a href="mailto:contact@edutalks.tech" className="text-accent-gray text-xs md:text-sm font-bold hover:text-primary transition-colors tracking-wide">Contact Us</a></li>
                        </ul>
                    </div>

                    {/* Contact Us */}
                    <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                        <h4 className="text-accent-white font-black text-[10px] md:text-xs uppercase tracking-[0.3em] mb-6 md:mb-8 italic">Contact Us</h4>
                        <ul className="space-y-5 md:space-y-6 w-full flex flex-col items-center sm:items-start">
                            <li className="flex items-center gap-4 group w-fit">
                                <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-surface-light border border-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-md shrink-0">
                                    <FaMapMarkerAlt size={14} />
                                </div>
                                <span className="text-accent-gray text-[11px] md:text-sm font-medium">Hyderabad, Telangana, India</span>
                            </li>
                            <li className="flex items-center gap-4 group w-fit">
                                <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-surface-light border border-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-md shrink-0">
                                    <FaPhoneAlt size={14} />
                                </div>
                                <div className="flex flex-col text-left">
                                    <a href="tel:+919640111233" className="text-accent-gray text-xs md:text-sm font-medium hover:text-primary transition-colors">+91 96401 11233</a>
                                    <a href="tel:+919505111233" className="text-accent-gray text-xs md:text-sm font-medium hover:text-primary transition-colors">+91 95051 11233</a>
                                </div>
                            </li>
                            <li className="flex items-center gap-4 group w-fit">
                                <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-surface-light border border-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-md shrink-0">
                                    <FaEnvelope size={14} />
                                </div>
                                <a href="mailto:contact@edutalks.tech" className="text-accent-gray text-[11px] md:text-sm font-medium hover:text-primary transition-colors break-all">contact@edutalks.tech</a>
                            </li>
                            <li className="pt-2 w-full flex justify-center sm:justify-start">
                                <a
                                    href="https://wa.me/917995674266"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-3 bg-[#25D366] text-white px-6 py-4 md:px-5 md:py-3 rounded-2xl md:rounded-xl font-black uppercase tracking-widest text-[10px] md:text-[9px] hover:bg-[#128C7E] transition-all hover:scale-105 shadow-xl shadow-[#25D366]/20 group w-full sm:w-auto justify-center"
                                >
                                    <FaWhatsapp size={20} className="group-hover:rotate-12 transition-transform" />
                                    WhatsApp support
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 md:pt-10 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
                    <p className="text-accent-gray text-[9px] md:text-[10px] font-black tracking-[0.4em] uppercase italic opacity-40 text-center sm:text-left leading-relaxed">
                        © 2026 EDUTALKS LEARNING PVT. LTD. <br className="sm:hidden" /> • MADE WITH <span className="text-primary">❤</span> IN INDIA.
                    </p>
                    <div className="flex gap-6 md:gap-8 text-[8px] md:text-[9px] font-black text-accent-gray uppercase tracking-[0.3em] italic opacity-40">
                        <span>All Rights Reserved</span>
                        <span>Secured by SSL</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
