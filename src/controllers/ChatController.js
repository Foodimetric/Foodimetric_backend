const { certainRespondMessage } = require("../utils/response");
const Message = require("../models/message");
const axios = require("axios");


const NUTRIBOT_API_URL = "https://foodimetric-bot.onrender.com/api/chat"; // Python API

class ChatController {
    async chat(req, res) {
        const { text, user_id } = req.body;

        try {
            await Message.create({ user_id, text });
            const response = await axios.post(NUTRIBOT_API_URL, { text, user_id });
            res.json(response.data);
        } catch (error) {
            console.error("Error communicating with NutriBot API:", error.response?.data || error.message);

            res.status(500).json({
                error: "Error communicating with NutriBot API",
                details: error.response?.data || error.message, // Provide more context
            });
        }
    }
}

module.exports = {
    ChatController
};