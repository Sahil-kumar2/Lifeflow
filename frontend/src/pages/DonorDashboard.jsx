import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSocket } from '../context/SocketContext';
import { Heart, Droplets, Calendar, Award, CheckCircle, ClipboardList } from 'lucide-react';

const calculateEligibility = (lastDate) => {
    if (!lastDate) return { isEligible: true, daysRemaining: 0 };
    const eligibilityTime = new Date(lastDate).getTime() + (84 * 24 * 60 * 60 * 1000);
    const daysRemaining = Math.ceil((eligibilityTime - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return {
        isEligible: daysRemaining <= 0,
        daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
    };
};

const DonorDashboard = () => {
    const [donor, setDonor] = useState(null);
    const [nearbyRequests, setNearbyRequests] = useState([]);
    const [donationHistory, setDonationHistory] = useState([]);
    const [donationCount, setDonationCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const navigate = useNavigate();
    const socket = useSocket();

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        const config = { headers: { 'x-auth-token': token } };
        try {

            const [userRes, historyRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/api/auth`, config),
                axios.get(`${import.meta.env.VITE_API_URL}/api/donations/donor-history`, config)
            ]);

            setDonor(userRes.data);

            setDonationHistory(historyRes.data);
            setDonationCount(historyRes.data.length);

            // Fetch nearby requests
            const requestsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/donors/nearby-requests`, config);
            setNearbyRequests(requestsRes.data);

        } catch (err) {
            console.error('Failed to fetch initial data. Logging out.', err);
            localStorage.removeItem('token');
            navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Also update location in the background
        const token = localStorage.getItem('token');
        const config = { headers: { 'x-auth-token': token } };
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { longitude, latitude } = position.coords;
            try {
                await axios.patch(`${import.meta.env.VITE_API_URL}/api/donors/profile`, { location: { type: 'Point', coordinates: [longitude, latitude] } }, config);
            } catch (err) { console.error('Could not update location:', err); }
        });
    }, [navigate]);

    useEffect(() => {
        if (!socket) return;

        socket.on('request_created', (newRequest) => {
            // Optimistically add to nearby requests if it fits criteria (or just add it and let the user filter)
            // Ideally we should check distance, but for now we'll add it if it's broadly relevant or just refetch.
            // A simple approach is to refetch nearby requests.
            // But let's try to add it.
            setNearbyRequests(prev => [newRequest, ...prev]);
        });

        socket.on('request_accepted', (updatedRequest) => {
            setNearbyRequests(prev => prev.filter(req => req._id !== updatedRequest._id));
        });

        socket.on('request_cancelled', (updatedRequest) => {
            // If cancelled, it might become available again.
            // We could add it back.
            setNearbyRequests(prev => [updatedRequest, ...prev]);
        });

        socket.on('request_completed', (updatedRequest) => {
            setNearbyRequests(prev => prev.filter(req => req._id !== updatedRequest._id));
        });

        return () => {
            socket.off('request_created');
            socket.off('request_accepted');
            socket.off('request_cancelled');
            socket.off('request_completed');
        };
    }, [socket]);

    // --- THIS IS THE CORRECTED AND RE-IMPLEMENTED FUNCTION ---
    const handleAccept = async (requestId) => {
        if (processingId) return;
        setProcessingId(requestId);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            await axios.post(`${import.meta.env.VITE_API_URL}/api/requests/${requestId}/accept`, {}, config);
            toast.success('Thank you for accepting! The patient has been notified.');
            // Refresh the list of requests after accepting one
            fetchData();
        } catch (error) {
            toast.error("Could not accept the request. It may have been taken by another donor.");
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading Your Dashboard...</div>;
    if (!donor) return <div className="p-10 text-center">Error loading profile. Please try logging in again.</div>;

    const eligibility = calculateEligibility(donor.lastDonationDate);

    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Welcome, {donor.name}!</h2>
            {/* All Statistic and Achievement Cards remain the same */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md flex items-center"><Heart className="h-10 w-10 text-red-500 mr-4" /><div><p className="text-sm text-gray-500">Total Donations</p><p className="text-2xl font-bold">{donationCount}</p></div></div>
                <div className="bg-white p-6 rounded-lg shadow-md flex items-center"><Droplets className="h-10 w-10 text-blue-500 mr-4" /><div><p className="text-sm text-gray-500">Lives Saved</p><p className="text-2xl font-bold">~{donationCount * 3}</p></div></div>
                <div className={`bg-white p-6 rounded-lg shadow-md flex items-center ${eligibility.isEligible ? 'border-l-4 border-green-500' : 'border-l-4 border-yellow-500'}`}><Calendar className="h-10 w-10 text-green-500 mr-4" /><div><p className="text-sm text-gray-500">Next Eligible</p><p className={`text-2xl font-bold ${eligibility.isEligible ? 'text-green-600' : 'text-yellow-600'}`}>{eligibility.isEligible ? 'Ready!' : `${eligibility.daysRemaining} days`}</p></div></div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-700 flex items-center mb-4"><Award className="h-6 w-6 mr-3 text-yellow-500" /> Your Achievements</h3>
                {donor.rewards && donor.rewards.badges.length > 0 ? (<div className="flex flex-wrap gap-4">{donor.rewards.badges.map((badge, index) => (<span key={`${badge}-${index}`} className="bg-teal-100 text-teal-800 font-semibold px-4 py-1 rounded-full text-sm">{badge}</span>))}</div>) : (<p className="text-gray-600">Your first donation will earn a badge!</p>)}
            </div>

            {/* Nearby Requests Card - The button is now functional */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-700 flex items-center mb-4"><CheckCircle className="h-6 w-6 mr-3 text-green-500" /> Nearby Blood Requests</h3>
                {nearbyRequests.length > 0 ? (
                    <div className="space-y-4">
                        {nearbyRequests.map(req => (
                            <div key={req._id} className="border p-4 rounded-lg flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold">{req.hospitalName}, {req.city}</h4>
                                    <p className="text-gray-600">Needed: <span className="font-bold text-red-600 text-lg">{req.bloodType}</span></p>
                                </div>
                                <button
                                    onClick={() => handleAccept(req._id)}
                                    disabled={processingId !== null}
                                    className={`font-bold py-2 px-4 rounded-lg transition flex items-center ${processingId === req._id ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                                >
                                    {processingId === req._id ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </>
                                    ) : 'I can donate'}
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600">No open blood requests found in your area.</p>
                )}
            </div>

            {/* Donation History Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-700 flex items-center mb-4">
                    <ClipboardList className="h-6 w-6 mr-3 text-purple-500" /> Donation History
                </h3>
                {donationHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {donationHistory.map((log) => (
                                    <tr key={log._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(log.donationDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {log.hospital ? log.hospital.name : 'Unknown Hospital'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {log.bloodRequest ? log.bloodRequest.bloodType : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {log.unitsDonated}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-600">You haven't made any donations yet.</p>
                )}
            </div>
        </div >
    );
};
export default DonorDashboard;