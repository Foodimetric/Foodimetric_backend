const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const usageSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now, // exact login/action time
    }
}, {
    timestamps: true // optional, adds createdAt + updatedAt
});

const Usage = mongoose.model("Usage", usageSchema);
module.exports = Usage;