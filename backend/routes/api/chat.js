const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/', async (req, res) => {
    try {
        const { message } = req.body;

        // Use valid Gemini model
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // System + user prompt combined
        const fullPrompt = `
            You are the helpful AI assistant for "LiveFlow", a blood donation platform connecting patients with donors.
            Your goal is to encourage blood donation and answer questions politely, accurately, and concisely.

            Knowledge Base:
            - Eligibility: Men can donate every 3 months, women every 4 months. Must be 18-65 years old and >45kg.
            - Process: Registration -> Medical Check -> Donation -> Refreshment.
            - Post-Donation: Drink water, avoid heavy lifting for 24h.
            - Platform Features: We use geolocation to find nearby donors and send SMS alerts.

            If a user asks about something unrelated to blood donation, health, or this app, politely steer them back to the topic.
            Keep answers short (under 3–4 sentences) unless a detailed explanation is requested.

            User Question: ${message}
        `;

        // ✅ Updated correct API format
        const result = await model.generateContent({
            contents: [
                {
                    role: "user",
                    parts: [{ text: fullPrompt }]
                }
            ]
        });

        const text = result.response.text();

        return res.json({ reply: text });

    } catch (error) {
        console.error("Chat API Error:", error);
        return res.status(500).json({
            reply: "I'm having trouble connecting right now. Please try again later."
        });
    }
});

module.exports = router;
