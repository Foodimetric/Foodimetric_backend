const { certainRespondMessage } = require("../utils/response");
const Message = require("../models/message");
const axios = require("axios");
const redis = require("../utils/redis"); // import Redis client

const NUTRIBOT_API_URL = "https://foodimetric-bot.onrender.com/api/chat";

const PER_MINUTE_LIMIT = 2; // RPM
const PER_DAY_LIMIT = 40; // RPD
const PER_MINUTE_TOKEN_LIMIT = 1000; // TPM (example)

class ChatController {
    async chat(req, res) {
        const { text, user_id } = req.body;

        if (!text || !user_id) {
            return res.status(400).json({ error: "Missing text or user_id" });
        }

        const tokenCount = text.split(/\s+/).length * 1.3; // Rough estimate: 1 word = ~1.3 tokens

        try {
            // --- Limits Setup ---
            const now = new Date();
            const minuteKey = `user:${user_id}:minute:${now.getUTCMinutes()}`;
            const dayKey = `user:${user_id}:day:${now.toISOString().split("T")[0]}`;

            const rpm = await redis.incr(minuteKey);
            const rpd = await redis.incr(dayKey);
            const tpmKey = `user:${user_id}:tokens_minute:${now.getUTCMinutes()}`;
            const tpm = await redis.incrByFloat(tpmKey, tokenCount);

            // Expiry timers
            await redis.expire(minuteKey, 60); // expires in 60 seconds
            await redis.expire(dayKey, 86400); // expires in 24 hours
            await redis.expire(tpmKey, 60); // expires in 60 seconds

            // --- Check Limits ---
            if (rpm > PER_MINUTE_LIMIT) {
                return res.status(429).json({ error: "Too many requests per minute (RPM) reached." });
            }

            if (rpd > PER_DAY_LIMIT) {
                const now = new Date();
                const tomorrow = new Date(now);
                tomorrow.setUTCHours(0, 0, 0, 0);
                tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
                const resetTime = tomorrow.toISOString().split("T")[1].split(".")[0]; // "00:00:00"
                return res.status(429).json({
                    error: "Daily request limit (RPD) reached.",
                    message: `You’ve reached the daily limit for Foodimetric AI. You can continue chatting again after midnight UTC (00:00:00).`,
                    reset_time_utc: resetTime
                });
            }

            if (tpm > PER_MINUTE_TOKEN_LIMIT) {
                return res.status(429).json({ error: "Token usage per minute (TPM) limit reached." });
            }

            // Save message to DB
            await Message.create({ user_id, text });

            // Send to Python bot
            const response = await axios.post(NUTRIBOT_API_URL, { text, user_id });

            return res.json(response.data);
        } catch (error) {
            console.error("Error communicating with Foodimetric-AI API:", error.response?.data || error.message);
            return res.status(500).json({
                error: "Error communicating with Foodimetric-AI API",
                details: error.response?.data || error.message,
            });
        }
    }
}

module.exports = {
    ChatController
};
