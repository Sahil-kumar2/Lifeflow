const crypto = require('crypto');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getCache, setCache } = require('../utils/cache');
require('dotenv').config();

class ChatService {
    static async sendMessage(userMessage) {
        try {
            const normalizedMessage = String(userMessage || '').trim();
            const cacheKey = `chat:response:${crypto.createHash('sha256').update(normalizedMessage).digest('hex')}`;
            const cachedResponse = await getCache(cacheKey);

            if (cachedResponse) {
                return cachedResponse;
            }

            const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

            const chat = model.startChat({
                history: [],
                generationConfig: {
                    maxOutputTokens: 1024,
                }
            });

            const result = await chat.sendMessage(normalizedMessage);
            const response = await result.response;
            const text = response.text();

            await setCache(cacheKey, text, 3600);

            return text;
        } catch (error) {
            console.error('Chat service error:', error);
            throw new Error('Failed to process chat message');
        }
    }
}

module.exports = ChatService;
