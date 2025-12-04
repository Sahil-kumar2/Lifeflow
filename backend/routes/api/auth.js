// backend/routes/api/auth.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const auth = require('../../middleware/auth');

// --- UPDATED REGISTRATION ROUTE ---
router.post('/register', async (req, res) => {
    // Now accepting longitude and latitude in the request
    const { name, email, password, phone, role, city, bloodType, longitude, latitude } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({ name, email, password, phone, role, city, bloodType });

        // ** NEW LOGIC: Save location if provided during registration **
        if (longitude && latitude) {
            user.location = {
                type: 'Point',
                coordinates: [longitude, latitude],
            };
        }

        await user.save();
        
        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- ALL OTHER ROUTES REMAIN THE SAME ---
router.get('/', auth, async (req, res) => { /* ... existing code ... */ 
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch(err){ res.status(500).send('Server Error'); }
});
router.post('/login', async (req, res) => { /* ... existing code ... */ 
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });
        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch(err){ res.status(500).send('Server Error'); }
});

module.exports = router;