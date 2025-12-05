const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ResourceSchema = new Schema({
    title: { type: String, required: true },
    image: { type: String, required: true },
    category: {
        type: String,
        enum: ["AI", "RECIPES", "EVENTS", "VIDEOS", "ARTICLES"],
        required: true
    },
    date: { type: String, required: true },
    description: { type: String },
    author: { type: String },
    likes: { type: Number, default: 0 },
    summary: { type: String },
    content: { type: String },
},
    { timestamps: true }
);
const Resource = mongoose.model("Resource", ResourceSchema);
module.exports = Resource;
