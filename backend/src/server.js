const createApp = require('./app');
const http = require('http');
const socket = require('./socket');
const { closeSMSQueue } = require('./config/queue');
const { closeSMSWorker } = require('./workers/smsWorker');

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

        // Graceful shutdown handlers
        const gracefulShutdown = async () => {
            console.log('\n📛 Graceful shutdown initiated...');
            
            // Close SMS Queue and Worker
            await closeSMSWorker();
            await closeSMSQueue();
            
            // Close server
            server.close(() => {
                console.log('✅ Server closed gracefully');
                process.exit(0);
            });

            // Force exit after 10 seconds if graceful shutdown fails
            setTimeout(() => {
                console.error('❌ Forced shutdown after timeout');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);

    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};

startServer();
