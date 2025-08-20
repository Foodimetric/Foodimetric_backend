// models/activityLog.model.js
const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        required: true,
    },
    role: {
        type: String,
        enum: ["superadmin", "admin", "marketing", "developer"],
        required: true,
    },
    action: {
        type: String,
        required: true, // e.g., "Created new user", "Updated settings"
    },
    meta: {
        type: mongoose.Schema.Types.Mixed, // optional, store extra info like objectId, IP, etc.
        default: {},
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

module.exports = mongoose.model("ActivityLog", activityLogSchema);
