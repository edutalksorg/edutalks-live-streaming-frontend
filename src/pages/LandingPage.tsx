import logo from '../assets/logo.png';
import { Link } from 'react-router-dom';
import { FaVideo, FaChalkboardTeacher, FaChartLine } from 'react-icons/fa';

const LandingPage: React.FC = () => {
    return (
        <div className="font-sans text-gray-900 bg-white">
            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2">
                            <img src={logo} alt="EduTalks Logo" className="h-10 w-auto" />
                        </div>
                        <div className="hidden md:flex space-x-8 items-center">
                            <a href="#features" className="text-gray-600 hover:text-indigo-600 transition">Features</a>
                            <a href="#about" className="text-gray-600 hover:text-indigo-600 transition">About Us</a>
                            <Link to="/login" className="text-indigo-600 font-medium hover:text-indigo-800 transition">Login</Link>
                            <Link to="/register" className="px-5 py-2.5 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="md:w-1/2 space-y-6">
                        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-gray-900">
                            Master Your Future with <span className="text-indigo-600">Live Learning</span>
                        </h1>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            Experience the classroom of tomorrow, today. Join India's fastest-growing live education platform.
                            Interactive classes, real-time doubt solving, and personalized mentorship.
                        </p>
                        <div className="flex gap-4 pt-4">
                            <Link to="/register" className="px-8 py-3.5 bg-indigo-600 text-white text-lg font-semibold rounded-lg hover:bg-indigo-700 transition shadow-xl shadow-indigo-200">
                                Join for Free
                            </Link>
                            <Link to="/about" className="px-8 py-3.5 bg-white text-indigo-600 text-lg font-semibold rounded-lg border border-indigo-100 hover:bg-indigo-50 transition shadow-sm">
                                Learn More
                            </Link>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 pt-4">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white"></div>
                                ))}
                            </div>
                            <p>Trusted by 10,000+ Students</p>
                        </div>
                    </div>
                    <div className="md:w-1/2 relative">
                        {/* Abstract Shape Background */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-300 to-purple-300 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
                        <img
                            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80"
                            alt="Student Learning"
                            className="relative rounded-2xl shadow-2xl transform rotate-2 hover:rotate-0 transition duration-500 border-4 border-white"
                        />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">Features</h2>
                        <h3 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
                            Everything you need to excel
                        </h3>
                        <p className="mt-4 text-xl text-gray-500">
                            Our platform provides a comprehensive learning ecosystem designed for student success.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: FaVideo, title: "Interactive Live Classes", desc: "HD Video streaming with real-time audio/video interaction. Feel like you're in the front row." },
                            { icon: FaChalkboardTeacher, title: "Top Educators", desc: "Learn from the best instructors in the country with years of experience and proven track records." },
                            { icon: FaChartLine, title: "Performance Analytics", desc: "Detailed insights into your test scores and learning progress to help you improve continuously." }
                        ].map((feature, idx) => (
                            <div key={idx} className="p-8 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-xl transition duration-300 border border-transparent hover:border-indigo-100 group">
                                <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                                    <feature.icon size={28} />
                                </div>
                                <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
                                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-20 bg-indigo-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">How It Works</h2>
                        <h3 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
                            Your Journey to Success
                        </h3>
                        <p className="mt-4 text-xl text-gray-500">
                            Get full access to premium education in 3 simple steps.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="relative">
                            <div className="w-16 h-16 mx-auto bg-white text-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg mb-6 border-4 border-indigo-100">1</div>
                            <h4 className="text-xl font-bold text-gray-900 mb-2">Register</h4>
                            <p className="text-gray-600">Create your account by selecting your grade and role (Student/Instructor).</p>
                        </div>
                        <div className="relative">
                            <div className="hidden md:block absolute top-8 left-1/2 w-full h-1 bg-indigo-200 -z-10"></div>
                            <div className="w-16 h-16 mx-auto bg-white text-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg mb-6 border-4 border-indigo-100">2</div>
                            <h4 className="text-xl font-bold text-gray-900 mb-2">Choose Plan & Pay</h4>
                            <p className="text-gray-600">Select a subscription plan that suits your needs and complete the secure payment.</p>
                        </div>
                        <div className="relative">
                            <div className="w-16 h-16 mx-auto bg-white text-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg mb-6 border-4 border-indigo-100">3</div>
                            <h4 className="text-xl font-bold text-gray-900 mb-2">Full Access</h4>
                            <p className="text-gray-600">Get assigned to an expert instructor, join live batches, and start learning!</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Plans Section */}
            <section id="plans" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">Pricing Plans</h2>
                        <h3 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
                            Affordable Excellence
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <div className="border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition relative">
                            <h4 className="text-xl font-bold text-gray-900">Basic</h4>
                            <div className="mt-4 text-4xl font-extrabold text-gray-900">₹999<span className="text-base font-medium text-gray-500">/mo</span></div>
                            <ul className="mt-6 space-y-4 text-gray-600">
                                <li className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"></div> Access to Recorded Classes</li>
                                <li className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"></div> 1 Doubt Session/Week</li>
                            </ul>
                            <button className="mt-8 w-full py-3 bg-indigo-50 text-indigo-700 font-bold rounded-lg hover:bg-indigo-100 transition">Get Started</button>
                        </div>

                        <div className="border-2 border-indigo-600 rounded-2xl p-8 shadow-2xl relative transform -translate-y-2 bg-white">
                            <div className="absolute top-0 right-0 bg-indigo-600 text-white px-3 py-1 rounded-bl-lg rounded-tr-lg text-sm font-bold">POPULAR</div>
                            <h4 className="text-xl font-bold text-gray-900">Premium Live</h4>
                            <div className="mt-4 text-4xl font-extrabold text-gray-900">₹4999<span className="text-base font-medium text-gray-500">/year</span></div>
                            <ul className="mt-6 space-y-4 text-gray-600">
                                <li className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"></div> Daily Live Classes</li>
                                <li className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"></div> Assigned Instructor Batch</li>
                                <li className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"></div> Weekly Tests & Olympiads</li>
                            </ul>
                            <button className="mt-8 w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">Enrol Now</button>
                        </div>

                        <div className="border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition relative">
                            <h4 className="text-xl font-bold text-gray-900">Pro Mentorship</h4>
                            <div className="mt-4 text-4xl font-extrabold text-gray-900">₹9999<span className="text-base font-medium text-gray-500">/year</span></div>
                            <ul className="mt-6 space-y-4 text-gray-600">
                                <li className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"></div> All Premium Features</li>
                                <li className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"></div> 1-on-1 Mentorship</li>
                                <li className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"></div> Hardcopy Study Material</li>
                            </ul>
                            <button className="mt-8 w-full py-3 bg-indigo-50 text-indigo-700 font-bold rounded-lg hover:bg-indigo-100 transition">Contact Us</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-indigo-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <div>
                        <div className="text-4xl font-bold mb-2">500+</div>
                        <div className="text-indigo-200">Live Classes Daily</div>
                    </div>
                    <div>
                        <div className="text-4xl font-bold mb-2">10k+</div>
                        <div className="text-indigo-200">Active Students</div>
                    </div>
                    <div>
                        <div className="text-4xl font-bold mb-2">50+</div>
                        <div className="text-indigo-200">Expert Instructors</div>
                    </div>
                    <div>
                        <div className="text-4xl font-bold mb-2">4.9/5</div>
                        <div className="text-indigo-200">User Rating</div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-50 py-12 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <img src={logo} alt="EduTalks Logo" className="h-8 w-auto" />
                    </div>
                    <p className="text-gray-500 text-sm">© 2025 EduTalks Platform. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
