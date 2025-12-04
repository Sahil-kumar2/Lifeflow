import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white">
            <div className="container mx-auto px-6 py-12">
                {/* Top section with multi-column layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                    
                    {/* Column 1: Brand and Mission */}
                    <div>
                        <Link to="/" className="text-3xl font-bold text-red-500 mb-2 inline-block">
                            LiveFlow 🩸
                        </Link>
                        <p className="text-gray-400 max-w-xs mx-auto md:mx-0">
                            Connecting volunteer blood donors with patients in real-time to save lives.
                        </p>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h3 className="font-semibold uppercase tracking-wider text-gray-400 mb-4">Quick Links</h3>
                        <nav className="space-y-3">
                            <Link to="/about" className="block hover:text-red-500 transition">About Us</Link>
                            <Link to="/register" className="block hover:text-red-500 transition">Register as a Donor</Link>
                            <Link to="/login" className="block hover:text-red-500 transition">Login</Link>
                        </nav>
                    </div>

                    {/* --- THIS IS THE FIX: A new, content-rich "Contact Us" column --- */}
                    {/* Column 3: Contact & Social */}
                    <div>
                        <h3 className="font-semibold uppercase tracking-wider text-gray-400 mb-4">Contact & Social</h3>
                        <div className="space-y-3 text-gray-300">
                           <p>
                                <a href="mailto:contact@liveflow.com" className="hover:text-red-500 transition">contact@liveflow.com</a>
                           </p>
                           <p>
                                <a href="tel:+919999999999" className="hover:text-red-500 transition">(+91) 99999-99999</a>
                           </p>
                        </div>
                        <div className="flex justify-center md:justify-start space-x-4 mt-6">
                            <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-white transition">
                                <Twitter size={24} />
                            </a>
                            <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-white transition">
                                <Facebook size={24} />
                            </a>
                            <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-white transition">
                                <Instagram size={24} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Copyright Bar */}
                <div className="mt-12 border-t border-gray-700 pt-8 text-center text-gray-500">
                    <p>&copy; {new Date().getFullYear()} LiveFlow. All Rights Reserved.</p>
                    <p className="text-sm">A B.Tech Project by Sahil.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;