// frontend/src/components/PrivateRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    // Check if a token exists in localStorage
    const isAuthenticated = !!localStorage.getItem('token');

    // If the user is logged in, show the page they want to see (the 'children').
    // Otherwise, redirect them to the login page.
    return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;