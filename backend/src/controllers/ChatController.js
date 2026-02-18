const { ChatService } = require('../services');

class ChatController {
    static async sendMessage(req, res) {
        try {
            const { message } = req.body;
            const response = await ChatService.sendMessage(message);
            res.json({ reply: response });
        } catch (err) {
            console.error('Error in chat controller:', err);
            res.status(500).json({ msg: 'Server Error' });
        }
    }
}

module.exports = ChatController;
