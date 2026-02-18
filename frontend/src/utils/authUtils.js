/**
 * Auth utilities for token management
 */
const AuthUtils = {
    /**
     * Store authentication token in localStorage
     * @param {string} token - JWT token
     */
    setToken: (token) => {
        localStorage.setItem('token', token);
    },

    /**
     * Retrieve authentication token from localStorage
     * @returns {string|null} JWT token or null if not found
     */
    getToken: () => {
        return localStorage.getItem('token');
    },

    /**
     * Clear authentication token from localStorage
     */
    clearToken: () => {
        localStorage.removeItem('token');
    },

    /**
     * Check if user is authenticated
     * @returns {boolean} True if token exists
     */
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },
};

export default AuthUtils;
