// models/Prompt.js
const mongoose = require("mongoose");

const PromptSchema = new mongoose.Schema({
    category: {
        type: Number,
        enum: [0, 1, 2, 3],
        required: true,
    },
    prompts: [
        {
            type: String,
            required: true,
        },
    ],
}, { timestamps: true });

module.exports = mongoose.model("Prompt", PromptSchema);
