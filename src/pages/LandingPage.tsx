import Logo from '../components/Logo';
import { Link } from 'react-router-dom';
import { FaVideo, FaChalkboardTeacher, FaChartLine, FaUserShield, FaCheckCircle, FaCode } from 'react-icons/fa';
import ThemeToggle from '../components/ThemeToggle';


const LandingPage: React.FC = () => {


    return (
        <div className="font-sans text-accent-white bg-surface-dark min-h-screen relative overflow-x-hidden transition-colors duration-500">
            {/* Background Pattern Layer */}
            <div className="fixed inset-0 bg-pattern-dark pointer-events-none -z-10"></div>



            {/* Navbar */}
            <nav className="fixed w-full z-50 glass-morphism border-b border-surface-border shadow-2xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex items-center">
                            <Logo size="md" className="drop-shadow-[0_0_8px_rgba(238,29,35,0.2)]" />
                        </div>
                        <div className="hidden md:flex space-x-10 items-center">
                            <a href="#features" className="text-accent-gray font-black text-xs uppercase tracking-widest hover:text-primary transition-all">Features</a>
                            <a href="#plans" className="text-accent-gray font-black text-xs uppercase tracking-widest hover:text-primary transition-all">Plans</a>
                            <a href="#about" className="text-accent-gray font-black text-xs uppercase tracking-widest hover:text-primary transition-all">About</a>
                            <ThemeToggle />
                            <Link to="/login" className="text-accent-gray font-black text-xs uppercase tracking-widest hover:text-primary transition-all">Login</Link>
                            <Link to="/register" className="btn-primary shadow-lg shadow-primary/30 scale-105 px-8">
                                Join Now
                            </Link>
                        </div>
                        {/* Mobile Menu Button - Placeholder if needed, or just keep simple for now */}
                        <div className="md:hidden flex items-center gap-4">
                            <Link to="/login" className="text-accent-gray font-black text-[10px] uppercase tracking-widest">Login</Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-16">
                    <div className="md:w-1/2 space-y-10 animate-in fade-in slide-in-from-left duration-1000">
                        <span className="px-5 py-2 bg-primary/10 text-primary text-[10px] font-black tracking-[0.3em] uppercase rounded-full border border-primary/20">Welcome to Future</span>
                        <h1 className="text-5xl md:text-8xl font-black leading-[1.0] tracking-tighter text-accent-white">
                            <span className="text-gradient-red italic">Master</span> Your <span className="text-accent-white">Future</span>
                        </h1>
                        <p className="text-xl text-accent-gray leading-relaxed max-w-lg font-medium">
                            Experience the classroom of tomorrow. Join India's <span className="text-primary font-black">#1 Live Learning</span> platform for young achievers.
                        </p>
                        <div className="flex flex-wrap gap-6 pt-4">
                            <Link to="/register" className="btn-primary text-xl px-12 py-5 shadow-2xl shadow-primary/40 transform hover:scale-110 transition-all">
                                Join for Free
                            </Link>
                        </div>
                    </div>
                    <div className="md:w-1/2 relative group animate-in fade-in slide-in-from-right duration-1000">
                        <div className="absolute inset-0 bg-primary/20 rounded-[3rem] filter blur-[120px] opacity-40 group-hover:opacity-60 transition-opacity"></div>
                        <div className="relative premium-card p-3 border-[10px] border-surface-border overflow-hidden rounded-[3rem] shadow-2xl rotate-3 group-hover:rotate-0 transition-all duration-700">
                            <img
                                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80"
                                alt="Student Learning"
                                className="rounded-[2rem] object-cover w-full h-[500px]"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-32 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-24">
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4 block">Our Expertise</span>
                        <h2 className="text-4xl md:text-7xl font-black tracking-tighter text-accent-white">
                            Everything <span className="text-gradient-red italic">to Excel</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: FaVideo, title: "Live Classes", desc: "HD Video streaming with real-time interaction. Feel the energy of real classrooms." },
                            { icon: FaChalkboardTeacher, title: "Best Mentors", desc: "Learn from industry experts with proven success records and elite pedagogy." },
                            { icon: FaChartLine, title: "Smart Progress", desc: "Advanced AI-driven analytics to track your growth and identify weak spots." }
                        ].map((feature, idx) => (
                            <div key={idx} className="bg-surface p-12 rounded-[2.5rem] border border-surface-border hover:border-primary/40 group transition-all duration-500 hover:-translate-y-4 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/20 transition-all"></div>
                                <div className="w-20 h-20 bg-surface-light text-accent-white rounded-2xl flex items-center justify-center mb-10 group-hover:bg-primary group-hover:rotate-6 transition-all duration-500 shadow-xl border border-surface-border">
                                    <feature.icon size={36} />
                                </div>
                                <h4 className="text-3xl font-black text-accent-white mb-6 italic">{feature.title}</h4>
                                <p className="text-accent-gray leading-relaxed text-lg font-medium opacity-80 group-hover:opacity-100 transition-opacity">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section - Highlight */}
            <section className="py-24 bg-surface-dark/80 backdrop-blur-3xl border-y border-white/5 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                    {[
                        { val: "500+", label: "Live Daily" },
                        { val: "10k+", label: "Students" },
                        { val: "50+", label: "Experts" },
                        { val: "4.9", label: "Rating" }
                    ].map((s, i) => (
                        <div key={i} className="group cursor-default">
                            <div className="text-6xl font-black text-primary italic tracking-tighter group-hover:scale-110 transition-transform">{s.val}</div>
                            <div className="text-accent-gray font-black tracking-[0.3em] uppercase text-[10px] opacity-60 group-hover:opacity-100 transition-opacity mt-2">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Plans Section */}
            <section id="plans" className="py-32 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-24">
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4 block">Pricing Plans</span>
                        <h2 className="text-4xl md:text-7xl font-black text-accent-white tracking-tighter">
                            Affordable <span className="text-gradient-red italic">Excellence</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto items-stretch">
                        {/* Monthly Card */}
                        <div className="bg-surface p-12 flex flex-col items-start rounded-[2.5rem] border border-white/5 hover:border-primary/20 transition-all group shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
                            <span className="text-[10px] font-black text-accent-gray uppercase tracking-[0.3em] mb-8">Standard Monthly</span>
                            <div className="flex items-baseline gap-2 mb-10">
                                <span className="text-6xl font-black text-accent-white tracking-tighter group-hover:text-primary transition-colors italic">₹499</span>
                                <span className="text-accent-gray font-bold uppercase text-xs tracking-widest">/mo</span>
                            </div>
                            <div className="w-full h-px bg-white/5 mb-10"></div>
                            <ul className="space-y-6 flex-grow w-full mb-10">
                                <li className="flex items-center gap-4 text-accent-gray font-black text-[10px] uppercase tracking-widest italic opacity-70 group-hover:opacity-100 transition-opacity"><div className="w-1.5 h-1.5 bg-primary rounded-full"></div> All Live Classes</li>
                                <li className="flex items-center gap-4 text-accent-gray font-black text-[10px] uppercase tracking-widest italic opacity-70 group-hover:opacity-100 transition-opacity"><div className="w-1.5 h-1.5 bg-primary rounded-full"></div> Recorded Backup</li>
                                <li className="flex items-center gap-4 text-accent-gray font-black text-[10px] uppercase tracking-widest italic opacity-70 group-hover:opacity-100 transition-opacity"><div className="w-1.5 h-1.5 bg-primary rounded-full"></div> Weekly Quizzes</li>
                            </ul>
                            <Link to="/register" className="w-full py-5 bg-background-dark border border-surface-border text-accent-white font-black rounded-2xl hover:bg-primary transition-all uppercase tracking-[0.2em] text-[10px] italic text-center block">Get Monthly</Link>
                        </div>

                        {/* Yearly Card */}
                        <div className="bg-surface-dark p-12 flex flex-col items-start rounded-[3rem] shadow-[0_30px_100px_rgba(238,29,35,0.15)] relative z-10 border-[3px] border-primary group overflow-hidden transform hover:scale-[1.02] transition-all duration-500">
                            <div className="absolute top-0 right-0 w-48 h-full bg-primary/5 -skew-x-12 translate-x-1/2"></div>
                            <div className="absolute top-6 right-6 bg-primary text-white px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase shadow-[0_0_15px_#ee1d23]">Best Value</div>
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-8 italic">Premium Annual</span>
                            <div className="flex items-baseline gap-2 mb-10">
                                <span className="text-7xl font-black text-accent-white italic tracking-tighter group-hover:scale-105 transition-transform cursor-default">₹5000</span>
                                <span className="text-accent-gray font-bold uppercase text-xs tracking-widest">/yr</span>
                            </div>
                            <div className="w-full h-px bg-white/10 mb-10 relative z-10"></div>
                            <ul className="space-y-6 flex-grow w-full mb-10 relative z-10">
                                <li className="flex items-center gap-4 text-accent-white font-black text-[10px] uppercase tracking-widest italic"><div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_#ee1d23]"></div> 2 Months Free Included</li>
                                <li className="flex items-center gap-4 text-accent-white font-black text-[10px] uppercase tracking-widest italic"><div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_#ee1d23]"></div> Full Course Access</li>
                                <li className="flex items-center gap-4 text-accent-white font-black text-[10px) uppercase tracking-widest italic"><div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_#ee1d23]"></div> 1-on-1 Mentorship</li>
                                <li className="flex items-center gap-4 text-accent-white font-black text-[10px] uppercase tracking-widest italic"><div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_#ee1d23]"></div> Books & Study Material</li>
                            </ul>
                            <Link to="/register" className="w-full btn-primary py-6 scale-100 hover:scale-105 transition-all text-[11px] italic relative z-10 uppercase tracking-widest text-center block">Enroll Yearly</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section - Technical Mastery */}
            <section id="about" className="py-32 relative bg-surface-dark/50 overflow-hidden border-t border-white/5">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-4xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom duration-1000">
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-6 block">Our Expertise</span>
                        <h2 className="text-4xl md:text-7xl font-black text-accent-white tracking-tighter mb-8">
                            Elite <span className="text-gradient-red italic">Learning Paths</span>
                        </h2>
                        <p className="text-lg md:text-xl text-accent-gray leading-relaxed font-medium opacity-80">
                            We specialize in high-demand technical domains designed to transform beginners into industry-ready professionals. Master the code, lead the innovation.
                        </p>
                    </div>

                    {/* School Academics Section */}
                    <div className="mb-24">
                        <div className="flex items-center gap-4 mb-12">
                            <div className="h-px flex-grow bg-white/5"></div>
                            <span className="text-[10px] font-black text-accent-gray uppercase tracking-[0.4em] italic">Foundation Academics (K-12)</span>
                            <div className="h-px flex-grow bg-white/5"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { title: "6th - 8th Grade", subjects: "Foundation Mathematics, Science, & English", level: "Middle School" },
                                { title: "9th - 10th Grade", subjects: "CBSE/ICSE Board Prep, Physics, Chemistry, Math", level: "Secondary" },
                                { title: "11th - 12th (Science)", subjects: "JEE/NEET Integrated, Advanced PCB/PCM", level: "Senior Secondary" },
                                { title: "11th - 12th (Commerce)", subjects: "Accountancy, Economics, & Business Studies", level: "Senior Secondary" }
                            ].map((grade, gIdx) => (
                                <div key={gIdx} className="bg-surface-light/30 p-8 rounded-[2rem] border border-white/5 hover:border-primary/20 transition-all hover:-translate-y-1 group">
                                    <div className="text-primary font-black uppercase text-[10px] tracking-widest mb-4 opacity-60 group-hover:opacity-100">{grade.level}</div>
                                    <h4 className="text-xl font-black text-accent-white mb-3 italic">{grade.title}</h4>
                                    <p className="text-xs text-accent-gray font-medium leading-relaxed">{grade.subjects}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Higher Education Section */}
                    <div className="mb-24">
                        <div className="flex items-center gap-4 mb-12">
                            <div className="h-px flex-grow bg-white/5"></div>
                            <span className="text-[10px] font-black text-accent-gray uppercase tracking-[0.4em] italic">Higher Education (UG & PG)</span>
                            <div className="h-px flex-grow bg-white/5"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[
                                {
                                    title: "Undergraduate (UG)",
                                    subjects: "B.Tech, B.Sc, BCA, & B.Com Specialized Coaching. Semester-wise academic support and technical skill building.",
                                    level: "Degree Programs"
                                },
                                {
                                    title: "Postgraduate (PG)",
                                    subjects: "M.Tech, MCA, MBA & M.Sc Advanced Research & specialization modules. Competitive exam prep like GATE & UGC NET.",
                                    level: "Masters & Research"
                                }
                            ].map((edu, eIdx) => (
                                <div key={eIdx} className="bg-surface-light/40 p-10 rounded-[2.5rem] border border-white/5 hover:border-primary/30 transition-all hover:-translate-y-2 group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:bg-primary/20 transition-all"></div>
                                    <div className="text-primary font-black uppercase text-[10px] tracking-widest mb-6 italic">{edu.level}</div>
                                    <h4 className="text-3xl font-black text-accent-white mb-4 italic tracking-tight">{edu.title}</h4>
                                    <p className="text-sm text-accent-gray font-medium leading-relaxed opacity-80">{edu.subjects}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mb-12">
                        <div className="h-px flex-grow bg-white/5"></div>
                        <span className="text-[10px] font-black text-accent-gray uppercase tracking-[0.4em] italic">Professional Technical Tracks</span>
                        <div className="h-px flex-grow bg-white/5"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                        {[
                            {
                                title: "AI & Machine Learning",
                                desc: "Neural networks, deep learning, and predictive modeling using industry-standard frameworks like TensorFlow and PyTorch.",
                                stats: "Advanced NLP & Computer Vision"
                            },
                            {
                                title: "Data Science & Analytics",
                                desc: "Extract insights from raw data using statistical analysis, Big Data tools, and advanced visualization techniques.",
                                stats: "Big Data & Python Integration"
                            },
                            {
                                title: "Python Full Stack",
                                desc: "End-to-end development using Django, Fast API, and modern frontend frameworks for scalable enterprise apps.",
                                stats: "Web + Mobile Mastery"
                            },
                            {
                                title: "Java Full Stack",
                                desc: "Enterprise-grade development with Spring Boot, Microservices, and robust backend architectures used by Fortune 500s.",
                                stats: "Enterprise Architectures"
                            },
                            {
                                title: "Web Development",
                                desc: "Mastering the modern web with React, Next.js, and high-performance server-side rendering for stunning user experiences.",
                                stats: "Full Component Lifecycle"
                            },
                            {
                                title: "Cloud & DevOps",
                                desc: "Infrastructure as code, CI/CD pipelines, and cloud orchestration with AWS, Docker, and Kubernetes.",
                                stats: "Zero-Downtime Deployment"
                            },
                            {
                                title: "Cyber Security",
                                desc: "Ethical hacking, network defense, and advanced cryptography to protect digital assets in a global landscape.",
                                stats: "Threat Mitigation & Defense"
                            },
                            {
                                title: "C & C++ Programming",
                                desc: "Low-level optimization, memory management, and high-performance systems programming for hardware and gaming.",
                                stats: "System-Level Mastery"
                            },
                            {
                                title: "Data Structures & DSA",
                                desc: "The foundation of computer science. Master algorithms and logic to crack top-tier technical interviews.",
                                stats: "Problem Solving Excellence"
                            },
                        ].map((path, idx) => (
                            <div key={idx} className="bg-surface p-10 rounded-[2.5rem] border border-white/5 hover:border-primary/30 transition-all hover:-translate-y-2 group shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-all"></div>
                                <h4 className="text-2xl font-black text-accent-white mb-4 italic tracking-tight">{path.title}</h4>
                                <p className="text-sm text-accent-gray leading-relaxed font-medium mb-8 opacity-70">{path.desc}</p>
                                <div className="pt-6 border-t border-white/5 flex items-center justify-between text-[10px] font-black text-primary uppercase tracking-widest italic">
                                    <span>{path.stats}</span>
                                    <FaCheckCircle />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Featured Track: Professional Development */}
                    <div className="bg-surface p-12 rounded-[3rem] border border-white/5 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-pattern-dark opacity-20"></div>
                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                            <div>
                                <h3 className="text-4xl font-black text-accent-white mb-8 italic tracking-tight">Future <span className="text-primary">Skills</span> Hub</h3>
                                <p className="text-accent-gray font-medium leading-relaxed mb-10">
                                    Our curriculum is meticulously crafted by engineers from top tech giants, ensuring you learn not just the syntax, but the architectural thinking required for elite roles.
                                </p>
                                <div className="grid grid-cols-2 gap-6">
                                    {[
                                        { label: "Placement Support", val: "100%" },
                                        { label: "Live Project Access", val: "Unlimited" },
                                        { label: "Expert Mentorship", val: "24/7" },
                                        { label: "Certification", val: "Industry Grade" }
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-surface-dark/50 p-6 rounded-2xl border border-white/5">
                                            <div className="text-2xl font-black text-primary italic mb-1">{stat.val}</div>
                                            <div className="text-[10px] font-black text-accent-gray uppercase tracking-widest opacity-60">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-[2rem] filter blur-3xl"></div>
                                <div className="premium-card p-1 items-center justify-center overflow-hidden h-[400px]">
                                    <div className="bg-surface-dark h-full w-full rounded-[1.5rem] p-10 flex flex-col justify-center">
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-4 animate-glow p-4 rounded-xl bg-primary/5 border border-primary/20">
                                                <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg">
                                                    <FaCode size={24} />
                                                </div>
                                                <div className="text-accent-white font-black italic">Live Coding Sandbox</div>
                                            </div>
                                            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 opacity-60">
                                                <FaChalkboardTeacher className="text-accent-gray" size={24} />
                                                <div className="text-accent-gray font-black">Architecture Reviews</div>
                                            </div>
                                            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 opacity-60">
                                                <FaUserShield className="text-accent-gray" size={24} />
                                                <div className="text-accent-gray font-black">Project Defense</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-surface py-24 border-t border-white/5 relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px]"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-12">
                        <div className="flex flex-col items-center md:items-start gap-6">
                            <Logo size="lg" className="scale-110 drop-shadow-[0_0_10px_rgba(238,29,35,0.3)]" />
                            <p className="text-accent-gray text-xs max-w-sm text-center md:text-left font-black uppercase tracking-[0.2em] leading-loose opacity-70">
                                Revolutionizing education with <span className="text-primary italic">Stunning</span> design and <span className="text-accent-white">Elite</span> mentorship.
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-12 text-[10px] font-black text-accent-white uppercase tracking-[0.4em]">
                            <a href="#" className="hover:text-primary transition-all hover:scale-110">Privacy</a>
                            <a href="#" className="hover:text-primary transition-all hover:scale-110">Terms</a>
                            <a href="#" className="hover:text-primary transition-all hover:scale-110">Careers</a>
                        </div>
                    </div>
                    <div className="mt-20 pt-10 border-t border-white/5 text-center text-accent-gray text-[9px] font-black tracking-[0.5em] uppercase italic opacity-40">
                        © 2025 EDUTALKS PLATFORM • BUILT FOR EXCELLENCE
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
