// backend/middleware/auth.js

const jwt = require('jsonwebtoken');
require('dotenv').config();

// This function is our "gatekeeper" middleware
module.exports = function (req, res, next) {
    // Get the token from the request header
    const token = req.header('x-auth-token');

    // Check if there's no token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // If there is a token, verify it
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Add the user's ID from the token to the request object
        req.user = decoded.user;
        // Move on to the actual route
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};