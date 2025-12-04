// frontend/src/components/layout/Navbar.jsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Navbar = () => {
    const navigate = useNavigate();
    const isAuthenticated = !!localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        toast.success('You have been successfully logged out.');
        navigate('/login');
    };

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold text-red-600">
                    LiveFlow 🩸
                </Link>

                <div className="flex items-center space-x-6">
                    <Link to="/" className="text-gray-600 hover:text-red-600 font-semibold">Home</Link>
                    <Link to="/about" className="text-gray-600 hover:text-red-600 font-semibold">About</Link> {/* <-- NEW LINK */}
                    
                    {isAuthenticated ? (
                        <button 
                            onClick={handleLogout}
                            className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition"
                        >
                            Logout
                        </button>
                    ) : (
                        <>
                            <Link to="/login" className="text-gray-600 hover:text-red-600 font-semibold">Login</Link>
                            <Link 
                                to="/register" 
                                className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Navbar;