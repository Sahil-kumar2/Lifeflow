const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

class ChatService {
    static async sendMessage(userMessage) {
        try {
            const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });

            const chat = model.startChat({
                history: [],
                generationConfig: {
                    maxOutputTokens: 1024,
                }
            });

            const result = await chat.sendMessage(userMessage);
            const response = await result.response;
            const text = response.text();

            return text;
        } catch (error) {
            console.error('Chat service error:', error);
            throw new Error('Failed to process chat message');
        }
    }
}

module.exports = ChatService;
