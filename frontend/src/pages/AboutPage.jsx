import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Users, Heart, LocateFixed, MessageSquare, Activity, Award } from 'lucide-react';

const AboutPage = () => {
    return (
        <div className="bg-gray-50 font-sans">
            {/* Hero Section (White Background) */}
            <section className="bg-white text-center py-20">
                <div className="container mx-auto px-6">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
                        Our Mission: A Lifeline for Every Need
                    </h1>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        We believe that technology can be a powerful force for good. LiveFlow was born from a simple yet powerful idea: to use real-time connectivity to ensure that no one suffers from a preventable shortage of blood in critical moments.
                    </p>
                </div>
            </section>

            {/* Our Story Section (Gray Background for contrast) */}
            <section className="bg-gray-100 py-20">
                <div className="container mx-auto px-6 max-w-4xl text-center">
                    <h2 className="text-3xl font-bold text-red-600 mb-4">From a Project to a Passion</h2>
                    <p className="text-lg leading-relaxed text-gray-700 mb-4">
                        LiveFlow began as a B.Tech project by Sahil, driven by a passion for using technology to solve meaningful, real-world problems. The challenge was clear: in a medical emergency, the time it takes to find a matching blood donor can be the difference between life and death.
                    </p>
                    <p className="text-lg leading-relaxed text-gray-700">
                        This platform was designed to be the solution. By creating a direct, instant link between patients and a network of volunteer donors, we aim to dramatically reduce response times and build a stronger, more connected community of life-savers.
                    </p>
                </div>
            </section>
            
            {/* Key Features Section (White Background) */}
            <section className="bg-white py-20">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center">The Technology Behind Our Mission</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
                        <div className="flex items-start">
                            <div className="bg-red-100 text-red-600 rounded-full p-3 mr-4 flex-shrink-0"><LocateFixed size={24} /></div>
                            <div>
                                <h4 className="font-bold text-lg">Real-Time Geolocation</h4>
                                <p className="text-gray-600">Our system instantly finds eligible donors within a 20km radius of a patient's request.</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="bg-red-100 text-red-600 rounded-full p-3 mr-4 flex-shrink-0"><MessageSquare size={24} /></div>
                            <div>
                                <h4 className="font-bold text-lg">Instant SMS Alerts</h4>
                                <p className="text-gray-600">Urgent requests are sent directly to donors' phones via SMS for immediate awareness.</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="bg-red-100 text-red-600 rounded-full p-3 mr-4 flex-shrink-0"><Activity size={24} /></div>
                            <div>
                                <h4 className="font-bold text-lg">End-to-End Tracking</h4>
                                <p className="text-gray-600">We track every step, from request to verification, for a secure and reliable process.</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="bg-red-100 text-red-600 rounded-full p-3 mr-4 flex-shrink-0"><Award size={24} /></div>
                            <div>
                                <h4 className="font-bold text-lg">Gamification & Rewards</h4>
                                <p className="text-gray-600">We celebrate our heroes by awarding digital badges for donation milestones.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- THIS SECTION IS NOW RESTORED --- */}
            {/* Our Values Section (Gray Background) */}
            <section className="bg-gray-100 py-20">
                 <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-12">Our Core Principles</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-8"><div className="flex justify-center mb-4"><div className="bg-red-100 text-red-600 rounded-full p-4"><Target size={32} /></div></div><h3 className="text-xl font-bold mb-2">Speed & Efficiency</h3><p className="text-gray-600">In an emergency, every second counts. Our platform is built for instant action.</p></div>
                        <div className="p-8"><div className="flex justify-center mb-4"><div className="bg-red-100 text-red-600 rounded-full p-4"><Users size={32} /></div></div><h3 className="text-xl font-bold mb-2">Community</h3><p className="text-gray-600">We are a network of heroes—donors, patients, and hospitals—working together.</p></div>
                        <div className="p-8"><div className="flex justify-center mb-4"><div className="bg-red-100 text-red-600 rounded-full p-4"><Heart size={32} /></div></div><h3 className="text-xl font-bold mb-2">Selfless Service</h3><p className="text-gray-600">We celebrate every donor who gives the gift of life.</p></div>
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="bg-red-600 text-white text-center py-20">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold mb-4">Join Our Community of Life-Savers</h2>
                    <p className="text-lg mb-8 max-w-2xl mx-auto">Your decision to donate can be the most important gift someone ever receives. Join us today.</p>
                    <Link to="/register" className="bg-white text-red-600 font-bold py-3 px-8 rounded-full hover:bg-gray-200 transition-transform transform hover:scale-105 text-lg shadow-lg">Register Today</Link>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;