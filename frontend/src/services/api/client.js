import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Axios instance configured with base URL and default headers
 */
const apiClient = axios.create({
    baseURL: API_BASE_URL,
});

/**
 * Add authorization token to request headers
 */
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['x-auth-token'] = token;
    }
    return config;
});

export default apiClient;
