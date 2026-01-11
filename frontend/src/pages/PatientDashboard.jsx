import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
// Import icons for the new design
import { User, PlusCircle, ClipboardList } from 'lucide-react';

const PatientDashboard = () => {
    const [user, setUser] = useState(null);
    const [myRequests, setMyRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ bloodType: 'A+', unitsRequired: 1, hospitalName: '' });
    const navigate = useNavigate();

    // The data fetching logic is correct and remains the same
    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) { navigate('/login'); return; }
            const config = { headers: { 'x-auth-token': token } };
            try {
                const [userRes, requestsRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_URL}/api/auth`, config),
                    axios.get(`${import.meta.env.VITE_API_URL}/api/requests/my-requests`, config)
                ]);
                setUser(userRes.data);
                setMyRequests(requestsRes.data);
            } catch (err) {
                console.error('Failed to fetch data', err);
                localStorage.removeItem('token');
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate]);

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { longitude, latitude } = position.coords;
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { 'x-auth-token': token } };
                const newRequest = { ...formData, city: user.city, longitude, latitude };
                await axios.post(`${import.meta.env.VITE_API_URL}/api/requests`, newRequest, config);
                toast.success('Blood request created successfully!');
                const requestsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/requests/my-requests`, config);
                setMyRequests(requestsRes.data);
            } catch (err) {
                toast.error('Failed to create request.');
            }
        }, () => {
            toast.error("Could not get your location. Please enable location services.");
        });
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!user) return <div className="p-10 text-center">Could not load user information.</div>;

    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Welcome, {user.name}!</h2>

            {/* --- NEW STATISTIC CARD --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
                    <User className="h-10 w-10 text-blue-500 mr-4" />
                    <div>
                        <p className="text-sm text-gray-500">Total Requests Made</p>
                        <p className="text-2xl font-bold text-gray-800">{myRequests.length}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Create Request Card */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-bold text-gray-700 flex items-center mb-4">
                        <PlusCircle className="h-6 w-6 mr-3 text-red-500" /> Create a New Blood Request
                    </h3>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Blood Type</label>
                            <select name="bloodType" value={formData.bloodType} onChange={onChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500">
                                <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                                <option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Units Needed</label>
                            <input type="number" name="unitsRequired" value={formData.unitsRequired} onChange={onChange} min="1" className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Hospital Name</label>
                            <input type="text" placeholder="e.g., City Hospital, Una" name="hospitalName" value={formData.hospitalName} onChange={onChange} required className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" />
                        </div>
                        <button type="submit" className="w-full bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition">
                            Submit Request
                        </button>
                    </form>
                </div>

                {/* Active Requests Card */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-bold text-gray-700 flex items-center mb-4">
                        <ClipboardList className="h-6 w-6 mr-3 text-blue-500" /> Your Active Requests
                    </h3>
                    {myRequests.length > 0 ? (
                        <div className="space-y-4">
                            {myRequests.map(req => (
                                <div key={req._id} className="border p-4 rounded-lg bg-gray-50">
                                    <h4 className="font-bold text-gray-800">{req.hospitalName}</h4>
                                    <p className="text-sm text-gray-600">Blood Type: {req.bloodType}, Units: {req.unitsRequired}</p>
                                    <p>Status:{' '}
                                        <span className={`font-bold ${req.status === 'In Progress' ? 'text-green-600' : (req.status === 'Fulfilled' ? 'text-blue-600' : 'text-yellow-600')}`}>
                                            {req.status}
                                        </span>
                                    </p>
                                    {req.status === 'In Progress' && <p className="text-sm text-green-600 font-semibold">A donor is on the way!</p>}
                                    {req.status === 'Fulfilled' && <p className="text-sm text-blue-600 font-semibold">This request has been fulfilled. Thank you!</p>}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-600">You have no active requests.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientDashboard;