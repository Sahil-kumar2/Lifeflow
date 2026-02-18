import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { User, Heart, Hospital, LogOut } from 'lucide-react';

const DashboardLayout = () => {
    const [user, setUser] = useState(null); // State to hold the current user's data
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // This hook will run when the layout loads to get the user's role
    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            try {
                const config = { headers: { 'x-auth-token': token } };
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth`, config);
                setUser(res.data);
            } catch (error) {
                console.error("Failed to fetch user role", error);
                handleLogout(); // Log out if the token is invalid
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        toast.success('You have been successfully logged out.');
        navigate('/login');
    };

    const getLinkClass = ({ isActive }) =>
        isActive
            ? 'flex items-center px-4 py-3 text-white bg-red-600 rounded-lg shadow-lg'
            : 'flex items-center px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-200 hover:text-gray-800 transition-colors';

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading User Profile...</div>;
    }

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Sidebar */}
            <div className="hidden md:flex flex-col w-64 bg-white border-r">
                <div className="flex items-center justify-center h-16 border-b">
                    <h1 className="text-2xl font-bold text-red-600">LiveFlow 🩸</h1>
                </div>
                <div className="flex flex-col flex-grow p-4">
                    <nav className="flex-grow space-y-2">
                        {/* --- THIS IS THE NEW CONDITIONAL LOGIC --- */}
                        {/* Only show the Donor link if the user's role is 'donor' */}
                        {user && user.role === 'donor' && (
                            <NavLink to="/donor-dashboard" className={getLinkClass}>
                                <Heart className="h-5 w-5" />
                                <span className="mx-4 font-medium">Donor Dashboard</span>
                            </NavLink>
                        )}
                        {/* Only show the Patient link if the user's role is 'patient' */}
                        {user && user.role === 'patient' && (
                            <NavLink to="/patient-dashboard" className={getLinkClass}>
                                <User className="h-5 w-5" />
                                <span className="mx-4 font-medium">Patient Dashboard</span>
                            </NavLink>
                        )}
                        {/* Only show the Hospital link if the user's role is 'hospital' */}
                        {user && user.role === 'hospital' && (
                            <NavLink to="/hospital-dashboard" className={getLinkClass}>
                                <Hospital className="h-5 w-5" />
                                <span className="mx-4 font-medium">Hospital Dashboard</span>
                            </NavLink>
                        )}
                    </nav>
                    <div className="mt-auto mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3">
                            <div className="bg-red-100 p-2 rounded-full">
                                <User className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-gray-800 truncate">{user ? user.name : 'User'}</p>
                                <p className="text-xs text-gray-500 truncate">{user ? user.email : ''}</p>
                                <p className="text-xs font-semibold text-red-500 uppercase mt-1">{user ? user.role : ''}</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-gray-600 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors">
                            <LogOut className="h-5 w-5" />
                            <span className="mx-4 font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;