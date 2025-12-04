import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, BellRing, HeartHandshake, CheckCircle } from 'lucide-react';

const HomePage = () => {
    return (
        <div className="bg-white text-gray-800 font-sans">
            {/* Hero Section */}
            <section className="relative bg-gray-50 pt-24 pb-32 text-center overflow-hidden">
                {/* Subtle background pattern */}
                <div className="absolute inset-0 opacity-50">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="hero-pattern" patternUnits="userSpaceOnUse" width="40" height="40" patternTransform="scale(2) rotate(45)"><rect x="0" y="0" width="100%" height="100%" fill="none"/><path d="M10 0v40M0 10h40" stroke="#ef4444" strokeWidth="0.5"/></pattern></defs><rect width="100%" height="100%" fill="url(#hero-pattern)"/></svg>
                </div>
                <div className="container mx-auto px-6 relative">
                    <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 text-gray-900">
                        Connect Hearts, Save Lives.
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
                        LiveFlow is a real-time platform bridging the gap between volunteer blood donors and patients in critical need. Your single donation can make a world of difference.
                    </p>
                    <div className="space-x-4">
                        <Link
                            to="/register"
                            className="bg-red-600 text-white font-bold py-3 px-8 rounded-full hover:bg-red-700 transition-transform transform hover:scale-105 text-lg shadow-xl"
                        >
                            Become a Donor
                        </Link>
                        <Link
                            to="/about"
                            className="bg-white text-gray-800 font-bold py-3 px-8 rounded-full hover:bg-gray-200 transition-transform transform hover:scale-105 text-lg shadow-xl"
                        >
                            Learn More
                        </Link>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="container mx-auto px-6 py-20">
                <h2 className="text-3xl font-bold text-center mb-12">How It Works in 3 Simple Steps</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
                    <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                        <div className="flex justify-center mb-4">
                            <div className="bg-red-100 text-red-600 rounded-full p-4"><HeartHandshake size={40} /></div>
                        </div>
                        <h3 className="text-xl font-bold mb-2">1. Register as a Hero</h3>
                        <p className="text-gray-600">Create your secure donor profile in minutes. Your data is only used for life-saving alerts.</p>
                    </div>
                    <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                        <div className="flex justify-center mb-4">
                            <div className="bg-red-100 text-red-600 rounded-full p-4"><BellRing size={40} /></div>
                        </div>
                        <h3 className="text-xl font-bold mb-2">2. Receive Urgent Alerts</h3>
                        <p className="text-gray-600">Get instant SMS notifications when a patient nearby needs your specific blood type.</p>
                    </div>
                    <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                        <div className="flex justify-center mb-4">
                            <div className="bg-red-100 text-red-600 rounded-full p-4"><ShieldCheck size={40} /></div>
                        </div>
                        <h3 className="text-xl font-bold mb-2">3. Save a Life</h3>
                        <p className="text-gray-600">Accept the request, donate at the designated hospital, and become a verified life-saver.</p>
                    </div>
                </div>
            </section>
            
            {/* Our Impact Section - New Two-Column Layout */}
            <section className="bg-gray-50 py-20">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div className="pr-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-4">Why Your Donation Matters</h2>
                            <p className="text-gray-600 text-lg mb-6 leading-relaxed">Every drop counts. A single blood donation can save up to three lives, providing a critical lifeline for accident victims, surgery patients, and those with chronic illnesses.</p>
                            <ul className="space-y-4">
                                <li className="flex items-start"><CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" /><span className="text-gray-700"><strong>Instant Impact:</strong> Directly help someone in your local community during their most vulnerable moments.</span></li>
                                <li className="flex items-start"><CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" /><span className="text-gray-700"><strong>Community of Heroes:</strong> Join a growing network of volunteers dedicated to making a tangible difference.</span></li>
                                <li className="flex items-start"><CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" /><span className="text-gray-700"><strong>Simple & Secure:</strong> Our platform makes it easy and safe to connect with verified needs near you.</span></li>
                            </ul>
                        </div>
                        <div>
                             <img 
                                src="https://c8.alamy.com/comp/PPJR3X/donate-blood-concept-with-blood-bag-and-heart-character-blood-donation-vector-illustration-isolated-on-white-background-world-blood-donor-day-june-PPJR3X.jpg" 
                                alt="A blood bag with a heart shape" 
                                className="rounded-lg shadow-2xl w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Final Call to Action Section */}
            <section className="bg-red-700 text-white text-center py-20">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
                    <p className="text-lg mb-8 max-w-2xl mx-auto">
                        Your decision to donate can be the most important gift someone ever receives. Join us today.
                    </p>
                    <Link 
                        to="/register"
                        className="bg-white text-red-700 font-bold py-3 px-8 rounded-full hover:bg-gray-200 transition-transform transform hover:scale-105 text-lg shadow-lg"
                    >
                        Register as a Donor
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default HomePage;