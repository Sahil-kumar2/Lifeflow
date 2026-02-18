import apiClient from './client';

/**
 * Auth API endpoints
 */
const AuthAPI = {
    register: (userData) => apiClient.post('/api/auth/register', userData),
    login: (email, password) => apiClient.post('/api/auth/login', { email, password }),
    getProfile: () => apiClient.get('/api/auth'),
};

/**
 * Blood Request API endpoints
 */
const BloodRequestAPI = {
    create: (requestData) => apiClient.post('/api/requests', requestData),
    getMyRequests: () => apiClient.get('/api/requests/my-requests'),
    getOpenRequests: () => apiClient.get('/api/requests'),
    getInProgressRequests: () => apiClient.get('/api/requests/inprogress'),
    acceptRequest: (requestId) => apiClient.post(`/api/requests/${requestId}/accept`),
};

/**
 * Donor API endpoints
 */
const DonorAPI = {
    getDonationLogs: () => apiClient.get('/api/donors/donation-logs'),
    updateProfile: (updates) => apiClient.patch('/api/donors/profile', updates),
    getNearbyRequests: () => apiClient.get('/api/donors/nearby-requests'),
};

/**
 * Hospital API endpoints
 */
const HospitalAPI = {
    verifyDonation: (donorId, requestId) => 
        apiClient.post('/api/hospitals/verify-donation', { donorId, requestId }),
};

/**
 * Chat API endpoints
 */
const ChatAPI = {
    sendMessage: (message) => apiClient.post('/api/chat', { message }),
};

export { AuthAPI, BloodRequestAPI, DonorAPI, HospitalAPI, ChatAPI };
export default apiClient;
