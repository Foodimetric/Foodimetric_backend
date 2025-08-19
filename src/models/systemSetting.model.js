// models/systemSetting.model.js
const mongoose = require("mongoose");

const systemSettingSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });

module.exports = mongoose.model("SystemSetting", systemSettingSchema);
