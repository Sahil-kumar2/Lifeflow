// backend/index.js

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const ensureGeoIndex = require('./utils/ensureIndexes'); // Import our new function

const app = express();

const startServer = async () => {
    // First, connect to the database
    await connectDB();
    
    // SECOND, forcefully ensure the geo index exists
    await ensureGeoIndex();

    // Now, we can safely set up the rest of the app
    app.use(cors());
    app.use(express.json());

    app.get('/', (req, res) => res.send('LiveFlow API is running...'));

    // Define Routes
    app.use('/api/auth', require('./routes/api/auth'));
    app.use('/api/requests', require('./routes/api/requests'));
    app.use('/api/hospitals', require('./routes/api/hospitals'));
    app.use('/api/donors', require('./routes/api/donors'));

    app.use('/api/chat', require('./routes/api/chat'));

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server is running on http://localhost:${PORT}`));
};

// Start the server
startServer();