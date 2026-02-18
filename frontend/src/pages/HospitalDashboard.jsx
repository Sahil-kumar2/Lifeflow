import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSocket } from '../context/SocketContext';
import { Hospital, CheckSquare, Users, AlertCircle, XCircle, ClipboardList } from 'lucide-react';

const HospitalDashboard = () => {
    const [user, setUser] = useState(null);
    const [requestsInProgress, setRequestsInProgress] = useState([]);
    const [openRequests, setOpenRequests] = useState([]);
    const [verifiedHistory, setVerifiedHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const navigate = useNavigate();
    const socket = useSocket();

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        const config = { headers: { 'x-auth-token': token } };
        try {
            const [userRes, requestsRes, openRes, historyRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/api/auth`, config),
                axios.get(`${import.meta.env.VITE_API_URL}/api/requests/inprogress`, config),
                axios.get(`${import.meta.env.VITE_API_URL}/api/requests`, config),
                axios.get(`${import.meta.env.VITE_API_URL}/api/donations/hospital-history`, config)
            ]);
            setUser(userRes.data);
            setRequestsInProgress(requestsRes.data);
            setOpenRequests(openRes.data);
            setVerifiedHistory(historyRes.data);
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

    useEffect(() => {
        if (!socket) return;

        socket.on('request_created', (newRequest) => {
            setOpenRequests(prev => [newRequest, ...prev]);
        });

        socket.on('request_accepted', (updatedRequest) => {
            setOpenRequests(prev => prev.filter(req => req._id !== updatedRequest._id));
            if (updatedRequest.status !== 'Completed') {
                setRequestsInProgress(prev => [updatedRequest, ...prev]);
            }
        });

        socket.on('request_cancelled', (updatedRequest) => {
            setRequestsInProgress(prev => prev.filter(req => req._id !== updatedRequest._id));
            setOpenRequests(prev => [updatedRequest, ...prev]);
        });

        socket.on('request_completed', (updatedRequest) => {
            setRequestsInProgress(prev => prev.filter(req => req._id !== updatedRequest._id.toString() && req._id !== updatedRequest._id));
        });

        return () => {
            socket.off('request_created');
            socket.off('request_accepted');
            socket.off('request_cancelled');
            socket.off('request_completed');
        };
    }, [socket]);

    const handleAccept = async (requestId) => {
        if (processingId) return;
        setProcessingId(requestId);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            await axios.post(`${import.meta.env.VITE_API_URL}/api/requests/${requestId}/accept`, {}, config);
            toast.success('Request accepted successfully!');
            // Socket will update the UI
        } catch (error) {
            toast.error('Failed to accept request.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleCancel = async (requestId) => {
        if (processingId) return;
        const reason = prompt("Please enter a reason for cancellation:");
        if (!reason) return;

        setProcessingId(requestId);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            await axios.post(`${import.meta.env.VITE_API_URL}/api/requests/${requestId}/cancel`, { reason }, config);
            toast.success('Request cancelled successfully.');
            // Socket will update the UI
        } catch (error) {
            toast.error('Failed to cancel request.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleVerify = async (donorId, requestId) => {
        if (processingId) return;
        setProcessingId(requestId);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/hospitals/verify-donation`, { donorId, requestId }, config);

            let toastMessage = 'Donation verified successfully!';
            if (res.data.badgeAwarded) {
                toastMessage += ` The donor has been awarded the "${res.data.badgeAwarded}" badge!`;
            }
            toast.success(toastMessage);
            // Socket will update the UI
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.msg || 'Could not verify the donation.');
        } finally {
            setProcessingId(null);
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
                <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
                    <AlertCircle className="h-10 w-10 text-red-500 mr-4" />
                    <div>
                        <p className="text-sm text-gray-500">Open Requests</p>
                        <p className="text-2xl font-bold text-gray-800">{openRequests.length}</p>
                    </div>
                </div>
            </div>

            {/* Open Requests Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-700 flex items-center mb-4">
                    <AlertCircle className="h-6 w-6 mr-3 text-red-500" /> Open Requests
                </h3>
                {openRequests.length > 0 ? (
                    <div className="space-y-4">
                        {openRequests.filter(req => req.status === 'Pending').map(req => (
                            <div key={req._id} className="border p-4 rounded-lg bg-red-50 flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold text-gray-800">{req.hospitalName}</h4>
                                    <p className="text-sm text-gray-600">Blood Type: <span className="font-bold text-red-600">{req.bloodType}</span></p>
                                    <p className="text-sm text-gray-600">Status: {req.status}</p>
                                </div>
                                <button
                                    onClick={() => handleAccept(req._id)}
                                    disabled={processingId !== null}
                                    className={`font-bold py-2 px-4 rounded-lg transition flex items-center ${processingId === req._id ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                                >
                                    {processingId === req._id ? 'Processing...' : 'Accept Request'}
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600">No open requests.</p>
                )}
            </div>

            {/* Verification Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-700 flex items-center mb-4">
                    <CheckSquare className="h-6 w-6 mr-3 text-blue-500" /> Verify Completed Donations / In Progress
                </h3>
                {requestsInProgress.length > 0 ? (
                    <div className="space-y-4">
                        {requestsInProgress.map(req => (
                            <div key={req._id} className="border p-4 rounded-lg bg-gray-50 flex flex-col sm:flex-row justify-between sm:items-center">
                                <div className="mb-4 sm:mb-0">
                                    <h4 className="font-bold text-gray-800">Donor: {req.acceptedBy ? req.acceptedBy.name : 'Unknown'}</h4>
                                    <p className="text-sm text-gray-600">Blood Type: <span className="font-bold text-red-600">{req.bloodType}</span></p>
                                    <p className="text-sm text-gray-600">Status: {req.status}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleCancel(req._id)}
                                        disabled={processingId !== null}
                                        className={`font-bold py-2 px-4 rounded-lg transition ${processingId === req._id ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-500 hover:bg-gray-600 text-white'}`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleVerify(req.acceptedBy?._id, req._id)}
                                        className={`font-bold py-2 px-4 rounded-lg transition flex items-center ${processingId === req._id ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                                        disabled={!req.acceptedBy || processingId !== null}
                                    >
                                        {processingId === req._id ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Verifying...
                                            </>
                                        ) : 'Mark as Completed'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600">No donors are currently on their way.</p>
                )}
            </div>

            {/* Verified History Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-8">
                <h3 className="text-xl font-bold text-gray-700 flex items-center mb-4">
                    <ClipboardList className="h-6 w-6 mr-3 text-green-600" /> Verified Donations History
                </h3>
                {verifiedHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {verifiedHistory.map((log) => (
                                    <tr key={log._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(log.donationDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {log.donor ? log.donor.name : 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {log.bloodRequest ? log.bloodRequest.bloodType : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {log.donor ? log.donor.email : 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-600">No verified donations history.</p>
                )}
            </div>
        </div>
    );
};

export default HospitalDashboard;