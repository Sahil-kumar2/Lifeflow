import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [userRole, setUserRole] = useState(null);
    const isAuthenticated = !!localStorage.getItem('token');

    useEffect(() => {
        const fetchUserRole = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const config = { headers: { 'x-auth-token': token } };
                    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth`, config);
                    setUserRole(res.data.role);
                } catch (error) {
                    console.error("Failed to fetch user role", error);
                    // Invalid token? Don't logout immediately here to avoid conflict with other components, just fail silently.
                }
            }
        };
        fetchUserRole();
    }, [isAuthenticated, location.pathname]); // Re-check on nav changes/login

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUserRole(null);
        toast.success('You have been successfully logged out.');
        navigate('/login');
    };

    const getDashboardLink = () => {
        if (userRole === 'donor') return '/donor-dashboard';
        if (userRole === 'patient') return '/patient-dashboard';
        if (userRole === 'hospital') return '/hospital-dashboard';
        return '/dashboard'; // Fallback
    };

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold text-red-600">
                    LiveFlow 🩸
                </Link>

                <div className="flex items-center space-x-6">
                    <Link to="/" className="text-gray-600 hover:text-red-600 font-semibold">Home</Link>
                    <Link to="/about" className="text-gray-600 hover:text-red-600 font-semibold">About</Link>

                    {isAuthenticated ? (
                        <>
                            {userRole && (
                                <Link to={getDashboardLink()} className="text-gray-600 hover:text-red-600 font-semibold">
                                    Dashboard
                                </Link>
                            )}
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition"
                            >
                                Logout
                            </button>
                        </>
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
