const createApp = require('./app');
const http = require('http');
const socket = require('./socket');

const startServer = async () => {
    try {
        const app = await createApp();
        const server = http.createServer(app);

        // Initialize Socket.io
        const io = socket.init(server);

        io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);
            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });

        const PORT = process.env.PORT || 5000;

        server.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};

startServer();
