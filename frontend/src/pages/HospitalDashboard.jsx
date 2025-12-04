import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
// Import icons for the new design
import { Hospital, CheckSquare, Users } from 'lucide-react';

const HospitalDashboard = () => {
    const [user, setUser] = useState(null);
    const [requestsInProgress, setRequestsInProgress] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        const config = { headers: { 'x-auth-token': token } };
        try {
            const [userRes, requestsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/auth', config),
                axios.get('http://localhost:5000/api/requests/inprogress', config)
            ]);
            setUser(userRes.data);
            setRequestsInProgress(requestsRes.data);
        } catch (err) {
            console.error('Failed to fetch data', err);
            localStorage.removeItem('token');
            navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [navigate]);

    const handleVerify = async (donorId, requestId) => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            const res = await axios.post('http://localhost:5000/api/hospitals/verify-donation', { donorId, requestId }, config);
            let toastMessage = 'Donation verified successfully!';
            if (res.data.badgeAwarded) {
                toastMessage += ` The donor has been awarded the "${res.data.badgeAwarded}" badge!`;
            }
            toast.success(toastMessage);
            fetchData(); // Refresh the list
        } catch (error) {
            toast.error('Could not verify the donation.');
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!user) return <div className="p-10 text-center">Could not load user information.</div>;

    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">{user.name} Administration</h2>

            {/* --- NEW STATISTIC CARD --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                 <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
                    <Users className="h-10 w-10 text-green-500 mr-4" />
                    <div>
                        <p className="text-sm text-gray-500">Donors Awaiting Verification</p>
                        <p className="text-2xl font-bold text-gray-800">{requestsInProgress.length}</p>
                    </div>
                </div>
            </div>

            {/* Verification Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-700 flex items-center mb-4">
                    <CheckSquare className="h-6 w-6 mr-3 text-blue-500" /> Verify Completed Donations
                </h3>
                {requestsInProgress.length > 0 ? (
                    <div className="space-y-4">
                        {requestsInProgress.map(req => (
                            <div key={req._id} className="border p-4 rounded-lg bg-gray-50 flex flex-col sm:flex-row justify-between sm:items-center">
                                <div className="mb-4 sm:mb-0">
                                    <h4 className="font-bold text-gray-800">Donor: {req.acceptedBy ? req.acceptedBy.name : 'N/A'}</h4>
                                    <p className="text-sm text-gray-600">Blood Type: <span className="font-bold text-red-600">{req.bloodType}</span></p>
                                </div>
                                <button 
                                    onClick={() => handleVerify(req.acceptedBy._id, req._id)} 
                                    className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition w-full sm:w-auto"
                                >
                                    Mark as Completed
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600">No donors are currently on their way for verification.</p>
                )}
            </div>
        </div>
    );
};

export default HospitalDashboard;